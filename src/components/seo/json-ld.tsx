export function JsonLd() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "速采云 SuCai Cloud",
    url: "https://sucaicloud.com",
    logo: "https://sucaicloud.com/logo.png",
    description:
      "一站式工业用品采购平台，连接中国供应商与印尼企业采购",
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+62-21-1234-5678",
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
    name: "速采云 SuCai Cloud",
    url: "https://sucaicloud.com",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://sucaicloud.com/search?q={search_term_string}",
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
