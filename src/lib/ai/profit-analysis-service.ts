import type { ConversationProductLine } from "@/lib/ai/ai-types";
import { prisma } from "@/lib/prisma";
import { getDbConnected } from "@/lib/db/db-availability";
import { calculateItemSubtotal } from "@/lib/quotations/quotation-repository";
import { calculateShippingCost } from "@/lib/quotations/shipping-service";

export interface ProfitLineItem {
  productName: string;
  productModel: string;
  quantity: number;
  purchasePrice: number;
  sellingPrice: number;
  purchaseTotal: number;
  sellingTotal: number;
  grossProfit: number;
  marginPercent: number;
  supplierName?: string;
}

export interface ProfitAnalysis {
  lines: ProfitLineItem[];
  totalPurchase: number;
  totalSelling: number;
  shippingCost: number;
  grossProfit: number;
  marginPercent: number;
}

async function resolvePurchasePrice(productId: string | undefined): Promise<{
  purchasePrice: number;
  supplierName?: string;
}> {
  if (!productId || !(await getDbConnected())) {
    return { purchasePrice: 0 };
  }

  try {
    const preferred = await prisma.supplierProduct.findFirst({
      where: { productId, preferred: true },
      include: { supplier: { select: { companyName: true } } },
    });
    if (preferred) {
      return {
        purchasePrice: Number(preferred.purchasePrice),
        supplierName: preferred.supplier.companyName,
      };
    }

    const fallback = await prisma.supplierProduct.findFirst({
      where: { productId },
      orderBy: { purchasePrice: "asc" },
      include: { supplier: { select: { companyName: true } } },
    });
    if (fallback) {
      return {
        purchasePrice: Number(fallback.purchasePrice),
        supplierName: fallback.supplier.companyName,
      };
    }
  } catch {
    // supplier tables may be unavailable
  }

  return { purchasePrice: 0 };
}

export async function analyzeProfit(
  products: ConversationProductLine[],
  destinationCity: string,
  incoterms: string,
): Promise<ProfitAnalysis> {
  const lines: ProfitLineItem[] = [];

  for (const item of products) {
    const quantity = item.quantity ?? 1;
    const sellingPrice = item.unitPrice ?? 0;
    const { purchasePrice, supplierName } = await resolvePurchasePrice(item.productId);
    const purchaseTotal = calculateItemSubtotal(quantity, purchasePrice);
    const sellingTotal = calculateItemSubtotal(quantity, sellingPrice);
    const grossProfit = sellingTotal - purchaseTotal;
    const marginPercent =
      sellingTotal > 0 ? Math.round((grossProfit / sellingTotal) * 1000) / 10 : 0;

    lines.push({
      productName: item.productName ?? item.rawText,
      productModel: item.productModel ?? "",
      quantity,
      purchasePrice,
      sellingPrice,
      purchaseTotal,
      sellingTotal,
      grossProfit,
      marginPercent,
      supplierName,
    });
  }

  const totalPurchase = lines.reduce((sum, line) => sum + line.purchaseTotal, 0);
  const totalSelling = lines.reduce((sum, line) => sum + line.sellingTotal, 0);
  const shippingCost = calculateShippingCost(
    destinationCity,
    products.map((item) => ({
      quantity: item.quantity ?? 1,
      unitPrice: item.unitPrice ?? 0,
    })),
    incoterms || "CIF",
  );
  const grossProfit = totalSelling - totalPurchase;
  const marginPercent =
    totalSelling > 0 ? Math.round((grossProfit / totalSelling) * 1000) / 10 : 0;

  return {
    lines,
    totalPurchase: Math.round(totalPurchase * 100) / 100,
    totalSelling: Math.round(totalSelling * 100) / 100,
    shippingCost,
    grossProfit: Math.round(grossProfit * 100) / 100,
    marginPercent,
  };
}

export function formatProfitAnalysisReply(analysis: ProfitAnalysis, locale: string): string {
  const header =
    locale === "zh"
      ? "利润分析："
      : locale === "en"
        ? "Profit analysis:"
        : "Analisis profit:";

  const lineTexts = analysis.lines.map((line) => {
    const supplier = line.supplierName ? ` (${line.supplierName})` : "";
    return `• ${line.productName} ×${line.quantity}${supplier}\n  采购 USD ${line.purchaseTotal.toFixed(2)} → 销售 USD ${line.sellingTotal.toFixed(2)} | 毛利 USD ${line.grossProfit.toFixed(2)} (${line.marginPercent}%)`;
  });

  const summary =
    locale === "zh"
      ? `\n合计采购 USD ${analysis.totalPurchase.toFixed(2)} | 销售 USD ${analysis.totalSelling.toFixed(2)}\n毛利润 USD ${analysis.grossProfit.toFixed(2)} | 毛利率 ${analysis.marginPercent}%`
      : locale === "en"
        ? `\nTotal cost USD ${analysis.totalPurchase.toFixed(2)} | Revenue USD ${analysis.totalSelling.toFixed(2)}\nGross profit USD ${analysis.grossProfit.toFixed(2)} | Margin ${analysis.marginPercent}%`
        : `\nTotal biaya USD ${analysis.totalPurchase.toFixed(2)} | Revenue USD ${analysis.totalSelling.toFixed(2)}\nProfit kotor USD ${analysis.grossProfit.toFixed(2)} | Margin ${analysis.marginPercent}%`;

  return [header, ...lineTexts, summary].join("\n");
}
