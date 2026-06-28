"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { SectionHeader, staggerContainer, staggerItem } from "@/components/motion/fade-in";
import { testimonials } from "@/lib/data";

export function Testimonials() {
  const t = useTranslations("testimonials");

  return (
    <section className="section-padding">
      <div className="mx-auto max-w-7xl">
        <SectionHeader title={t("title")} subtitle={t("subtitle")} />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid gap-6 sm:grid-cols-2"
        >
          {testimonials.map((item) => (
            <motion.div key={item.id} variants={staggerItem}>
              <div className="glass-card relative h-full p-8 transition-all duration-300 hover:border-orange-500/30 hover:glow-orange">
                <Quote className="absolute top-6 right-6 h-8 w-8 text-orange-500/20" />
                <div className="mb-4 flex gap-1">
                  {Array.from({ length: item.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
                  &ldquo;{t(`items.${item.id}.content`)}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-amber-500 text-sm font-bold text-white">
                    {item.avatar}
                  </div>
                  <div>
                    <div className="font-semibold">{t(`items.${item.id}.name`)}</div>
                    <div className="text-xs text-muted-foreground">
                      {t(`items.${item.id}.role`)} · {t(`items.${item.id}.company`)}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
