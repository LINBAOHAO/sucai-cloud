import type { Category } from "@prisma/client";
import type { AdminCategory } from "@/lib/admin/types";

export function mapPrismaToAdminCategory(record: Category): AdminCategory {
  return {
    id: record.slug,
    name: record.name,
    icon: record.icon,
    sortOrder: record.sortOrder,
  };
}
