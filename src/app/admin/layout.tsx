import type { Metadata } from "next";
import { AdminLayoutClient } from "./admin-layout-client";
import { getSiteSettings } from "@/lib/settings/settings-repository";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: `后台 | ${settings.siteName.split(/\s+/)[0] || settings.siteName}`,
    robots: { index: false, follow: false },
  };
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
