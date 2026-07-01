import type { ConversationProductLine } from "@/lib/ai/ai-types";
import { calculateItemSubtotal } from "@/lib/quotations/quotation-repository";
import { calculateShippingBreakdown } from "@/lib/quotations/shipping-service";

const DEFAULT_IDR_RATE = Number(process.env.USD_TO_IDR_RATE ?? "15800");

export interface QuotePreviewLine {
  productName: string;
  productModel: string;
  quantity: number;
  unit: string;
  unitPriceUsd: number;
  subtotalUsd: number;
  subtotalIdr: number;
}

export interface QuotePreviewSummary {
  lines: QuotePreviewLine[];
  goodsSubtotalUsd: number;
  shippingUsd: number;
  insuranceUsd: number;
  subtotalUsd: number;
  totalUsd: number;
  goodsSubtotalIdr: number;
  shippingIdr: number;
  insuranceIdr: number;
  subtotalIdr: number;
  totalIdr: number;
  idrRate: number;
  incoterms: string;
  destination: string;
}

function toIdr(usd: number, rate: number): number {
  return Math.round(usd * rate);
}

function formatIdr(amount: number): string {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

export function buildQuotePreview(
  products: ConversationProductLine[],
  destinationCity: string,
  incoterms: string,
  idrRate = DEFAULT_IDR_RATE,
): QuotePreviewSummary {
  const lines: QuotePreviewLine[] = products.map((item) => {
    const quantity = item.quantity ?? 1;
    const unitPriceUsd = item.unitPrice ?? 0;
    const subtotalUsd = calculateItemSubtotal(quantity, unitPriceUsd);
    return {
      productName: item.productName ?? item.rawText,
      productModel: item.productModel ?? "",
      quantity,
      unit: "pcs",
      unitPriceUsd,
      subtotalUsd,
      subtotalIdr: toIdr(subtotalUsd, idrRate),
    };
  });

  const goodsSubtotalUsd = lines.reduce((sum, line) => sum + line.subtotalUsd, 0);
  const { freight, insurance } = calculateShippingBreakdown(
    destinationCity,
    products.map((item) => ({
      quantity: item.quantity ?? 1,
      unitPrice: item.unitPrice ?? 0,
    })),
    incoterms || "CIF",
  );

  const subtotalUsd = goodsSubtotalUsd;
  const totalUsd = Math.round((goodsSubtotalUsd + freight + insurance) * 100) / 100;

  return {
    lines,
    goodsSubtotalUsd: Math.round(goodsSubtotalUsd * 100) / 100,
    shippingUsd: freight,
    insuranceUsd: insurance,
    subtotalUsd: Math.round(subtotalUsd * 100) / 100,
    totalUsd,
    goodsSubtotalIdr: toIdr(goodsSubtotalUsd, idrRate),
    shippingIdr: toIdr(freight, idrRate),
    insuranceIdr: toIdr(insurance, idrRate),
    subtotalIdr: toIdr(subtotalUsd, idrRate),
    totalIdr: toIdr(totalUsd, idrRate),
    idrRate,
    incoterms: incoterms || "CIF",
    destination: destinationCity,
  };
}

export function formatQuotePreviewText(preview: QuotePreviewSummary, locale: string): string {
  const divider = "--------------------------------";
  const lineTexts = preview.lines.map(
    (line) =>
      `${line.productName}${line.productModel ? ` ${line.productModel}` : ""}\n${line.quantity} pcs\n${formatIdr(line.subtotalIdr)}`,
  );

  const labels =
    locale === "zh"
      ? { shipping: "运费 Shipping", insurance: "保险 Insurance", sub: "小计 Subtotal", total: "总计 Total" }
      : locale === "en"
        ? { shipping: "Shipping", insurance: "Insurance", sub: "Subtotal", total: "Total" }
        : { shipping: "Shipping", insurance: "Asuransi", sub: "Subtotal", total: "Total" };

  return [
    divider,
    ...lineTexts,
    "",
    labels.shipping,
    formatIdr(preview.shippingIdr),
    labels.insurance,
    formatIdr(preview.insuranceIdr),
    labels.sub,
    formatIdr(preview.subtotalIdr),
    labels.total,
    formatIdr(preview.totalIdr),
    divider,
  ].join("\n");
}
