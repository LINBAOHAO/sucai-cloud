import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/require-admin-api";
import { getAdminAiOrderDetail } from "@/lib/ai/ai-upload-repository";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const { id } = await context.params;
  const order = await getAdminAiOrderDetail(id);
  if (!order) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(order);
}
