import type { Brand, Category, Product, ProductImage } from "@prisma/client";
import type { AdminProduct, AdminProductImage } from "@/lib/admin/types";
import { mockProducts } from "@/lib/mock-products";
import type { MockProduct, ProductImageItem } from "@/lib/product-types";
import type { ShipLocation, StockStatus } from "@/lib/product-types";
import { getPrimaryImageUrl } from "@/lib/products/product-image-utils";

export type ProductWithRelations = Product & {
  category: Category;
  brand: Brand;
  images: ProductImage[];
};

function mapImages(images: ProductImage[]): ProductImageItem[] {
  return [...images]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((image) => ({
      id: image.id,
      url: image.url,
      alt: image.alt,
      sortOrder: image.sortOrder,
    }));
}

function mapAdminImages(images: ProductImage[]): AdminProductImage[] {
  return mapImages(images).map((image) => ({
    id: image.id,
    url: image.url,
    alt: image.alt ?? null,
    sortOrder: image.sortOrder,
  }));
}

export const SLUG_TO_MOCK_ID = Object.fromEntries(mockProducts.map((p) => [p.slug, p.id]));

export function mapPrismaToProduct(record: ProductWithRelations): MockProduct {
  const images = mapImages(record.images);
  return {
    id: record.id,
    slug: record.slug,
    sku: record.sku,
    name: record.name,
    categoryId: record.category.slug as MockProduct["categoryId"],
    brandId: record.brand.slug,
    model: record.model,
    moq: record.moq,
    stockStatus: record.stockStatus as StockStatus,
    location: record.location as ShipLocation,
    price: Number(record.price),
    hotScore: record.hotScore,
    sortOrder: record.sortOrder,
    updatedAt: record.updatedAt.toISOString().slice(0, 10),
    imageCount: images.length > 0 ? images.length : record.imageCount,
    images,
    primaryImageUrl: getPrimaryImageUrl(images),
  };
}

export function mapPrismaToAdminProduct(record: ProductWithRelations): AdminProduct {
  const product = mapPrismaToProduct(record);
  return {
    ...product,
    name: record.name,
    categoryId: record.category.slug,
    brandId: record.brand.slug,
    images: mapAdminImages(record.images),
  };
}

export function mapMockToAdminProduct(product: MockProduct): AdminProduct {
  const names: Record<string, string> = {
    p1: "工业级角磨机",
    p2: "专业级角磨机",
    p3: "马达保护断路器",
    p4: "空气开关 C32",
    p5: "防砸防穿刺劳保鞋",
    p6: "安全帽",
    p7: "304 不锈钢无缝管",
    p8: "PVC-U 给水管",
    p9: "铸钢闸阀 DN80",
    p10: "深沟球轴承 6205",
    p11: "工业润滑脂",
    p12: "工业工具箱",
  };
  return {
    ...product,
    name: names[product.id] ?? product.model,
    images: (product.images ?? []).map((image) => ({
      id: image.id,
      url: image.url,
      alt: image.alt ?? null,
      sortOrder: image.sortOrder,
    })),
  };
}
