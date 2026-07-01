import type { MockProduct } from "@/lib/product-types";
import { SLUG_TO_MOCK_ID } from "@/lib/products/product-mapper";

const MOCK_PRODUCT_ID = /^p\d+$/;

export function resolveProductContentId(product: MockProduct): string {
  if (MOCK_PRODUCT_ID.test(product.id)) return product.id;
  return SLUG_TO_MOCK_ID[product.slug] ?? product.id;
}

export function resolveProductName(
  product: MockProduct,
  translateById: (id: string) => string,
): string {
  const contentId = resolveProductContentId(product);
  if (MOCK_PRODUCT_ID.test(contentId)) {
    return translateById(contentId);
  }

  const mockId = SLUG_TO_MOCK_ID[product.slug];
  if (mockId) {
    return translateById(mockId);
  }

  if (product.name) return product.name;
  return product.model || product.slug;
}
