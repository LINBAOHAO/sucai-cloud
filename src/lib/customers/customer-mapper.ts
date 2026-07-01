import type { Customer } from "@prisma/client";
import type { AdminCustomer } from "@/lib/admin/types";

export function mapPrismaToAdminCustomer(record: Customer): AdminCustomer {
  return {
    id: record.id,
    companyName: record.companyName,
    contactName: record.contactName,
    email: record.email,
    whatsapp: record.whatsapp,
    phone: record.phone,
    country: record.country,
    city: record.city,
    address: record.address,
    taxNumber: record.taxNumber ?? undefined,
    notes: record.notes,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}
