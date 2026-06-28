"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { ShieldCheck, BadgeDollarSign, Truck, Headphones } from "lucide-react";
import { SectionHeader, staggerContainer, staggerItem } from "@/components/motion/fade-in";

const advantageItems = [
  { key: "quality", icon: ShieldCheck },
  { key: "price", icon: BadgeDollarSign },
  { key: "logistics", icon: Truck },
  { key: "service", icon: Headphones },
] as const;

export function Advantages() {
  const t = useTranslations("advantages");

  return (
    <section className="section-padding">
      <div className="mx-auto max-w-7xl">
        <SectionHeader title={t("title")} subtitle={t("subtitle")} />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {advantageItems.map((item) => (
            <motion.div key={item.key} variants={staggerItem}>
              <div className="group relative h-full overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-transparent p-8 transition-all duration-300 hover:border-orange-500/30 hover:glow-orange">
                <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-orange-500/5 transition-all group-hover:bg-orange-500/10" />
                <div className="relative">
                  <div className="mb-5 inline-flex rounded-xl bg-primary/10 p-3 transition-transform group-hover:scale-110">
                    <item.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="mb-3 text-xl font-semibold">{t(`items.${item.key}.title`)}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {t(`items.${item.key}.desc`)}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
