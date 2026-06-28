"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Cloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "./language-switcher";
import { NavLink } from "./nav-link";
import { WhatsAppButton } from "./whatsapp-button";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

const navItems = [
  { key: "home", href: "/" },
  { key: "products", href: "/products" },
  { key: "brands", href: "/#brands" },
  { key: "about", href: "/#why-choose" },
  { key: "contact", href: "/#contact" },
] as const;

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

export function Header() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <header
      className={cn(
        "fixed top-0 right-0 left-0 z-50 transition-all duration-500 ease-out",
        "border-b backdrop-blur-2xl backdrop-saturate-150",
        scrolled
          ? "border-white/10 bg-[#060a12]/75 shadow-lg shadow-black/20"
          : "border-white/5 bg-[#060a12]/45",
      )}
    >
      <div
        className={cn(
          "mx-auto flex max-w-7xl items-center justify-between px-4 transition-all duration-500 sm:px-6 lg:px-8",
          scrolled ? "h-[72px]" : "h-20",
        )}
      >
        <a
          href={localizeHref("/", locale)}
          onClick={(event) => {
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
              return;
            }
            event.preventDefault();
            navigate(localizeHref("/", locale));
          }}
          className="group relative z-10 flex shrink-0 items-center gap-3"
        >
          <div
            className={cn(
              "flex items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 shadow-lg shadow-orange-500/30 transition-all duration-300 group-hover:scale-105 group-hover:shadow-orange-500/40",
              scrolled ? "h-11 w-11" : "h-12 w-12",
            )}
          >
            <Cloud
              className={cn(
                "text-white transition-all duration-300",
                scrolled ? "h-6 w-6" : "h-7 w-7",
              )}
            />
          </div>
          <span
            className={cn(
              "font-bold tracking-tight transition-all duration-300",
              scrolled ? "text-xl" : "text-2xl",
            )}
          >
            {locale === "zh" ? (
              <span className="text-gradient">速采云</span>
            ) : (
              <>
                Su<span className="text-gradient">Cai</span> Cloud
              </>
            )}
          </span>
        </a>

        <nav className="relative z-10 hidden items-center lg:flex">
          {navItems.map((item) => (
            <NavLink key={item.key} href={item.href}>
              {t(item.key)}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-2.5 lg:flex">
          <LanguageSwitcher />
          <WhatsAppButton />
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            {t("login")}
          </Button>
          <Button size="sm">{t("register")}</Button>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5 lg:hidden">
          <WhatsAppButton size="sm" className="xl:hidden" />
          <LanguageSwitcher />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-lg p-2.5 text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 top-[72px] z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="relative z-50 overflow-hidden border-b border-white/10 bg-[#060a12]/90 backdrop-blur-2xl lg:hidden"
            >
              <nav className="flex flex-col gap-0.5 px-4 py-4">
                {navItems.map((item, i) => (
                  <motion.div
                    key={item.key}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <a
                      href={localizeHref(item.href, locale)}
                      onClick={(event) => {
                        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
                          return;
                        }
                        event.preventDefault();
                        navigate(localizeHref(item.href, locale), () => setMobileOpen(false));
                      }}
                      className="relative z-10 block rounded-lg px-4 py-3.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-orange-500/10 hover:text-orange-300"
                    >
                      {t(item.key)}
                    </a>
                  </motion.div>
                ))}
                <div className="mt-3 flex flex-col gap-2 border-t border-white/10 pt-4">
                  <WhatsAppButton className="w-full" />
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      {t("login")}
                    </Button>
                    <Button size="sm" className="flex-1">
                      {t("register")}
                    </Button>
                  </div>
                </div>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
