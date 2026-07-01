import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/require-admin-api";
import { createOrder, listAdminOrders } from "@/lib/orders/order-repository";
import type { OrderWriteInput } from "@/lib/orders/order-types";

export async function GET() {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const orders = await listAdminOrders();
  return NextResponse.json(orders);
}

export async function POST(request: Request) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  try {
    const body = (await request.json()) as OrderWriteInput;
    const order = await createOrder(body);
    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create order";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
