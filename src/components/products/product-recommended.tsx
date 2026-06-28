"use client";

import { Package } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { motion } from "framer-motion";
import { getBrandLabel } from "@/lib/mock-products";
import type { MockProduct } from "@/lib/product-types";
import { cn } from "@/lib/utils";

function ProductThumbPlaceholder({ label, className }: { label: string; className?: string }) {
  return (
    <div
      className={cn(
        "relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#1a2332] to-[#0d1424]",
        className,
      )}
    >
      <div className="absolute inset-0 grid-pattern opacity-40" />
      <div className="relative flex flex-col items-center gap-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-orange-500/20 bg-orange-500/10">
          <Package className="h-6 w-6 text-orange-400/60" />
        </div>
        <span className="max-w-[80%] truncate text-xs text-muted-foreground/60">{label}</span>
      </div>
    </div>
  );
}

interface ProductRecommendedProps {
  products: MockProduct[];
}

export function ProductRecommended({ products }: ProductRecommendedProps) {
  const t = useTranslations("productsPage");
  const td = useTranslations("productDetail");

  if (products.length === 0) return null;

  return (
    <section className="mt-16">
      <h2 className="mb-6 text-xl font-bold sm:text-2xl">
        <span className="text-gradient">{td("recommendedTitle")}</span>
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product, index) => {
          const name = t(`items.${product.id}.name`);
          return (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              whileHover={{ y: -4 }}
            >
              <Link
                href={`/products/${product.slug}`}
                className="glass-card group block overflow-hidden transition-all hover:border-orange-500/40 hover:glow-orange"
              >
                <ProductThumbPlaceholder
                  label={name}
                  className="transition-transform duration-300 group-hover:scale-[1.03]"
                />
                <div className="p-4">
                  <h3 className="mb-1 line-clamp-2 text-sm font-semibold group-hover:text-orange-300">
                    {name}
                  </h3>
                  <p className="text-xs text-orange-400">{getBrandLabel(product.brandId)}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{product.model}</p>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
