import type { Metadata } from "next";
import { routing } from "@/i18n/routing";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sucaicloud.com";

/** Served by `src/app/opengraph-image.tsx` */
export const DEFAULT_OG_IMAGE_PATH = "/opengraph-image";

export function getSiteBaseUrl(): string {
  return SITE_URL.replace(/\/$/, "");
}

export function localizedPath(locale: string, path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (locale === routing.defaultLocale) {
    return normalized === "/" ? "/" : normalized;
  }
  return normalized === "/" ? `/${locale}` : `/${locale}${normalized}`;
}

export function absoluteUrl(locale: string, path: string): string {
  const pathname = localizedPath(locale, path);
  return `${getSiteBaseUrl()}${pathname === "/" ? "" : pathname}`;
}

export function absoluteSitePath(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${getSiteBaseUrl()}${normalized}`;
}

export function getDefaultOgImageUrl(): string {
  return absoluteSitePath(DEFAULT_OG_IMAGE_PATH);
}

export function buildAlternateLanguages(path: string): Record<string, string> {
  return Object.fromEntries(routing.locales.map((loc) => [loc, absoluteUrl(loc, path)]));
}

export function buildProductsSearchUrlTemplate(): string {
  const searchPath = localizedPath(routing.defaultLocale, "/products");
  return `${getSiteBaseUrl()}${searchPath}?q={search_term_string}`;
}

function openGraphLocale(locale: string): string {
  if (locale === "zh") return "zh_CN";
  if (locale === "id") return "id_ID";
  return "en_US";
}

function resolveOgImageUrl(imageUrl?: string | null): string {
  if (imageUrl?.startsWith("http://") || imageUrl?.startsWith("https://")) {
    return imageUrl;
  }
  if (imageUrl) {
    return absoluteSitePath(imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`);
  }
  return getDefaultOgImageUrl();
}

export function buildPageMetadata({
  locale,
  path,
  title,
  description,
  imageUrl,
  type = "website",
}: {
  locale: string;
  path: string;
  title: string;
  description: string;
  imageUrl?: string | null;
  type?: "website" | "article";
}): Metadata {
  const url = absoluteUrl(locale, path);
  const ogImage = resolveOgImageUrl(imageUrl);
  const images = [{ url: ogImage, alt: title, width: 1200, height: 630 }];

  return {
    title,
    description,
    alternates: {
      canonical: absoluteUrl(locale, path),
      languages: buildAlternateLanguages(path),
    },
    openGraph: {
      title,
      description,
      locale: openGraphLocale(locale),
      type,
      url,
      siteName: "速采云 SuCai Cloud",
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export const defaultSiteMetadata: Metadata = {
  metadataBase: new URL(getSiteBaseUrl()),
  openGraph: {
    images: [
      {
        url: DEFAULT_OG_IMAGE_PATH,
        width: 1200,
        height: 630,
        alt: "速采云 SuCai Cloud",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: [DEFAULT_OG_IMAGE_PATH],
  },
};
