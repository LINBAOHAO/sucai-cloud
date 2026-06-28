"use client";

import { ProductCategoryTree } from "@/components/products/product-category-tree";
import type { CategoryId } from "@/lib/product-types";
import { cn } from "@/lib/utils";

interface ProductSidebarProps {
  category: CategoryId | "all";
  onCategoryChange: (cat: CategoryId | "all") => void;
  categoryCounts: Record<string, number>;
  className?: string;
}

export function ProductSidebar({
  category,
  onCategoryChange,
  categoryCounts,
  className,
}: ProductSidebarProps) {
  return (
    <div className={cn(className)}>
      <ProductCategoryTree
        selected={category}
        onSelect={onCategoryChange}
        counts={categoryCounts}
      />
    </div>
  );
}
