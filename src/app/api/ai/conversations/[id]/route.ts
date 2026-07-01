import { NextResponse } from "next/server";
import { getConversationById } from "@/lib/ai/ai-conversation-repository";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const conversation = await getConversationById(id);
  if (!conversation) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(conversation);
}
