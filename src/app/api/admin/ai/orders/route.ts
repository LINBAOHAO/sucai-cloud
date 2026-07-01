import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/require-admin-api";
import { listAdminAiOrders } from "@/lib/ai/ai-upload-repository";

export async function GET(request: Request) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") ?? undefined;
  const orders = await listAdminAiOrders(search);
  return NextResponse.json(orders);
}
