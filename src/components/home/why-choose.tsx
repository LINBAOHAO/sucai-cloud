"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Network, Cpu, FileCheck, CreditCard } from "lucide-react";
import { FadeIn, SectionHeader } from "@/components/motion/fade-in";

const whyItems = [
  { key: "network", icon: Network },
  { key: "technology", icon: Cpu },
  { key: "compliance", icon: FileCheck },
  { key: "payment", icon: CreditCard },
] as const;

export function WhyChoose() {
  const t = useTranslations("whyChoose");

  return (
    <section id="why-choose" className="section-padding relative overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-50" />
      <div className="absolute top-0 right-0 h-[500px] w-[500px] rounded-full bg-orange-500/5 blur-3xl" />

      <div className="relative mx-auto max-w-7xl">
        <SectionHeader title={t("title")} subtitle={t("subtitle")} />

        <div className="grid gap-8 lg:grid-cols-2">
          {whyItems.map((item, index) => (
            <FadeIn key={item.key} delay={index * 0.1} direction={index % 2 === 0 ? "left" : "right"}>
              <motion.div
                whileHover={{ x: 4 }}
                className="flex gap-5 rounded-2xl border border-white/10 bg-gradient-to-r from-white/[0.04] to-transparent p-6 transition-all hover:border-orange-500/30 sm:p-8"
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 shadow-lg shadow-orange-500/20">
                  <item.icon className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="mb-2 text-xl font-semibold">{t(`items.${item.key}.title`)}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {t(`items.${item.key}.desc`)}
                  </p>
                </div>
              </motion.div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
