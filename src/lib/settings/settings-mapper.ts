import type { Setting } from "@prisma/client";
import type { AdminSettings } from "@/lib/admin/types";

export function mapPrismaToSiteSettings(record: Setting): AdminSettings {
  return {
    siteName: record.siteName,
    logo: record.logo,
    contactEmail: record.contactEmail,
    whatsapp: record.whatsapp,
    address: record.address,
  };
}
