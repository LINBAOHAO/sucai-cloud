import { getDbConnected } from "@/lib/db/db-availability";
import { prisma } from "@/lib/prisma";

export async function createQuotationRevision(
  parentQuotationId: string,
  newQuotationId: string,
): Promise<void> {
  if (!(await getDbConnected())) {
    return;
  }

  try {
    const parent = await prisma.quotation.findUnique({
      where: { id: parentQuotationId },
      select: { id: true, revision: true, quotationNo: true },
    });

    if (!parent) {
      return;
    }

    const nextRevision = parent.revision + 1;
    const baseNo = parent.quotationNo.replace(/-R\d+$/, "");

    await prisma.quotation.update({
      where: { id: newQuotationId },
      data: {
        parentId: parentQuotationId,
        revision: nextRevision,
        quotationNo: `${baseNo}-R${nextRevision}`,
      },
    });
  } catch {
    // revision tracking is optional when DB tables are unavailable
  }
}

export async function listQuotationRevisions(parentId: string) {
  if (!(await getDbConnected())) {
    return [];
  }

  return prisma.quotation.findMany({
    where: {
      OR: [{ id: parentId }, { parentId }],
    },
    orderBy: { revision: "asc" },
    include: { items: { orderBy: { sortOrder: "asc" } } },
  });
}
