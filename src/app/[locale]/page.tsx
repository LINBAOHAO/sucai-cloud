import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing, type Locale } from "@/i18n/routing";
import { HeroBanner } from "@/components/home/hero-banner";
import { Categories } from "@/components/home/categories";
import { HotProducts } from "@/components/home/hot-products";
import { HomeWhyChoose } from "@/components/home/home-why-choose";
import { ServiceProcess } from "@/components/home/service-process";
import { HomeContactCta } from "@/components/home/home-contact-cta";
import { JsonLd } from "@/components/seo/json-ld";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });

  const alternateLanguages: Record<string, string> = {};
  for (const loc of routing.locales) {
    alternateLanguages[loc] = loc === routing.defaultLocale ? "/" : `/${loc}`;
  }

  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: locale === routing.defaultLocale ? "/" : `/${locale}`,
      languages: alternateLanguages,
    },
    openGraph: {
      title: t("title"),
      description: t("description"),
      locale: locale === "zh" ? "zh_CN" : locale === "id" ? "id_ID" : "en_US",
    },
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

  return (
    <>
      <JsonLd />
      <HeroBanner />
      <Categories />
      <HotProducts />
      <HomeWhyChoose />
      <ServiceProcess />
      <HomeContactCta />
    </>
  );
}
