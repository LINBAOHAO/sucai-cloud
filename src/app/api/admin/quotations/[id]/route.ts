import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/require-admin-api";
import {
  deleteQuotation,
  getQuotationById,
  updateQuotation,
} from "@/lib/quotations/quotation-repository";
import type { QuotationWriteInput } from "@/lib/quotations/quotation-types";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const { id } = await context.params;
  const quotation = await getQuotationById(id);
  if (!quotation) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(quotation);
}

export async function PATCH(request: Request, context: RouteContext) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const { id } = await context.params;

  try {
    const body = (await request.json()) as QuotationWriteInput;
    const quotation = await updateQuotation(id, body);
    if (!quotation) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(quotation);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update quotation";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const { id } = await context.params;
  const deleted = await deleteQuotation(id);
  if (!deleted) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
