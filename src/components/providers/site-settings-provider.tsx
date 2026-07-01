"use client";

import { createContext, useContext } from "react";
import { defaultAdminSettings } from "@/lib/admin/defaults";
import type { SiteSettings } from "@/lib/site-settings";

const SiteSettingsContext = createContext<SiteSettings>(defaultAdminSettings);

export function SiteSettingsProvider({
  settings,
  children,
}: {
  settings: SiteSettings;
  children: React.ReactNode;
}) {
  return (
    <SiteSettingsContext.Provider value={settings}>{children}</SiteSettingsContext.Provider>
  );
}

export function useSiteSettings(): SiteSettings {
  return useContext(SiteSettingsContext);
}
