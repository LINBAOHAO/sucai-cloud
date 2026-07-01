import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/require-admin-api";
import type { InquiryStatus } from "@/lib/admin/types";
import {
  deleteInquiry,
  updateInquiryStatus,
} from "@/lib/inquiries/inquiry-repository";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const { id } = await context.params;

  try {
    const body = (await request.json()) as { status: InquiryStatus };
    const inquiry = await updateInquiryStatus(id, body.status);
    if (!inquiry) {
      return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
    }
    return NextResponse.json(inquiry);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update inquiry";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const { id } = await context.params;

  try {
    const deleted = await deleteInquiry(id);
    if (!deleted) {
      return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete inquiry";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
