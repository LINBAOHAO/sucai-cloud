import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { routing, type Locale } from "@/i18n/routing";
import { listCategories } from "@/lib/categories/category-repository";
import { listBrands } from "@/lib/brands/brand-repository";
import { buildBrandLabelMap, resolveCategoryLabels } from "@/lib/catalog/catalog-display";
import {
  getAllProductSlugs,
  getProductBySlugCached,
  getRecommendedProducts,
} from "@/lib/products/product-repository";
import { resolveProductContentId, resolveProductName } from "@/lib/products/product-display";
import { SLUG_TO_MOCK_ID } from "@/lib/products/product-mapper";
import { ProductJsonLd } from "@/components/seo/product-json-ld";
import { buildPageMetadata } from "@/lib/seo/metadata";
import ProductDetailClient from "./product-detail-client";

type PageParams = { locale: string; slug: string };

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  const slugs = await getAllProductSlugs();
  return routing.locales.flatMap((locale) =>
    slugs.map((slug) => ({
      locale,
      slug,
    })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = await getProductBySlugCached(slug);
  if (!product) return {};

  const t = await getTranslations({ locale, namespace: "productsPage" });
  const td = await getTranslations({ locale, namespace: "productDetail" });
  const contentId = resolveProductContentId(product);

  const title = resolveProductName(product, (id) => t(`items.${id}.name`));
  const mockId = SLUG_TO_MOCK_ID[product.slug];
  const description = mockId
    ? td(`items.${mockId}.longDescription`)
    : product.name
      ? `${product.model} — ${product.name}`
      : td(`items.${contentId}.longDescription`);

  return buildPageMetadata({
    locale,
    path: `/products/${slug}`,
    title,
    description,
    imageUrl: product.primaryImageUrl,
    type: "website",
  });
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale as Locale);

  const product = await getProductBySlugCached(slug);
  if (!product) notFound();

  const [recommended, brands, categories, messages, t, td] = await Promise.all([
    getRecommendedProducts(product.id, 4),
    listBrands(),
    listCategories(),
    getMessages(),
    getTranslations({ locale, namespace: "productsPage" }),
    getTranslations({ locale, namespace: "productDetail" }),
  ]);

  const categoryMessages = (
    messages.productsPage as { categories?: Record<string, string> } | undefined
  )?.categories;
  const resolvedCategories = resolveCategoryLabels(categories, categoryMessages);
  const brandLabels = buildBrandLabelMap(brands);
  const categoryName =
    resolvedCategories.find((category) => category.id === product.categoryId)?.name ??
    t(`categories.${product.categoryId}`);

  const contentId = resolveProductContentId(product);
  const name = resolveProductName(product, (id) => t(`items.${id}.name`));
  const mockId = SLUG_TO_MOCK_ID[product.slug];
  const description = mockId
    ? td(`items.${mockId}.longDescription`)
    : product.name
      ? `${product.model} — ${product.name}`
      : td(`items.${contentId}.longDescription`);
  const brandName = brands.find((brand) => brand.id === product.brandId)?.name ?? product.brandId;

  return (
    <>
      <ProductJsonLd
        locale={locale}
        product={product}
        name={name}
        description={description}
        brandName={brandName}
      />
      <ProductDetailClient
        product={product}
        recommended={recommended}
        brandLabels={brandLabels}
        categoryName={categoryName}
      />
    </>
  );
}
