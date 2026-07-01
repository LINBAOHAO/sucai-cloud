"use client";

import { ProductCategoryTree } from "@/components/products/product-category-tree";
import { ProductBrandTree } from "@/components/products/product-brand-tree";
import type { AdminBrand, AdminCategory } from "@/lib/admin/types";
import type { CategoryId } from "@/lib/product-types";
import { cn } from "@/lib/utils";

interface ProductSidebarProps {
  categories: AdminCategory[];
  brands: AdminBrand[];
  category: CategoryId | "all";
  onCategoryChange: (cat: CategoryId | "all") => void;
  categoryCounts: Record<string, number>;
  brand: string | "all";
  onBrandChange: (brand: string | "all") => void;
  brandCounts: Record<string, number>;
  className?: string;
}

export function ProductSidebar({
  categories,
  brands,
  category,
  onCategoryChange,
  categoryCounts,
  brand,
  onBrandChange,
  brandCounts,
  className,
}: ProductSidebarProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <ProductCategoryTree
        categories={categories}
        selected={category}
        onSelect={onCategoryChange}
        counts={categoryCounts}
      />
      <ProductBrandTree
        brands={brands}
        selected={brand}
        onSelect={onBrandChange}
        counts={brandCounts}
      />
    </div>
  );
}
