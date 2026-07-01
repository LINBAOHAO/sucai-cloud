import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type CustomerMatchInput = {
  companyName: string;
  contactName?: string;
  email?: string;
  whatsapp?: string;
  phone?: string;
  country?: string;
  city?: string;
  address?: string;
};

export function normalizeWhatsApp(value: string): string {
  return value.replace(/\D/g, "");
}

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export async function resolveOrCreateCustomer(
  input: CustomerMatchInput,
  tx: Prisma.TransactionClient = prisma,
): Promise<string> {
  const companyName = input.companyName.trim();
  const contactName = input.contactName?.trim() ?? "";
  const email = input.email?.trim() ?? "";
  const whatsapp = input.whatsapp?.trim() ?? "";
  const phone = input.phone?.trim() ?? "";
  const country = input.country?.trim() ?? "";
  const city = input.city?.trim() ?? "";
  const address = input.address?.trim() ?? "";

  const normalizedWhatsApp = normalizeWhatsApp(whatsapp);
  const normalizedEmail = normalizeEmail(email);

  let existing = null;

  if (normalizedWhatsApp) {
    const candidates = await tx.customer.findMany({
      where: { whatsapp: { not: "" } },
      take: 200,
    });
    existing =
      candidates.find((c) => normalizeWhatsApp(c.whatsapp) === normalizedWhatsApp) ?? null;
  }

  if (!existing && normalizedEmail) {
    existing = await tx.customer.findFirst({
      where: { email: { equals: normalizedEmail, mode: "insensitive" } },
    });
  }

  if (!existing && companyName) {
    existing = await tx.customer.findFirst({
      where: {
        companyName: { equals: companyName, mode: "insensitive" },
        ...(contactName
          ? { contactName: { equals: contactName, mode: "insensitive" } }
          : {}),
      },
    });
  }

  if (existing) {
    const updates: Prisma.CustomerUpdateInput = {};
    if (!existing.contactName && contactName) updates.contactName = contactName;
    if (!existing.email && email) updates.email = email;
    if (!existing.whatsapp && whatsapp) updates.whatsapp = whatsapp;
    if (!existing.phone && phone) updates.phone = phone;
    if (!existing.country && country) updates.country = country;
    if (!existing.city && city) updates.city = city;
    if (!existing.address && address) updates.address = address;

    if (Object.keys(updates).length > 0) {
      await tx.customer.update({ where: { id: existing.id }, data: updates });
    }

    return existing.id;
  }

  const created = await tx.customer.create({
    data: {
      companyName: companyName || contactName || "Unknown Customer",
      contactName,
      email,
      whatsapp,
      phone,
      country,
      city,
      address,
    },
  });

  return created.id;
}
