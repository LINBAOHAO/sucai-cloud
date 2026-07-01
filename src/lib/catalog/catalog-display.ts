import type { AdminBrand, AdminCategory } from "@/lib/admin/types";

export const CATEGORY_GRADIENTS = [
  "from-orange-500 to-amber-500",
  "from-yellow-500 to-orange-500",
  "from-blue-500 to-cyan-500",
  "from-emerald-500 to-teal-500",
  "from-purple-500 to-violet-500",
  "from-slate-400 to-slate-600",
  "from-rose-500 to-orange-500",
  "from-indigo-500 to-blue-500",
] as const;

export function categoryGradient(index: number): string {
  return CATEGORY_GRADIENTS[index % CATEGORY_GRADIENTS.length];
}

export function resolveCategoryLabels(
  categories: AdminCategory[],
  categoryMessages?: Record<string, string>,
): AdminCategory[] {
  return categories.map((category) => ({
    ...category,
    name: categoryMessages?.[category.id] ?? category.name,
  }));
}

export function buildBrandLabelMap(brands: AdminBrand[]): Record<string, string> {
  return Object.fromEntries(brands.map((brand) => [brand.id, brand.name]));
}

export function resolveBrandName(
  brandId: string,
  brandLabels: Record<string, string>,
): string {
  return brandLabels[brandId] ?? brandId;
}
