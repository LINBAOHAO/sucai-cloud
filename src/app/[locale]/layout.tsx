import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { routing, type Locale } from "@/i18n/routing";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { AppProviders } from "@/components/providers/app-providers";
import { SiteSettingsProvider } from "@/components/providers/site-settings-provider";
import { getSiteSettings } from "@/lib/settings/settings-repository";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();

  return {
    title: {
      default: settings.siteName,
      template: `%s | ${settings.siteName}`,
    },
    openGraph: {
      siteName: settings.siteName,
      title: settings.siteName,
    },
    twitter: {
      title: settings.siteName,
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const [messages, settings] = await Promise.all([getMessages(), getSiteSettings()]);

  return (
    <NextIntlClientProvider messages={messages}>
      <SiteSettingsProvider settings={settings}>
        <AppProviders>
          <Header />
          <main>{children}</main>
          <Footer />
        </AppProviders>
      </SiteSettingsProvider>
    </NextIntlClientProvider>
  );
}
