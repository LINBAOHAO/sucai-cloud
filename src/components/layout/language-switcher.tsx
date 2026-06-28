"use client";

import { useLocale, useTranslations } from "next-intl";
import { ChevronDown, Check, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { routing, type Locale } from "@/i18n/routing";
import { usePathname, useRouter } from "@/i18n/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const localeConfig: Record<
  Locale,
  { label: string; native: string; flag: string }
> = {
  zh: { label: "中文", native: "简体中文", flag: "🇨🇳" },
  en: { label: "EN", native: "English", flag: "🇺🇸" },
  id: { label: "ID", native: "Bahasa Indonesia", flag: "🇮🇩" },
};

interface LanguageSwitcherProps {
  className?: string;
}

export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("nav");
  const current = localeConfig[locale];

  const switchLocale = (newLocale: Locale) => {
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          "group flex h-9 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 text-sm font-medium text-foreground outline-none transition-all duration-200 hover:border-orange-500/30 hover:bg-orange-500/10 focus-visible:ring-2 focus-visible:ring-orange-500/50 data-[state=open]:border-orange-500/30 data-[state=open]:bg-orange-500/10",
          className,
        )}
      >
        <Globe className="h-4 w-4 text-orange-400" />
        <span className="hidden sm:inline">{current.native}</span>
        <span className="sm:hidden">{current.label}</span>
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-48">
        <div className="px-2.5 py-2 text-xs font-medium text-muted-foreground">
          {t("language")}
        </div>
        {routing.locales.map((loc) => {
          const config = localeConfig[loc];
          const isActive = locale === loc;
          return (
            <DropdownMenuItem
              key={loc}
              onClick={() => switchLocale(loc)}
              className={cn(
                "cursor-pointer",
                isActive && "bg-orange-500/10 text-orange-300",
              )}
            >
              <span className="text-base">{config.flag}</span>
              <span className="flex-1">{config.native}</span>
              {isActive && <Check className="h-4 w-4 text-orange-400" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
