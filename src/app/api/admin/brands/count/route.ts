import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/require-admin-api";
import { countBrands } from "@/lib/brands/brand-repository";

export async function GET() {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const count = await countBrands();
  return NextResponse.json({ count });
}
