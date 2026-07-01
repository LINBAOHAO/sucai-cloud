"use client";

import { Tag } from "lucide-react";
import { useTranslations } from "next-intl";
import type { AdminBrand } from "@/lib/admin/types";
import { cn } from "@/lib/utils";

interface ProductBrandTreeProps {
  brands: AdminBrand[];
  selected: string | "all";
  onSelect: (brand: string | "all") => void;
  counts: Record<string, number>;
  className?: string;
}

export function ProductBrandTree({
  brands,
  selected,
  onSelect,
  counts,
  className,
}: ProductBrandTreeProps) {
  const t = useTranslations("productsPage");
  const allCount = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className={cn("glass-card overflow-hidden rounded-xl", className)}>
      <div className="border-b border-white/10 px-4 py-3.5">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <Tag className="h-4 w-4 text-orange-400" />
          {t("brandsTitle")}
        </h2>
      </div>
      <ul className="p-2">
        <li>
          <button
            type="button"
            onClick={() => onSelect("all")}
            className={cn(
              "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-all duration-200",
              selected === "all"
                ? "bg-orange-500/15 text-orange-300"
                : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
            )}
          >
            <span className="font-medium">{t("brands.all")}</span>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-xs",
                selected === "all" ? "bg-orange-500/20 text-orange-400" : "bg-white/5",
              )}
            >
              {allCount}
            </span>
          </button>
        </li>
        {brands.map((brand) => (
          <li key={brand.id}>
            <button
              type="button"
              onClick={() => onSelect(brand.id)}
              className={cn(
                "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-all duration-200",
                selected === brand.id
                  ? "bg-orange-500/15 text-orange-300"
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
              )}
            >
              <span className="truncate font-medium">{brand.name}</span>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs",
                  selected === brand.id ? "bg-orange-500/20 text-orange-400" : "bg-white/5",
                )}
              >
                {counts[brand.id] ?? 0}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
