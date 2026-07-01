import { unstable_noStore as noStore } from "next/cache";
import type { AdminSupplierProduct } from "@/lib/admin/types";
import { mapPrismaToAdminSupplierProduct } from "@/lib/suppliers/supplier-mapper";
import { prisma } from "@/lib/prisma";

export type SupplierProductWriteInput = {
  supplierId: string;
  purchasePrice: number;
  moq?: number;
  stock?: number;
  leadTime?: number;
  preferred?: boolean;
};

export async function listSupplierProductsByProductId(
  productId: string,
): Promise<AdminSupplierProduct[]> {
  noStore();
  if (!process.env.DATABASE_URL) {
    return [];
  }
  const records = await prisma.supplierProduct.findMany({
    where: { productId },
    include: { supplier: true },
    orderBy: [{ preferred: "desc" }, { purchasePrice: "asc" }],
  });
  return records.map(mapPrismaToAdminSupplierProduct);
}

export async function createSupplierProduct(
  productId: string,
  input: SupplierProductWriteInput,
): Promise<AdminSupplierProduct> {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured");
  }

  const preferred = input.preferred ?? false;

  return prisma.$transaction(async (tx) => {
    if (preferred) {
      await tx.supplierProduct.updateMany({
        where: { productId },
        data: { preferred: false },
      });
    }

    const record = await tx.supplierProduct.create({
      data: {
        supplierId: input.supplierId,
        productId,
        purchasePrice: input.purchasePrice,
        moq: input.moq ?? 1,
        stock: input.stock ?? 0,
        leadTime: input.leadTime ?? 0,
        preferred,
      },
      include: { supplier: true },
    });

    return mapPrismaToAdminSupplierProduct(record);
  });
}

export async function updateSupplierProduct(
  productId: string,
  supplierId: string,
  input: Partial<SupplierProductWriteInput>,
): Promise<AdminSupplierProduct | null> {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured");
  }

  try {
    return await prisma.$transaction(async (tx) => {
      if (input.preferred === true) {
        await tx.supplierProduct.updateMany({
          where: { productId, supplierId: { not: supplierId } },
          data: { preferred: false },
        });
      }

      const record = await tx.supplierProduct.update({
        where: {
          supplierId_productId: { supplierId, productId },
        },
        data: {
          ...(input.purchasePrice !== undefined
            ? { purchasePrice: input.purchasePrice }
            : {}),
          ...(input.moq !== undefined ? { moq: input.moq } : {}),
          ...(input.stock !== undefined ? { stock: input.stock } : {}),
          ...(input.leadTime !== undefined ? { leadTime: input.leadTime } : {}),
          ...(input.preferred !== undefined ? { preferred: input.preferred } : {}),
        },
        include: { supplier: true },
      });

      return mapPrismaToAdminSupplierProduct(record);
    });
  } catch {
    return null;
  }
}

export async function deleteSupplierProduct(
  productId: string,
  supplierId: string,
): Promise<boolean> {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured");
  }
  try {
    await prisma.supplierProduct.delete({
      where: {
        supplierId_productId: { supplierId, productId },
      },
    });
    return true;
  } catch {
    return false;
  }
}

export async function setPreferredSupplier(
  productId: string,
  supplierId: string,
): Promise<AdminSupplierProduct | null> {
  return updateSupplierProduct(productId, supplierId, { preferred: true });
}
