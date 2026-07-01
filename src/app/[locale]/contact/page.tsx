import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ContactSection } from "@/components/home/contact-section";
import type { Locale } from "@/i18n/routing";
import { buildPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });

  return buildPageMetadata({
    locale,
    path: "/contact",
    title: t("title"),
    description: t("subtitle"),
  });
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

  return <ContactSection />;
}
