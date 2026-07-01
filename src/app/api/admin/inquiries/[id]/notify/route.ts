import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/require-admin-api";
import { sendInquiryNotification } from "@/lib/email/email-service";
import { getInquiryById } from "@/lib/inquiries/inquiry-repository";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: RouteContext) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const { id } = await context.params;

  try {
    const inquiry = await getInquiryById(id);
    if (!inquiry) {
      return NextResponse.json({ error: "Inquiry not found" }, { status: 404 });
    }

    const result = await sendInquiryNotification(inquiry);
    if (!result.ok) {
      return NextResponse.json(
        { error: result.error ?? "Failed to send notification" },
        { status: result.error === "Email not configured" ? 503 : 502 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to send notification";
    console.error("[email] Admin resend failed:", { inquiryId: id, message });
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
