import {
  appendMessage,
  getConversationById,
  updateConversationState,
} from "@/lib/ai/ai-conversation-repository";
import { createAiUpload } from "@/lib/ai/ai-upload-repository";
import type { AiAgentReply, AiConversationState, ConversationProductLine } from "@/lib/ai/ai-types";
import { parseUploadedProcurementFile, saveUploadFile } from "@/lib/ai/procurement-file-parser";
import type { ParsedProcurementLine } from "@/lib/ai/procurement-line-parser";
import {
  fuzzyMatchProducts,
  shouldAutoMatch,
  type MatchedProduct,
} from "@/lib/quotations/product-matcher";

function lineToProduct(line: ParsedProcurementLine, product: MatchedProduct): ConversationProductLine {
  return {
    rawText: line.rawText,
    productId: product.id,
    productName: product.name,
    productModel: product.model,
    quantity: line.quantity,
    unitPrice: product.price,
  };
}

export async function processUploadedProcurementFile(
  conversationId: string,
  buffer: Buffer,
  fileName: string,
  mimeType?: string,
): Promise<AiAgentReply> {
  const conversation = await getConversationById(conversationId);
  if (!conversation) throw new Error("Conversation not found");

  const locale = conversation.locale;
  const { fileType, lines } = await parseUploadedProcurementFile(buffer, fileName, mimeType);

  const storagePath = await saveUploadFile(conversationId, fileName, buffer);
  await createAiUpload({
    conversationId,
    fileName,
    fileType,
    fileSize: buffer.length,
    storagePath,
    parsedLineCount: lines.length,
  });

  if (lines.length === 0) {
    const errMsg =
      locale === "zh"
        ? "未能从文件中识别采购行，请检查格式或手动输入。"
        : locale === "en"
          ? "No procurement lines detected in file. Check format or type manually."
          : "Tidak ada baris pesanan terdeteksi. Periksa format atau ketik manual.";
    await appendMessage(conversationId, "user", `[Upload] ${fileName}`);
    const message = await appendMessage(conversationId, "assistant", errMsg, { intent: "upload" });
    const updated = await getConversationById(conversationId);
    if (!updated) throw new Error("Conversation not found");
    return { conversation: updated, message };
  }

  const state: AiConversationState = { ...conversation.state };
  const ambiguousLines: Array<{
    rawText: string;
    options: Array<{ productId: string; productName: string; productModel: string; unitPrice: number; score: number }>;
  }> = [];

  for (const line of lines) {
    const matches = await fuzzyMatchProducts(line.productText, 5);
    if (matches.length === 0) continue;

    if (shouldAutoMatch(matches)) {
      const merged = lineToProduct(line, matches[0].product);
      state.products = mergeLines(state.products, [merged]);
    } else {
      ambiguousLines.push({
        rawText: line.rawText,
        options: matches.map((m) => ({
          productId: m.product.id,
          productName: m.product.name,
          productModel: m.product.model,
          unitPrice: m.product.price,
          score: m.score,
        })),
      });
    }
  }

  await appendMessage(conversationId, "user", `[Upload] ${fileName} (${lines.length} lines)`);

  if (ambiguousLines.length > 0) {
    const first = ambiguousLines[0];
    state.pendingAmbiguous = {
      rawText: first.rawText,
      options: first.options,
    };
    state.lastRecommendations = first.options.map((o) => ({
      productId: o.productId,
      productName: o.productName,
      productModel: o.productModel,
      unitPrice: o.unitPrice,
      reason: "fuzzy_match",
    }));

    const header =
      locale === "zh"
        ? `已解析 ${lines.length} 行。以下产品需要确认：\n"${first.rawText}"`
        : locale === "en"
          ? `Parsed ${lines.length} lines. Please confirm product:\n"${first.rawText}"`
          : `Parsed ${lines.length} baris. Konfirmasi produk:\n"${first.rawText}"`;

    const options = first.options
      .map(
        (o, i) =>
          `${i + 1}. ${o.productName} ${o.productModel} — USD ${o.unitPrice.toFixed(2)} (score ${o.score})`,
      )
      .join("\n");

    const footer =
      locale === "zh"
        ? "\n回复序号选择产品。"
        : locale === "en"
          ? "\nReply with a number to select."
          : "\nBalas nomor untuk memilih.";

    const message = await appendMessage(conversationId, "assistant", [header, options, footer].join("\n"), {
      intent: "upload",
      ambiguous: true,
    });
    const updated = await updateConversationState(conversationId, state);
    return { conversation: updated, message };
  }

  const summary =
    locale === "zh"
      ? `已从 ${fileName} 识别 ${state.products.length} 个产品：\n${state.products.map((p) => `• ${p.productName} ×${p.quantity}`).join("\n")}`
      : locale === "en"
        ? `Identified ${state.products.length} products from ${fileName}:\n${state.products.map((p) => `• ${p.productName} ×${p.quantity}`).join("\n")}`
        : `Teridentifikasi ${state.products.length} produk dari ${fileName}:\n${state.products.map((p) => `• ${p.productName} ×${p.quantity}`).join("\n")}`;

  const message = await appendMessage(conversationId, "assistant", summary, {
    intent: "upload",
    parsedCount: lines.length,
  });
  const updated = await updateConversationState(conversationId, state);
  return { conversation: updated, message };
}

function mergeLines(
  existing: ConversationProductLine[],
  incoming: ConversationProductLine[],
): ConversationProductLine[] {
  const map = new Map<string, ConversationProductLine>();
  for (const line of existing) {
    map.set(line.productId ?? line.rawText, line);
  }
  for (const line of incoming) {
    map.set(line.productId ?? line.rawText, { ...map.get(line.productId ?? line.rawText), ...line });
  }
  return [...map.values()];
}

export async function modifyAgentOrder(conversationId: string): Promise<AiAgentReply> {
  const conversation = await getConversationById(conversationId);
  if (!conversation) throw new Error("Conversation not found");

  const state: AiConversationState = {
    ...conversation.state,
    phase: "gathering",
    quotePreview: undefined,
    pendingField: undefined,
  };

  const locale = conversation.locale;
  const text =
    locale === "zh"
      ? "好的，请修改您的订单（可粘贴文本或上传新文件）。"
      : locale === "en"
        ? "OK, please modify your order (paste text or upload a new file)."
        : "Baik, silakan ubah pesanan Anda (tempel teks atau upload file baru).";

  await appendMessage(conversationId, "user", "[Modify Order]");
  const message = await appendMessage(conversationId, "assistant", text, { intent: "modify" });
  const updated = await updateConversationState(conversationId, state);
  return { conversation: updated, message, canModify: false, canConfirm: false };
}
