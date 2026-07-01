"use client";

import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ArrowRight, Eye, MapPin, MessageSquareQuote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/motion/fade-in";
import { ProductThumbnail } from "@/components/products/product-thumbnail";
import type { HomeFeaturedProduct } from "@/lib/home-content";
import {
  homeFeaturedProductNames,
  homeFeaturedProducts,
  homeHotProducts,
  indonesiaShipLocations,
} from "@/lib/home-content";
import type { Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

export type HomeFeaturedProductView = HomeFeaturedProduct & {
  primaryImageUrl?: string | null;
};

interface HotProductsProps {
  products?: HomeFeaturedProductView[];
}

export function HotProducts({ products = homeFeaturedProducts }: HotProductsProps) {
  const locale = useLocale() as Locale;
  const content = homeHotProducts[locale];
  const names = homeFeaturedProductNames[locale];

  return (
    <section id="hot-products" className="section-padding relative bg-white text-slate-900">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(37,99,235,0.04),transparent_70%)]" />

      <div className="relative mx-auto max-w-7xl">
        <SectionHeader title={content.title} subtitle={content.subtitle} />

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {products.map((product) => {
            const name = names[product.id];
            const shipLabel = indonesiaShipLocations[product.shipFrom][locale];
            const statusLabel =
              product.status === "inStock"
                ? content.statusInStock
                : content.statusPreOrder;

            return (
              <article
                key={product.id}
                className={cn(
                  "group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-md shadow-slate-200/50",
                  "transition-all duration-300 ease-out",
                  "hover:-translate-y-1.5 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-100/80",
                )}
              >
                <Link href={`/products/${product.slug}`} className="relative block">
                  <ProductThumbnail
                    imageUrl={product.primaryImageUrl}
                    label={name}
                    className="aspect-[4/3] rounded-none bg-gradient-to-br from-slate-100 via-blue-50/80 to-slate-50"
                  />
                  <span
                    className={cn(
                      "absolute top-3 left-3 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1",
                      product.status === "inStock"
                        ? "bg-emerald-500/90 text-white ring-emerald-400/50"
                        : "bg-blue-500/90 text-white ring-blue-400/50",
                    )}
                  >
                    {statusLabel}
                  </span>
                </Link>

                <div className="flex flex-1 flex-col p-4 sm:p-5">
                  <Link href={`/products/${product.slug}`}>
                    <h3 className="mb-3 line-clamp-2 text-sm font-semibold leading-snug text-slate-900 transition-colors group-hover:text-blue-700 sm:text-base">
                      {name}
                    </h3>
                  </Link>

                  <dl className="mb-4 space-y-2 text-xs sm:text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <dt className="text-slate-500">{content.brand}</dt>
                      <dd className="truncate font-medium text-blue-600">{product.brand}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <dt className="text-slate-500">{content.model}</dt>
                      <dd className="truncate font-medium text-slate-800">{product.model}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <dt className="text-slate-500">{content.location}</dt>
                      <dd className="flex items-center gap-1 truncate font-medium text-slate-700">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-blue-500" />
                        {shipLabel}
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-auto flex flex-col gap-2 sm:flex-row">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 border-blue-200 text-blue-700 hover:bg-blue-50"
                      asChild
                    >
                      <Link href={`/products/${product.slug}`}>
                        <Eye className="h-4 w-4" />
                        {content.viewDetail}
                      </Link>
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 bg-orange-500 shadow-md shadow-orange-500/20 hover:bg-orange-400"
                      asChild
                    >
                      <Link href="/contact">
                        <MessageSquareQuote className="h-4 w-4" />
                        {content.inquiry}
                      </Link>
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-10 text-center">
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
        </div>
      </div>
    </section>
  );
}
