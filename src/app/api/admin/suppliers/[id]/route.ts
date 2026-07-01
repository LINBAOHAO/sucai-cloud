import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/require-admin-api";
import {
  deleteSupplier,
  updateSupplier,
  type SupplierWriteInput,
} from "@/lib/suppliers/supplier-repository";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const { id } = await context.params;

  try {
    const body = (await request.json()) as SupplierWriteInput;
    const supplier = await updateSupplier(id, body);
    if (!supplier) {
      return NextResponse.json({ error: "Supplier not found" }, { status: 404 });
    }
    return NextResponse.json(supplier);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update supplier";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const { id } = await context.params;

  try {
    const result = await deleteSupplier(id);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete supplier";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
