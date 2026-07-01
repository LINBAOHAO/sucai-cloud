"use client";

import { useLocale } from "next-intl";
import { ArrowRight, MessageSquareQuote, ShieldCheck } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { HeroIllustration } from "@/components/home/hero-illustration";
import { homeHero } from "@/lib/home-content";
import type { Locale } from "@/i18n/routing";

const trustItems: Record<Locale, string[]> = {
  zh: ["正品保障", "跨境物流", "本地仓储", "24h 报价"],
  en: ["Authentic Products", "Cross-border Logistics", "Local Warehousing", "24h Quote"],
  id: ["Produk Asli", "Logistik Lintas Batas", "Gudang Lokal", "Penawaran 24j"],
};

export function HeroBanner() {
  const locale = useLocale() as Locale;
  const content = homeHero[locale];

  return (
    <section
      id="home"
      className="relative overflow-hidden bg-gradient-to-br from-blue-800 via-blue-600 to-blue-50 pt-20"
    >
      {/* Decorative layers */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.12),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(255,255,255,0.45),transparent_55%)]" />
        <div className="absolute top-0 right-0 h-[480px] w-[480px] translate-x-1/4 -translate-y-1/4 rounded-full bg-white/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-72 w-72 -translate-x-1/4 translate-y-1/4 rounded-full bg-blue-300/30 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16 xl:gap-20">
          {/* Left: copy */}
          <div className="text-center lg:text-left">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-4 py-1.5 text-sm font-medium text-white shadow-sm backdrop-blur-sm">
              <ShieldCheck className="h-4 w-4 text-blue-100" />
              {content.badge}
            </span>

            <h1 className="mt-6 text-4xl font-bold leading-[1.12] tracking-tight text-white sm:text-5xl lg:text-[3.25rem] xl:text-6xl">
              {content.title}
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-blue-50/90 sm:text-lg lg:mx-0">
              {content.subtitle}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <Button
                size="lg"
                className="h-12 bg-orange-500 px-8 text-base shadow-lg shadow-orange-500/30 hover:bg-orange-400"
                asChild
              >
                <Link href="/products">
                  {content.ctaBrowse}
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 border-white/40 bg-white/10 px-8 text-base text-white backdrop-blur-sm hover:border-white/60 hover:bg-white/20 hover:text-white"
                asChild
              >
                <Link href="/contact">
                  <MessageSquareQuote className="h-5 w-5" />
                  {content.ctaInquiry}
                </Link>
              </Button>
            </div>

            {/* Trust strip */}
            <ul className="mt-10 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 lg:justify-start">
              {trustItems[locale].map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-1.5 text-xs font-medium text-blue-100/85 sm:text-sm"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-orange-400" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Right: illustration */}
          <div className="mx-auto w-full max-w-lg lg:max-w-none lg:justify-self-end">
            <HeroIllustration locale={locale} />
          </div>
        </div>
      </div>

      {/* Bottom fade into page background */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background/80 to-transparent" />
    </section>
  );
}
