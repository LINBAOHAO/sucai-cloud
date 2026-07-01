import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/require-admin-api";
import { countSuppliers } from "@/lib/suppliers/supplier-repository";

export async function GET() {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const count = await countSuppliers();
  return NextResponse.json({ count });
}
