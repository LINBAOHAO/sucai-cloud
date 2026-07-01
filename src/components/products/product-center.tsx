"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { ChevronRight, Home } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { ProductSidebar } from "@/components/products/product-sidebar";
import { ProductToolbar } from "@/components/products/product-toolbar";
import { ProductGrid } from "@/components/products/product-grid";
import { resolveProductName } from "@/lib/products/product-display";
import type { AdminBrand, AdminCategory } from "@/lib/admin/types";
import type { CategoryId, MockProduct } from "@/lib/product-types";

interface ProductCenterProps {
  products: MockProduct[];
  categories: AdminCategory[];
  brands: AdminBrand[];
  initialCategory?: string | null;
  initialKeyword?: string | null;
}

function parseCategoryParam(
  value: string | null | undefined,
  validCategoryIds: Set<string>,
): CategoryId | "all" {
  if (value && validCategoryIds.has(value)) {
    return value;
  }
  return "all";
}

function SearchUrlSync({
  onKeywordApply,
}: {
  onKeywordApply: (keyword: string) => void;
}) {
  const searchParams = useSearchParams();

  useEffect(() => {
    onKeywordApply(searchParams.get("q")?.trim() ?? "");
  }, [searchParams, onKeywordApply]);

  return null;
}

function QuoteHintBanner() {
  const searchParams = useSearchParams();
  const t = useTranslations("productsPage");

  if (searchParams.get("quote") !== "1") {
    return null;
  }

  return (
    <div
      role="status"
      className="mb-4 rounded-xl border border-blue-200/80 bg-blue-50 px-4 py-3 text-sm text-blue-900"
    >
      {t("quoteHint")}
    </div>
  );
}

function CategoryUrlSync({
  validCategoryIds,
  onCategoryChange,
}: {
  validCategoryIds: Set<string>;
  onCategoryChange: (category: CategoryId | "all") => void;
}) {
  const searchParams = useSearchParams();

  useEffect(() => {
    onCategoryChange(parseCategoryParam(searchParams.get("category"), validCategoryIds));
  }, [searchParams, onCategoryChange, validCategoryIds]);

  return null;
}

export function ProductCenter({
  products,
  categories,
  brands,
  initialCategory,
  initialKeyword,
}: ProductCenterProps) {
  const t = useTranslations("productsPage");

  const validCategoryIds = useMemo(
    () => new Set(categories.map((category) => category.id)),
    [categories],
  );

  const brandLabels = useMemo(() => {
    const labels: Record<string, string> = {};
    for (const brand of brands) {
      labels[brand.id] = brand.name;
    }
    return labels;
  }, [brands]);

  const [category, setCategory] = useState<CategoryId | "all">(() =>
    parseCategoryParam(initialCategory, validCategoryIds),
  );
  const [brand, setBrand] = useState<string | "all">("all");
  const [keyword, setKeyword] = useState(initialKeyword ?? "");
  const [appliedKeyword, setAppliedKeyword] = useState(initialKeyword ?? "");

  const handleCategoryFromUrl = useCallback((next: CategoryId | "all") => {
    setCategory(next);
  }, []);

  const handleKeywordFromUrl = useCallback((next: string) => {
    setKeyword(next);
    setAppliedKeyword(next);
  }, []);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of products) {
      counts[p.categoryId] = (counts[p.categoryId] ?? 0) + 1;
    }
    return counts;
  }, [products]);

  const brandCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of products) {
      counts[p.brandId] = (counts[p.brandId] ?? 0) + 1;
    }
    return counts;
  }, [products]);

  const filteredProducts = useMemo(() => {
    const kw = appliedKeyword.toLowerCase().trim();
    return products.filter((p) => {
      if (category !== "all" && p.categoryId !== category) return false;
      if (brand !== "all" && p.brandId !== brand) return false;
      if (!kw) return true;
      const name = resolveProductName(p, (id) => t(`items.${id}.name`)).toLowerCase();
      const brandLabel = (brandLabels[p.brandId] ?? p.brandId).toLowerCase();
      const model = p.model.toLowerCase();
      return name.includes(kw) || brandLabel.includes(kw) || model.includes(kw);
    });
  }, [category, brand, appliedKeyword, t, products, brandLabels]);

  const handleReset = useCallback(() => {
    setCategory("all");
    setBrand("all");
    setKeyword("");
    setAppliedKeyword("");
  }, []);

  return (
    <div className="relative min-h-screen pt-20 pb-16">
      <Suspense fallback={null}>
        <CategoryUrlSync
          validCategoryIds={validCategoryIds}
          onCategoryChange={handleCategoryFromUrl}
        />
        <SearchUrlSync onKeywordApply={handleKeywordFromUrl} />
      </Suspense>

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
          <div className="w-full lg:w-60 lg:shrink-0 xl:w-64">
            <div className="mb-4 lg:mb-0 lg:sticky lg:top-24">
              <ProductSidebar
                categories={categories}
                brands={brands}
                category={category}
                onCategoryChange={setCategory}
                categoryCounts={categoryCounts}
                brand={brand}
                onBrandChange={setBrand}
                brandCounts={brandCounts}
              />
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <Suspense fallback={null}>
              <QuoteHintBanner />
            </Suspense>
            <ProductToolbar
              keyword={keyword}
              onKeywordChange={setKeyword}
              onSearch={() => setAppliedKeyword(keyword)}
            />

            <ProductGrid
              products={filteredProducts}
              brandLabels={brandLabels}
              onReset={handleReset}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
