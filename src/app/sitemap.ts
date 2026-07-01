import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { getAllProductSlugs } from "@/lib/products/product-repository";
import { getSiteBaseUrl, localizedPath } from "@/lib/seo/metadata";

const staticPages = ["", "/products", "/about", "/contact"] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteBaseUrl();
  const productSlugs = await getAllProductSlugs();

  const staticEntries = routing.locales.flatMap((locale) =>
    staticPages.map((page) => ({
      url: `${baseUrl}${localizedPath(locale, page)}`.replace(/\/$/, "") || baseUrl,
      lastModified: new Date(),
      changeFrequency: page === "" ? ("weekly" as const) : ("weekly" as const),
      priority: page === "" ? (locale === routing.defaultLocale ? 1 : 0.8) : 0.9,
    })),
  );

  const productEntries = routing.locales.flatMap((locale) =>
    productSlugs.map((slug) => ({
      url: `${baseUrl}${localizedPath(locale, `/products/${slug}`)}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  );

  return [...staticEntries, ...productEntries];
}
