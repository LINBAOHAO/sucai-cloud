import { unstable_noStore as noStore } from "next/cache";
import { Prisma } from "@prisma/client";
import { defaultAdminBrands } from "@/lib/admin/defaults";
import type { AdminBrand } from "@/lib/admin/types";
import { mapPrismaToAdminBrand } from "@/lib/brands/brand-mapper";
import { uniqueSlug } from "@/lib/catalog/slug";
import { getDbTableCounts } from "@/lib/db/db-availability";
import { prisma } from "@/lib/prisma";

export type BrandWriteInput = {
  name: string;
  color: string;
};

async function hasDbBrands(): Promise<boolean> {
  const { connected, brands } = await getDbTableCounts();
  return connected && brands > 0;
}

export async function listBrands(): Promise<AdminBrand[]> {
  return listAdminBrands();
}

export async function listAdminBrands(): Promise<AdminBrand[]> {
  noStore();
  if (!(await hasDbBrands())) {
    return [...defaultAdminBrands];
  }
  const records = await prisma.brand.findMany({
    orderBy: { name: "asc" },
  });
  return records.map(mapPrismaToAdminBrand);
}

export async function countBrands(): Promise<number> {
  noStore();
  const { connected, brands } = await getDbTableCounts();
  if (!connected || brands === 0) {
    return defaultAdminBrands.length;
  }
  return brands;
}

export async function createBrand(input: BrandWriteInput): Promise<AdminBrand> {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured");
  }
  const slug = await uniqueSlug(input.name, async (candidate) => {
    const row = await prisma.brand.findUnique({ where: { slug: candidate } });
    return Boolean(row);
  });
  const record = await prisma.brand.create({
    data: {
      slug,
      name: input.name,
      color: input.color,
    },
  });
  return mapPrismaToAdminBrand(record);
}

export async function updateBrand(
  slug: string,
  input: BrandWriteInput,
): Promise<AdminBrand | null> {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured");
  }
  try {
    const record = await prisma.brand.update({
      where: { slug },
      data: {
        name: input.name,
        color: input.color,
      },
    });
    return mapPrismaToAdminBrand(record);
  } catch {
    return null;
  }
}

export async function deleteBrand(slug: string): Promise<{ ok: boolean; error?: string }> {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured");
  }
  try {
    await prisma.brand.delete({ where: { slug } });
    return { ok: true };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      return { ok: false, error: "该品牌下仍有产品，无法删除（Restrict 约束）" };
    }
    return { ok: false, error: "品牌不存在或删除失败" };
  }
}

export async function resolveBrandIdBySlug(slug: string): Promise<string> {
  if (!process.env.DATABASE_URL) {
    const fallback = defaultAdminBrands.find((b) => b.id === slug);
    if (!fallback) throw new Error(`Brand not found: ${slug}`);
    throw new Error("DATABASE_URL is not configured");
  }
  const brand = await prisma.brand.findUnique({ where: { slug } });
  if (!brand) throw new Error(`Brand not found: ${slug}`);
  return brand.id;
}
