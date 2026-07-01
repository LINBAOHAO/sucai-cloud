import { type NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { ADMIN_SESSION_COOKIE, validateAdminSession } from "@/lib/admin/admin-session";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    const isLoginPage = pathname === "/admin/login";
    const session = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    const isAuthed = await validateAdminSession(session);

    if (!isLoginPage && !isAuthed) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (isLoginPage && isAuthed) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    return NextResponse.next();
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/((?!api|_next|_vercel|admin|.*\\..*).*)",
    "/",
  ],
};
