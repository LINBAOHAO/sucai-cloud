import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/require-admin-api";
import {
  deleteSupplierProduct,
  updateSupplierProduct,
  type SupplierProductWriteInput,
} from "@/lib/suppliers/supplier-product-repository";

type RouteContext = { params: Promise<{ id: string; supplierId: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const { id: productId, supplierId } = await context.params;

  try {
    const body = (await request.json()) as Partial<SupplierProductWriteInput>;
    const link = await updateSupplierProduct(productId, supplierId, body);
    if (!link) {
      return NextResponse.json({ error: "Supplier link not found" }, { status: 404 });
    }
    return NextResponse.json(link);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update supplier link";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const { id: productId, supplierId } = await context.params;

  try {
    const deleted = await deleteSupplierProduct(productId, supplierId);
    if (!deleted) {
      return NextResponse.json({ error: "Supplier link not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete supplier link";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
