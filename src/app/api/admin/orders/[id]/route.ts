import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/require-admin-api";
import {
  deleteOrder,
  getOrderById,
  updateOrder,
} from "@/lib/orders/order-repository";
import type { OrderUpdateInput } from "@/lib/orders/order-types";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const { id } = await context.params;
  const order = await getOrderById(id);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  return NextResponse.json(order);
}

export async function PATCH(request: Request, context: RouteContext) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const { id } = await context.params;

  try {
    const body = (await request.json()) as OrderUpdateInput;
    const order = await updateOrder(id, body);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    return NextResponse.json(order);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update order";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const { id } = await context.params;

  try {
    const deleted = await deleteOrder(id);
    if (!deleted) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete order";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
