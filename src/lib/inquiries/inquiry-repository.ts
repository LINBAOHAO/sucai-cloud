import { randomUUID } from "crypto";
import { unstable_noStore as noStore } from "next/cache";
import type { InquirySource, InquiryStatus } from "@prisma/client";
import type { AdminInquiry, InquiryStatus as AdminInquiryStatus } from "@/lib/admin/types";
import { getDbConnected } from "@/lib/db/db-availability";
import { resolveOrCreateCustomer } from "@/lib/customers/customer-resolver";
import { mapPrismaToAdminInquiry } from "@/lib/inquiries/inquiry-mapper";
import { prisma } from "@/lib/prisma";

export type InquiryWriteInput = {
  companyName: string;
  contactName: string;
  email?: string;
  whatsapp: string;
  country?: string;
  productName?: string;
  productModel?: string;
  quantity?: string;
  notes?: string;
  productSlug?: string;
  source: "product" | "contact";
  status?: AdminInquiryStatus;
};

export type InquiryStats = {
  todayInquiries: number;
  monthInquiries: number;
};

const memoryInquiries: AdminInquiry[] = [];
let inquiryDbUnavailable = false;

async function canUseDb(): Promise<boolean> {
  if (inquiryDbUnavailable) return false;
  if (!(await getDbConnected())) {
    inquiryDbUnavailable = true;
    return false;
  }
  try {
    await prisma.inquiry.findFirst({ select: { id: true } });
    return true;
  } catch {
    inquiryDbUnavailable = true;
    return false;
  }
}

function createMemoryInquiry(input: InquiryWriteInput): AdminInquiry {
  const record: AdminInquiry = {
    id: randomUUID(),
    submittedAt: new Date().toISOString(),
    companyName: input.companyName,
    contactName: input.contactName,
    email: input.email ?? "",
    whatsapp: input.whatsapp,
    country: input.country ?? "",
    productName: input.productName ?? "",
    productModel: input.productModel ?? "",
    quantity: input.quantity ?? "",
    notes: input.notes ?? "",
    productSlug: input.productSlug,
    source: input.source,
    status: input.status ?? "pending",
  };
  memoryInquiries.unshift(record);
  return record;
}

async function resolveProductId(productSlug?: string): Promise<string | null> {
  if (!productSlug) return null;
  const product = await prisma.product.findUnique({
    where: { slug: productSlug },
    select: { id: true },
  });
  return product?.id ?? null;
}

export async function listAdminInquiries(limit?: number): Promise<AdminInquiry[]> {
  noStore();
  if (!(await canUseDb())) {
    return limit ? memoryInquiries.slice(0, limit) : [...memoryInquiries];
  }
  const records = await prisma.inquiry.findMany({
    orderBy: { submittedAt: "desc" },
    ...(limit ? { take: limit } : {}),
  });
  return records.map(mapPrismaToAdminInquiry);
}

export async function createInquiry(input: InquiryWriteInput): Promise<AdminInquiry> {
  if (!(await canUseDb())) {
    return createMemoryInquiry(input);
  }

  try {
    const productId = await resolveProductId(input.productSlug);
    const customerId = await resolveOrCreateCustomer({
      companyName: input.companyName,
      contactName: input.contactName,
      email: input.email,
      whatsapp: input.whatsapp,
      country: input.country,
    });

    const record = await prisma.inquiry.create({
      data: {
        companyName: input.companyName,
        contactName: input.contactName,
        email: input.email ?? "",
        whatsapp: input.whatsapp,
        country: input.country ?? "",
        productName: input.productName ?? "",
        productModel: input.productModel ?? "",
        quantity: input.quantity ?? "",
        notes: input.notes ?? "",
        productSlug: input.productSlug ?? null,
        source: input.source as InquirySource,
        status: (input.status ?? "pending") as InquiryStatus,
        productId,
        customerId,
      },
    });

    return mapPrismaToAdminInquiry(record);
  } catch {
    inquiryDbUnavailable = true;
    return createMemoryInquiry(input);
  }
}

export async function updateInquiryStatus(
  id: string,
  status: AdminInquiryStatus,
): Promise<AdminInquiry | null> {
  if (!(await canUseDb())) {
    const index = memoryInquiries.findIndex((i) => i.id === id);
    if (index === -1) return null;
    memoryInquiries[index] = { ...memoryInquiries[index], status };
    return memoryInquiries[index];
  }

  try {
    const record = await prisma.inquiry.update({
      where: { id },
      data: { status: status as InquiryStatus },
    });
    return mapPrismaToAdminInquiry(record);
  } catch {
    return null;
  }
}

export async function deleteInquiry(id: string): Promise<boolean> {
  if (!(await canUseDb())) {
    const index = memoryInquiries.findIndex((i) => i.id === id);
    if (index === -1) return false;
    memoryInquiries.splice(index, 1);
    return true;
  }

  try {
    await prisma.inquiry.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}

export async function getInquiryStats(): Promise<InquiryStats> {
  noStore();
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  if (!(await canUseDb())) {
    const todayInquiries = memoryInquiries.filter(
      (i) => new Date(i.submittedAt) >= todayStart,
    ).length;
    const monthInquiries = memoryInquiries.filter(
      (i) => new Date(i.submittedAt) >= monthStart,
    ).length;
    return { todayInquiries, monthInquiries };
  }

  const [todayInquiries, monthInquiries] = await Promise.all([
    prisma.inquiry.count({ where: { submittedAt: { gte: todayStart } } }),
    prisma.inquiry.count({ where: { submittedAt: { gte: monthStart } } }),
  ]);

  return { todayInquiries, monthInquiries };
}

export async function getInquiryById(id: string): Promise<AdminInquiry | null> {
  noStore();
  if (!(await canUseDb())) {
    return memoryInquiries.find((inquiry) => inquiry.id === id) ?? null;
  }

  const record = await prisma.inquiry.findUnique({ where: { id } });
  return record ? mapPrismaToAdminInquiry(record) : null;
}
