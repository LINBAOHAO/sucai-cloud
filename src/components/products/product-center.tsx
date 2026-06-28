"use client";

import { useMemo, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { ChevronRight, Home } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { ProductSidebar } from "@/components/products/product-sidebar";
import { ProductToolbar } from "@/components/products/product-toolbar";
import { ProductGrid } from "@/components/products/product-grid";
import { mockProducts, getBrandLabel } from "@/lib/mock-products";
import type { CategoryId } from "@/lib/product-types";

export function ProductCenter() {
  const t = useTranslations("productsPage");

  const [category, setCategory] = useState<CategoryId | "all">("all");
  const [keyword, setKeyword] = useState("");
  const [appliedKeyword, setAppliedKeyword] = useState("");

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of mockProducts) {
      counts[p.categoryId] = (counts[p.categoryId] ?? 0) + 1;
    }
    return counts;
  }, []);

  const filteredProducts = useMemo(() => {
    const kw = appliedKeyword.toLowerCase().trim();
    return mockProducts.filter((p) => {
      if (category !== "all" && p.categoryId !== category) return false;
      if (!kw) return true;
      const name = t(`items.${p.id}.name`).toLowerCase();
      const brandLabel = getBrandLabel(p.brandId).toLowerCase();
      const model = p.model.toLowerCase();
      return name.includes(kw) || brandLabel.includes(kw) || model.includes(kw);
    });
  }, [category, appliedKeyword, t]);

  const handleReset = useCallback(() => {
    setCategory("all");
    setKeyword("");
    setAppliedKeyword("");
  }, []);

  return (
    <div className="relative min-h-screen pt-20 pb-16">
      <div className="absolute inset-0 grid-pattern opacity-30" />
      <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-orange-500/5 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground">
          <Link href="/" className="flex items-center gap-1 transition-colors hover:text-orange-400">
            <Home className="h-3.5 w-3.5" />
            {t("breadcrumb.home")}
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-orange-400">{t("breadcrumb.products")}</span>
        </nav>

        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            <span className="text-gradient">{t("title")}</span>
          </h1>
          <p className="mt-2 text-muted-foreground">{t("subtitle")}</p>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
          <aside className="hidden w-60 shrink-0 lg:block xl:w-64">
            <div className="sticky top-24">
              <ProductSidebar
                category={category}
                onCategoryChange={setCategory}
                categoryCounts={categoryCounts}
              />
            </div>
          </aside>

          <div className="min-w-0 flex-1">
            <div className="mb-4 lg:hidden">
              <ProductSidebar
                category={category}
                onCategoryChange={setCategory}
                categoryCounts={categoryCounts}
              />
            </div>

            <ProductToolbar
              keyword={keyword}
              onKeywordChange={setKeyword}
              onSearch={() => setAppliedKeyword(keyword)}
            />

            <ProductGrid products={filteredProducts} onReset={handleReset} />
          </div>
        </div>
      </div>
    </div>
  );
}
