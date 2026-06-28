import { setRequestLocale } from "next-intl/server";
import { ContactSection } from "@/components/home/contact-section";
import type { Locale } from "@/i18n/routing";

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

  return <ContactSection />;
}
