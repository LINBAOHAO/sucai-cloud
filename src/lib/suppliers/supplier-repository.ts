import { unstable_noStore as noStore } from "next/cache";
import { Prisma } from "@prisma/client";
import type { AdminSupplier } from "@/lib/admin/types";
import { mapPrismaToAdminSupplier } from "@/lib/suppliers/supplier-mapper";
import { prisma } from "@/lib/prisma";

export type SupplierWriteInput = {
  companyName: string;
  contactName?: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  city?: string;
  country?: string;
  paymentTerms?: string;
  leadTime?: number;
  rating?: number;
  notes?: string;
};

function normalizeInput(input: SupplierWriteInput) {
  return {
    companyName: input.companyName.trim(),
    contactName: input.contactName?.trim() ?? "",
    whatsapp: input.whatsapp?.trim() ?? "",
    email: input.email?.trim() ?? "",
    address: input.address?.trim() ?? "",
    city: input.city?.trim() ?? "",
    country: input.country?.trim() ?? "",
    paymentTerms: input.paymentTerms?.trim() ?? "",
    leadTime: input.leadTime ?? 0,
    rating: input.rating ?? 0,
    notes: input.notes?.trim() ?? "",
  };
}

export async function listSuppliers(): Promise<AdminSupplier[]> {
  noStore();
  if (!process.env.DATABASE_URL) {
    return [];
  }
  const records = await prisma.supplier.findMany({
    orderBy: [{ companyName: "asc" }],
  });
  return records.map(mapPrismaToAdminSupplier);
}

export async function getSupplierById(id: string): Promise<AdminSupplier | null> {
  noStore();
  if (!process.env.DATABASE_URL) {
    return null;
  }
  const record = await prisma.supplier.findUnique({ where: { id } });
  return record ? mapPrismaToAdminSupplier(record) : null;
}

export async function countSuppliers(): Promise<number> {
  noStore();
  if (!process.env.DATABASE_URL) {
    return 0;
  }
  return prisma.supplier.count();
}

export async function createSupplier(input: SupplierWriteInput): Promise<AdminSupplier> {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured");
  }
  const data = normalizeInput(input);
  if (!data.companyName) {
    throw new Error("Company name is required");
  }
  const record = await prisma.supplier.create({ data });
  return mapPrismaToAdminSupplier(record);
}

export async function updateSupplier(
  id: string,
  input: SupplierWriteInput,
): Promise<AdminSupplier | null> {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured");
  }
  const data = normalizeInput(input);
  if (!data.companyName) {
    throw new Error("Company name is required");
  }
  try {
    const record = await prisma.supplier.update({
      where: { id },
      data,
    });
    return mapPrismaToAdminSupplier(record);
  } catch {
    return null;
  }
}

export async function deleteSupplier(id: string): Promise<{ ok: boolean; error?: string }> {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured");
  }
  try {
    await prisma.supplier.delete({ where: { id } });
    return { ok: true };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return { ok: false, error: "供应商不存在" };
    }
    return { ok: false, error: "删除失败" };
  }
}
