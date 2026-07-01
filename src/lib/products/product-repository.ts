import type { Prisma } from "@prisma/client";
import { cache } from "react";
import { unstable_noStore as noStore } from "next/cache";
import type { AdminProduct } from "@/lib/admin/types";
import { resolveBrandIdBySlug } from "@/lib/brands/brand-repository";
import { resolveCategoryIdBySlug } from "@/lib/categories/category-repository";
import { getDbTableCounts } from "@/lib/db/db-availability";
import { mockProducts } from "@/lib/mock-products";
import { prisma } from "@/lib/prisma";
import {
  mapMockToAdminProduct,
  mapPrismaToAdminProduct,
  mapPrismaToProduct,
} from "@/lib/products/product-mapper";
import { deleteAllProductImages } from "@/lib/products/product-image-repository";
import type { MockProduct } from "@/lib/product-types";
import type { ShipLocation, StockStatus } from "@/lib/product-types";

const productInclude = {
  category: true,
  brand: true,
  images: { orderBy: { sortOrder: "asc" as const } },
} satisfies Prisma.ProductInclude;

export type ProductWriteInput = {
  slug: string;
  sku: string;
  name: string;
  categoryId: string;
  brandId: string;
  model: string;
  moq: number;
  stockStatus: StockStatus;
  location: ShipLocation;
  price: number;
  hotScore: number;
  sortOrder: number;
  imageCount: number;
};

async function hasDbProducts(): Promise<boolean> {
  const { connected, products } = await getDbTableCounts();
  return connected && products > 0;
}

function mockRecommendedProducts(currentId: string, limit: number): MockProduct[] {
  const current = mockProducts.find((p) => p.id === currentId);
  if (!current) {
    return mockProducts.filter((p) => p.id !== currentId).slice(0, limit);
  }
  const sameCategory = mockProducts.filter(
    (p) => p.id !== currentId && p.categoryId === current.categoryId,
  );
  const others = mockProducts.filter(
    (p) => p.id !== currentId && p.categoryId !== current.categoryId,
  );
  return [...sameCategory, ...others]
    .sort((a, b) => b.hotScore - a.hotScore)
    .slice(0, limit);
}

async function fetchRecommendedFromDb(
  currentId: string,
  limit: number,
): Promise<MockProduct[]> {
  const current = await prisma.product.findUnique({
    where: { id: currentId },
    select: { id: true, categoryId: true },
  });

  if (!current) {
    const records = await prisma.product.findMany({
      where: { id: { not: currentId } },
      include: productInclude,
      orderBy: [{ hotScore: "desc" }],
      take: limit,
    });
    return records.map(mapPrismaToProduct);
  }

  const sameCategory = await prisma.product.findMany({
    where: {
      id: { not: currentId },
      categoryId: current.categoryId,
    },
    include: productInclude,
    orderBy: [{ hotScore: "desc" }],
    take: limit,
  });

  if (sameCategory.length >= limit) {
    return sameCategory.map(mapPrismaToProduct);
  }

  const excludeIds = new Set(sameCategory.map((record) => record.id));
  excludeIds.add(currentId);

  const others = await prisma.product.findMany({
    where: { id: { notIn: [...excludeIds] } },
    include: productInclude,
    orderBy: [{ hotScore: "desc" }],
    take: limit - sameCategory.length,
  });

  return [...sameCategory, ...others].map(mapPrismaToProduct);
}

function mockAdminProducts(): AdminProduct[] {
  return mockProducts.map(mapMockToAdminProduct);
}

async function resolveCategoryId(categorySlug: string): Promise<string> {
  return resolveCategoryIdBySlug(categorySlug);
}

async function resolveBrandId(brandSlug: string): Promise<string> {
  return resolveBrandIdBySlug(brandSlug);
}

export async function listProducts(): Promise<MockProduct[]> {
  noStore();
  if (!(await hasDbProducts())) {
    return [...mockProducts];
  }
  const records = await prisma.product.findMany({
    include: productInclude,
    orderBy: [{ sortOrder: "desc" }, { hotScore: "desc" }],
  });
  return records.map(mapPrismaToProduct);
}

export async function listAdminProducts(): Promise<AdminProduct[]> {
  if (!(await hasDbProducts())) {
    return mockAdminProducts();
  }
  const records = await prisma.product.findMany({
    include: productInclude,
    orderBy: [{ sortOrder: "desc" }, { updatedAt: "desc" }],
  });
  return records.map(mapPrismaToAdminProduct);
}

export async function getProductBySlug(slug: string): Promise<MockProduct | undefined> {
  noStore();
  if (!(await hasDbProducts())) {
    return mockProducts.find((p) => p.slug === slug);
  }
  const record = await prisma.product.findUnique({
    where: { slug },
    include: productInclude,
  });
  return record ? mapPrismaToProduct(record) : undefined;
}

/** Dedupes product fetch within a single request (metadata + page). */
export const getProductBySlugCached = cache(getProductBySlug);

export async function getProductsBySlugs(slugs: string[]): Promise<MockProduct[]> {
  noStore();
  if (!(await hasDbProducts())) {
    return slugs
      .map((slug) => mockProducts.find((p) => p.slug === slug))
      .filter((p): p is MockProduct => Boolean(p));
  }
  const records = await prisma.product.findMany({
    where: { slug: { in: slugs } },
    include: productInclude,
  });
  const bySlug = new Map(records.map((r) => [r.slug, mapPrismaToProduct(r)]));
  return slugs.map((slug) => bySlug.get(slug)).filter((p): p is MockProduct => Boolean(p));
}

export async function getRecommendedProducts(
  currentId: string,
  limit = 4,
): Promise<MockProduct[]> {
  noStore();
  if (!(await hasDbProducts())) {
    return mockRecommendedProducts(currentId, limit);
  }
  return fetchRecommendedFromDb(currentId, limit);
}

export async function getAllProductSlugs(): Promise<string[]> {
  noStore();
  if (!(await hasDbProducts())) {
    return mockProducts.map((p) => p.slug);
  }
  const rows = await prisma.product.findMany({ select: { slug: true } });
  return rows.map((r) => r.slug);
}

export async function countProducts(): Promise<number> {
  const { connected, products } = await getDbTableCounts();
  if (!connected || products === 0) {
    return mockProducts.length;
  }
  return products;
}

export async function createProduct(input: ProductWriteInput): Promise<AdminProduct> {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured");
  }
  const [categoryId, brandId] = await Promise.all([
    resolveCategoryId(input.categoryId),
    resolveBrandId(input.brandId),
  ]);
  const record = await prisma.product.create({
    data: {
      slug: input.slug,
      sku: input.sku,
      name: input.name,
      model: input.model,
      moq: input.moq,
      stockStatus: input.stockStatus,
      location: input.location,
      price: input.price,
      hotScore: input.hotScore,
      sortOrder: input.sortOrder,
      imageCount: 0,
      categoryId,
      brandId,
    },
    include: productInclude,
  });
  return mapPrismaToAdminProduct(record);
}

export async function updateProduct(
  id: string,
  input: ProductWriteInput,
): Promise<AdminProduct | null> {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured");
  }
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) return null;

  const [categoryId, brandId] = await Promise.all([
    resolveCategoryId(input.categoryId),
    resolveBrandId(input.brandId),
  ]);
  const imageCount = await prisma.productImage.count({ where: { productId: id } });

  const record = await prisma.product.update({
    where: { id },
    data: {
      slug: input.slug,
      sku: input.sku,
      name: input.name,
      model: input.model,
      moq: input.moq,
      stockStatus: input.stockStatus,
      location: input.location,
      price: input.price,
      hotScore: input.hotScore,
      sortOrder: input.sortOrder,
      imageCount,
      categoryId,
      brandId,
    },
    include: productInclude,
  });
  return mapPrismaToAdminProduct(record);
}

export async function deleteProduct(id: string): Promise<boolean> {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured");
  }
  try {
    await deleteAllProductImages(id);
    await prisma.product.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}
