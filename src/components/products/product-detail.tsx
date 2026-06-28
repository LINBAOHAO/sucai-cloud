"use client";

import { motion } from "framer-motion";
import {
  ChevronRight,
  Clock,
  Home,
  MapPin,
  MessageSquareQuote,
  Package2,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/layout/whatsapp-icon";
import { ProductImageGallery } from "@/components/products/product-image-gallery";
import { ProductSpecsTable } from "@/components/products/product-specs-table";
import { ProductRecommended } from "@/components/products/product-recommended";
import { getBrandLabel, getRecommendedProducts } from "@/lib/mock-products";
import { contactConfig } from "@/lib/contact-config";
import type { MockProduct } from "@/lib/product-types";
import { cn } from "@/lib/utils";

interface ProductDetailProps {
  product: MockProduct;
}

const stockBadgeStyles = {
  inStock: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  preOrder: "bg-blue-500/15 text-blue-400 border-blue-500/30",
} as const;

const stockTextStyles = {
  inStock: "text-emerald-400",
  preOrder: "text-blue-400",
} as const;

function formatUpdatedAt(date: string, locale: string): string {
  const tag = locale === "zh" ? "zh-CN" : locale === "id" ? "id-ID" : "en-US";
  return new Date(date).toLocaleDateString(tag, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function ProductDetail({ product }: ProductDetailProps) {
  const locale = useLocale();
  const t = useTranslations("productsPage");
  const td = useTranslations("productDetail");
  const name = t(`items.${product.id}.name`);
  const longDescription = td(`items.${product.id}.longDescription`);
  const recommended = getRecommendedProducts(product.id, 4);
  const whatsappUrl = contactConfig.whatsapp.getUrl(
    td("whatsappMessage", { productName: name }),
  );

  const infoRows = [
    { label: t("card.brand"), value: getBrandLabel(product.brandId), highlight: true },
    { label: t("card.model"), value: product.model },
    { label: td("sku"), value: product.sku },
    {
      label: t("card.stock"),
      value: t(`stock.${product.stockStatus}`),
      valueClass: stockTextStyles[product.stockStatus],
      icon: Package2,
    },
    {
      label: t("card.moq"),
      value: `${product.moq} ${t("card.moqUnit")}`,
    },
    {
      label: t("card.location"),
      value: t(`locations.${product.location}`),
      icon: MapPin,
    },
    {
      label: td("updatedAt"),
      value: formatUpdatedAt(product.updatedAt, locale),
      icon: Clock,
    },
  ] as const;

  return (
    <div className="relative min-h-screen pt-20 pb-16">
      <div className="absolute inset-0 grid-pattern opacity-30" />
      <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-orange-500/5 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav className="mb-8 flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
          <Link href="/" className="flex items-center gap-1 transition-colors hover:text-orange-400">
            <Home className="h-3.5 w-3.5" />
            {t("breadcrumb.home")}
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/products" className="transition-colors hover:text-orange-400">
            {t("breadcrumb.products")}
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-orange-400">{td("breadcrumb.detail")}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ProductImageGallery productName={name} imageCount={product.imageCount} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col"
          >
            <div
              className={cn(
                "mb-4 inline-flex w-fit rounded-md border px-3 py-1 text-xs font-medium",
                stockBadgeStyles[product.stockStatus],
              )}
            >
              {t(`stock.${product.stockStatus}`)}
            </div>

            <h1 className="mb-6 text-2xl font-bold tracking-tight sm:text-3xl">
              <span className="text-gradient">{name}</span>
            </h1>

            <dl className="glass-card mb-8 space-y-0 rounded-xl p-6">
              {infoRows.map((row, index) => {
                const Icon = "icon" in row ? row.icon : undefined;
                const isLast = index === infoRows.length - 1;
                return (
                  <div
                    key={row.label}
                    className={cn(
                      "flex justify-between gap-4 py-4",
                      !isLast && "border-b border-white/10",
                    )}
                  >
                    <dt className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      {Icon && <Icon className="h-4 w-4" />}
                      {row.label}
                    </dt>
                    <dd
                      className={cn(
                        "text-right text-sm font-semibold",
                        "highlight" in row && row.highlight && "text-orange-400",
                        "valueClass" in row && row.valueClass,
                      )}
                    >
                      {row.value}
                    </dd>
                  </div>
                );
              })}
            </dl>

            <div id="inquiry" className="mt-auto flex flex-col gap-3 sm:flex-row">
              <Button
                size="lg"
                className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 shadow-lg shadow-orange-500/25 hover:from-orange-400 hover:to-amber-400"
              >
                <MessageSquareQuote className="h-5 w-5" />
                {td("inquiry")}
              </Button>
              <Button
                size="lg"
                asChild
                className="flex-1 bg-[#25D366] text-white shadow-lg shadow-[#25D366]/25 hover:bg-[#20bd5a]"
              >
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <WhatsAppIcon />
                  {td("whatsapp")}
                </a>
              </Button>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">{td("inquiryHint")}</p>
          </motion.div>
        </div>

        <ProductSpecsTable productId={product.id} />

        <section className="mt-16">
          <h2 className="mb-6 text-xl font-bold sm:text-2xl">
            <span className="text-gradient">{td("descTitle")}</span>
          </h2>
          <div className="glass-card rounded-xl p-6 sm:p-8">
            <p className="leading-relaxed text-muted-foreground">{longDescription}</p>
          </div>
        </section>

        <ProductRecommended products={recommended} />
      </div>
    </div>
  );
}
