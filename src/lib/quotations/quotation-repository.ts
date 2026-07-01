import { randomUUID } from "crypto";
import { unstable_noStore as noStore } from "next/cache";
import type { QuotationStatus as PrismaQuotationStatus } from "@prisma/client";
import type { AdminQuotation, QuotationStatus } from "@/lib/admin/types";
import { getDbConnected } from "@/lib/db/db-availability";
import { resolveOrCreateCustomer } from "@/lib/customers/customer-resolver";
import { convertQuotationToOrder } from "@/lib/orders/order-repository";
import { mapPrismaToAdminQuotation } from "@/lib/quotations/quotation-mapper";
import { generateQuotationPdf } from "@/lib/quotations/quotation-pdf";
import {
  DEFAULT_QUOTATION_TERMS,
  type QuotationItemInput,
  type QuotationWriteInput,
} from "@/lib/quotations/quotation-types";
import { getSiteSettings } from "@/lib/settings/settings-repository";
import { prisma } from "@/lib/prisma";

const memoryQuotations: AdminQuotation[] = [];
let quotationDbUnavailable = false;

async function canUseDb(): Promise<boolean> {
  if (quotationDbUnavailable) return false;
  if (!(await getDbConnected())) {
    quotationDbUnavailable = true;
    return false;
  }
  try {
    await prisma.quotation.findFirst({ select: { id: true } });
    return true;
  } catch {
    quotationDbUnavailable = true;
    return false;
  }
}

export function generateQuotationNo(): string {
  const date = new Date();
  const ymd = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("");
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `QT-${ymd}-${rand}`;
}

function calculateItemSubtotal(quantity: number, unitPrice: number): number {
  return Math.round(quantity * unitPrice * 100) / 100;
}

function calculateTotals(
  items: QuotationItemInput[],
  shippingCost = 0,
): { subtotal: number; total: number } {
  const subtotal = items.reduce(
    (sum, item) => sum + calculateItemSubtotal(item.quantity, item.unitPrice),
    0,
  );
  const roundedSubtotal = Math.round(subtotal * 100) / 100;
  const total = Math.round((roundedSubtotal + shippingCost) * 100) / 100;
  return {
    subtotal: roundedSubtotal,
    total,
  };
}

function createMemoryQuotation(input: QuotationWriteInput): AdminQuotation {
  const shippingCost = input.shippingCost ?? 0;
  const { subtotal, total } = calculateTotals(input.items, shippingCost);
  const now = new Date().toISOString();
  const quotationNo = generateQuotationNo();
  const record: AdminQuotation = {
    id: randomUUID(),
    quotationNo,
    companyName: input.companyName,
    contactName: input.contactName,
    email: input.email ?? "",
    whatsapp: input.whatsapp,
    country: input.country ?? "Indonesia",
    destinationCity: input.destinationCity ?? "",
    inquiryId: input.inquiryId,
    subtotal,
    total,
    currency: input.currency ?? "USD",
    terms: input.terms ?? DEFAULT_QUOTATION_TERMS,
    notes: input.notes ?? "",
    status: input.status ?? "draft",
    incoterms: input.incoterms ?? "",
    deliveryDays: input.deliveryDays ?? undefined,
    shippingCost,
    validUntil: input.validUntil,
    pdfPath: "",
    pdfUrl: "",
    parentId: undefined,
    revision: 1,
    createdAt: now,
    updatedAt: now,
    items: input.items.map((item, index) => ({
      id: randomUUID(),
      productId: item.productId,
      productName: item.productName,
      productModel: item.productModel ?? "",
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      subtotal: calculateItemSubtotal(item.quantity, item.unitPrice),
      sortOrder: index,
    })),
  };
  memoryQuotations.unshift(record);
  return record;
}

async function attachPdf(quotation: AdminQuotation): Promise<AdminQuotation> {
  const settings = await getSiteSettings();
  const pdfUrl = await generateQuotationPdf({ quotation, settings });
  const updated = { ...quotation, pdfPath: pdfUrl, pdfUrl, updatedAt: new Date().toISOString() };

  if (await canUseDb()) {
    await prisma.quotation.update({
      where: { id: quotation.id },
      data: { pdfPath: pdfUrl },
    });
  } else {
    const index = memoryQuotations.findIndex((item) => item.id === quotation.id);
    if (index !== -1) {
      memoryQuotations[index] = updated;
    }
  }

  return updated;
}

export async function listAdminQuotations(): Promise<AdminQuotation[]> {
  noStore();
  if (!(await canUseDb())) {
    return [...memoryQuotations];
  }

  const records = await prisma.quotation.findMany({
    include: { items: { orderBy: { sortOrder: "asc" } } },
    orderBy: { createdAt: "desc" },
  });

  return records.map(mapPrismaToAdminQuotation);
}

export async function getQuotationById(id: string): Promise<AdminQuotation | null> {
  noStore();
  if (!(await canUseDb())) {
    return memoryQuotations.find((item) => item.id === id) ?? null;
  }

  const record = await prisma.quotation.findUnique({
    where: { id },
    include: { items: { orderBy: { sortOrder: "asc" } } },
  });

  return record ? mapPrismaToAdminQuotation(record) : null;
}

export async function createQuotation(input: QuotationWriteInput): Promise<AdminQuotation> {
  const shippingCost = input.shippingCost ?? 0;
  const { subtotal, total } = calculateTotals(input.items, shippingCost);
  const validUntil = input.validUntil ? new Date(input.validUntil) : getDefaultValidUntil();

  if (!(await canUseDb())) {
    const created = createMemoryQuotation(input);
    return attachPdf(created);
  }

  try {
    const quotationNo = generateQuotationNo();

    let customerId: string | null = null;
    if (input.inquiryId) {
      const inquiry = await prisma.inquiry.findUnique({
        where: { id: input.inquiryId },
        select: { customerId: true },
      });
      customerId = inquiry?.customerId ?? null;
    }

    if (!customerId) {
      customerId = await resolveOrCreateCustomer({
        companyName: input.companyName,
        contactName: input.contactName,
        email: input.email,
        whatsapp: input.whatsapp,
        country: input.country,
        city: input.destinationCity,
      });
    }

    const record = await prisma.quotation.create({
      data: {
        quotationNo,
        companyName: input.companyName,
        contactName: input.contactName,
        email: input.email ?? "",
        whatsapp: input.whatsapp,
        country: input.country ?? "Indonesia",
        destinationCity: input.destinationCity ?? "",
        inquiryId: input.inquiryId ?? null,
        customerId,
        subtotal,
        total,
        currency: input.currency ?? "USD",
        terms: input.terms ?? DEFAULT_QUOTATION_TERMS,
        notes: input.notes ?? "",
        status: (input.status ?? "draft") as PrismaQuotationStatus,
        incoterms: input.incoterms ?? "",
        deliveryDays: input.deliveryDays ?? null,
        shippingCost,
        validUntil,
        items: {
          create: input.items.map((item, index) => ({
            productId: item.productId ?? null,
            productName: item.productName,
            productModel: item.productModel ?? "",
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: calculateItemSubtotal(item.quantity, item.unitPrice),
            sortOrder: index,
          })),
        },
      },
      include: { items: { orderBy: { sortOrder: "asc" } } },
    });

    const mapped = mapPrismaToAdminQuotation(record);
    return attachPdf(mapped);
  } catch {
    quotationDbUnavailable = true;
    const created = createMemoryQuotation(input);
    return attachPdf(created);
  }
}

export async function updateQuotation(
  id: string,
  input: QuotationWriteInput,
): Promise<AdminQuotation | null> {
  const shippingCost = input.shippingCost ?? 0;
  const { subtotal, total } = calculateTotals(input.items, shippingCost);
  const validUntil = input.validUntil ? new Date(input.validUntil) : getDefaultValidUntil();

  if (!(await canUseDb())) {
    const index = memoryQuotations.findIndex((item) => item.id === id);
    if (index === -1) {
      return null;
    }
    const updated: AdminQuotation = {
      ...memoryQuotations[index],
      companyName: input.companyName,
      contactName: input.contactName,
      email: input.email ?? "",
      whatsapp: input.whatsapp,
      country: input.country ?? "Indonesia",
      destinationCity: input.destinationCity ?? "",
      inquiryId: input.inquiryId,
      subtotal,
      total,
      currency: input.currency ?? "USD",
      terms: input.terms ?? DEFAULT_QUOTATION_TERMS,
      notes: input.notes ?? "",
      status: input.status ?? memoryQuotations[index].status,
      incoterms: input.incoterms ?? "",
      deliveryDays: input.deliveryDays ?? undefined,
      shippingCost,
      validUntil: validUntil.toISOString(),
      updatedAt: new Date().toISOString(),
      items: input.items.map((item, itemIndex) => ({
        id: randomUUID(),
        productId: item.productId,
        productName: item.productName,
        productModel: item.productModel ?? "",
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: calculateItemSubtotal(item.quantity, item.unitPrice),
        sortOrder: itemIndex,
      })),
    };
    memoryQuotations[index] = updated;
    return attachPdf(updated);
  }

  try {
    await prisma.quotationItem.deleteMany({ where: { quotationId: id } });
    const record = await prisma.quotation.update({
      where: { id },
      data: {
        companyName: input.companyName,
        contactName: input.contactName,
        email: input.email ?? "",
        whatsapp: input.whatsapp,
        country: input.country ?? "Indonesia",
        destinationCity: input.destinationCity ?? "",
        inquiryId: input.inquiryId ?? null,
        subtotal,
        total,
        currency: input.currency ?? "USD",
        terms: input.terms ?? DEFAULT_QUOTATION_TERMS,
        notes: input.notes ?? "",
        status: (input.status ?? "draft") as PrismaQuotationStatus,
        incoterms: input.incoterms ?? "",
        deliveryDays: input.deliveryDays ?? null,
        shippingCost,
        validUntil,
        items: {
          create: input.items.map((item, index) => ({
            productId: item.productId ?? null,
            productName: item.productName,
            productModel: item.productModel ?? "",
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: calculateItemSubtotal(item.quantity, item.unitPrice),
            sortOrder: index,
          })),
        },
      },
      include: { items: { orderBy: { sortOrder: "asc" } } },
    });

    const mapped = mapPrismaToAdminQuotation(record);
    return attachPdf(mapped);
  } catch {
    return null;
  }
}

export async function deleteQuotation(id: string): Promise<boolean> {
  if (!(await canUseDb())) {
    const index = memoryQuotations.findIndex((item) => item.id === id);
    if (index === -1) {
      return false;
    }
    memoryQuotations.splice(index, 1);
    return true;
  }

  try {
    await prisma.quotation.delete({ where: { id } });
    return true;
  } catch {
    return false;
  }
}

export async function updateQuotationStatus(
  id: string,
  status: QuotationStatus,
): Promise<AdminQuotation | null> {
  if (!(await canUseDb())) {
    const index = memoryQuotations.findIndex((item) => item.id === id);
    if (index === -1) {
      return null;
    }
    memoryQuotations[index] = {
      ...memoryQuotations[index],
      status,
      updatedAt: new Date().toISOString(),
    };
    return memoryQuotations[index];
  }

  try {
    const record = await prisma.quotation.update({
      where: { id },
      data: { status: status as PrismaQuotationStatus },
      include: { items: { orderBy: { sortOrder: "asc" } } },
    });

    if (status === "accepted" && record.customerId) {
      await convertQuotationToOrder(record.id);
    }

    return mapPrismaToAdminQuotation(record);
  } catch {
    return null;
  }
}

function getDefaultValidUntil(): Date {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return date;
}

export { calculateItemSubtotal, calculateTotals };
