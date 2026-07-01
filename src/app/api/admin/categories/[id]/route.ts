import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/require-admin-api";
import {
  deleteCategory,
  updateCategory,
  type CategoryWriteInput,
} from "@/lib/categories/category-repository";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const { id: slug } = await context.params;

  try {
    const body = (await request.json()) as CategoryWriteInput;
    const category = await updateCategory(slug, body);
    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }
    return NextResponse.json(category);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update category";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const { id: slug } = await context.params;

  try {
    const result = await deleteCategory(slug);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 409 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete category";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
