import { NextResponse } from "next/server";
import { publicApiError } from "@/lib/api/public-api-error";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { confirmAgentQuotation } from "@/lib/ai/ai-agent-service";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, context: RouteContext) {
  const ip = getClientIp(_request);
  const { allowed } = await checkRateLimit(ip);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { id } = await context.params;

  try {
    const reply = await confirmAgentQuotation(id);
    return NextResponse.json(reply);
  } catch (error) {
    return NextResponse.json(
      { error: publicApiError(error, "Failed to confirm quotation") },
      { status: 503 },
    );
  }
}
