import type { MockProduct } from "./product-types";

export const mockProducts: MockProduct[] = [
  { id: "p1", slug: "bosch-gws-750-100", sku: "SC-HW-001", categoryId: "hardware-tools", brandId: "bosch", model: "GWS 750-100", moq: 10, stockStatus: "inStock", location: "shenzhen", price: 680, hotScore: 980, sortOrder: 12, updatedAt: "2026-06-15", imageCount: 4 },
  { id: "p2", slug: "makita-9557nb", sku: "SC-HW-002", categoryId: "hardware-tools", brandId: "makita", model: "9557NB", moq: 20, stockStatus: "inStock", location: "ningbo", price: 890, hotScore: 850, sortOrder: 11, updatedAt: "2026-06-12", imageCount: 4 },
  { id: "p3", slug: "schneider-lc1d09m7c", sku: "SC-EL-001", categoryId: "electrical", brandId: "schneider", model: "LC1D09M7C", moq: 50, stockStatus: "inStock", location: "shanghai", price: 86, hotScore: 910, sortOrder: 10, updatedAt: "2026-06-10", imageCount: 3 },
  { id: "p4", slug: "abb-a9f74110", sku: "SC-EL-002", categoryId: "electrical", brandId: "abb", model: "A9F74110", moq: 100, stockStatus: "inStock", location: "shenzhen", price: 32, hotScore: 960, sortOrder: 9, updatedAt: "2026-06-08", imageCount: 3 },
  { id: "p5", slug: "bosch-safety-shoes-gb21148", sku: "SC-SF-001", categoryId: "safety", brandId: "bosch", model: "GB21148-2020", moq: 50, stockStatus: "inStock", location: "guangzhou", price: 89, hotScore: 790, sortOrder: 8, updatedAt: "2026-06-05", imageCount: 4 },
  { id: "p6", slug: "makita-h910-pro", sku: "SC-SF-002", categoryId: "safety", brandId: "makita", model: "H910 Pro", moq: 100, stockStatus: "preOrder", location: "shanghai", price: 35, hotScore: 640, sortOrder: 7, updatedAt: "2026-06-01", imageCount: 3 },
  { id: "p7", slug: "abb-ss-pipe-dn50", sku: "SC-PP-001", categoryId: "pipes", brandId: "abb", model: "304 SS DN50", moq: 20, stockStatus: "preOrder", location: "ningbo", price: 320, hotScore: 480, sortOrder: 6, updatedAt: "2026-05-28", imageCount: 3 },
  { id: "p8", slug: "schneider-pvc-u-dn32", sku: "SC-PP-002", categoryId: "pipes", brandId: "schneider", model: "PVC-U DN32", moq: 50, stockStatus: "inStock", location: "yiwu", price: 18, hotScore: 710, sortOrder: 5, updatedAt: "2026-05-25", imageCount: 3 },
  { id: "p9", slug: "abb-gate-valve-dn80", sku: "SC-VL-001", categoryId: "valves", brandId: "abb", model: "Z41H-16C DN80", moq: 5, stockStatus: "inStock", location: "ningbo", price: 1580, hotScore: 760, sortOrder: 4, updatedAt: "2026-05-20", imageCount: 4 },
  { id: "p10", slug: "skf-6205-2rs", sku: "SC-BR-001", categoryId: "bearings", brandId: "skf", model: "6205-2RS", moq: 100, stockStatus: "inStock", location: "shanghai", price: 56, hotScore: 990, sortOrder: 3, updatedAt: "2026-05-18", imageCount: 3 },
  { id: "p11", slug: "skf-lgmt-2-grease", sku: "SC-CS-001", categoryId: "consumables", brandId: "skf", model: "LGMT 2/0.4", moq: 24, stockStatus: "inStock", location: "shenzhen", price: 68, hotScore: 740, sortOrder: 2, updatedAt: "2026-05-15", imageCount: 3 },
  { id: "p12", slug: "makita-tool-box-stst19405", sku: "SC-LG-001", categoryId: "logistics", brandId: "makita", model: "STST19405", moq: 10, stockStatus: "inStock", location: "ningbo", price: 450, hotScore: 670, sortOrder: 1, updatedAt: "2026-05-10", imageCount: 4 },
];

export function getBrandLabel(brandId: string): string {
  const labels: Record<string, string> = {
    bosch: "Bosch",
    makita: "Makita",
    schneider: "Schneider",
    abb: "ABB",
    skf: "SKF",
  };
  return labels[brandId] ?? brandId;
}

export function getProductBySlug(slug: string): MockProduct | undefined {
  return mockProducts.find((p) => p.slug === slug);
}

export function getProductById(id: string): MockProduct | undefined {
  return mockProducts.find((p) => p.id === id);
}

export function getRecommendedProducts(currentId: string, limit = 4): MockProduct[] {
  const current = getProductById(currentId);
  if (!current) return mockProducts.filter((p) => p.id !== currentId).slice(0, limit);

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

export const productSlugs = mockProducts.map((p) => p.slug);
