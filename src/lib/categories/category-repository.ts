import { unstable_noStore as noStore } from "next/cache";
import { Prisma } from "@prisma/client";
import { defaultAdminCategories } from "@/lib/admin/defaults";
import type { AdminCategory } from "@/lib/admin/types";
import { mapPrismaToAdminCategory } from "@/lib/categories/category-mapper";
import { uniqueSlug } from "@/lib/catalog/slug";
import { getDbTableCounts } from "@/lib/db/db-availability";
import { prisma } from "@/lib/prisma";

export type CategoryWriteInput = {
  name: string;
  icon: string;
  sortOrder: number;
};

async function hasDbCategories(): Promise<boolean> {
  const { connected, categories } = await getDbTableCounts();
  return connected && categories > 0;
}

export async function listCategories(): Promise<AdminCategory[]> {
  return listAdminCategories();
}

export async function listAdminCategories(): Promise<AdminCategory[]> {
  noStore();
  if (!(await hasDbCategories())) {
    return [...defaultAdminCategories];
  }
  const records = await prisma.category.findMany({
    orderBy: [{ sortOrder: "desc" }, { name: "asc" }],
  });
  return records.map(mapPrismaToAdminCategory);
}

export async function countCategories(): Promise<number> {
  noStore();
  const { connected, categories } = await getDbTableCounts();
  if (!connected || categories === 0) {
    return defaultAdminCategories.length;
  }
  return categories;
}

export async function createCategory(input: CategoryWriteInput): Promise<AdminCategory> {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured");
  }
  const slug = await uniqueSlug(input.name, async (candidate) => {
    const row = await prisma.category.findUnique({ where: { slug: candidate } });
    return Boolean(row);
  });
  const record = await prisma.category.create({
    data: {
      slug,
      name: input.name,
      icon: input.icon,
      sortOrder: input.sortOrder,
    },
  });
  return mapPrismaToAdminCategory(record);
}

export async function updateCategory(
  slug: string,
  input: CategoryWriteInput,
): Promise<AdminCategory | null> {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured");
  }
  try {
    const record = await prisma.category.update({
      where: { slug },
      data: {
        name: input.name,
        icon: input.icon,
        sortOrder: input.sortOrder,
      },
    });
    return mapPrismaToAdminCategory(record);
  } catch {
    return null;
  }
}

export async function deleteCategory(slug: string): Promise<{ ok: boolean; error?: string }> {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured");
  }
  try {
    await prisma.category.delete({ where: { slug } });
    return { ok: true };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      return { ok: false, error: "该分类下仍有产品，无法删除（Restrict 约束）" };
    }
    return { ok: false, error: "分类不存在或删除失败" };
  }
}

export async function resolveCategoryIdBySlug(slug: string): Promise<string> {
  if (!process.env.DATABASE_URL) {
    const fallback = defaultAdminCategories.find((c) => c.id === slug);
    if (!fallback) throw new Error(`Category not found: ${slug}`);
    throw new Error("DATABASE_URL is not configured");
  }
  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) throw new Error(`Category not found: ${slug}`);
  return category.id;
}
