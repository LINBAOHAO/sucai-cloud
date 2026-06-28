"use client";

import ProductDetail from "@/components/products/product-detail";
import type { MockProduct } from "@/lib/product-types";

interface ProductDetailClientProps {
  product: MockProduct;
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  return <ProductDetail product={product} />;
}
