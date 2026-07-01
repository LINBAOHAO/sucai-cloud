import type { Metadata } from "next";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { type Locale } from "@/i18n/routing";
import { HeroBanner } from "@/components/home/hero-banner";
import { Categories } from "@/components/home/categories";
import { HotProducts } from "@/components/home/hot-products";
import { listCategories } from "@/lib/categories/category-repository";
import { listBrands } from "@/lib/brands/brand-repository";
import { resolveCategoryLabels, buildBrandLabelMap } from "@/lib/catalog/catalog-display";
import { HomeWhyChoose } from "@/components/home/home-why-choose";
import { ServiceProcess } from "@/components/home/service-process";
import { HomeTrustedBrands } from "@/components/home/home-trusted-brands";
import { HomeContactCta } from "@/components/home/home-contact-cta";
import { JsonLd } from "@/components/seo/json-ld";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { getProductsBySlugs } from "@/lib/products/product-repository";
import { homeFeaturedProducts } from "@/lib/home-content";
import { getSiteSettings } from "@/lib/settings/settings-repository";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });

  return buildPageMetadata({
    locale,
    path: "/",
    title: t("title"),
    description: t("description"),
  });
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

  const [featuredSlugs, settings, categories, brands, messages] = await Promise.all([
    Promise.resolve(homeFeaturedProducts.map((p) => p.slug)),
    getSiteSettings(),
    listCategories(),
    listBrands(),
    getMessages(),
  ]);
  const catalogProducts = await getProductsBySlugs(featuredSlugs);
  const catalogBySlug = new Map(catalogProducts.map((product) => [product.slug, product]));
  const availableSlugs = new Set(catalogProducts.map((p) => p.slug));
  const categoryMessages = (
    messages.productsPage as { categories?: Record<string, string> } | undefined
  )?.categories;
  const homeCategories = resolveCategoryLabels(categories, categoryMessages);
  const brandLabels = buildBrandLabelMap(brands);
  const featuredProducts = homeFeaturedProducts
    .filter((p) => availableSlugs.has(p.slug))
    .map((product) => {
      const catalog = catalogBySlug.get(product.slug);
      return {
        ...product,
        brand: catalog
          ? (brandLabels[catalog.brandId] ?? catalog.brandId)
          : product.brand,
        primaryImageUrl: catalog?.primaryImageUrl ?? null,
      };
    });

  return (
    <>
      <JsonLd settings={settings} />
      <HeroBanner />
      <Categories categories={homeCategories} />
      <HotProducts products={featuredProducts} />
      <HomeWhyChoose />
      <ServiceProcess />
      <HomeTrustedBrands brands={brands} />
      <HomeContactCta />
    </>
  );
}
