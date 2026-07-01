import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/require-admin-api";
import { convertQuotationToOrder } from "@/lib/orders/order-repository";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: RouteContext) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const { id } = await context.params;

  try {
    const order = await convertQuotationToOrder(id);
    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to convert quotation";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
