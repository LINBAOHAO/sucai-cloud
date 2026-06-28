"use client";

import { useLocale } from "next-intl";
import { motion } from "framer-motion";
import { Link } from "@/i18n/navigation";
import { ArrowRight, MapPin, MessageSquareQuote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeIn, SectionHeader, staggerContainer, staggerItem } from "@/components/motion/fade-in";
import { ProductPlaceholder } from "@/components/home/product-placeholder";
import {
  homeHotProducts,
  locationLabels,
  productNames,
} from "@/lib/home-content";
import { getBrandLabel, mockProducts } from "@/lib/mock-products";
import type { Locale } from "@/i18n/routing";

const featuredProducts = [...mockProducts]
  .sort((a, b) => b.hotScore - a.hotScore)
  .slice(0, 8);

export function HotProducts() {
  const locale = useLocale() as Locale;
  const content = homeHotProducts[locale];
  const locations = locationLabels[locale];
  const names = productNames[locale];

  return (
    <section id="products" className="section-padding relative">
      <div className="absolute inset-0 bg-gradient-to-b from-slate-50/50 via-transparent to-transparent" />

      <div className="relative mx-auto max-w-7xl">
        <SectionHeader title={content.title} subtitle={content.subtitle} />

        <motion.div
          variants={staggerContainer}
          initial={false}
          animate="visible"
          className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {featuredProducts.map((product) => {
            const name = names[product.id] ?? product.model;
            const location = locations[product.location] ?? product.location;

            return (
              <motion.div
                key={product.id}
                variants={staggerItem}
                initial={false}
                animate="visible"
              >
                <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-100/80">
                  <Link href={`/products/${product.slug}`} className="block">
                    <ProductPlaceholder
                      label={name}
                      className="aspect-[4/3] rounded-none bg-gradient-to-br from-slate-100 via-blue-50 to-slate-100"
                    />
                  </Link>

                  <div className="flex flex-1 flex-col p-4">
                    <Link href={`/products/${product.slug}`}>
                      <h3 className="mb-3 line-clamp-2 text-sm font-semibold leading-snug text-slate-900 transition-colors group-hover:text-blue-700">
                        {name}
                      </h3>
                    </Link>

                    <div className="mb-4 space-y-2 text-xs">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-slate-500">{content.brand}</span>
                        <span className="truncate font-medium text-blue-600">
                          {getBrandLabel(product.brandId)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-slate-500">{content.model}</span>
                        <span className="truncate font-medium text-slate-800">
                          {product.model}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-slate-500">{content.location}</span>
                        <span className="flex items-center gap-1 truncate font-medium text-slate-700">
                          <MapPin className="h-3 w-3 shrink-0 text-blue-500" />
                          {location}
                        </span>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      className="mt-auto w-full bg-orange-500 shadow-md shadow-orange-500/20 hover:bg-orange-400"
                      asChild
                    >
                      <Link href="/contact">
                        <MessageSquareQuote className="h-4 w-4" />
                        {content.inquiry}
                      </Link>
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        <FadeIn className="mt-10 text-center">
          <Button
            variant="outline"
            size="lg"
            className="border-blue-200 text-blue-700 hover:border-blue-300 hover:bg-blue-50"
            asChild
          >
            <Link href="/products">
              {content.viewAll}
              <ArrowRight className="transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </FadeIn>
      </div>
    </section>
  );
}
