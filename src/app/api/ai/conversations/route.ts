import { NextResponse } from "next/server";
import { publicApiError } from "@/lib/api/public-api-error";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import {
  appendMessage,
  getConversationById,
  getOrCreateConversation,
} from "@/lib/ai/ai-conversation-repository";
import { buildWelcomeMessage } from "@/lib/ai/ai-agent-service";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const { allowed } = await checkRateLimit(ip);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const body = (await request.json()) as { sessionKey?: string; locale?: string };
    if (!body.sessionKey?.trim()) {
      return NextResponse.json({ error: "sessionKey required" }, { status: 400 });
    }

    const conversation = await getOrCreateConversation(
      body.sessionKey.trim(),
      body.locale ?? "id",
    );

    if (!conversation.messages?.length) {
      const welcome = buildWelcomeMessage(conversation.locale);
      await appendMessage(conversation.id, "assistant", welcome);
      const refreshed = await getConversationById(conversation.id);
      return NextResponse.json(refreshed);
    }

    return NextResponse.json(conversation);
  } catch (error) {
    return NextResponse.json(
      { error: publicApiError(error, "Failed to create conversation") },
      { status: 503 },
    );
  }
}
