import type { MetadataRoute } from "next";
import { absoluteSitePath } from "@/lib/seo/metadata";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api/admin"],
    },
    sitemap: absoluteSitePath("/sitemap.xml"),
  };
}
