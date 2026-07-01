import type { ProductImageItem } from "@/lib/product-types";

export function sortProductImages(images: ProductImageItem[]): ProductImageItem[] {
  return [...images].sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getPrimaryImageUrl(images: ProductImageItem[]): string | null {
  const sorted = sortProductImages(images);
  return sorted[0]?.url ?? null;
}
