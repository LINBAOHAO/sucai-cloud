import { NextResponse } from "next/server";
import { publicApiError } from "@/lib/api/public-api-error";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { processAgentMessage } from "@/lib/ai/ai-agent-service";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const ip = getClientIp(request);
  const { allowed } = await checkRateLimit(ip);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { id } = await context.params;

  try {
    const body = (await request.json()) as { content?: string };
    if (!body.content?.trim()) {
      return NextResponse.json({ error: "content required" }, { status: 400 });
    }

    const reply = await processAgentMessage(id, body.content.trim());
    return NextResponse.json(reply);
  } catch (error) {
    return NextResponse.json(
      { error: publicApiError(error, "Failed to process message") },
      { status: 503 },
    );
  }
}
