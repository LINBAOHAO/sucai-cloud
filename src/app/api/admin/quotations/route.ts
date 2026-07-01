import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/require-admin-api";
import {
  createQuotation,
  listAdminQuotations,
} from "@/lib/quotations/quotation-repository";
import type { QuotationWriteInput } from "@/lib/quotations/quotation-types";

export async function GET() {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const quotations = await listAdminQuotations();
  return NextResponse.json(quotations);
}

export async function POST(request: Request) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  try {
    const body = (await request.json()) as QuotationWriteInput;
    if (!body.companyName?.trim() || !body.contactName?.trim() || !body.whatsapp?.trim()) {
      return NextResponse.json({ error: "Missing required customer fields" }, { status: 400 });
    }
    if (!body.items?.length) {
      return NextResponse.json({ error: "At least one item is required" }, { status: 400 });
    }

    const quotation = await createQuotation(body);
    return NextResponse.json(quotation, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create quotation";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
