import { randomUUID } from "crypto";
import { unstable_noStore as noStore } from "next/cache";
import type { Prisma } from "@prisma/client";
import { getDbConnected } from "@/lib/db/db-availability";
import { prisma } from "@/lib/prisma";

export interface AiUploadRecord {
  id: string;
  conversationId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  storagePath: string;
  parsedLineCount: number;
  createdAt: string;
}

const memoryUploads = new Map<string, AiUploadRecord[]>();

function mapRow(row: {
  id: string;
  conversationId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  storagePath: string;
  parsedLineCount: number;
  createdAt: Date;
}): AiUploadRecord {
  return {
    id: row.id,
    conversationId: row.conversationId,
    fileName: row.fileName,
    fileType: row.fileType,
    fileSize: row.fileSize,
    storagePath: row.storagePath,
    parsedLineCount: row.parsedLineCount,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function createAiUpload(input: {
  conversationId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  storagePath: string;
  parsedLineCount: number;
}): Promise<AiUploadRecord> {
  noStore();
  const record: AiUploadRecord = {
    id: randomUUID(),
    ...input,
    createdAt: new Date().toISOString(),
  };

  if (!(await getDbConnected())) {
    const list = memoryUploads.get(input.conversationId) ?? [];
    list.push(record);
    memoryUploads.set(input.conversationId, list);
    return record;
  }

  try {
    const row = await prisma.aiUpload.create({ data: input });
    return mapRow(row);
  } catch {
    const list = memoryUploads.get(input.conversationId) ?? [];
    list.push(record);
    memoryUploads.set(input.conversationId, list);
    return record;
  }
}

export async function listAiUploads(conversationId: string): Promise<AiUploadRecord[]> {
  noStore();
  if (!(await getDbConnected())) {
    return memoryUploads.get(conversationId) ?? [];
  }
  const rows = await prisma.aiUpload.findMany({
    where: { conversationId },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(mapRow);
}

export interface AdminAiOrderSummary {
  id: string;
  companyName: string;
  contactName: string;
  whatsapp: string;
  email: string;
  country: string;
  port: string;
  destinationCity: string;
  incoterms: string;
  status: string;
  dealStatus: string;
  quotationId?: string;
  grossProfit?: number;
  messageCount: number;
  uploadCount: number;
  createdAt: string;
  updatedAt: string;
}

export async function listAdminAiOrders(search?: string): Promise<AdminAiOrderSummary[]> {
  noStore();
  if (!(await getDbConnected())) {
    return [];
  }

  const where = search?.trim()
    ? {
        OR: [
          { companyName: { contains: search, mode: "insensitive" as const } },
          { contactName: { contains: search, mode: "insensitive" as const } },
          { whatsapp: { contains: search } },
          { destinationCity: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : undefined;

  const rows = await prisma.aiConversation.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    include: {
      _count: { select: { messages: true, uploads: true } },
    },
    take: 200,
  });

  return rows.map((row) => ({
    id: row.id,
    companyName: row.companyName,
    contactName: row.contactName,
    whatsapp: row.whatsapp,
    email: row.email,
    country: row.country,
    port: row.port,
    destinationCity: row.destinationCity,
    incoterms: row.incoterms,
    status: row.status,
    dealStatus: row.dealStatus,
    quotationId: row.quotationId ?? undefined,
    grossProfit: row.grossProfit != null ? Number(row.grossProfit) : undefined,
    messageCount: row._count.messages,
    uploadCount: row._count.uploads,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }));
}

export async function getAdminAiOrderDetail(id: string) {
  noStore();
  if (!(await getDbConnected())) return null;

  const row = await prisma.aiConversation.findUnique({
    where: { id },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
      uploads: { orderBy: { createdAt: "desc" } },
      quotation: {
        include: { items: true },
      },
    },
  });

  if (!row) return null;

  return {
    id: row.id,
    sessionKey: row.sessionKey,
    locale: row.locale,
    status: row.status,
    dealStatus: row.dealStatus,
    state: row.state,
    companyName: row.companyName,
    contactName: row.contactName,
    whatsapp: row.whatsapp,
    email: row.email,
    country: row.country,
    port: row.port,
    destinationCity: row.destinationCity,
    incoterms: row.incoterms,
    deliveryDays: row.deliveryDays,
    quotationId: row.quotationId,
    grossProfit: row.grossProfit != null ? Number(row.grossProfit) : null,
    recommendedSuppliers: row.recommendedSuppliers,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    messages: row.messages.map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      metadata: m.metadata as Record<string, unknown> | null,
      createdAt: m.createdAt.toISOString(),
    })),
    uploads: row.uploads.map(mapRow),
    quotation: row.quotation
      ? {
          id: row.quotation.id,
          quotationNo: row.quotation.quotationNo,
          total: Number(row.quotation.total),
          status: row.quotation.status,
          pdfUrl: row.quotation.pdfPath || `/api/admin/quotations/${row.quotation.id}/pdf`,
          items: row.quotation.items.map((item) => ({
            productName: item.productName,
            productModel: item.productModel,
            quantity: item.quantity,
            unitPrice: Number(item.unitPrice),
            subtotal: Number(item.subtotal),
          })),
        }
      : null,
  };
}

export async function updateAiOrderMeta(
  conversationId: string,
  data: Partial<{
    dealStatus: "pending" | "quoted" | "won" | "lost";
    grossProfit: number;
    recommendedSuppliers: Prisma.InputJsonValue;
    country: string;
    port: string;
  }>,
): Promise<void> {
  if (!(await getDbConnected())) return;
  await prisma.aiConversation.update({
    where: { id: conversationId },
    data,
  });
}
