import type { Metadata } from "next";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { ProductCenter } from "@/components/products/product-center";
import { listCategories } from "@/lib/categories/category-repository";
import { listBrands } from "@/lib/brands/brand-repository";
import { resolveCategoryLabels } from "@/lib/catalog/catalog-display";
import { listProducts } from "@/lib/products/product-repository";
import { type Locale } from "@/i18n/routing";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "productsPage" });

  return buildPageMetadata({
    locale,
    path: "/products",
    title: t("title"),
    description: t("subtitle"),
  });
}

export default async function ProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const { locale } = await params;
  const { category, q } = await searchParams;
  setRequestLocale(locale as Locale);

  const [products, categories, brands, messages] = await Promise.all([
    listProducts(),
    listCategories(),
    listBrands(),
    getMessages(),
  ]);

  const categoryMessages = (
    messages.productsPage as { categories?: Record<string, string> } | undefined
  )?.categories;

  return (
    <ProductCenter
      products={products}
      categories={resolveCategoryLabels(categories, categoryMessages)}
      brands={brands}
      initialCategory={category ?? null}
      initialKeyword={q ?? null}
    />
  );
}
