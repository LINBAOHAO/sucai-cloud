import { setRequestLocale } from "next-intl/server";
import { WhyChoose } from "@/components/home/why-choose";
import type { Locale } from "@/i18n/routing";

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale as Locale);

  return <WhyChoose />;
}
