import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/require-admin-api";
import {
  createProduct,
  listAdminProducts,
  type ProductWriteInput,
} from "@/lib/products/product-repository";

export async function GET() {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const products = await listAdminProducts();
  return NextResponse.json(products);
}

export async function POST(request: Request) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  try {
    const body = (await request.json()) as ProductWriteInput;
    const product = await createProduct(body);
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create product";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
