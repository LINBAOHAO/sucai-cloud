import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/require-admin-api";
import {
  createCustomer,
  listCustomers,
  type CustomerWriteInput,
} from "@/lib/customers/customer-repository";

export async function GET(request: Request) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") ?? undefined;
  const customers = await listCustomers(search);
  return NextResponse.json(customers);
}

export async function POST(request: Request) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  try {
    const body = (await request.json()) as CustomerWriteInput;
    const customer = await createCustomer(body);
    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create customer";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
