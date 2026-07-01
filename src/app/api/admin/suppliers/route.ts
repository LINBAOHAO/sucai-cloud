import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/require-admin-api";
import {
  createSupplier,
  listSuppliers,
  type SupplierWriteInput,
} from "@/lib/suppliers/supplier-repository";

export async function GET() {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const suppliers = await listSuppliers();
  return NextResponse.json(suppliers);
}

export async function POST(request: Request) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  try {
    const body = (await request.json()) as SupplierWriteInput;
    const supplier = await createSupplier(body);
    return NextResponse.json(supplier, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create supplier";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
