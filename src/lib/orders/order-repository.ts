import { unstable_noStore as noStore } from "next/cache";
import type {
  OrderStatus as PrismaOrderStatus,
  PaymentStatus as PrismaPaymentStatus,
} from "@prisma/client";
import type { AdminOrder } from "@/lib/admin/types";
import { resolveOrCreateCustomer } from "@/lib/customers/customer-resolver";
import { generateOrderNo, mapPrismaToAdminOrder } from "@/lib/orders/order-mapper";
import type { OrderUpdateInput, OrderWriteInput } from "@/lib/orders/order-types";
import { prisma } from "@/lib/prisma";

const orderInclude = {
  items: true,
  customer: { select: { companyName: true } },
  supplier: { select: { companyName: true } },
} as const;

function calculateItemSubtotal(quantity: number, sellingPrice: number): number {
  return Math.round(quantity * sellingPrice * 100) / 100;
}

async function resolvePreferredSupplier(productId: string): Promise<{
  supplierId: string;
  purchasePrice: number;
} | null> {
  const preferred = await prisma.supplierProduct.findFirst({
    where: { productId, preferred: true },
  });
  if (preferred) {
    return {
      supplierId: preferred.supplierId,
      purchasePrice: Number(preferred.purchasePrice),
    };
  }

  const fallback = await prisma.supplierProduct.findFirst({
    where: { productId },
    orderBy: { purchasePrice: "asc" },
  });
  if (!fallback) {
    return null;
  }

  return {
    supplierId: fallback.supplierId,
    purchasePrice: Number(fallback.purchasePrice),
  };
}

export async function listAdminOrders(): Promise<AdminOrder[]> {
  noStore();
  if (!process.env.DATABASE_URL) {
    return [];
  }
  const records = await prisma.order.findMany({
    include: orderInclude,
    orderBy: { createdAt: "desc" },
  });
  return records.map(mapPrismaToAdminOrder);
}

export async function listOrdersByCustomerId(customerId: string): Promise<AdminOrder[]> {
  noStore();
  if (!process.env.DATABASE_URL) {
    return [];
  }
  const records = await prisma.order.findMany({
    where: { customerId },
    include: orderInclude,
    orderBy: { createdAt: "desc" },
  });
  return records.map(mapPrismaToAdminOrder);
}

export async function countOrders(): Promise<number> {
  noStore();
  if (!process.env.DATABASE_URL) {
    return 0;
  }
  return prisma.order.count();
}

export async function getOrderById(id: string): Promise<AdminOrder | null> {
  noStore();
  if (!process.env.DATABASE_URL) {
    return null;
  }
  const record = await prisma.order.findUnique({
    where: { id },
    include: orderInclude,
  });
  return record ? mapPrismaToAdminOrder(record) : null;
}

export async function createOrder(input: OrderWriteInput): Promise<AdminOrder> {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured");
  }

  const shippingCost = input.shippingCost ?? 0;
  const record = await prisma.order.create({
    data: {
      orderNo: generateOrderNo(),
      customerId: input.customerId,
      quotationId: input.quotationId ?? null,
      supplierId: input.supplierId ?? null,
      subtotal: input.subtotal,
      shippingCost,
      total: input.total,
      currency: input.currency ?? "USD",
      paymentStatus: (input.paymentStatus ?? "unpaid") as PrismaPaymentStatus,
      orderStatus: (input.orderStatus ?? "pending") as PrismaOrderStatus,
      trackingNo: input.trackingNo ?? "",
      shippingMethod: input.shippingMethod ?? "",
      eta: input.eta ? new Date(input.eta) : null,
      notes: input.notes ?? "",
      items: input.items?.length
        ? {
            create: input.items.map((item) => ({
              productId: item.productId ?? null,
              productName: item.productName ?? "",
              quantity: item.quantity,
              purchasePrice: item.purchasePrice ?? 0,
              sellingPrice: item.sellingPrice,
              subtotal: calculateItemSubtotal(item.quantity, item.sellingPrice),
            })),
          }
        : undefined,
    },
    include: orderInclude,
  });

  return mapPrismaToAdminOrder(record);
}

export async function updateOrder(
  id: string,
  input: OrderUpdateInput,
): Promise<AdminOrder | null> {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured");
  }

  try {
    const record = await prisma.order.update({
      where: { id },
      data: {
        ...(input.supplierId !== undefined ? { supplierId: input.supplierId || null } : {}),
        ...(input.subtotal !== undefined ? { subtotal: input.subtotal } : {}),
        ...(input.shippingCost !== undefined ? { shippingCost: input.shippingCost } : {}),
        ...(input.total !== undefined ? { total: input.total } : {}),
        ...(input.currency !== undefined ? { currency: input.currency } : {}),
        ...(input.paymentStatus !== undefined
          ? { paymentStatus: input.paymentStatus as PrismaPaymentStatus }
          : {}),
        ...(input.orderStatus !== undefined
          ? { orderStatus: input.orderStatus as PrismaOrderStatus }
          : {}),
        ...(input.trackingNo !== undefined ? { trackingNo: input.trackingNo } : {}),
        ...(input.shippingMethod !== undefined ? { shippingMethod: input.shippingMethod } : {}),
        ...(input.eta !== undefined ? { eta: input.eta ? new Date(input.eta) : null } : {}),
        ...(input.notes !== undefined ? { notes: input.notes } : {}),
      },
      include: orderInclude,
    });
    return mapPrismaToAdminOrder(record);
  } catch {
    return null;
  }
}

export async function deleteOrder(id: string): Promise<boolean> {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured");
  }
  try {
    await prisma.order.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}

export async function convertQuotationToOrder(quotationId: string): Promise<AdminOrder> {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured");
  }

  const existing = await prisma.order.findUnique({
    where: { quotationId },
    include: orderInclude,
  });
  if (existing) {
    return mapPrismaToAdminOrder(existing);
  }

  const quotation = await prisma.quotation.findUnique({
    where: { id: quotationId },
    include: { items: { orderBy: { sortOrder: "asc" } } },
  });

  if (!quotation) {
    throw new Error("Quotation not found");
  }

  let customerId = quotation.customerId;
  if (!customerId) {
    customerId = await resolveOrCreateCustomer({
      companyName: quotation.companyName,
      contactName: quotation.contactName,
      email: quotation.email,
      whatsapp: quotation.whatsapp,
      country: quotation.country,
      city: quotation.destinationCity,
    });
    await prisma.quotation.update({
      where: { id: quotationId },
      data: { customerId },
    });
  }

  let supplierId: string | null = null;
  const itemCreates: {
    productId: string | null;
    productName: string;
    quantity: number;
    purchasePrice: number;
    sellingPrice: number;
    subtotal: number;
  }[] = [];

  for (const item of quotation.items) {
    let purchasePrice = 0;
    if (item.productId) {
      const supplierInfo = await resolvePreferredSupplier(item.productId);
      if (supplierInfo) {
        purchasePrice = supplierInfo.purchasePrice;
        if (!supplierId) {
          supplierId = supplierInfo.supplierId;
        }
      }
    }

    itemCreates.push({
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      purchasePrice,
      sellingPrice: Number(item.unitPrice),
      subtotal: Number(item.subtotal),
    });
  }

  const record = await prisma.$transaction(async (tx) => {
    const order = await tx.order.create({
      data: {
        orderNo: generateOrderNo(),
        customerId,
        quotationId,
        supplierId,
        subtotal: quotation.subtotal,
        shippingCost: quotation.shippingCost,
        total: quotation.total,
        currency: quotation.currency,
        paymentStatus: "unpaid",
        orderStatus: "confirmed",
        shippingMethod: quotation.incoterms ? `${quotation.incoterms} Shipping` : "",
        eta:
          quotation.deliveryDays != null
            ? new Date(Date.now() + quotation.deliveryDays * 86_400_000)
            : null,
        notes: `Converted from quotation ${quotation.quotationNo}`,
        items: { create: itemCreates },
      },
      include: orderInclude,
    });

    if (quotation.status !== "accepted") {
      await tx.quotation.update({
        where: { id: quotationId },
        data: { status: "accepted" },
      });
    }

    return order;
  });

  return mapPrismaToAdminOrder(record);
}

/** @deprecated Use convertQuotationToOrder */
export async function createOrderFromQuotation(
  quotationId: string,
  customerId: string,
): Promise<AdminOrder | null> {
  void customerId;
  try {
    return await convertQuotationToOrder(quotationId);
  } catch {
    return null;
  }
}
