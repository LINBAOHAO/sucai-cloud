import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/require-admin-api";
import { getAdminConversationDetail } from "@/lib/ai/ai-conversation-repository";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const { id } = await context.params;
  const conversation = await getAdminConversationDetail(id);
  if (!conversation) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }
  return NextResponse.json(conversation);
}
