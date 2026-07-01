import type { Brand } from "@prisma/client";
import type { AdminBrand } from "@/lib/admin/types";

export function mapPrismaToAdminBrand(record: Brand): AdminBrand {
  return {
    id: record.slug,
    name: record.name,
    color: record.color,
  };
}
