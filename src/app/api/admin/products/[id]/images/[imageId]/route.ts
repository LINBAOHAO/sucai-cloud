import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/require-admin-api";
import { deleteProductImage } from "@/lib/products/product-image-repository";

type RouteContext = { params: Promise<{ id: string; imageId: string }> };

export async function DELETE(_request: Request, context: RouteContext) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const { imageId } = await context.params;

  try {
    const deleted = await deleteProductImage(imageId);
    if (!deleted) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete image";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
