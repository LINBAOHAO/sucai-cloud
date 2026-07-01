import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/require-admin-api";
import {
  createBrand,
  listAdminBrands,
  type BrandWriteInput,
} from "@/lib/brands/brand-repository";

export async function GET() {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const brands = await listAdminBrands();
  return NextResponse.json(brands);
}

export async function POST(request: Request) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  try {
    const body = (await request.json()) as BrandWriteInput;
    const brand = await createBrand(body);
    return NextResponse.json(brand, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create brand";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
