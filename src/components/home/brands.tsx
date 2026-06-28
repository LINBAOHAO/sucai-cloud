"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeIn, SectionHeader, staggerContainer, staggerItem } from "@/components/motion/fade-in";
import { brands } from "@/lib/data";

export function Brands() {
  const t = useTranslations("brands");

  return (
    <section id="brands" className="section-padding relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-orange-500/[0.03] via-transparent to-transparent" />

      <div className="relative mx-auto max-w-7xl">
        <SectionHeader title={t("title")} subtitle={t("subtitle")} />

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:gap-6"
        >
          {brands.map((brand) => (
            <motion.div key={brand.id} variants={staggerItem}>
              <div className="glass-card flex h-24 items-center justify-center transition-all duration-300 hover:-translate-y-1 hover:border-orange-500/30 hover:glow-orange sm:h-28">
                <span className="text-lg font-bold tracking-wider text-muted-foreground transition-colors hover:text-foreground sm:text-xl">
                  {brand.logo}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <FadeIn className="mt-10 text-center">
          <Button variant="outline" size="lg" className="group">
            {t("viewAll")}
            <ArrowRight className="transition-transform group-hover:translate-x-1" />
          </Button>
        </FadeIn>
      </div>
    </section>
  );
}
