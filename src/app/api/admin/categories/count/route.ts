import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/require-admin-api";
import { countCategories } from "@/lib/categories/category-repository";

export async function GET() {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const count = await countCategories();
  return NextResponse.json({ count });
}
