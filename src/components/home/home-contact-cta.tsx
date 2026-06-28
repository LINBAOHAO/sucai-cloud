"use client";

import { useLocale } from "next-intl";
import { ArrowRight, MessageSquare } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/motion/fade-in";
import { homeContactCta } from "@/lib/home-content";
import type { Locale } from "@/i18n/routing";

export function HomeContactCta() {
  const locale = useLocale() as Locale;
  const content = homeContactCta[locale];

  return (
    <section id="contact" className="section-padding relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-700 via-blue-800 to-blue-950" />
      <div className="absolute inset-0 grid-pattern opacity-10" />
      <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-orange-500/10 blur-3xl" />

      <div className="relative mx-auto max-w-4xl text-center">
        <FadeIn>
          <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-12 backdrop-blur-sm sm:px-12 sm:py-16">
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500/20 ring-1 ring-orange-400/30">
              <MessageSquare className="h-7 w-7 text-orange-300" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {content.title}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-blue-100/90 sm:text-lg">
              {content.subtitle}
            </p>
            <Button
              size="lg"
              className="mt-8 bg-orange-500 px-8 shadow-lg shadow-orange-500/30 hover:bg-orange-400"
              asChild
            >
              <Link href="/contact">
                {content.button}
                <ArrowRight className="transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
