import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/require-admin-api";
import { listAdminConversations } from "@/lib/ai/ai-conversation-repository";

export async function GET(request: Request) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") ?? undefined;
  const conversations = await listAdminConversations(search);
  return NextResponse.json(conversations);
}
