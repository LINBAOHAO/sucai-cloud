import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/require-admin-api";
import {
  createCategory,
  listAdminCategories,
  type CategoryWriteInput,
} from "@/lib/categories/category-repository";

export async function GET() {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const categories = await listAdminCategories();
  return NextResponse.json(categories);
}

export async function POST(request: Request) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  try {
    const body = (await request.json()) as CategoryWriteInput;
    const category = await createCategory(body);
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create category";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
