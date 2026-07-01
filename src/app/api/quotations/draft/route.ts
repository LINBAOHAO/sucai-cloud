import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { createQuotationDraftFromAssistant } from "@/lib/quotations/quotation-service";
import type { QuotationDraftInput } from "@/lib/quotations/quotation-types";

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
    const body = (await request.json()) as QuotationDraftInput;

    if (!body.companyName?.trim() || !body.contactName?.trim() || !body.whatsapp?.trim()) {
      return NextResponse.json({ error: "Missing required customer fields" }, { status: 400 });
    }

    const hasOrderMessage = Boolean(body.orderMessage?.trim());
    const hasLegacyProduct = Boolean(body.productName?.trim() && body.quantity?.trim());

    if (!hasOrderMessage && !hasLegacyProduct) {
      return NextResponse.json({ error: "Missing product or order message" }, { status: 400 });
    }

    const result = await createQuotationDraftFromAssistant(body);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create quotation draft";
    const status = message.startsWith("Product not found") ? 404 : 503;
    return NextResponse.json({ error: message }, { status });
  }
}
