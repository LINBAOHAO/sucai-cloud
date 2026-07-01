import type { Metadata } from "next";
import { resolveHtmlLang } from "@/lib/i18n/resolve-html-lang";
import { defaultSiteMetadata, getSiteBaseUrl } from "@/lib/seo/metadata";
import "./globals.css";

export const metadata: Metadata = {
  ...defaultSiteMetadata,
  metadataBase: new URL(getSiteBaseUrl()),
  title: {
    default: "速采云 SuCai Cloud",
    template: "%s | 速采云 SuCai Cloud",
  },
  description:
    "一站式工业用品采购平台，连接中国供应商与印尼企业采购",
  keywords: [
    "工业用品",
    "B2B采购",
    "industrial supplies",
    "perlengkapan industri",
    "速采云",
    "SuCai Cloud",
  ],
  authors: [{ name: "SuCai Cloud" }],
  creator: "SuCai Cloud",
  openGraph: {
    ...defaultSiteMetadata.openGraph,
    type: "website",
    locale: "zh_CN",
    alternateLocale: ["en_US", "id_ID"],
    url: getSiteBaseUrl(),
    siteName: "速采云 SuCai Cloud",
    title: "速采云 - 一站式工业用品采购平台",
    description: "连接中国供应商与印尼企业采购",
  },
  twitter: {
    ...defaultSiteMetadata.twitter,
    title: "速采云 SuCai Cloud",
    description: "一站式工业用品采购平台",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await resolveHtmlLang();

  return (
    <html lang={locale} className="dark" suppressHydrationWarning>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
