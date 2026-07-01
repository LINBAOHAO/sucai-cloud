import { NextResponse } from "next/server";
import { publicApiError } from "@/lib/api/public-api-error";
import { notifyInquiryCreated } from "@/lib/email/email-service";
import {
  createInquiry,
  type InquiryWriteInput,
} from "@/lib/inquiries/inquiry-repository";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const { allowed } = await checkRateLimit(ip);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 },
    );
  }

  try {
    const body = (await request.json()) as InquiryWriteInput;
    if (!body.companyName?.trim() || !body.contactName?.trim() || !body.whatsapp?.trim()) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    const inquiry = await createInquiry({
      ...body,
      companyName: body.companyName.trim(),
      contactName: body.contactName.trim(),
      whatsapp: body.whatsapp.trim(),
      email: body.email?.trim() ?? "",
      country: body.country?.trim() ?? "",
      productName: body.productName?.trim() ?? "",
      productModel: body.productModel?.trim() ?? "",
      quantity: body.quantity?.trim() ?? "",
      notes: body.notes?.trim() ?? "",
      source: body.source ?? (body.productName ? "product" : "contact"),
      status: "pending",
    });

    notifyInquiryCreated(inquiry);

    return NextResponse.json(inquiry, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: publicApiError(error, "Failed to submit inquiry. Please try again later.") },
      { status: 503 },
    );
  }
}
