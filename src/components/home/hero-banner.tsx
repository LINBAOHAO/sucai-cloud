"use client";

import { useLocale } from "next-intl";
import { motion } from "framer-motion";
import { ArrowRight, MessageSquareQuote } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/motion/fade-in";
import { HeroIllustration } from "@/components/home/hero-illustration";
import { homeHero } from "@/lib/home-content";
import type { Locale } from "@/i18n/routing";

export function HeroBanner() {
  const locale = useLocale() as Locale;
  const content = homeHero[locale];

  return (
    <section
      id="home"
      className="relative overflow-hidden bg-gradient-to-br from-blue-950 via-blue-900 to-slate-900 pt-20"
    >
      <div className="absolute inset-0 grid-pattern opacity-[0.07]" />
      <div className="absolute top-0 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl" />
      <div className="absolute right-0 bottom-0 h-72 w-72 rounded-full bg-orange-500/5 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="text-center lg:text-left">
            <FadeIn delay={0.05}>
              <span className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-1.5 text-sm font-medium text-blue-200">
                {content.badge}
              </span>
            </FadeIn>

            <FadeIn delay={0.15}>
              <h1 className="mt-6 text-4xl font-bold leading-[1.15] tracking-tight text-white sm:text-5xl lg:text-[3.25rem]">
                {content.title}
              </h1>
            </FadeIn>

            <FadeIn delay={0.25}>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-blue-100/85 sm:text-lg lg:mx-0 mx-auto">
                {content.subtitle}
              </p>
            </FadeIn>

            <FadeIn delay={0.35} className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <Button
                size="lg"
                className="bg-orange-500 shadow-lg shadow-orange-500/25 hover:bg-orange-400"
                asChild
              >
                <Link href="/products">
                  {content.ctaBrowse}
                  <ArrowRight />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/25 bg-white/5 text-white hover:border-orange-400/50 hover:bg-orange-500/10 hover:text-white"
                asChild
              >
                <Link href="/contact">
                  <MessageSquareQuote />
                  {content.ctaInquiry}
                </Link>
              </Button>
            </FadeIn>
          </div>

          <FadeIn delay={0.2} direction="right" className="hidden sm:block">
            <motion.div initial={false} animate="visible">
              <HeroIllustration />
            </motion.div>
          </FadeIn>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
