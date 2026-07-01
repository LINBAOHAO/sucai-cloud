import type { AdminSettings } from "@/lib/admin/types";

export type SiteSettings = AdminSettings;

export function formatSiteName(siteName: string, locale: string): string {
  if (locale === "zh") {
    return siteName.split(/\s+/)[0] || siteName;
  }
  const parts = siteName.split(/\s+/);
  if (parts.length > 1) {
    return parts.slice(1).join(" ");
  }
  return siteName;
}
