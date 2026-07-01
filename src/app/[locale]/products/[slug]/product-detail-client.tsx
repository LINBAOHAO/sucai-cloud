"use client";

import ProductDetail from "@/components/products/product-detail";
import type { MockProduct } from "@/lib/product-types";

interface ProductDetailClientProps {
  product: MockProduct;
  recommended: MockProduct[];
  brandLabels: Record<string, string>;
  categoryName: string;
}

export default function ProductDetailClient({
  product,
  recommended,
  brandLabels,
  categoryName,
}: ProductDetailClientProps) {
  return (
    <ProductDetail
      product={product}
      recommended={recommended}
      brandLabels={brandLabels}
      categoryName={categoryName}
    />
  );
}
