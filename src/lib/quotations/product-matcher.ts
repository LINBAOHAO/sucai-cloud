import { getDbConnected } from "@/lib/db/db-availability";
import { defaultAdminProducts, defaultAdminBrands } from "@/lib/admin/defaults";
import { prisma } from "@/lib/prisma";
import type { ShipLocation, StockStatus } from "@/lib/product-types";

export interface MatchedProduct {
  id: string;
  name: string;
  model: string;
  slug: string;
  sku: string;
  price: number;
  brandName: string;
  moq: number;
  stockStatus: StockStatus;
  location: ShipLocation;
}

function normalizeToken(value: string): string {
  return value.toLowerCase().replace(/[\s\-_./]/g, "");
}

function scoreMatch(query: string, product: { name: string; model: string; brandName: string; slug: string }): number {
  const q = normalizeToken(query);
  const candidates = [
    normalizeToken(`${product.brandName} ${product.model}`),
    normalizeToken(`${product.brandName}${product.model}`),
    normalizeToken(product.model),
    normalizeToken(product.name),
    normalizeToken(product.slug),
  ];

  if (candidates.some((candidate) => candidate === q)) {
    return 100;
  }
  if (candidates.some((candidate) => candidate.includes(q) || q.includes(candidate))) {
    return 80;
  }

  const qTokens = q.match(/[a-z0-9]+/g) ?? [];
  if (qTokens.length === 0) {
    return 0;
  }

  const haystack = candidates.join("");
  const hits = qTokens.filter((token) => haystack.includes(token)).length;
  return Math.round((hits / qTokens.length) * 70);
}

export async function listCatalogProducts(): Promise<MatchedProduct[]> {
  if (!(await getDbConnected())) {
    const brandMap = Object.fromEntries(defaultAdminBrands.map((brand) => [brand.id, brand.name]));
    return defaultAdminProducts.map((product) => ({
      id: product.id,
      name: product.name,
      model: product.model,
      slug: product.slug,
      sku: product.sku,
      price: product.price,
      brandName: brandMap[product.brandId] ?? "",
      moq: product.moq,
      stockStatus: product.stockStatus,
      location: product.location,
    }));
  }

  const products = await prisma.product.findMany({
    include: { brand: { select: { name: true } } },
    orderBy: { hotScore: "desc" },
  });

  return products.map((product) => ({
    id: product.id,
    name: product.name,
    model: product.model,
    slug: product.slug,
    sku: product.sku,
    price: Number(product.price),
    brandName: product.brand.name,
    moq: product.moq,
    stockStatus: product.stockStatus,
    location: product.location,
  }));
}

export async function fuzzyMatchProducts(
  rawText: string,
  limit = 5,
): Promise<Array<{ product: MatchedProduct; score: number }>> {
  const catalog = await listCatalogProducts();
  const scored = catalog
    .map((product) => ({ product, score: scoreMatch(rawText, product) }))
    .filter((item) => item.score >= 35)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
  return scored;
}

export function shouldAutoMatch(
  matches: Array<{ product: MatchedProduct; score: number }>,
): boolean {
  if (matches.length === 0) return false;
  if (matches.length === 1) return matches[0].score >= 55;
  return matches[0].score >= 75 && matches[0].score - matches[1].score >= 12;
}

export async function matchProductByText(rawText: string): Promise<MatchedProduct | null> {
  const matches = await fuzzyMatchProducts(rawText, 1);
  if (!matches.length || matches[0].score < 40) return null;
  return matches[0].product;
}

export async function matchProductsByText(
  lines: Array<{ rawText: string; quantity: number }>,
): Promise<Array<{ rawText: string; quantity: number; product: MatchedProduct }>> {
  const results: Array<{ rawText: string; quantity: number; product: MatchedProduct }> = [];

  for (const line of lines) {
    const product = await matchProductByText(line.rawText);
    if (!product) {
      throw new Error(`Product not found: ${line.rawText}`);
    }
    results.push({ ...line, product });
  }

  return results;
}
