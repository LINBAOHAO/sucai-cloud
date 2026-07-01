"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { resolveBrandName } from "@/lib/catalog/catalog-display";
import { resolveProductName } from "@/lib/products/product-display";
import { ProductThumbnail } from "@/components/products/product-thumbnail";
import type { MockProduct } from "@/lib/product-types";
import { cn } from "@/lib/utils";

function ProductThumbPlaceholder({
  product,
  label,
  className,
}: {
  product: MockProduct;
  label: string;
  className?: string;
}) {
  return (
    <ProductThumbnail
      imageUrl={product.primaryImageUrl}
      label={label}
      className={className}
    />
  );
}

interface ProductRecommendedProps {
  products: MockProduct[];
  brandLabels: Record<string, string>;
}

export function ProductRecommended({ products, brandLabels }: ProductRecommendedProps) {
  const t = useTranslations("productsPage");
  const td = useTranslations("productDetail");

  if (products.length === 0) return null;

  return (
    <section className="mt-12 border-t border-slate-200 pt-12 sm:mt-16 sm:pt-16">
      <h2 className="mb-6 text-xl font-bold text-slate-900 sm:text-2xl">
        {td("recommendedTitle")}
      </h2>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
        {products.map((product) => {
          const name = resolveProductName(product, (id) => t(`items.${id}.name`));
          return (
            <Link
              key={product.id}
              href={`/products/${product.slug}`}
              className={cn(
                "group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-md shadow-slate-200/50",
                "transition-all duration-300 ease-out",
                "hover:-translate-y-1.5 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-100/80",
              )}
            >
              <ProductThumbPlaceholder
                product={product}
                label={name}
                className="aspect-[4/3] transition-transform duration-300 group-hover:scale-[1.02]"
              />
              <div className="flex flex-1 flex-col p-4">
                <h3 className="mb-1 line-clamp-2 text-sm font-semibold text-slate-900 group-hover:text-blue-700">
                  {name}
                </h3>
                <p className="text-xs font-medium text-blue-600">
                  {resolveBrandName(product.brandId, brandLabels)}
                </p>
                <p className="mt-1 text-xs text-slate-500">{product.model}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
