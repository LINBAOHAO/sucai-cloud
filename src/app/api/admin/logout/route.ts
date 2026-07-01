import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  clearSessionCookieOptions,
  revokeAdminSession,
} from "@/lib/admin/admin-session";

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  revokeAdminSession(token);

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, "", clearSessionCookieOptions());
  return response;
}
