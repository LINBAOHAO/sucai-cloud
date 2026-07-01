"use client";

import { PackageX } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/products/product-card";
import type { MockProduct } from "@/lib/product-types";

interface ProductGridProps {
  products: MockProduct[];
  brandLabels: Record<string, string>;
  onReset?: () => void;
}

export function ProductGrid({ products, brandLabels, onReset }: ProductGridProps) {
  const t = useTranslations("productsPage");

  if (products.length === 0) {
    return (
      <div className="glass-card flex flex-col items-center justify-center rounded-xl px-6 py-20 text-center">
        <PackageX className="mb-4 h-12 w-12 text-muted-foreground/40" />
        <h3 className="mb-2 text-lg font-semibold">{t("empty.title")}</h3>
        <p className="mb-6 max-w-sm text-sm text-muted-foreground">{t("empty.desc")}</p>
        {onReset && (
          <Button variant="outline" onClick={onReset}>
            {t("empty.reset")}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} brandLabels={brandLabels} />
      ))}
    </div>
  );
}
