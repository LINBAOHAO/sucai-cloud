"use client";

import { motion } from "framer-motion";
import { MapPin, MessageSquareQuote } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ProductPlaceholder } from "@/components/home/product-placeholder";
import { getBrandLabel } from "@/lib/mock-products";
import type { MockProduct } from "@/lib/product-types";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: MockProduct;
  index?: number;
}

const stockTextStyles = {
  inStock: "text-emerald-400",
  preOrder: "text-blue-400",
} as const;

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const t = useTranslations("productsPage");
  const name = t(`items.${product.id}.name`);
  const href = `/products/${product.slug}`;

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
      whileHover={{ y: -8 }}
      className="group"
    >
      <div className="glass-card flex h-full flex-col overflow-hidden transition-all duration-300 hover:border-orange-500/50 hover:shadow-xl hover:shadow-orange-500/10">
        <Link href={href} className="block">
          <ProductPlaceholder
            label={name}
            className="aspect-[4/3] transition-transform duration-500 group-hover:scale-[1.04]"
          />
        </Link>

        <div className="flex flex-1 flex-col p-4">
          <Link href={href}>
            <h3 className="mb-3 line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug transition-colors group-hover:text-orange-300">
              {name}
            </h3>
          </Link>

          <dl className="mb-4 space-y-1.5 text-xs">
            <div className="flex justify-between gap-2">
              <dt className="text-muted-foreground">{t("card.brand")}</dt>
              <dd className="truncate font-medium text-orange-400">
                {getBrandLabel(product.brandId)}
              </dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-muted-foreground">{t("card.model")}</dt>
              <dd className="truncate font-medium">{product.model}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-muted-foreground">{t("card.stock")}</dt>
              <dd className={cn("font-medium", stockTextStyles[product.stockStatus])}>
                {t(`stock.${product.stockStatus}`)}
              </dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="flex items-center gap-1 text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {t("card.location")}
              </dt>
              <dd className="truncate font-medium">{t(`locations.${product.location}`)}</dd>
            </div>
          </dl>

          <Link
            href={href}
            className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-2 text-sm font-medium text-white shadow-md shadow-orange-500/20 transition-all hover:from-orange-400 hover:to-amber-400 hover:shadow-lg hover:shadow-orange-500/30"
          >
            <MessageSquareQuote className="h-4 w-4" />
            {t("card.inquiry")}
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
