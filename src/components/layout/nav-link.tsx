"use client";

import { useLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

function localizeHref(href: string, locale: string): string {
  if (href.startsWith("/#")) {
    return locale === routing.defaultLocale ? href : `/${locale}${href.slice(1)}`;
  }
  if (locale === routing.defaultLocale) return href;
  return href === "/" ? `/${locale}` : `/${locale}${href}`;
}

function navigate(href: string, onClick?: () => void) {
  onClick?.();
  window.location.assign(href);
}

export function NavLink({ href, children, onClick, className }: NavLinkProps) {
  const locale = useLocale();
  const localizedHref = localizeHref(href, locale);

  return (
    <a
      href={localizedHref}
      onClick={(event) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
          return;
        }
        event.preventDefault();
        navigate(localizedHref, onClick);
      }}
      className={cn("group relative inline-flex px-4 py-2.5", className)}
    >
      <span className="pointer-events-none absolute inset-0 scale-95 rounded-lg bg-orange-500/0 transition-all duration-300 group-hover:scale-100 group-hover:bg-orange-500/8" />
      <span className="relative z-10 text-sm font-medium text-muted-foreground transition-all duration-300 group-hover:-translate-y-px group-hover:text-orange-300">
        {children}
      </span>
      <span className="pointer-events-none absolute bottom-1 left-1/2 z-10 h-[2px] w-0 -translate-x-1/2 rounded-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-300 ease-out group-hover:w-[calc(100%-1rem)]" />
    </a>
  );
}
