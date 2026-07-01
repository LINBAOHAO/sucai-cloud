import type { Order, OrderItem } from "@prisma/client";
import type { AdminOrder, AdminOrderItem } from "@/lib/admin/types";

type OrderWithRelations = Order & {
  items?: OrderItem[];
  customer?: { companyName: string } | null;
  supplier?: { companyName: string } | null;
};

function decimalToNumber(value: { toString(): string }): number {
  return Number.parseFloat(value.toString());
}

export function mapPrismaToAdminOrderItem(item: OrderItem): AdminOrderItem {
  return {
    id: item.id,
    orderId: item.orderId,
    productId: item.productId ?? undefined,
    productName: item.productName,
    quantity: item.quantity,
    purchasePrice: decimalToNumber(item.purchasePrice),
    sellingPrice: decimalToNumber(item.sellingPrice),
    subtotal: decimalToNumber(item.subtotal),
  };
}

export function mapPrismaToAdminOrder(record: OrderWithRelations): AdminOrder {
  return {
    id: record.id,
    orderNo: record.orderNo,
    customerId: record.customerId,
    customerName: record.customer?.companyName,
    quotationId: record.quotationId ?? undefined,
    supplierId: record.supplierId ?? undefined,
    supplierName: record.supplier?.companyName,
    subtotal: decimalToNumber(record.subtotal),
    shippingCost: decimalToNumber(record.shippingCost),
    total: decimalToNumber(record.total),
    currency: record.currency,
    paymentStatus: record.paymentStatus,
    orderStatus: record.orderStatus,
    trackingNo: record.trackingNo,
    shippingMethod: record.shippingMethod,
    eta: record.eta?.toISOString(),
    notes: record.notes,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    items: record.items?.map(mapPrismaToAdminOrderItem) ?? [],
  };
}

export function generateOrderNo(): string {
  const date = new Date();
  const ymd = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("");
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `SO-${ymd}-${rand}`;
}
