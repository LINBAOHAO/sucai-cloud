"use client";

import { useLocale } from "next-intl";
import { motion } from "framer-motion";
import { CheckCircle2, Globe2, Timer, Warehouse } from "lucide-react";
import { SectionHeader, staggerContainer, staggerItem } from "@/components/motion/fade-in";
import { homeWhyChoose } from "@/lib/home-content";
import type { Locale } from "@/i18n/routing";

const icons = [Warehouse, Globe2, Timer, CheckCircle2];

export function HomeWhyChoose() {
  const locale = useLocale() as Locale;
  const content = homeWhyChoose[locale];

  return (
    <section id="why-choose" className="section-padding relative bg-slate-50 text-slate-900">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(37,99,235,0.05),transparent_70%)]" />

      <div className="relative mx-auto max-w-7xl">
        <SectionHeader title={content.title} subtitle={content.subtitle} />

        <motion.div
          variants={staggerContainer}
          initial={false}
          animate="visible"
          className="grid gap-5 sm:grid-cols-2 lg:gap-6"
        >
          {content.items.map((item, index) => {
            const Icon = icons[index];
            return (
              <motion.div
                key={item.title}
                variants={staggerItem}
                initial={false}
                animate="visible"
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:border-blue-200 hover:shadow-md hover:shadow-blue-100/50 sm:p-8"
              >
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-600/20">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="mb-2 flex items-center gap-2 text-lg font-semibold text-slate-900">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-orange-500" />
                      {item.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-slate-600">{item.desc}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
