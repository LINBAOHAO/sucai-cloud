import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { requireAdminApi } from "@/lib/admin/require-admin-api";
import {
  createSupplierProduct,
  listSupplierProductsByProductId,
  type SupplierProductWriteInput,
} from "@/lib/suppliers/supplier-product-repository";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const { id: productId } = await context.params;
  const links = await listSupplierProductsByProductId(productId);
  return NextResponse.json(links);
}

export async function POST(request: Request, context: RouteContext) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const { id: productId } = await context.params;

  try {
    const body = (await request.json()) as SupplierProductWriteInput;
    const link = await createSupplierProduct(productId, body);
    return NextResponse.json(link, { status: 201 });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json({ error: "该供应商已绑定到此产品" }, { status: 409 });
    }
    const message =
      error instanceof Error ? error.message : "Failed to link supplier to product";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
