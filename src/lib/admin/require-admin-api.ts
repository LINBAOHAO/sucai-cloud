import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, validateAdminSession } from "@/lib/admin/admin-session";

export async function requireAdminApi(): Promise<NextResponse | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (!(await validateAdminSession(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
