import type { MatchedProduct } from "@/lib/quotations/product-matcher";
import { listCatalogProducts } from "@/lib/quotations/product-matcher";
import { prisma } from "@/lib/prisma";
import { getDbConnected } from "@/lib/db/db-availability";

export interface ProductRecommendation {
  product: MatchedProduct;
  reason: "same_brand_cheaper" | "other_brand_alternative" | "more_stock";
  savings?: number;
  stockHint?: string;
}

async function getSupplierStockByProductId(): Promise<Map<string, number>> {
  const stockMap = new Map<string, number>();
  if (!(await getDbConnected())) {
    return stockMap;
  }
  try {
    const rows = await prisma.supplierProduct.groupBy({
      by: ["productId"],
      _sum: { stock: true },
    });
    for (const row of rows) {
      stockMap.set(row.productId, row._sum.stock ?? 0);
    }
  } catch {
    // supplier tables may be unavailable in partial DB setups
  }
  return stockMap;
}

async function getProductCategoryId(productId: string): Promise<string | null> {
  if (!(await getDbConnected())) return null;
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { categoryId: true },
    });
    return product?.categoryId ?? null;
  } catch {
    return null;
  }
}

export async function recommendProductAlternatives(
  referenceProductId: string | null,
  referenceText: string,
): Promise<ProductRecommendation[]> {
  const catalog = await listCatalogProducts();
  let reference: MatchedProduct | null = null;

  if (referenceProductId) {
    reference = catalog.find((p) => p.id === referenceProductId) ?? null;
  }
  if (!reference && referenceText) {
    const { matchProductByText } = await import("@/lib/quotations/product-matcher");
    reference = await matchProductByText(referenceText);
  }
  if (!reference) {
    return [];
  }

  const stockMap = await getSupplierStockByProductId();
  const refCategoryId = reference.id ? await getProductCategoryId(reference.id) : null;
  const recommendations: ProductRecommendation[] = [];

  for (const product of catalog) {
    if (product.id === reference.id) continue;

    if (
      product.brandName === reference.brandName &&
      product.price < reference.price
    ) {
      recommendations.push({
        product,
        reason: "same_brand_cheaper",
        savings: reference.price - product.price,
      });
      continue;
    }

    if (product.price < reference.price * 0.95) {
      const refStock = stockMap.get(reference.id) ?? 0;
      const prodStock = stockMap.get(product.id) ?? 0;
      if (prodStock > refStock + 10 || product.stockStatus === "inStock") {
        recommendations.push({
          product,
          reason: "more_stock",
          stockHint: prodStock > 0 ? `stock ${prodStock}` : "in stock",
        });
        continue;
      }

      if (product.brandName !== reference.brandName) {
        recommendations.push({
          product,
          reason: "other_brand_alternative",
          savings: reference.price - product.price,
        });
      }
    }
  }

  if (refCategoryId && recommendations.length < 3) {
    for (const product of catalog) {
      if (product.id === reference.id) continue;
      if (recommendations.some((r) => r.product.id === product.id)) continue;
      const catId = await getProductCategoryId(product.id);
      if (catId === refCategoryId && product.price < reference.price) {
        recommendations.push({
          product,
          reason: "other_brand_alternative",
          savings: reference.price - product.price,
        });
      }
    }
  }

  return recommendations
    .sort((a, b) => (b.savings ?? 0) - (a.savings ?? 0))
    .slice(0, 5);
}

export function formatRecommendationsReply(
  recommendations: ProductRecommendation[],
  locale: string,
): string {
  if (recommendations.length === 0) {
    if (locale === "zh") return "暂未找到更便宜的替代型号，当前选型已是较优价格。";
    if (locale === "en") return "No cheaper alternatives found — current selection is already competitive.";
    return "Belum ada alternatif lebih murah — pilihan saat ini sudah kompetitif.";
  }

  const header =
    locale === "zh"
      ? "为您推荐以下替代方案："
      : locale === "en"
        ? "Here are alternative options:"
        : "Berikut alternatif yang saya rekomendasikan:";

  const reasonLabel = (reason: ProductRecommendation["reason"]) => {
    if (locale === "zh") {
      if (reason === "same_brand_cheaper") return "同品牌低配";
      if (reason === "more_stock") return "库存更充足";
      return "其他品牌替代";
    }
    if (locale === "en") {
      if (reason === "same_brand_cheaper") return "Same brand, lower spec";
      if (reason === "more_stock") return "More stock";
      return "Other brand alternative";
    }
    if (reason === "same_brand_cheaper") return "Merek sama, spec lebih rendah";
    if (reason === "more_stock") return "Stok lebih banyak";
    return "Alternatif merek lain";
  };

  const lines = recommendations.map((rec, index) => {
    const save =
      rec.savings != null && rec.savings > 0
        ? ` (save USD ${rec.savings.toFixed(2)})`
        : rec.stockHint
          ? ` (${rec.stockHint})`
          : "";
    return `${index + 1}. ${rec.product.brandName} ${rec.product.model} — USD ${rec.product.price.toFixed(2)}${save}\n   ${reasonLabel(rec.reason)}`;
  });

  const footer =
    locale === "zh"
      ? "\n回复产品名或序号即可替换到报价清单。"
      : locale === "en"
        ? "\nReply with a product name or number to swap into your quote."
        : "\nBalas dengan nama/ nomor produk untuk mengganti ke penawaran.";

  return [header, ...lines, footer].join("\n");
}
