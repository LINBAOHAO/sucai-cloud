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
    id: "Produk apa yang Anda butuhkan? Sebutkan model dan jumlahnya.",
    en: "What products do you need? Please share model and quantity.",
    zh: "您好，请告诉我您需要采购什么产品？型号和数量是多少？",
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
    id: "Pelabuhan tujuan? (opsional, balas \"-\" jika tidak ada)",
    en: "Destination port? (optional — reply \"-\" to skip)",
    zh: "目的港口是哪里？（可选，如无请回复「-」）",
  },
  destinationCity: {
    id: "Ke kota mana produk akan dikirim? (contoh: Morowali)",
    en: "Which city should we ship to? (e.g. Morowali)",
    zh: "产品将发往哪个城市？（例如：Morowali）",
  },
  shippingMethod: {
    id: "Metode pengiriman: laut atau udara?",
    en: "Shipping method: sea freight or air freight?",
    zh: "运输方式是海运还是空运？",
  },
  incoterms: {
    id: "Incoterms? (FOB / CIF / DDP — opsional, default CIF)",
    en: "Incoterms? (FOB / CIF / DDP — optional, default CIF)",
    zh: "贸易条款是？（FOB / CIF / DDP 等，可选，默认 CIF）",
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
  if (isExplicitQuoteRequest(message)) return "quote";
  return "general";
}

function isExplicitQuoteRequest(message: string): boolean {
  return (
    /(?:我要报价|请报价|正式报价|报价单|形式发票)/i.test(message) ||
    /\b(?:send\s+quotation|rfq|proforma|penawaran)\b/i.test(message) ||
    /\b(?:quote|pi)\b/i.test(message)
  );
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

  const countryMatch = message.match(/(?:country|国家|negara)[：:\s]+([A-Za-z\u4e00-\u9fff\s]+)/i);
  if (countryMatch) next.country = countryMatch[1].trim();

  const portMatch = message.match(/(?:port|港口|pelabuhan)[：:\s]+([A-Za-z\s\u4e00-\u9fff]+)/i);
  if (portMatch) next.port = portMatch[1].trim();

  if (!next.country.trim()) {
    const inlineCountry = message.match(
      /\b(Indonesia|China|Malaysia|Singapore|Philippines|Vietnam|Thailand|India|Australia)\b/i,
    );
    if (inlineCountry) next.country = inlineCountry[1];
  }

  if (!next.shippingMethod?.trim()) {
    if (/海运|sea\s*freight|by\s*sea|laut/i.test(message)) next.shippingMethod = "sea";
    else if (/空运|air\s*freight|by\s*air|udara/i.test(message)) next.shippingMethod = "air";
  }

  return next;
}

function resolveShippingDestination(state: AiConversationState): string {
  return state.destinationCity.trim() || state.port.trim() || state.country.trim() || "Jakarta";
}

function isSkipAnswer(message: string): boolean {
  return /^(无|没有|跳过|skip|n\/a|na|none|—|-)$/i.test(message.trim());
}

function parseShippingMethod(message: string): string | null {
  const trimmed = message.trim();
  if (/海运|sea\s*freight|by\s*sea|laut/i.test(trimmed)) return "sea";
  if (/空运|air\s*freight|by\s*air|udara/i.test(trimmed)) return "air";
  if (/^sea$/i.test(trimmed)) return "sea";
  if (/^air$/i.test(trimmed)) return "air";
  return null;
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

function findMissingProcurementField(state: AiConversationState): AiPendingField | null {
  if (!state.products.length) return "products";
  if (state.products.some((item) => !item.quantity || item.quantity < 1)) return "quantity";
  return null;
}

function findMissingQuoteField(state: AiConversationState): AiPendingField | null {
  if (!state.country.trim()) return "country";
  if (!state.portAsked && !state.port.trim()) return "port";
  if (!state.shippingMethod?.trim()) return "shippingMethod";
  if (!state.incoterms.trim()) return "incoterms";
  if (!state.companyName.trim()) return "companyName";
  return null;
}

function findMissingContactField(state: AiConversationState): AiPendingField | null {
  if (!state.companyName.trim()) return "companyName";
  if (!state.contactName.trim()) return "contactName";
  if (!state.whatsapp.trim()) return "whatsapp";
  return null;
}

function isQuoteFlowReady(state: AiConversationState): boolean {
  return findMissingProcurementField(state) === null && findMissingQuoteField(state) === null;
}

function buildProcurementAck(state: AiConversationState, locale: string): string {
  const summary = state.products
    .map((item) => `• ${item.productName || item.rawText}${item.productModel ? ` (${item.productModel})` : ""} ×${item.quantity ?? 1}`)
    .join("\n");

  if (locale === "zh") {
    return `已记录您的采购需求：\n${summary}\n\n如需正式报价，请回复「请报价」；也可继续补充型号、品牌或数量，或询问库存 / 交期 / 替代方案。`;
  }
  if (locale === "en") {
    return `Procurement noted:\n${summary}\n\nReply "Quote" or "Send quotation" when you want a formal quotation. You can also add models, brands, quantities, or ask about stock / lead time / alternatives.`;
  }
  return `Kebutuhan tercatat:\n${summary}\n\nBalas "Quote" atau "Penawaran" jika ingin penawaran resmi. Anda juga bisa menambah model, merek, jumlah, atau tanya stok / lead time / alternatif.`;
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
  const destination = resolveShippingDestination(state);
  const incoterms = state.incoterms || "CIF";
  try {
    const stock = await checkStockForProducts(state.products, locale);
    const preview = buildQuotePreview(state.products, destination, incoterms);
    const previewSummary = toPreviewSummary(preview);
    const profit = await analyzeProfit(state.products, destination, incoterms);
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
    const preview = buildQuotePreview(state.products, destination, incoterms);
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
  if (state.country.trim()) lines.push(`Country: ${state.country}`);
  if (state.port.trim()) lines.push(`Port: ${state.port}`);
  if (state.destinationCity.trim()) lines.push(`送到 ${state.destinationCity}`);
  if (state.shippingMethod?.trim()) {
    lines.push(state.shippingMethod === "air" ? "Air freight" : "Sea freight");
  }
  if (state.incoterms.trim()) lines.push(state.incoterms);
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
      next.portAsked = true;
      if (!isSkipAnswer(trimmed)) next.port = trimmed;
      break;
    case "shippingMethod": {
      const method = parseShippingMethod(trimmed);
      if (method) next.shippingMethod = method;
      else if (!isSkipAnswer(trimmed)) next.shippingMethod = trimmed;
      break;
    }
    case "incoterms":
      if (isSkipAnswer(trimmed)) next.incoterms = "CIF";
      else next.incoterms = trimmed.toUpperCase();
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
  const prevProductCount = conversation.state.products.length;

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

  if (state.products.length > prevProductCount) {
    state.procurementAcknowledged = false;
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
    const destination = resolveShippingDestination(state);
    const profit = await analyzeProfit(state.products, destination, state.incoterms || "CIF");
    const reply = formatProfitAnalysisReply(profit, locale);
    const profitSummary = toProfitSummary(profit);
    const message = await appendMessage(conversationId, "assistant", reply, { intent: "profit", profitAnalysis: profitSummary });
    return { conversation: await updateConversationState(conversationId, state), message, profitAnalysis: profitSummary };
  }

  if (intent === "confirm" && state.phase === "preview") {
    const missingContact = findMissingContactField(state);
    if (missingContact) {
      state.pendingField = missingContact;
      state.quoteRequested = true;
      const ask = pickLocaleText(locale, missingContact);
      const message = await appendMessage(conversationId, "assistant", ask, { awaitingField: missingContact });
      return { conversation: await updateConversationState(conversationId, state), message, awaitingField: missingContact };
    }

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

      const profit = await analyzeProfit(
        state.products,
        resolveShippingDestination(state),
        state.incoterms || "CIF",
      );
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

  if (intent === "quote" || isExplicitQuoteRequest(userMessage)) {
    state.quoteRequested = true;
  }

  const procMissing = findMissingProcurementField(state);
  if (procMissing) {
    state.pendingField = procMissing;
    state.phase = "gathering";
    const ask = pickLocaleText(locale, procMissing);
    const message = await appendMessage(conversationId, "assistant", ask, { awaitingField: procMissing });
    return { conversation: await updateConversationState(conversationId, state), message, awaitingField: procMissing };
  }

  if (!state.quoteRequested) {
    if (!state.procurementAcknowledged) {
      state.procurementAcknowledged = true;
      const ack = buildProcurementAck(state, locale);
      const message = await appendMessage(conversationId, "assistant", ack, { intent: "general" });
      return { conversation: await updateConversationState(conversationId, state), message };
    }
    const message = await appendMessage(
      conversationId,
      "assistant",
      locale === "zh"
        ? "如需正式报价，请回复「请报价」。也可继续补充产品信息，或询问库存 / 交期 / 替代方案。"
        : locale === "en"
          ? 'Reply "Quote" or "Send quotation" when you need a formal quotation. You can also add product details or ask about stock / lead time / alternatives.'
          : 'Balas "Quote" atau "Penawaran" untuk penawaran resmi. Anda juga bisa menambah detail produk atau tanya stok / lead time / alternatif.',
      { intent: "general" },
    );
    return { conversation: await updateConversationState(conversationId, state), message };
  }

  const quoteMissing = findMissingQuoteField(state);
  if (quoteMissing) {
    state.pendingField = quoteMissing;
    state.phase = "gathering";
    const ask = pickLocaleText(locale, quoteMissing);
    const message = await appendMessage(conversationId, "assistant", ask, { awaitingField: quoteMissing });
    return { conversation: await updateConversationState(conversationId, state), message, awaitingField: quoteMissing };
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
  if (state.phase !== "preview" && isQuoteFlowReady(state)) {
    state.phase = "preview";
    await updateConversationState(conversationId, state);
  }

  return processAgentMessage(conversationId, "confirm");
}

export function buildWelcomeMessage(locale: string): string {
  if (locale === "zh") {
    return "您好！我是 SuCai Cloud AI 采购员。\n\n请告诉我您需要采购什么产品？型号和数量是多少？\n\n您也可以：\n• 上传采购单（Excel / CSV / PDF / Word / TXT）\n• 粘贴产品清单\n• 询问库存 / 交期 / 替代方案\n\n需要正式报价时，请回复「请报价」。";
  }
  if (locale === "en") {
    return "Hello! I'm the SuCai Cloud AI Procurement Agent.\n\nWhat products do you need? Please share model and quantity.\n\nYou can also:\n• Upload PO files (Excel / CSV / PDF / Word / TXT)\n• Paste product lists\n• Ask about stock / lead time / alternatives\n\nWhen you need a formal quotation, reply \"Quote\" or \"Send quotation\".";
  }
  return "Halo! Saya AI Procurement Agent SuCai Cloud.\n\nProduk apa yang Anda butuhkan? Sebutkan model dan jumlahnya.\n\nAnda juga bisa:\n• Upload file PO (Excel / CSV / PDF / Word / TXT)\n• Tempel daftar produk\n• Tanya stok / lead time / alternatif\n\nUntuk penawaran resmi, balas \"Quote\" atau \"Penawaran\".";
}

export function getWhatsAppShareUrl(whatsapp: string, pdfUrl: string, quotationNo: string): string {
  return getWhatsAppUrl(whatsapp, `Penawaran resmi ${quotationNo}:\n${pdfUrl}`);
}
