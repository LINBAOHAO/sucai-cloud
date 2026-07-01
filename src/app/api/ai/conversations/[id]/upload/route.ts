import { NextResponse } from "next/server";
import { publicApiError } from "@/lib/api/public-api-error";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { processUploadedProcurementFile } from "@/lib/ai/procurement-upload-service";

type RouteContext = { params: Promise<{ id: string }> };

const MAX_BYTES = 10 * 1024 * 1024;

export async function POST(request: Request, context: RouteContext) {
  const ip = getClientIp(request);
  const { allowed } = await checkRateLimit(ip);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { id } = await context.params;

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "file required" }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const reply = await processUploadedProcurementFile(id, buffer, file.name, file.type);
    return NextResponse.json(reply);
  } catch (error) {
    return NextResponse.json(
      { error: publicApiError(error, "Failed to process upload") },
      { status: 503 },
    );
  }
}
