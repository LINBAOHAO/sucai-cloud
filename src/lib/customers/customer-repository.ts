import { unstable_noStore as noStore } from "next/cache";
import { Prisma } from "@prisma/client";
import type {
  AdminCustomer,
  AdminCustomerDetail,
  AdminInquiry,
  AdminOrder,
  AdminQuotation,
} from "@/lib/admin/types";
import { mapPrismaToAdminCustomer } from "@/lib/customers/customer-mapper";
import { mapPrismaToAdminInquiry } from "@/lib/inquiries/inquiry-mapper";
import { mapPrismaToAdminOrder } from "@/lib/orders/order-mapper";
import { mapPrismaToAdminQuotation } from "@/lib/quotations/quotation-mapper";
import { prisma } from "@/lib/prisma";

export type CustomerWriteInput = {
  companyName: string;
  contactName?: string;
  email?: string;
  whatsapp?: string;
  phone?: string;
  country?: string;
  city?: string;
  address?: string;
  taxNumber?: string | null;
  notes?: string;
};

function normalizeInput(input: CustomerWriteInput) {
  return {
    companyName: input.companyName.trim(),
    contactName: input.contactName?.trim() ?? "",
    email: input.email?.trim() ?? "",
    whatsapp: input.whatsapp?.trim() ?? "",
    phone: input.phone?.trim() ?? "",
    country: input.country?.trim() ?? "",
    city: input.city?.trim() ?? "",
    address: input.address?.trim() ?? "",
    taxNumber: input.taxNumber?.trim() || null,
    notes: input.notes?.trim() ?? "",
  };
}

export async function listCustomers(search?: string): Promise<AdminCustomer[]> {
  noStore();
  if (!process.env.DATABASE_URL) {
    return [];
  }

  const q = search?.trim();
  const where: Prisma.CustomerWhereInput = q
    ? {
        OR: [
          { companyName: { contains: q, mode: "insensitive" } },
          { contactName: { contains: q, mode: "insensitive" } },
          { whatsapp: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
          { phone: { contains: q, mode: "insensitive" } },
        ],
      }
    : {};

  const records = await prisma.customer.findMany({
    where,
    orderBy: [{ updatedAt: "desc" }],
  });

  return records.map(mapPrismaToAdminCustomer);
}

export async function getCustomerById(id: string): Promise<AdminCustomer | null> {
  noStore();
  if (!process.env.DATABASE_URL) {
    return null;
  }
  const record = await prisma.customer.findUnique({ where: { id } });
  return record ? mapPrismaToAdminCustomer(record) : null;
}

export async function getCustomerDetail(id: string): Promise<AdminCustomerDetail | null> {
  noStore();
  if (!process.env.DATABASE_URL) {
    return null;
  }

  const record = await prisma.customer.findUnique({
    where: { id },
    include: {
      inquiries: { orderBy: { submittedAt: "desc" } },
      quotations: {
        include: { items: { orderBy: { sortOrder: "asc" } } },
        orderBy: { createdAt: "desc" },
      },
      orders: {
        include: { items: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!record) {
    return null;
  }

  const inquiries: AdminInquiry[] = record.inquiries.map(mapPrismaToAdminInquiry);
  const quotations: AdminQuotation[] = record.quotations.map(mapPrismaToAdminQuotation);
  const orders: AdminOrder[] = record.orders.map(mapPrismaToAdminOrder);

  const totalRevenue = orders
    .filter(
      (order) =>
        order.orderStatus === "completed" ||
        order.orderStatus === "delivered" ||
        order.paymentStatus === "paid",
    )
    .reduce((sum, order) => sum + order.total, 0);

  const currency = orders[0]?.currency ?? quotations[0]?.currency ?? "USD";

  return {
    ...mapPrismaToAdminCustomer(record),
    inquiries,
    quotations,
    orders,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    currency,
  };
}

export async function createCustomer(input: CustomerWriteInput): Promise<AdminCustomer> {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured");
  }
  const data = normalizeInput(input);
  if (!data.companyName) {
    throw new Error("Company name is required");
  }
  const record = await prisma.customer.create({ data });
  return mapPrismaToAdminCustomer(record);
}

export async function updateCustomer(
  id: string,
  input: CustomerWriteInput,
): Promise<AdminCustomer | null> {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured");
  }
  const data = normalizeInput(input);
  if (!data.companyName) {
    throw new Error("Company name is required");
  }
  try {
    const record = await prisma.customer.update({ where: { id }, data });
    return mapPrismaToAdminCustomer(record);
  } catch {
    return null;
  }
}

export async function deleteCustomer(id: string): Promise<{ ok: boolean; error?: string }> {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured");
  }
  try {
    await prisma.customer.delete({ where: { id } });
    return { ok: true };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      return { ok: false, error: "该客户仍有关联订单，无法删除" };
    }
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return { ok: false, error: "客户不存在" };
    }
    return { ok: false, error: "删除失败" };
  }
}
