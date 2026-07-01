import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/require-admin-api";
import { getAiDashboardStats } from "@/lib/ai/ai-conversation-repository";

export async function GET() {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const stats = await getAiDashboardStats();
  return NextResponse.json(stats);
}
