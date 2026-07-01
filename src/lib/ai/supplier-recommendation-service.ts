import { prisma } from "@/lib/prisma";
import { getDbConnected } from "@/lib/db/db-availability";

export interface SupplierRecommendation {
  supplierId: string;
  companyName: string;
  productId: string;
  productName: string;
  purchasePrice: number;
  stock: number;
  leadTime: number;
  rating: number;
  score: number;
  preferred: boolean;
}

function scoreSupplier(input: {
  purchasePrice: number;
  stock: number;
  leadTime: number;
  rating: number;
  preferred: boolean;
  minPrice: number;
  maxPrice: number;
}): number {
  const priceRange = Math.max(input.maxPrice - input.minPrice, 1);
  const priceScore = ((input.maxPrice - input.purchasePrice) / priceRange) * 40;
  const stockScore = Math.min(input.stock / 100, 1) * 25;
  const leadScore = Math.max(0, 1 - input.leadTime / 60) * 20;
  const ratingScore = (input.rating / 5) * 10;
  const preferredBonus = input.preferred ? 5 : 0;
  return Math.round((priceScore + stockScore + leadScore + ratingScore + preferredBonus) * 10) / 10;
}

export async function recommendSuppliersForProducts(
  productIds: string[],
): Promise<SupplierRecommendation[]> {
  if (!(await getDbConnected()) || productIds.length === 0) {
    return [];
  }

  try {
    const rows = await prisma.supplierProduct.findMany({
    where: { productId: { in: productIds } },
    include: {
      supplier: true,
      product: { select: { name: true } },
    },
  });

  if (rows.length === 0) {
    return [];
  }

  const prices = rows.map((r) => Number(r.purchasePrice));
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  const scored = rows.map((row) => ({
    supplierId: row.supplierId,
    companyName: row.supplier.companyName,
    productId: row.productId,
    productName: row.product.name,
    purchasePrice: Number(row.purchasePrice),
    stock: row.stock,
    leadTime: row.leadTime,
    rating: Number(row.supplier.rating),
    preferred: row.preferred,
    score: scoreSupplier({
      purchasePrice: Number(row.purchasePrice),
      stock: row.stock,
      leadTime: row.leadTime,
      rating: Number(row.supplier.rating),
      preferred: row.preferred,
      minPrice,
      maxPrice,
    }),
  }));

  return scored.sort((a, b) => b.score - a.score).slice(0, 8);
  } catch {
    return [];
  }
}

export function formatSupplierRecommendationsReply(
  recommendations: SupplierRecommendation[],
  locale: string,
): string {
  if (recommendations.length === 0) {
    if (locale === "zh") return "暂无供应商采购数据，请联系销售团队确认。";
    if (locale === "en") return "No supplier sourcing data available yet.";
    return "Belum ada data supplier — hubungi tim sales.";
  }

  const header =
    locale === "zh"
      ? "推荐供应商（综合成本/库存/交期/评分）："
      : locale === "en"
        ? "Recommended suppliers (cost / stock / lead time / rating):"
        : "Supplier rekomendasi (biaya / stok / lead time / rating):";

  const lines = recommendations.map((rec, index) => {
    const tags = [
      rec.preferred ? "★ Preferred" : null,
      `USD ${rec.purchasePrice.toFixed(2)}`,
      `stock ${rec.stock}`,
      `${rec.leadTime}d`,
      `★${rec.rating.toFixed(1)}`,
      `score ${rec.score}`,
    ]
      .filter(Boolean)
      .join(" · ");
    return `${index + 1}. ${rec.companyName} — ${rec.productName}\n   ${tags}`;
  });

  return [header, ...lines].join("\n");
}
