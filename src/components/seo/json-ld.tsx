import type { SiteSettings } from "@/lib/site-settings";
import {
  buildProductsSearchUrlTemplate,
  getSiteBaseUrl,
} from "@/lib/seo/metadata";

type JsonLdProps = {
  settings?: Pick<SiteSettings, "siteName" | "contactEmail" | "whatsapp">;
};

export function JsonLd({ settings }: JsonLdProps) {
  const siteName = settings?.siteName ?? "速采云 SuCai Cloud";
  const siteUrl = getSiteBaseUrl();
  const telephone = settings?.whatsapp?.replace(/\s+/g, "-") ?? "+62-21-1234-5678";
  const email = settings?.contactEmail ?? "contact@sucaicloud.com";

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteName,
    url: siteUrl,
    description:
      "一站式工业用品采购平台，连接中国供应商与印尼企业采购",
    email,
    contactPoint: {
      "@type": "ContactPoint",
      telephone,
      contactType: "customer service",
      availableLanguage: ["Chinese", "English", "Indonesian"],
    },
    sameAs: [],
    areaServed: [
      { "@type": "Country", name: "Indonesia" },
      { "@type": "Country", name: "China" },
    ],
  };

  const websiteData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    url: siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: buildProductsSearchUrlTemplate(),
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteData) }}
      />
    </>
  );
}
