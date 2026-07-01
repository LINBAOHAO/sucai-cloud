import { NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  createAdminSession,
  sessionCookieOptions,
} from "@/lib/admin/admin-session";
import { getAdminConfigError, verifyAdminCredentials } from "@/lib/admin/auth";
import {
  checkLoginLockout,
  clearLoginFailures,
  getLoginClientIp,
  recordLoginFailure,
} from "@/lib/admin/login-lockout";

export async function POST(request: Request) {
  const configError = getAdminConfigError();
  if (configError) {
    return NextResponse.json({ error: configError }, { status: 503 });
  }

  const ip = getLoginClientIp(request);
  const lockout = checkLoginLockout(ip);
  if (!lockout.allowed) {
    return NextResponse.json(
      { error: "Too many failed login attempts. Try again later." },
      { status: 429 },
    );
  }

  let body: { username?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const username = body.username?.trim() ?? "";
  const password = body.password ?? "";

  if (!verifyAdminCredentials(username, password)) {
    recordLoginFailure(ip);
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  clearLoginFailures(ip);
  const session = await createAdminSession();
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, session.token, sessionCookieOptions(session.maxAge));
  return response;
}
