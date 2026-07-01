import { headers } from "next/headers";
import { routing, type Locale } from "@/i18n/routing";

const LOCALE_HEADER = "X-NEXT-INTL-LOCALE";

export async function resolveHtmlLang(): Promise<Locale> {
  const headerStore = await headers();
  const fromHeader = headerStore.get(LOCALE_HEADER);

  if (fromHeader && routing.locales.includes(fromHeader as Locale)) {
    return fromHeader as Locale;
  }

  return routing.defaultLocale;
}
