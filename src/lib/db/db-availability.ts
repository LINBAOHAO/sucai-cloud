import { cache } from "react";
import { unstable_noStore as noStore } from "next/cache";
import { prisma } from "@/lib/prisma";

export type DbTableCounts = {
  connected: boolean;
  products: number;
  categories: number;
  brands: number;
};

async function fetchDbTableCountsUncached(): Promise<DbTableCounts> {
  noStore();
  const fallback: DbTableCounts = {
    connected: false,
    products: 0,
    categories: 0,
    brands: 0,
  };

  if (!process.env.DATABASE_URL) {
    return fallback;
  }

  try {
    const [products, categories, brands] = await Promise.all([
      prisma.product.count(),
      prisma.category.count(),
      prisma.brand.count(),
    ]);

    return { connected: true, products, categories, brands };
  } catch {
    return fallback;
  }
}

/** Request-scoped cache for product/category/brand table counts. */
export const getDbTableCounts = cache(fetchDbTableCountsUncached);

async function fetchDbConnectedUncached(): Promise<boolean> {
  noStore();
  if (!process.env.DATABASE_URL) return false;

  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

/** Request-scoped cache for generic DB connectivity checks. */
export const getDbConnected = cache(fetchDbConnectedUncached);
