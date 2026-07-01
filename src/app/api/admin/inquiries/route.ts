import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/require-admin-api";
import { notifyInquiryCreated } from "@/lib/email/email-service";
import {
  createInquiry,
  listAdminInquiries,
  type InquiryWriteInput,
} from "@/lib/inquiries/inquiry-repository";

export async function GET(request: Request) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const { searchParams } = new URL(request.url);
  const limitParam = searchParams.get("limit");
  const limit = limitParam ? Number.parseInt(limitParam, 10) : undefined;

  const inquiries = await listAdminInquiries(
    limit && !Number.isNaN(limit) ? limit : undefined,
  );
  return NextResponse.json(inquiries);
}

export async function POST(request: Request) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  try {
    const body = (await request.json()) as InquiryWriteInput;
    const inquiry = await createInquiry(body);
    notifyInquiryCreated(inquiry);
    return NextResponse.json(inquiry, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create inquiry";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
