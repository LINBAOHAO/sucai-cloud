import { randomUUID } from "crypto";
import { unstable_noStore as noStore } from "next/cache";
import type { AiConversationStatus, Prisma } from "@prisma/client";
import {
  EMPTY_CONVERSATION_STATE,
  parseConversationState,
  type AdminAiConversationSummary,
  type AiConversationRecord,
  type AiConversationState,
  type AiDashboardStats,
  type AiMessageRecord,
  type AiMessageRole,
} from "@/lib/ai/ai-types";
import { getDbConnected } from "@/lib/db/db-availability";
import { prisma } from "@/lib/prisma";

const memoryConversations = new Map<string, AiConversationRecord>();
const memoryMessages = new Map<string, AiMessageRecord[]>();
let aiDbUnavailable = false;

async function canUseDb(): Promise<boolean> {
  if (aiDbUnavailable) return false;
  if (!(await getDbConnected())) {
    aiDbUnavailable = true;
    return false;
  }
  try {
    await prisma.aiConversation.findFirst({ select: { id: true } });
    return true;
  } catch {
    aiDbUnavailable = true;
    return false;
  }
}

function mapRecord(
  conversation: {
    id: string;
    sessionKey: string;
    locale: string;
    status: AiConversationStatus;
    state: unknown;
    companyName: string;
    contactName: string;
    whatsapp: string;
    email: string;
    country: string;
    port: string;
    destinationCity: string;
    incoterms: string;
    deliveryDays: number | null;
    quotationId: string | null;
    dealStatus?: string;
    grossProfit?: unknown;
    createdAt: Date;
    updatedAt: Date;
  },
  messages?: AiMessageRecord[],
): AiConversationRecord {
  const state = parseConversationState(conversation.state);
  return {
    id: conversation.id,
    sessionKey: conversation.sessionKey,
    locale: conversation.locale,
    status: conversation.status,
    state,
    companyName: conversation.companyName || state.companyName,
    contactName: conversation.contactName || state.contactName,
    whatsapp: conversation.whatsapp || state.whatsapp,
    email: conversation.email || state.email,
    country: conversation.country || state.country,
    port: conversation.port || state.port,
    destinationCity: conversation.destinationCity || state.destinationCity,
    incoterms: conversation.incoterms || state.incoterms,
    deliveryDays: conversation.deliveryDays ?? state.deliveryDays ?? undefined,
    quotationId: conversation.quotationId ?? undefined,
    dealStatus: conversation.dealStatus,
    grossProfit:
      conversation.grossProfit != null ? Number(conversation.grossProfit) : undefined,
    createdAt: conversation.createdAt.toISOString(),
    updatedAt: conversation.updatedAt.toISOString(),
    messages,
  };
}

export async function getOrCreateConversation(
  sessionKey: string,
  locale = "id",
): Promise<AiConversationRecord> {
  noStore();
  if (!(await canUseDb())) {
    const existing = memoryConversations.get(sessionKey);
    if (existing) {
      return {
        ...existing,
        messages: memoryMessages.get(existing.id) ?? [],
      };
    }
    const record: AiConversationRecord = {
      id: randomUUID(),
      sessionKey,
      locale,
      status: "active",
      state: { ...EMPTY_CONVERSATION_STATE },
      companyName: "",
      contactName: "",
      whatsapp: "",
      email: "",
      country: "",
      port: "",
      destinationCity: "",
      incoterms: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [],
    };
    memoryConversations.set(sessionKey, record);
    memoryMessages.set(record.id, []);
    return record;
  }

  let conversation = await prisma.aiConversation.findUnique({
    where: { sessionKey },
  }).catch(() => null);

  if (!conversation) {
    try {
      conversation = await prisma.aiConversation.create({
        data: {
          sessionKey,
          locale,
          state: EMPTY_CONVERSATION_STATE as unknown as Prisma.InputJsonValue,
        },
      });
    } catch {
      aiDbUnavailable = true;
      return getOrCreateConversation(sessionKey, locale);
    }
  }

  const messages = await listMessages(conversation.id);
  return mapRecord(conversation, messages);
}

export async function getConversationById(id: string): Promise<AiConversationRecord | null> {
  noStore();
  if (!(await canUseDb())) {
    for (const record of memoryConversations.values()) {
      if (record.id === id) {
        return { ...record, messages: memoryMessages.get(id) ?? [] };
      }
    }
    return null;
  }

  const conversation = await prisma.aiConversation.findUnique({ where: { id } });
  if (!conversation) return null;
  const messages = await listMessages(id);
  return mapRecord(conversation, messages);
}

export async function listMessages(conversationId: string): Promise<AiMessageRecord[]> {
  if (!(await canUseDb())) {
    return memoryMessages.get(conversationId) ?? [];
  }

  const rows = await prisma.aiMessage.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" },
  });

  return rows.map((row) => ({
    id: row.id,
    role: row.role as AiMessageRole,
    content: row.content,
    metadata: (row.metadata as Record<string, unknown> | null) ?? undefined,
    createdAt: row.createdAt.toISOString(),
  }));
}

export async function appendMessage(
  conversationId: string,
  role: AiMessageRole,
  content: string,
  metadata?: Record<string, unknown>,
): Promise<AiMessageRecord> {
  const record: AiMessageRecord = {
    id: randomUUID(),
    role,
    content,
    metadata,
    createdAt: new Date().toISOString(),
  };

  if (!(await canUseDb())) {
    const list = memoryMessages.get(conversationId) ?? [];
    list.push(record);
    memoryMessages.set(conversationId, list);
    return record;
  }

  try {
    const row = await prisma.aiMessage.create({
      data: {
        conversationId,
        role,
        content,
        metadata: (metadata as Prisma.InputJsonValue | undefined) ?? undefined,
      },
    });

    return {
      id: row.id,
      role: row.role as AiMessageRole,
      content: row.content,
      metadata: (row.metadata as Record<string, unknown> | null) ?? undefined,
      createdAt: row.createdAt.toISOString(),
    };
  } catch {
    aiDbUnavailable = true;
    const list = memoryMessages.get(conversationId) ?? [];
    list.push(record);
    memoryMessages.set(conversationId, list);
    return record;
  }
}

export async function updateConversationState(
  conversationId: string,
  state: AiConversationState,
  extras?: Partial<{
    status: AiConversationRecord["status"];
    quotationId: string;
    companyName: string;
    contactName: string;
    whatsapp: string;
    email: string;
    country: string;
    port: string;
    destinationCity: string;
    incoterms: string;
    deliveryDays: number | null;
    dealStatus: "pending" | "quoted" | "won" | "lost";
    grossProfit: number;
    recommendedSuppliers: Prisma.InputJsonValue;
  }>,
): Promise<AiConversationRecord> {
  if (!(await canUseDb())) {
    for (const [key, record] of memoryConversations.entries()) {
      if (record.id === conversationId) {
        const updated: AiConversationRecord = {
          ...record,
          state,
          companyName: extras?.companyName ?? state.companyName ?? record.companyName,
          contactName: extras?.contactName ?? state.contactName ?? record.contactName,
          whatsapp: extras?.whatsapp ?? state.whatsapp ?? record.whatsapp,
          email: extras?.email ?? state.email ?? record.email,
          country: extras?.country ?? state.country ?? record.country,
          port: extras?.port ?? state.port ?? record.port,
          destinationCity: extras?.destinationCity ?? state.destinationCity ?? record.destinationCity,
          incoterms: extras?.incoterms ?? state.incoterms ?? record.incoterms,
          deliveryDays: extras?.deliveryDays ?? state.deliveryDays ?? record.deliveryDays,
          status: extras?.status ?? record.status,
          quotationId: extras?.quotationId ?? record.quotationId,
          updatedAt: new Date().toISOString(),
        };
        memoryConversations.set(key, updated);
        return { ...updated, messages: memoryMessages.get(conversationId) ?? [] };
      }
    }
    throw new Error("Conversation not found");
  }

  try {
    const row = await prisma.aiConversation.update({
      where: { id: conversationId },
      data: {
        state: state as unknown as Prisma.InputJsonValue,
        companyName: extras?.companyName ?? state.companyName,
        contactName: extras?.contactName ?? state.contactName,
        whatsapp: extras?.whatsapp ?? state.whatsapp,
        email: extras?.email ?? state.email,
        country: extras?.country ?? state.country,
        port: extras?.port ?? state.port,
        destinationCity: extras?.destinationCity ?? state.destinationCity,
        incoterms: extras?.incoterms ?? state.incoterms,
        deliveryDays: extras?.deliveryDays ?? state.deliveryDays,
        status: extras?.status,
        quotationId: extras?.quotationId,
        dealStatus: extras?.dealStatus,
        grossProfit: extras?.grossProfit,
        recommendedSuppliers: extras?.recommendedSuppliers,
      },
    });

    const messages = await listMessages(conversationId);
    return mapRecord(row, messages);
  } catch {
    aiDbUnavailable = true;
    for (const [key, record] of memoryConversations.entries()) {
      if (record.id === conversationId) {
        const updated: AiConversationRecord = {
          ...record,
          state,
          companyName: extras?.companyName ?? state.companyName ?? record.companyName,
          contactName: extras?.contactName ?? state.contactName ?? record.contactName,
          whatsapp: extras?.whatsapp ?? state.whatsapp ?? record.whatsapp,
          email: extras?.email ?? state.email ?? record.email,
          country: extras?.country ?? state.country ?? record.country,
          port: extras?.port ?? state.port ?? record.port,
          destinationCity: extras?.destinationCity ?? state.destinationCity ?? record.destinationCity,
          incoterms: extras?.incoterms ?? state.incoterms ?? record.incoterms,
          deliveryDays: extras?.deliveryDays ?? state.deliveryDays ?? record.deliveryDays,
          status: extras?.status ?? record.status,
          quotationId: extras?.quotationId ?? record.quotationId,
          updatedAt: new Date().toISOString(),
        };
        memoryConversations.set(key, updated);
        return { ...updated, messages: memoryMessages.get(conversationId) ?? [] };
      }
    }
    throw new Error("Conversation not found");
  }
}

export async function getAiDashboardStats(): Promise<AiDashboardStats> {
  noStore();
  if (!(await canUseDb())) {
    const records = [...memoryConversations.values()];
    const messageCount = [...memoryMessages.values()].reduce((sum, list) => sum + list.length, 0);
    return {
      receptionCount: records.length,
      quotationCount: records.filter((item) => item.quotationId).length,
      activeSessions: records.filter((item) => item.status === "active").length,
      messageCount,
      conversionRate: 0,
      avgQuotationAmount: 0,
      hotProducts: [],
      hotCities: [],
    };
  }

    try {
  const aiWithQuotes = await prisma.aiConversation.findMany({
    where: { quotationId: { not: null } },
    select: { quotationId: true },
  }).catch(() => []);
  const quotationIds = aiWithQuotes
    .map((row) => row.quotationId)
    .filter((id): id is string => id != null);

  const [
    receptionCount,
    quotationCount,
    activeSessions,
    messageCount,
    conversations,
    quotationItems,
    orderCount,
    quotationTotals,
  ] = await Promise.all([
    prisma.aiConversation.count(),
    prisma.aiConversation.count({ where: { quotationId: { not: null } } }),
    prisma.aiConversation.count({ where: { status: "active" } }),
    prisma.aiMessage.count(),
    prisma.aiConversation.findMany({
      where: { destinationCity: { not: "" } },
      select: { destinationCity: true },
    }),
    prisma.quotationItem.findMany({
      select: { productName: true, productModel: true },
      take: 500,
    }),
    prisma.order.count({ where: { quotationId: { in: quotationIds } } }),
    prisma.quotation.findMany({
      where: { id: { in: quotationIds } },
      select: { total: true },
    }),
  ]);

  const cityMap = new Map<string, number>();
  for (const row of conversations) {
    const city = row.destinationCity.trim();
    if (!city) continue;
    cityMap.set(city, (cityMap.get(city) ?? 0) + 1);
  }

  const productMap = new Map<string, { name: string; model: string; count: number }>();
  for (const item of quotationItems) {
    const key = `${item.productName}::${item.productModel}`;
    const current = productMap.get(key);
    if (current) {
      current.count += 1;
    } else {
      productMap.set(key, {
        name: item.productName,
        model: item.productModel,
        count: 1,
      });
    }
  }

  const avgQuotationAmount =
    quotationTotals.length > 0
      ? Math.round(
          (quotationTotals.reduce((sum, q) => sum + Number(q.total), 0) / quotationTotals.length) *
            100,
        ) / 100
      : 0;

  const conversionRate =
    quotationIds.length > 0 ? Math.round((orderCount / quotationIds.length) * 1000) / 10 : 0;

  return {
    receptionCount,
    quotationCount,
    activeSessions,
    messageCount,
    conversionRate,
    avgQuotationAmount,
    hotProducts: [...productMap.values()].sort((a, b) => b.count - a.count).slice(0, 8),
    hotCities: [...cityMap.entries()]
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8),
  };
  } catch {
    return {
      receptionCount: 0,
      quotationCount: 0,
      activeSessions: 0,
      messageCount: 0,
      conversionRate: 0,
      avgQuotationAmount: 0,
      hotProducts: [],
      hotCities: [],
    };
  }
}

export async function listAdminConversations(
  search?: string,
): Promise<AdminAiConversationSummary[]> {
  noStore();
  if (!(await canUseDb())) {
    const records = [...memoryConversations.values()];
    return records
      .map((record) => ({
        id: record.id,
        sessionKey: record.sessionKey,
        locale: record.locale,
        status: record.status,
        companyName: record.companyName,
        contactName: record.contactName,
        whatsapp: record.whatsapp,
        destinationCity: record.destinationCity,
        messageCount: memoryMessages.get(record.id)?.length ?? 0,
        quotationId: record.quotationId,
        createdAt: record.createdAt,
        updatedAt: record.updatedAt,
      }))
      .filter((item) => {
        if (!search?.trim()) return true;
        const q = search.toLowerCase();
        return (
          item.companyName.toLowerCase().includes(q) ||
          item.contactName.toLowerCase().includes(q) ||
          item.whatsapp.includes(q) ||
          item.destinationCity.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
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
    include: { _count: { select: { messages: true } } },
    take: 200,
  });

  return rows.map((row) => ({
    id: row.id,
    sessionKey: row.sessionKey,
    locale: row.locale,
    status: row.status,
    companyName: row.companyName,
    contactName: row.contactName,
    whatsapp: row.whatsapp,
    destinationCity: row.destinationCity,
    messageCount: row._count.messages,
    quotationId: row.quotationId ?? undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }));
}

export async function getAdminConversationDetail(id: string): Promise<AiConversationRecord | null> {
  return getConversationById(id);
}
