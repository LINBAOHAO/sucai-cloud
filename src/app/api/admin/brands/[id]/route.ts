import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/require-admin-api";
import {
  deleteBrand,
  updateBrand,
  type BrandWriteInput,
} from "@/lib/brands/brand-repository";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const { id: slug } = await context.params;

  try {
    const body = (await request.json()) as BrandWriteInput;
    const brand = await updateBrand(slug, body);
    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }
    return NextResponse.json(brand);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update brand";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const { id: slug } = await context.params;

  try {
    const result = await deleteBrand(slug);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 409 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete brand";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
