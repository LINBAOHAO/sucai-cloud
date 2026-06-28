import type { productCategories } from "./data";

export type CategoryId = (typeof productCategories)[number]["id"];

export type StockStatus = "inStock" | "preOrder";

export type ShipLocation = "shenzhen" | "guangzhou" | "yiwu" | "ningbo" | "shanghai";

export type SortOption = "newest" | "hot";

export interface MockProduct {
  id: string;
  slug: string;
  sku: string;
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
}

export const sidebarBrands = ["bosch", "makita", "schneider", "abb", "skf"] as const;

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
