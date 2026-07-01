import { getWhatsAppUrl } from "@/lib/contact-config";
import {
  appendMessage,
  getConversationById,
  updateConversationState,
} from "@/lib/ai/ai-conversation-repository";
import {
  analyzeProfit,
  formatProfitAnalysisReply,
  type ProfitAnalysis,
} from "@/lib/ai/profit-analysis-service";
import {
  formatRecommendationsReply,
  recommendProductAlternatives,
} from "@/lib/ai/product-recommendation-service";
import {
  buildQuotePreview,
  formatQuotePreviewText,
} from "@/lib/ai/quote-preview-service";
import {
  extractProductQueryFromMessage,
  queryProductInventory,
  queryProductLeadTime,
  queryProductWarehouse,
} from "@/lib/ai/product-catalog-service";
import {
  formatSupplierRecommendationsReply,
  recommendSuppliersForProducts,
} from "@/lib/ai/supplier-recommendation-service";
import {
  checkStockForProducts,
  formatStockWarnings,
} from "@/lib/ai/stock-check-service";
import type {
  AiAgentReply,
  AiConversationState,
  AiIntent,
  AiPendingField,
  ConversationProductLine,
  ProfitAnalysisSummary,
  QuotePreviewSummary,
} from "@/lib/ai/ai-types";
import { parseProcurementMessage } from "@/lib/quotations/procurement-parser";
import {
  fuzzyMatchProducts,
  matchProductByText,
  shouldAutoMatch,
} from "@/lib/quotations/product-matcher";
import { createQuotationDraftFromAssistant } from "@/lib/quotations/quotation-service";
import { createQuotationRevision } from "@/lib/quotations/quotation-revision";

const CONFIRM_PATTERN = /^(yes|ok|confirm|konfirmasi|setuju|ya|确认|好的|generate|kirim)$/i;

const ASK_LABELS: Record<AiPendingField, { id: string; en: string; zh: string }> = {
  products: {
    id: "Produk apa yang Anda butuhkan? (contoh: Bosch GWS750-100 ×20)",
    en: "Which products do you need? (e.g. Bosch GWS750-100 ×20)",
    zh: "需要哪些产品？（例如：Bosch GWS750-100 ×20）",
  },
  quantity: {
    id: "Berapa jumlah untuk setiap produk?",
    en: "What quantity do you need for each product?",
    zh: "每个产品需要多少数量？",
  },
  country: {
    id: "Negara tujuan pengiriman? (contoh: Indonesia)",
    en: "Destination country? (e.g. Indonesia)",
    zh: "目的国家是哪里？（例如：Indonesia）",
  },
  port: {
    id: "Pelabuhan tujuan? (contoh: Tanjung Priok)",
    en: "Destination port? (e.g. Tanjung Priok)",
    zh: "目的港口是哪里？（例如：Tanjung Priok）",
  },
  destinationCity: {
    id: "Ke kota mana produk akan dikirim? (contoh: Morowali)",
    en: "Which city should we ship to? (e.g. Morowali)",
    zh: "产品将发往哪个城市？（例如：Morowali）",
  },
  incoterms: {
    id: "FOB 还是 CIF？",
    en: "FOB or CIF?",
    zh: "FOB 还是 CIF？",
  },
  companyName: {
    id: "Nama perusahaan Anda?",
    en: "Your company name?",
    zh: "您的公司名称？",
  },
  contactName: {
    id: "Nama kontak person?",
    en: "Contact person name?",
    zh: "联系人姓名？",
  },
  whatsapp: {
    id: "Nomor WhatsApp Anda?",
    en: "Your WhatsApp number?",
    zh: "您的 WhatsApp 号码？",
  },
};

function detectIntent(message: string): AiIntent {
  const text = message.toLowerCase();
  if (CONFIRM_PATTERN.test(message.trim())) return "confirm";
  if (/modify|修改|ubah pesanan|change order/.test(text)) return "modify";
  if (/便宜|cheaper|alternative|alternatif|替代|低配|更便宜|有没有.*便宜/.test(text)) return "recommend";
  if (/supplier|供应商|vendor|pemasok|供货/.test(text)) return "supplier";
  if (/profit|margin|利润|毛利|利润率|keuntungan/.test(text)) return "profit";
  if (/stock|inventory|stok|库存|有货|tersedia/.test(text)) return "inventory";
  if (/lead\s*time|delivery|交期|pengiriman|发货|kirim dalam/.test(text)) return "leadtime";
  if (/warehouse|gudang|仓库|location|从哪发/.test(text)) return "warehouse";
  if (/quote|penawaran|报价|harga|price|buy|beli|采购|要买/.test(text)) return "quote";
  return "general";
}

function pickLocaleText(locale: string, key: AiPendingField): string {
  const item = ASK_LABELS[key];
  if (locale === "zh") return item.zh;
  if (locale === "en") return item.en;
  return item.id;
}

function extractContactFields(message: string, state: AiConversationState): AiConversationState {
  const next = { ...state };
  const emailMatch = message.match(/[\w.+-]+@[\w-]+\.[A-Za-z]{2,}/);
  if (emailMatch) next.email = emailMatch[0];

  const whatsappMatch = message.match(/(\+?\d[\d\s-]{8,}\d)/);
  if (whatsappMatch && !next.whatsapp) next.whatsapp = whatsappMatch[1].replace(/\s/g, "");

  const incotermsMatch = message.match(/\b(CIF|FOB|EXW|DDP|CFR|CIP)\b/i);
  if (incotermsMatch) next.incoterms = incotermsMatch[1].toUpperCase();

  const countryMatch = message.match(/(?:country|国家|negara)[：:\s]+([A-Za-z\s]+)/i);
  if (countryMatch) next.country = countryMatch[1].trim();

  const portMatch = message.match(/(?:port|港口|pelabuhan)[：:\s]+([A-Za-z\s]+)/i);
  if (portMatch) next.port = portMatch[1].trim();

  return next;
}

function mergeProductLines(
  existing: ConversationProductLine[],
  incoming: ConversationProductLine[],
): ConversationProductLine[] {
  const map = new Map<string, ConversationProductLine>();
  for (const line of existing) map.set(line.productId ?? line.rawText, line);
  for (const line of incoming) {
    const key = line.productId ?? line.rawText;
    map.set(key, { ...map.get(key), ...line });
  }
  return [...map.values()];
}

function trackDiscussedProducts(state: AiConversationState): AiConversationState {
  const ids = new Set(state.discussedProductIds ?? []);
  for (const item of state.products) {
    if (item.productId) ids.add(item.productId);
  }
  return { ...state, discussedProductIds: [...ids] };
}

function getReferenceProduct(state: AiConversationState) {
  const first = state.products[0];
  if (first?.productId) return { productId: first.productId, rawText: first.rawText };
  const lastId = state.discussedProductIds?.[state.discussedProductIds.length - 1];
  if (lastId) {
    const item = state.products.find((p) => p.productId === lastId);
    return { productId: lastId, rawText: item?.rawText ?? "" };
  }
  return { productId: null, rawText: "" };
}

async function tryApplyAmbiguousSelection(
  message: string,
  state: AiConversationState,
): Promise<AiConversationState | null> {
  const trimmed = message.trim();
  const indexMatch = trimmed.match(/^(\d+)$/);
  const options = state.pendingAmbiguous?.options ?? state.lastRecommendations;
  if (!indexMatch || !options?.length) return null;

  const index = Number.parseInt(indexMatch[1], 10) - 1;
  const selected = options[index];
  if (!selected) return null;

  const qty = state.products.find((p) => p.rawText === state.pendingAmbiguous?.rawText)?.quantity ?? 1;
  const newLine: ConversationProductLine = {
    rawText: state.pendingAmbiguous?.rawText ?? `${selected.productName} ${selected.productModel}`,
    productId: selected.productId,
    productName: selected.productName,
    productModel: selected.productModel,
    quantity: qty,
    unitPrice: selected.unitPrice,
  };

  return trackDiscussedProducts({
    ...state,
    products: mergeProductLines(state.products, [newLine]),
    pendingAmbiguous: undefined,
    lastRecommendations: undefined,
    phase: "gathering",
  });
}

async function mergeProcurementIntoState(
  message: string,
  state: AiConversationState,
): Promise<AiConversationState> {
  const parsed = parseProcurementMessage(message);
  const next = extractContactFields(message, { ...state });

  if (parsed.destinationCity) next.destinationCity = parsed.destinationCity;
  if (parsed.incoterms) next.incoterms = parsed.incoterms;
  if (parsed.deliveryDays) next.deliveryDays = parsed.deliveryDays;

  if (parsed.productLines.length > 0) {
    const lines: ConversationProductLine[] = [];
    for (const { rawText, quantity } of parsed.productLines) {
      const matches = await fuzzyMatchProducts(rawText, 5);
      if (matches.length === 0) continue;
      if (shouldAutoMatch(matches)) {
        lines.push({
          rawText,
          productId: matches[0].product.id,
          productName: matches[0].product.name,
          productModel: matches[0].product.model,
          quantity,
          unitPrice: matches[0].product.price,
        });
      } else {
        next.pendingAmbiguous = {
          rawText,
          options: matches.map((m) => ({
            productId: m.product.id,
            productName: m.product.name,
            productModel: m.product.model,
            unitPrice: m.product.price,
            score: m.score,
          })),
        };
        next.lastRecommendations = next.pendingAmbiguous.options.map((o) => ({
          productId: o.productId,
          productName: o.productName,
          productModel: o.productModel,
          unitPrice: o.unitPrice,
          reason: "fuzzy_match",
        }));
        break;
      }
    }
    if (lines.length > 0) {
      next.products = mergeProductLines(state.products, lines);
    } else if (!next.pendingAmbiguous && parsed.productLines.length > 0) {
      next.unmatchedProducts = parsed.productLines.map((line) => line.rawText);
    }
  } else if (next.products.length === 0) {
    const single = await matchProductByText(message);
    if (single) {
      next.products = [
        {
          rawText: message.trim(),
          productId: single.id,
          productName: single.name,
          productModel: single.model,
          quantity: 1,
          unitPrice: single.price,
        },
      ];
    }
  }

  return trackDiscussedProducts(next);
}

function findMissingField(state: AiConversationState): AiPendingField | null {
  if (!state.products.length) return "products";
  if (state.products.some((item) => !item.quantity || item.quantity < 1)) return "quantity";
  if (!state.country.trim()) return "country";
  if (!state.port.trim()) return "port";
  if (!state.destinationCity.trim()) return "destinationCity";
  if (!state.incoterms.trim()) return "incoterms";
  if (!state.companyName.trim()) return "companyName";
  if (!state.contactName.trim()) return "contactName";
  if (!state.whatsapp.trim()) return "whatsapp";
  return null;
}

function toProfitSummary(analysis: ProfitAnalysis): ProfitAnalysisSummary {
  return {
    lines: analysis.lines.map((line) => ({
      productName: line.productName,
      quantity: line.quantity,
      purchaseTotal: line.purchaseTotal,
      sellingTotal: line.sellingTotal,
      grossProfit: line.grossProfit,
      marginPercent: line.marginPercent,
    })),
    totalPurchase: analysis.totalPurchase,
    totalSelling: analysis.totalSelling,
    shippingCost: analysis.shippingCost,
    grossProfit: analysis.grossProfit,
    marginPercent: analysis.marginPercent,
  };
}

function toPreviewSummary(preview: ReturnType<typeof buildQuotePreview>): QuotePreviewSummary {
  return {
    lines: preview.lines.map((line) => ({
      productName: line.productName,
      productModel: line.productModel,
      quantity: line.quantity,
      unit: line.unit,
      subtotalUsd: line.subtotalUsd,
      subtotalIdr: line.subtotalIdr,
    })),
    goodsSubtotalUsd: preview.goodsSubtotalUsd,
    shippingUsd: preview.shippingUsd,
    insuranceUsd: preview.insuranceUsd,
    subtotalUsd: preview.subtotalUsd,
    totalUsd: preview.totalUsd,
    goodsSubtotalIdr: preview.goodsSubtotalIdr,
    shippingIdr: preview.shippingIdr,
    insuranceIdr: preview.insuranceIdr,
    subtotalIdr: preview.subtotalIdr,
    totalIdr: preview.totalIdr,
    idrRate: preview.idrRate,
    incoterms: preview.incoterms,
    destination: preview.destination,
  };
}

function messageLooksLikeProductOrder(message: string): boolean {
  return parseProcurementMessage(message).productLines.length > 0;
}

async function buildPreviewReply(state: AiConversationState, locale: string) {
  try {
    const stock = await checkStockForProducts(state.products, locale);
    const preview = buildQuotePreview(
      state.products,
      state.destinationCity,
      state.incoterms || "CIF",
    );
    const previewSummary = toPreviewSummary(preview);
    const profit = await analyzeProfit(state.products, state.destinationCity, state.incoterms || "CIF");
    const profitSummary = toProfitSummary(profit);

    const stockBlock = formatStockWarnings(stock.warnings, locale);
    const previewBlock = formatQuotePreviewText(preview, locale);

    const footer =
      locale === "zh"
        ? "请确认预览。点击下方「生成正式报价」或「修改订单」。"
        : locale === "en"
          ? 'Review the preview. Tap "Generate Official Quotation" or "Modify Order".'
          : 'Periksa pratinjau. Ketuk "Generate Official Quotation" atau "Modify Order".';

    const text = [stockBlock, previewBlock, footer].filter(Boolean).join("\n\n");

    return {
      text,
      previewSummary,
      profitSummary,
      stockWarnings: stock.warnings,
    };
  } catch {
    const preview = buildQuotePreview(
      state.products,
      state.destinationCity,
      state.incoterms || "CIF",
    );
    const previewSummary = toPreviewSummary(preview);
    const previewBlock = formatQuotePreviewText(preview, locale);
    const footer =
      locale === "zh"
        ? "请确认预览。点击下方「生成正式报价」或「修改订单」。"
        : locale === "en"
          ? 'Review the preview. Tap "Generate Official Quotation" or "Modify Order".'
          : 'Periksa pratinjau. Ketuk "Generate Official Quotation" atau "Modify Order".';
    return {
      text: [previewBlock, footer].filter(Boolean).join("\n\n"),
      previewSummary,
      profitSummary: undefined,
      stockWarnings: [],
    };
  }
}

function buildOrderMessageFromState(state: AiConversationState): string {
  const lines = state.products.map(
    (item) => `${item.rawText || item.productModel || item.productName} ×${item.quantity ?? 1}`,
  );
  lines.push(`Country: ${state.country}`);
  lines.push(`Port: ${state.port}`);
  lines.push(`送到 ${state.destinationCity}`);
  lines.push(state.incoterms);
  if (state.deliveryDays) lines.push(`${state.deliveryDays}天内发货`);
  return lines.join("\n");
}

function applyDirectAnswer(
  field: AiPendingField,
  message: string,
  state: AiConversationState,
): AiConversationState {
  const next = { ...state, pendingField: undefined };
  const trimmed = message.trim();
  if (!trimmed) return next;

  switch (field) {
    case "destinationCity":
      next.destinationCity = trimmed;
      break;
    case "country":
      next.country = trimmed;
      break;
    case "port":
      next.port = trimmed;
      break;
    case "incoterms":
      next.incoterms = trimmed.toUpperCase();
      break;
    case "companyName":
      next.companyName = trimmed;
      break;
    case "contactName":
      next.contactName = trimmed;
      break;
    case "whatsapp":
      next.whatsapp = trimmed.replace(/\s/g, "");
      break;
    case "products":
    case "quantity":
      break;
  }
  return next;
}

export async function processAgentMessage(
  conversationId: string,
  userMessage: string,
): Promise<AiAgentReply> {
  const conversation = await getConversationById(conversationId);
  if (!conversation) throw new Error("Conversation not found");

  const locale = conversation.locale;
  await appendMessage(conversationId, "user", userMessage);

  const intent = detectIntent(userMessage);
  let state: AiConversationState = { ...conversation.state, lastIntent: intent };

  const ambiguousApplied = await tryApplyAmbiguousSelection(userMessage, state);
  if (ambiguousApplied) {
    state = ambiguousApplied;
    const confirmMsg =
      locale === "zh"
        ? `已选择：${state.products.at(-1)?.productName} (${state.products.at(-1)?.productModel})`
        : locale === "en"
          ? `Selected: ${state.products.at(-1)?.productName} (${state.products.at(-1)?.productModel})`
          : `Dipilih: ${state.products.at(-1)?.productName} (${state.products.at(-1)?.productModel})`;
    const message = await appendMessage(conversationId, "assistant", confirmMsg, { intent: "general" });
    const updated = await updateConversationState(conversationId, state);
    return { conversation: updated, message };
  }

  if (state.pendingAmbiguous) {
    const header =
      locale === "zh"
        ? `请为 "${state.pendingAmbiguous.rawText}" 选择产品（回复序号）：`
        : locale === "en"
          ? `Please select a product for "${state.pendingAmbiguous.rawText}" (reply with number):`
          : `Pilih produk untuk "${state.pendingAmbiguous.rawText}" (balas nomor):`;
    const options = state.pendingAmbiguous.options
      .map((o, i) => `${i + 1}. ${o.productName} ${o.productModel}`)
      .join("\n");
    const message = await appendMessage(conversationId, "assistant", [header, options].join("\n"), {
      ambiguous: true,
    });
    const updated = await updateConversationState(conversationId, state);
    return { conversation: updated, message };
  }

  if (state.pendingField && !["inventory", "leadtime", "warehouse"].includes(intent)) {
    if (state.pendingField === "products" || messageLooksLikeProductOrder(userMessage)) {
      state = await mergeProcurementIntoState(userMessage, state);
    } else {
      state = applyDirectAnswer(state.pendingField, userMessage, state);
    }
    state.pendingField = undefined;
  } else if (["quote", "general", "confirm", "recommend", "profit", "supplier"].includes(intent)) {
    state = await mergeProcurementIntoState(userMessage, state);
  }

  if (intent === "inventory") {
    const query = extractProductQueryFromMessage(userMessage) || getReferenceProduct(state).rawText;
    const reply = await queryProductInventory(query);
    const message = await appendMessage(conversationId, "assistant", reply, { intent });
    return { conversation: await updateConversationState(conversationId, state), message };
  }

  if (intent === "leadtime") {
    const qtyMatch = userMessage.match(/[×xX*]\s*(\d+)/);
    const quantity = qtyMatch ? Number.parseInt(qtyMatch[1], 10) : state.products[0]?.quantity ?? 1;
    const query = extractProductQueryFromMessage(userMessage) || getReferenceProduct(state).rawText;
    const reply = await queryProductLeadTime(query, quantity);
    const message = await appendMessage(conversationId, "assistant", reply, { intent });
    return { conversation: await updateConversationState(conversationId, state), message };
  }

  if (intent === "warehouse") {
    const query = extractProductQueryFromMessage(userMessage) || getReferenceProduct(state).rawText;
    const reply = await queryProductWarehouse(query);
    const message = await appendMessage(conversationId, "assistant", reply, { intent });
    return { conversation: await updateConversationState(conversationId, state), message };
  }

  if (intent === "recommend") {
    const ref = getReferenceProduct(state);
    const recommendations = await recommendProductAlternatives(ref.productId, ref.rawText);
    const reply = formatRecommendationsReply(recommendations, locale);
    state.lastRecommendations = recommendations.map((rec) => ({
      productId: rec.product.id,
      productName: rec.product.name,
      productModel: rec.product.model,
      unitPrice: rec.product.price,
      reason: rec.reason,
    }));
    const message = await appendMessage(conversationId, "assistant", reply, { intent: "recommend" });
    return { conversation: await updateConversationState(conversationId, state), message };
  }

  if (intent === "supplier") {
    let productIds = state.products.map((p) => p.productId).filter(Boolean) as string[];
    if (productIds.length === 0) {
      const ref = getReferenceProduct(state);
      if (ref.productId) productIds = [ref.productId];
    }
    const suppliers = await recommendSuppliersForProducts(productIds);
    const reply = formatSupplierRecommendationsReply(suppliers, locale);
    const message = await appendMessage(conversationId, "assistant", reply, { intent: "supplier", suppliers });
    return { conversation: await updateConversationState(conversationId, state), message };
  }

  if (intent === "profit" && state.products.length > 0) {
    const profit = await analyzeProfit(state.products, state.destinationCity || "Jakarta", state.incoterms || "CIF");
    const reply = formatProfitAnalysisReply(profit, locale);
    const profitSummary = toProfitSummary(profit);
    const message = await appendMessage(conversationId, "assistant", reply, { intent: "profit", profitAnalysis: profitSummary });
    return { conversation: await updateConversationState(conversationId, state), message, profitAnalysis: profitSummary };
  }

  if (intent === "confirm" && state.phase === "preview") {
    try {
      const orderMessage = buildOrderMessageFromState(state);
      const draft = await createQuotationDraftFromAssistant({
        orderMessage,
        companyName: state.companyName,
        contactName: state.contactName,
        whatsapp: state.whatsapp,
        email: state.email || undefined,
      });

      if (conversation.quotationId) {
        await createQuotationRevision(conversation.quotationId, draft.id);
      }

      const profit = await analyzeProfit(state.products, state.destinationCity, state.incoterms || "CIF");
      const productIds = state.products.map((p) => p.productId).filter(Boolean) as string[];
      const suppliers = await recommendSuppliersForProducts(productIds);

      state.phase = "completed";
      const successText =
        locale === "zh"
          ? `正式报价已生成：${draft.quotationNo}\n总计 ${draft.currency} ${draft.total.toFixed(2)}${draft.emailSent ? "\nPDF 已发送至邮箱。" : ""}`
          : locale === "en"
            ? `Official quotation created: ${draft.quotationNo}\nTotal ${draft.currency} ${draft.total.toFixed(2)}${draft.emailSent ? "\nPDF sent to your email." : ""}`
            : `Penawaran resmi dibuat: ${draft.quotationNo}\nTotal ${draft.currency} ${draft.total.toFixed(2)}${draft.emailSent ? "\nPDF dikirim ke email Anda." : ""}`;

      const message = await appendMessage(conversationId, "assistant", successText, {
        intent: "confirm",
        pdfUrl: draft.pdfUrl,
        quotationId: draft.id,
        emailSent: draft.emailSent,
      });

      const updated = await updateConversationState(conversationId, state, {
        status: "completed",
        quotationId: draft.id,
        dealStatus: "quoted",
        grossProfit: profit.grossProfit,
        recommendedSuppliers: suppliers as unknown as import("@prisma/client").Prisma.InputJsonValue,
        companyName: state.companyName,
        contactName: state.contactName,
        whatsapp: state.whatsapp,
        email: state.email,
        country: state.country,
        port: state.port,
        destinationCity: state.destinationCity,
        incoterms: state.incoterms,
        deliveryDays: state.deliveryDays,
      });

      return {
        conversation: updated,
        message,
        pdfUrl: draft.pdfUrl,
        whatsAppUrl: draft.whatsAppUrl,
        emailSent: draft.emailSent,
      };
    } catch {
      const text =
        locale === "zh"
          ? "报价生成失败，请稍后重试或联系销售团队。"
          : locale === "en"
            ? "Could not generate quotation. Please try again or contact our sales team."
            : "Gagal generate penawaran. Silakan coba lagi atau hubungi tim sales.";
      const message = await appendMessage(conversationId, "assistant", text, { intent: "confirm", failed: true });
      return { conversation: await updateConversationState(conversationId, state), message };
    }
  }

  state = extractContactFields(userMessage, state);
  if (!state.companyName.trim() && conversation.companyName) state.companyName = conversation.companyName;
  if (!state.contactName.trim() && conversation.contactName) state.contactName = conversation.contactName;
  if (!state.whatsapp.trim() && conversation.whatsapp) state.whatsapp = conversation.whatsapp;
  if (!state.country.trim() && conversation.country) state.country = conversation.country;
  if (!state.port.trim() && conversation.port) state.port = conversation.port;

  if (state.unmatchedProducts?.length) {
    const list = state.unmatchedProducts.join(", ");
    const text =
      locale === "zh"
        ? `未找到以下产品，请检查型号或联系销售：\n${list}`
        : locale === "en"
          ? `Products not found. Please verify model names or contact sales:\n${list}`
          : `Produk tidak ditemukan. Periksa model atau hubungi sales:\n${list}`;
    state.unmatchedProducts = undefined;
    state.pendingField = "products";
    const message = await appendMessage(conversationId, "assistant", text, { awaitingField: "products" });
    return { conversation: await updateConversationState(conversationId, state), message, awaitingField: "products" };
  }

  const missing = findMissingField(state);
  if (missing) {
    state.pendingField = missing;
    state.phase = "gathering";
    const ask = pickLocaleText(locale, missing);
    const message = await appendMessage(conversationId, "assistant", ask, { awaitingField: missing });
    return { conversation: await updateConversationState(conversationId, state), message, awaitingField: missing };
  }

  state.phase = "preview";
  const { text: preview, previewSummary, profitSummary, stockWarnings } = await buildPreviewReply(state, locale);
  state.quotePreview = previewSummary;
  state.stockWarnings = stockWarnings;

  const message = await appendMessage(conversationId, "assistant", preview, {
    phase: "preview",
    quotePreview: previewSummary,
    profitAnalysis: profitSummary,
    canConfirm: true,
    canModify: true,
  });

  const updated = await updateConversationState(conversationId, state, {
    companyName: state.companyName,
    contactName: state.contactName,
    whatsapp: state.whatsapp,
    email: state.email,
    country: state.country,
    port: state.port,
    destinationCity: state.destinationCity,
    incoterms: state.incoterms,
    deliveryDays: state.deliveryDays,
  });

  return {
    conversation: updated,
    message,
    canConfirm: true,
    canModify: true,
    quotePreview: previewSummary,
    profitAnalysis: profitSummary,
  };
}

export async function confirmAgentQuotation(conversationId: string): Promise<AiAgentReply> {
  const conversation = await getConversationById(conversationId);
  if (!conversation) throw new Error("Conversation not found");

  const state = { ...conversation.state };
  if (state.phase !== "preview" && !findMissingField(state)) {
    state.phase = "preview";
    await updateConversationState(conversationId, state);
  }

  return processAgentMessage(conversationId, "confirm");
}

export function buildWelcomeMessage(locale: string): string {
  if (locale === "zh") {
    return "您好！我是 SuCai Cloud AI 采购员。\n\n您可以：\n• 上传采购单（Excel / CSV / PDF / Word / TXT）\n• 粘贴采购需求获取报价\n• 追问库存 / 交期 / 替代方案\n\n示例：\nBosch GWS750-100 ×20\n送到 Morowali\nCIF";
  }
  if (locale === "en") {
    return "Hello! I'm the SuCai Cloud AI Procurement Agent.\n\nYou can:\n• Upload PO files (Excel / CSV / PDF / Word / TXT)\n• Paste procurement requests for quotations\n• Ask about stock / lead time / alternatives\n\nExample:\nBosch GWS750-100 ×20\nDeliver to Morowali\nCIF";
  }
  return "Halo! Saya AI Procurement Agent SuCai Cloud.\n\nAnda bisa:\n• Upload file PO (Excel / CSV / PDF / Word / TXT)\n• Tempel pesanan untuk penawaran\n• Tanya stok / lead time / alternatif\n\nContoh:\nBosch GWS750-100 ×20\n送到 Morowali\nCIF";
}

export function getWhatsAppShareUrl(whatsapp: string, pdfUrl: string, quotationNo: string): string {
  return getWhatsAppUrl(whatsapp, `Penawaran resmi ${quotationNo}:\n${pdfUrl}`);
}
