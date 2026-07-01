import type { Supplier, SupplierProduct } from "@prisma/client";
import type { AdminSupplier, AdminSupplierProduct } from "@/lib/admin/types";

export function mapPrismaToAdminSupplier(record: Supplier): AdminSupplier {
  return {
    id: record.id,
    companyName: record.companyName,
    contactName: record.contactName,
    whatsapp: record.whatsapp,
    email: record.email,
    address: record.address,
    city: record.city,
    country: record.country,
    paymentTerms: record.paymentTerms,
    leadTime: record.leadTime,
    rating: Number(record.rating),
    notes: record.notes,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  };
}

export function mapPrismaToAdminSupplierProduct(
  record: SupplierProduct & { supplier?: Supplier },
): AdminSupplierProduct {
  return {
    supplierId: record.supplierId,
    productId: record.productId,
    supplierName: record.supplier?.companyName,
    purchasePrice: Number(record.purchasePrice),
    moq: record.moq,
    stock: record.stock,
    leadTime: record.leadTime,
    preferred: record.preferred,
  };
}
