export type CategoryId = string;

export type StockStatus = "inStock" | "preOrder";

export type ShipLocation = "shenzhen" | "guangzhou" | "yiwu" | "ningbo" | "shanghai";

export type SortOption = "newest" | "hot";

export interface ProductImageItem {
  id: string;
  url: string;
  alt?: string | null;
  sortOrder: number;
}

export interface MockProduct {
  id: string;
  slug: string;
  sku: string;
  /** Present when loaded from Prisma; mock catalog uses i18n keys by id instead */
  name?: string;
  categoryId: CategoryId;
  brandId: string;
  model: string;
  moq: number;
  stockStatus: StockStatus;
  location: ShipLocation;
  price: number;
  hotScore: number;
  sortOrder: number;
  updatedAt: string;
  imageCount: number;
  images?: ProductImageItem[];
  primaryImageUrl?: string | null;
}

export const sortOptions: SortOption[] = ["newest", "hot"];

export function sortProducts(products: MockProduct[], sort: SortOption): MockProduct[] {
  const sorted = [...products];
  switch (sort) {
    case "newest":
      return sorted.sort((a, b) => b.sortOrder - a.sortOrder);
    case "hot":
      return sorted.sort((a, b) => b.hotScore - a.hotScore);
  }
}
