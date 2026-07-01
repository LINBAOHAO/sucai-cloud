import type { Quotation, QuotationItem } from "@prisma/client";
import type { AdminQuotation, AdminQuotationItem } from "@/lib/admin/types";

type QuotationWithItems = Quotation & { items: QuotationItem[] };

function decimalToNumber(value: { toString(): string }): number {
  return Number.parseFloat(value.toString());
}

export function mapPrismaToAdminQuotationItem(item: QuotationItem): AdminQuotationItem {
  return {
    id: item.id,
    productId: item.productId ?? undefined,
    productName: item.productName,
    productModel: item.productModel,
    quantity: item.quantity,
    unitPrice: decimalToNumber(item.unitPrice),
    subtotal: decimalToNumber(item.subtotal),
    sortOrder: item.sortOrder,
  };
}

export function mapPrismaToAdminQuotation(record: QuotationWithItems): AdminQuotation {
  const pdfFileName = record.pdfPath ? record.pdfPath.split("/").pop() : "";
  return {
    id: record.id,
    quotationNo: record.quotationNo,
    companyName: record.companyName,
    contactName: record.contactName,
    email: record.email,
    whatsapp: record.whatsapp,
    country: record.country,
    destinationCity: record.destinationCity,
    inquiryId: record.inquiryId ?? undefined,
    customerId: record.customerId ?? undefined,
    subtotal: decimalToNumber(record.subtotal),
    total: decimalToNumber(record.total),
    currency: record.currency,
    terms: record.terms,
    notes: record.notes,
    status: record.status,
    incoterms: record.incoterms,
    deliveryDays: record.deliveryDays ?? undefined,
    shippingCost: decimalToNumber(record.shippingCost),
    validUntil: record.validUntil?.toISOString(),
    pdfPath: record.pdfPath,
    pdfUrl: pdfFileName ? `/quotations/${pdfFileName}` : "",
    parentId: record.parentId ?? undefined,
    revision: record.revision,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    items: record.items.map(mapPrismaToAdminQuotationItem),
  };
}
