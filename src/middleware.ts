import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: [
    // Required for localePrefix: "as-needed" — match unprefixed pathnames
    "/((?!api|_next|_vercel|.*\\..*).*)",
    // Explicit root (needed for some basePath / edge cases)
    "/",
  ],
};
