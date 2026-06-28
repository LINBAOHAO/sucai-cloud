"use client";

import { useLocale } from "next-intl";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { SectionHeader, staggerContainer, staggerItem } from "@/components/motion/fade-in";
import {
  categoryCards,
  categoryNames,
  homeCategories,
} from "@/lib/home-content";
import type { Locale } from "@/i18n/routing";

export function Categories() {
  const locale = useLocale() as Locale;
  const section = homeCategories[locale];
  const names = categoryNames[locale];

  return (
    <section id="categories" className="section-padding relative bg-white text-slate-900">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(37,99,235,0.04),transparent_70%)]" />

      <div className="relative mx-auto max-w-7xl">
        <SectionHeader title={section.title} subtitle={section.subtitle} />

        <motion.div
          variants={staggerContainer}
          initial={false}
          animate="visible"
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {categoryCards.map((cat) => (
            <motion.div key={cat.id} variants={staggerItem} initial={false} animate="visible">
              <Link
                href="/products"
                className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-100"
              >
                <span className="mb-4 text-3xl" role="img" aria-hidden>
                  {cat.emoji}
                </span>
                <h3 className="mb-1 text-base font-semibold text-slate-900 transition-colors group-hover:text-blue-700 sm:text-lg">
                  {names[cat.id]}
                </h3>
                <div className="mt-auto flex items-center gap-1 pt-4 text-xs font-medium text-blue-600 opacity-0 transition-opacity group-hover:opacity-100">
                  <span>{locale === "zh" ? "进入分类" : locale === "id" ? "Lihat" : "Browse"}</span>
                  <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
