import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/require-admin-api";
import {
  getSiteSettings,
  updateSiteSettings,
  type SettingsWriteInput,
} from "@/lib/settings/settings-repository";

export async function GET() {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  const settings = await getSiteSettings();
  return NextResponse.json(settings);
}

export async function PATCH(request: Request) {
  const unauthorized = await requireAdminApi();
  if (unauthorized) return unauthorized;

  try {
    const body = (await request.json()) as SettingsWriteInput;
    const settings = await updateSiteSettings(body);
    return NextResponse.json(settings);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update settings";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
