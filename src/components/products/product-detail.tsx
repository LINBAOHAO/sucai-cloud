"use client";

import { useState } from "react";
import {
  ChevronRight,
  Home,
  MapPin,
  MessageSquareQuote,
  Package2,
  Tag,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/layout/whatsapp-icon";
import { ProductImageGallery } from "@/components/products/product-image-gallery";
import { ProductSpecsTable } from "@/components/products/product-specs-table";
import { ProductRecommended } from "@/components/products/product-recommended";
import { useInquiry } from "@/components/inquiry/inquiry-provider";
import { resolveBrandName } from "@/lib/catalog/catalog-display";
import { getProductDetailExtra } from "@/lib/product-detail-content";
import { resolveProductContentId, resolveProductName } from "@/lib/products/product-display";
import { getWhatsAppUrl } from "@/lib/contact-config";
import { useSiteSettings } from "@/components/providers/site-settings-provider";
import type { MockProduct } from "@/lib/product-types";
import type { Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

interface ProductDetailProps {
  product: MockProduct;
  recommended: MockProduct[];
  brandLabels: Record<string, string>;
  categoryName: string;
}

type TabId = "introduction" | "specs" | "applications" | "packaging";

const stockBadgeStyles = {
  inStock: "bg-emerald-50 text-emerald-700 border-emerald-200",
  preOrder: "bg-blue-50 text-blue-700 border-blue-200",
} as const;

const tabIds: TabId[] = ["introduction", "specs", "applications", "packaging"];

export default function ProductDetail({
  product,
  recommended,
  brandLabels,
  categoryName,
}: ProductDetailProps) {
  const locale = useLocale() as Locale;
  const t = useTranslations("productsPage");
  const td = useTranslations("productDetail");
  const { openInquiry } = useInquiry();
  const settings = useSiteSettings();
  const [activeTab, setActiveTab] = useState<TabId>("introduction");

  const contentId = resolveProductContentId(product);
  const name = resolveProductName(product, (id) => t(`items.${id}.name`));
  const summary = /^p\d+$/.test(contentId)
    ? t(`items.${contentId}.description`)
    : product.model;
  const longDescription = /^p\d+$/.test(contentId)
    ? td(`items.${contentId}.longDescription`)
    : summary;
  const extra = getProductDetailExtra(locale, contentId, product.slug);
  const category = categoryName;
  const whatsappUrl = getWhatsAppUrl(
    settings.whatsapp,
    td("whatsappMessage", { productName: name }),
  );

  const infoRows = [
    { label: td("labels.brand"), value: resolveBrandName(product.brandId, brandLabels), highlight: true },
    { label: td("labels.model"), value: product.model },
    { label: td("labels.category"), value: category },
    {
      label: td("labels.stock"),
      value: td(`stock.${product.stockStatus}`),
      badge: product.stockStatus,
    },
    { label: td("labels.shipFrom"), value: extra.shipFrom, icon: MapPin },
    {
      label: td("labels.moq"),
      value: `${product.moq} ${t("card.moqUnit")}`,
    },
    { label: td("labels.deliveryTime"), value: extra.deliveryTime },
  ] as const;

  return (
    <div className="min-h-screen bg-slate-50 pb-16 pt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav className="mb-8 flex flex-wrap items-center gap-1.5 text-sm text-slate-500">
          <Link href="/" className="flex items-center gap-1 transition-colors hover:text-blue-600">
            <Home className="h-3.5 w-3.5" />
            {t("breadcrumb.home")}
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/products" className="transition-colors hover:text-blue-600">
            {t("breadcrumb.products")}
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-medium text-slate-800">{name}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[9fr_11fr] lg:gap-12">
          <div className="lg:max-w-none">
            <ProductImageGallery productName={name} images={product.images} />
          </div>

          <div className="flex flex-col">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
              {name}
            </h1>

            <dl className="mt-6 space-y-0 rounded-2xl border border-slate-200/80 bg-white shadow-sm">
              {infoRows.map((row, index) => {
                const Icon = "icon" in row ? row.icon : undefined;
                const isLast = index === infoRows.length - 1;
                return (
                  <div
                    key={row.label}
                    className={cn(
                      "flex items-center justify-between gap-4 px-5 py-3.5 sm:px-6",
                      !isLast && "border-b border-slate-100",
                    )}
                  >
                    <dt className="flex shrink-0 items-center gap-1.5 text-sm text-slate-500">
                      {Icon && <Icon className="h-4 w-4" />}
                      {row.label}
                    </dt>
                    <dd className="text-right text-sm font-semibold text-slate-800">
                      {"badge" in row && row.badge ? (
                        <span
                          className={cn(
                            "inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium",
                            stockBadgeStyles[row.badge],
                          )}
                        >
                          {row.value}
                        </span>
                      ) : (
                        <span className={"highlight" in row && row.highlight ? "text-blue-600" : undefined}>
                          {row.value}
                        </span>
                      )}
                    </dd>
                  </div>
                );
              })}
            </dl>

            <div className="mt-6 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Tag className="h-4 w-4 text-blue-600" />
                {td("labels.summary")}
              </h2>
              <p className="text-sm leading-relaxed text-slate-600">{summary}</p>
            </div>

            <div id="inquiry" className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button
                size="lg"
                type="button"
                className="flex-1 bg-blue-600 shadow-md shadow-blue-600/20 hover:bg-blue-700"
                onClick={() =>
                  openInquiry({
                    productName: name,
                    productModel: product.model,
                    productSlug: product.slug,
                  })
                }
              >
                <MessageSquareQuote className="h-5 w-5" />
                {td("inquiry")}
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="flex-1 border-slate-300 text-slate-700 hover:border-[#25D366] hover:bg-[#25D366]/5 hover:text-[#128C7E]"
              >
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <WhatsAppIcon />
                  {td("whatsapp")}
                </a>
              </Button>
            </div>
            <p className="mt-3 text-xs text-slate-500">{td("inquiryHint")}</p>
          </div>
        </div>

        <div className="mt-12 sm:mt-16">
          <div className="border-b border-slate-200">
            <div className="flex gap-1 overflow-x-auto pb-px sm:gap-2">
              {tabIds.map((tabId) => (
                <button
                  key={tabId}
                  type="button"
                  onClick={() => setActiveTab(tabId)}
                  className={cn(
                    "shrink-0 border-b-2 px-4 py-3 text-sm font-medium transition-colors sm:px-6",
                    activeTab === tabId
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800",
                  )}
                >
                  {td(`tabs.${tabId}`)}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-b-2xl border border-t-0 border-slate-200/80 bg-white p-5 shadow-sm sm:p-8">
            {activeTab === "introduction" && (
              <div className="prose prose-slate max-w-none">
                <p className="leading-relaxed text-slate-600">{longDescription}</p>
              </div>
            )}
            {activeTab === "specs" && (
              <ProductSpecsTable product={product} locale={locale} brandLabels={brandLabels} />
            )}
            {activeTab === "applications" && (
              <div className="flex gap-3">
                <Package2 className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
                <p className="leading-relaxed text-slate-600">{extra.applications}</p>
              </div>
            )}
            {activeTab === "packaging" && (
              <div className="flex gap-3">
                <Package2 className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
                <p className="leading-relaxed text-slate-600">{extra.packaging}</p>
              </div>
            )}
          </div>
        </div>

        <ProductRecommended products={recommended} brandLabels={brandLabels} />
      </div>
    </div>
  );
}
