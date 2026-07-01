import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/require-admin-api";
import { getQuotationById } from "@/lib/quotations/quotation-repository";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const { id } = await context.params;
  const quotation = await getQuotationById(id);
  if (!quotation?.pdfPath) {
    return NextResponse.json({ error: "PDF not found" }, { status: 404 });
  }

  const fileName = quotation.pdfPath.split("/").pop();
  if (!fileName) {
    return NextResponse.json({ error: "PDF not found" }, { status: 404 });
  }

  try {
    const filePath = path.join(process.cwd(), "public", "quotations", fileName);
    const buffer = await readFile(filePath);
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${fileName}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "PDF file missing" }, { status: 404 });
  }
}
