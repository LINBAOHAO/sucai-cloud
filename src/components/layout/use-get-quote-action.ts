"use client";

import { useCallback } from "react";
import { useLocale } from "next-intl";
import { useInquiryOptional } from "@/components/inquiry/inquiry-context";
import { routing } from "@/i18n/routing";

function localizePath(path: string, locale: string): string {
  if (locale === routing.defaultLocale) {
    return path;
  }
  return `/${locale}${path}`;
}

export function useGetQuoteAction() {
  const inquiry = useInquiryOptional();
  const locale = useLocale();

  return useCallback(() => {
    if (inquiry) {
      inquiry.openInquiry({ productName: "", productModel: "" });
      return;
    }

    if (typeof window === "undefined") {
      return;
    }

    window.location.assign(localizePath("/products?quote=1", locale));
  }, [inquiry, locale]);
}
