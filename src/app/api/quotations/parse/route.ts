import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { parseProcurementRequest } from "@/lib/quotations/quotation-service";

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
    const body = (await request.json()) as { message?: string };
    if (!body.message?.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const preview = await parseProcurementRequest(body.message);
    return NextResponse.json(preview);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to parse request";
    const status = message.includes("not found") || message.includes("No products") ? 400 : 503;
    return NextResponse.json({ error: message }, { status });
  }
}
