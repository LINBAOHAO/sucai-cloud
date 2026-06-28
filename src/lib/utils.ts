import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number, locale: string): string {
  const currencyMap: Record<string, string> = {
    zh: "CNY",
    en: "USD",
    id: "IDR",
  };
  const currency = currencyMap[locale] ?? "CNY";
  return new Intl.NumberFormat(locale === "zh" ? "zh-CN" : locale === "id" ? "id-ID" : "en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}
