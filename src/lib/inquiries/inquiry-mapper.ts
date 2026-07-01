import type { Inquiry } from "@prisma/client";
import type { AdminInquiry } from "@/lib/admin/types";

export function mapPrismaToAdminInquiry(record: Inquiry): AdminInquiry {
  return {
    id: record.id,
    submittedAt: record.submittedAt.toISOString(),
    companyName: record.companyName,
    contactName: record.contactName,
    email: record.email,
    whatsapp: record.whatsapp,
    country: record.country,
    productName: record.productName,
    productModel: record.productModel,
    quantity: record.quantity,
    notes: record.notes,
    productSlug: record.productSlug ?? undefined,
    source: record.source as AdminInquiry["source"],
    status: record.status as AdminInquiry["status"],
    customerId: record.customerId ?? undefined,
  };
}
