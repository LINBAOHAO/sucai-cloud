import { prisma } from "@/lib/prisma";
import { getDbConnected } from "@/lib/db/db-availability";
import { recommendProductAlternatives } from "@/lib/ai/product-recommendation-service";
import type { ConversationProductLine } from "@/lib/ai/ai-types";

export interface StockCheckResult {
  productId: string;
  productName: string;
  requestedQty: number;
  availableStock: number;
  moq: number;
  sufficient: boolean;
  preferredSupplier?: string;
  leadTime?: number;
  alternativeSupplier?: string;
  alternativeProduct?: string;
}

export interface StockCheckSummary {
  allSufficient: boolean;
  results: StockCheckResult[];
  warnings: string[];
}

async function getProductStockInfo(productId: string): Promise<{
  moq: number;
  totalStock: number;
  preferredSupplier?: string;
  preferredLeadTime?: number;
  altSupplier?: string;
}> {
  const fallback = { moq: 1, totalStock: 999 };
  if (!(await getDbConnected())) {
    return fallback;
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { moq: true },
    });

    const supplierRows = await prisma.supplierProduct.findMany({
      where: { productId },
      include: { supplier: { select: { companyName: true } } },
      orderBy: [{ preferred: "desc" }, { stock: "desc" }],
    });

    const totalStock = supplierRows.reduce((sum, row) => sum + row.stock, 0);
    const preferred = supplierRows.find((row) => row.preferred) ?? supplierRows[0];
    const alt = supplierRows.find((row) => !row.preferred && row.stock > (preferred?.stock ?? 0));

    return {
      moq: product?.moq ?? 1,
      totalStock: totalStock > 0 ? totalStock : fallback.totalStock,
      preferredSupplier: preferred?.supplier.companyName,
      preferredLeadTime: preferred?.leadTime,
      altSupplier: alt?.supplier.companyName,
    };
  } catch {
    return fallback;
  }
}

export async function checkStockForProducts(
  products: ConversationProductLine[],
  locale: string,
): Promise<StockCheckSummary> {
  const results: StockCheckResult[] = [];
  const warnings: string[] = [];

  for (const item of products) {
    if (!item.productId) continue;
    const qty = item.quantity ?? 1;
    const info = await getProductStockInfo(item.productId);
    const sufficient = qty >= info.moq && qty <= info.totalStock;

    let alternativeProduct: string | undefined;
    if (!sufficient) {
      const alts = await recommendProductAlternatives(item.productId, item.rawText);
      if (alts.length > 0) {
        alternativeProduct = `${alts[0].product.brandName} ${alts[0].product.model}`;
      }
    }

    results.push({
      productId: item.productId,
      productName: item.productName ?? item.rawText,
      requestedQty: qty,
      availableStock: info.totalStock,
      moq: info.moq,
      sufficient,
      preferredSupplier: info.preferredSupplier,
      leadTime: info.preferredLeadTime,
      alternativeSupplier: !sufficient ? info.altSupplier : undefined,
      alternativeProduct: !sufficient ? alternativeProduct : undefined,
    });

    if (!sufficient) {
      const msg =
        locale === "zh"
          ? `⚠ ${item.productName}：库存不足（需要 ${qty}，可用 ${info.totalStock}，MOQ ${info.moq}）`
          : locale === "en"
            ? `⚠ ${item.productName}: insufficient stock (need ${qty}, available ${info.totalStock}, MOQ ${info.moq})`
            : `⚠ ${item.productName}: stok tidak cukup (butuh ${qty}, tersedia ${info.totalStock}, MOQ ${info.moq})`;
      warnings.push(msg);
      if (info.altSupplier) {
        warnings.push(
          locale === "zh"
            ? `  → 推荐供应商：${info.altSupplier}`
            : locale === "en"
              ? `  → Recommended supplier: ${info.altSupplier}`
              : `  → Supplier rekomendasi: ${info.altSupplier}`,
        );
      }
      if (alternativeProduct) {
        warnings.push(
          locale === "zh"
            ? `  → 建议替代产品：${alternativeProduct}`
            : locale === "en"
              ? `  → Suggested alternative: ${alternativeProduct}`
              : `  → Alternatif disarankan: ${alternativeProduct}`,
        );
      }
    }
  }

  return {
    allSufficient: results.every((r) => r.sufficient),
    results,
    warnings,
  };
}

export function formatStockWarnings(warnings: string[], locale: string): string {
  if (warnings.length === 0) return "";
  const header =
    locale === "zh"
      ? "库存检查结果："
      : locale === "en"
        ? "Stock check:"
        : "Hasil cek stok:";
  return [header, ...warnings].join("\n");
}
