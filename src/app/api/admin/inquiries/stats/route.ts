import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/require-admin-api";
import { getInquiryStats } from "@/lib/inquiries/inquiry-repository";

export async function GET() {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const stats = await getInquiryStats();
  return NextResponse.json(stats);
}
