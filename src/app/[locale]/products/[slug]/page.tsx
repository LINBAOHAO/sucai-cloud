import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing, type Locale } from "@/i18n/routing";
import { getProductBySlug, mockProducts } from "@/lib/mock-products";
import ProductDetailClient from "./product-detail-client";

type PageParams = { locale: string; slug: string };

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    mockProducts.map((product) => ({
      locale,
      slug: product.slug,
    })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return {};

  const t = await getTranslations({ locale, namespace: "productsPage" });
  const td = await getTranslations({ locale, namespace: "productDetail" });

  return {
    title: t(`items.${product.id}.name`),
    description: td(`items.${product.id}.longDescription`),
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale as Locale);

  const product = getProductBySlug(slug);
  if (!product) notFound();

  return <ProductDetailClient product={product} />;
}
