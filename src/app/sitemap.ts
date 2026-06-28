import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";

const pages = ["", "/products"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://sucaicloud.com";

  return routing.locales.flatMap((locale) =>
    pages.map((page) => ({
      url:
        locale === routing.defaultLocale
          ? `${baseUrl}${page}`
          : `${baseUrl}/${locale}${page}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: page === "" ? (locale === routing.defaultLocale ? 1 : 0.8) : 0.9,
    })),
  );
}
