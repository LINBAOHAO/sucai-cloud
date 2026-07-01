import { cache } from "react";
import { unstable_noStore as noStore } from "next/cache";
import { defaultAdminSettings } from "@/lib/admin/defaults";
import type { AdminSettings } from "@/lib/admin/types";
import { getDbConnected } from "@/lib/db/db-availability";
import { prisma } from "@/lib/prisma";
import { mapPrismaToSiteSettings } from "@/lib/settings/settings-mapper";

export type SiteSettings = AdminSettings;
export type SettingsWriteInput = AdminSettings;

const SETTINGS_KEY = "general";

let memorySettings: SiteSettings = { ...defaultAdminSettings };

async function canUseDb(): Promise<boolean> {
  return getDbConnected();
}

async function getSiteSettingsUncached(): Promise<SiteSettings> {
  noStore();
  if (!(await canUseDb())) {
    return { ...memorySettings };
  }

  try {
    const record = await prisma.setting.findUnique({
      where: { key: SETTINGS_KEY },
    });

    if (!record) {
      return { ...defaultAdminSettings };
    }

    return mapPrismaToSiteSettings(record);
  } catch {
    return { ...defaultAdminSettings };
  }
}

/** Request-scoped deduplication (layout metadata + layout body). */
export const getSiteSettings = cache(getSiteSettingsUncached);

export async function updateSiteSettings(input: SettingsWriteInput): Promise<SiteSettings> {
  if (!(await canUseDb())) {
    memorySettings = { ...input };
    return memorySettings;
  }

  const record = await prisma.setting.upsert({
    where: { key: SETTINGS_KEY },
    create: {
      key: SETTINGS_KEY,
      siteName: input.siteName,
      logo: input.logo,
      contactEmail: input.contactEmail,
      whatsapp: input.whatsapp,
      address: input.address,
    },
    update: {
      siteName: input.siteName,
      logo: input.logo,
      contactEmail: input.contactEmail,
      whatsapp: input.whatsapp,
      address: input.address,
    },
  });

  return mapPrismaToSiteSettings(record);
}
