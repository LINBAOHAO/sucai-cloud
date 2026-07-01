import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/require-admin-api";
import {
  deleteCustomer,
  getCustomerDetail,
  updateCustomer,
  type CustomerWriteInput,
} from "@/lib/customers/customer-repository";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const { id } = await context.params;
  const detail = await getCustomerDetail(id);
  if (!detail) {
    return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  }
  return NextResponse.json(detail);
}

export async function PATCH(request: Request, context: RouteContext) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const { id } = await context.params;

  try {
    const body = (await request.json()) as CustomerWriteInput;
    const customer = await updateCustomer(id, body);
    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }
    return NextResponse.json(customer);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update customer";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const { id } = await context.params;

  try {
    const result = await deleteCustomer(id);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 409 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete customer";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
