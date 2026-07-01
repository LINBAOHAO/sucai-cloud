"use client";

import type { AiAgentReply, AiConversationRecord } from "@/lib/ai/ai-types";

const SESSION_KEY = "sucai-ai-session";
const CONVERSATION_ID_KEY = "sucai-ai-conversation-id";

export function getAiSessionKey(): string {
  if (typeof window === "undefined") return "";
  let key = localStorage.getItem(SESSION_KEY);
  if (!key) {
    key = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, key);
  }
  return key;
}

export function resetAiSession(): string {
  const key = crypto.randomUUID();
  localStorage.setItem(SESSION_KEY, key);
  localStorage.removeItem(CONVERSATION_ID_KEY);
  return key;
}

export function getStoredConversationId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(CONVERSATION_ID_KEY);
}

function storeConversationId(id: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem(CONVERSATION_ID_KEY, id);
  }
}

export async function startAiConversation(locale: string): Promise<AiConversationRecord> {
  const storedId = getStoredConversationId();
  if (storedId) {
    try {
      const existing = await fetchAiConversation(storedId);
      storeConversationId(existing.id);
      return existing;
    } catch {
      localStorage.removeItem(CONVERSATION_ID_KEY);
    }
  }

  const res = await fetch("/api/ai/conversations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionKey: getAiSessionKey(), locale }),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? "Failed to start conversation");
  }
  const conversation = (await res.json()) as AiConversationRecord;
  storeConversationId(conversation.id);
  return conversation;
}

export async function fetchAiConversation(id: string): Promise<AiConversationRecord> {
  const res = await fetch(`/api/ai/conversations/${id}`);
  if (!res.ok) {
    throw new Error("Failed to load conversation");
  }
  return (await res.json()) as AiConversationRecord;
}

export async function sendAiMessage(
  conversationId: string,
  content: string,
): Promise<AiAgentReply> {
  const res = await fetch(`/api/ai/conversations/${conversationId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? "Failed to send message");
  }
  return (await res.json()) as AiAgentReply;
}

export async function confirmAiQuotation(conversationId: string): Promise<AiAgentReply> {
  const res = await fetch(`/api/ai/conversations/${conversationId}/confirm`, {
    method: "POST",
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? "Failed to confirm quotation");
  }
  return (await res.json()) as AiAgentReply;
}

export async function modifyAiOrder(conversationId: string): Promise<AiAgentReply> {
  const res = await fetch(`/api/ai/conversations/${conversationId}/modify`, {
    method: "POST",
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? "Failed to modify order");
  }
  return (await res.json()) as AiAgentReply;
}

export async function uploadAiProcurementFile(
  conversationId: string,
  file: File,
): Promise<AiAgentReply> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`/api/ai/conversations/${conversationId}/upload`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? "Failed to upload file");
  }
  return (await res.json()) as AiAgentReply;
}
