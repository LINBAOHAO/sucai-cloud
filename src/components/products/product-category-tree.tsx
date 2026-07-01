"use client";

import { motion } from "framer-motion";
import {
  Wrench,
  Zap,
  HardHat,
  Cylinder,
  Settings2,
  CircleDot,
  Boxes,
  Warehouse,
  LayoutGrid,
  ChevronRight,
} from "lucide-react";
import { useTranslations } from "next-intl";
import type { AdminCategory } from "@/lib/admin/types";
import type { CategoryId } from "@/lib/product-types";
import { cn } from "@/lib/utils";

const iconMap = {
  Wrench,
  Zap,
  HardHat,
  Cylinder,
  Settings2,
  CircleDot,
  Boxes,
  Warehouse,
} as const;

interface ProductCategoryTreeProps {
  categories: AdminCategory[];
  selected: CategoryId | "all";
  onSelect: (category: CategoryId | "all") => void;
  counts: Record<string, number>;
  className?: string;
}

export function ProductCategoryTree({
  categories,
  selected,
  onSelect,
  counts,
  className,
}: ProductCategoryTreeProps) {
  const t = useTranslations("productsPage");

  const allCount = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className={cn("glass-card overflow-hidden rounded-xl", className)}>
      <div className="border-b border-white/10 px-4 py-3.5">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <LayoutGrid className="h-4 w-4 text-orange-400" />
          {t("mobileCategories")}
        </h2>
      </div>
      <ul className="p-2">
        <li>
          <button
            type="button"
            onClick={() => onSelect("all")}
            className={cn(
              "group flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-all duration-200",
              selected === "all"
                ? "bg-orange-500/15 text-orange-300"
                : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
            )}
          >
            <span className="font-medium">{t("categories.all")}</span>
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
        {categories.map((cat) => {
          const Icon = iconMap[cat.icon as keyof typeof iconMap] ?? LayoutGrid;
          const isActive = selected === cat.id;
          return (
            <li key={cat.id}>
              <button
                type="button"
                onClick={() => onSelect(cat.id)}
                className={cn(
                  "group flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm transition-all duration-200",
                  isActive
                    ? "bg-orange-500/15 text-orange-300"
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0 transition-colors",
                    isActive ? "text-orange-400" : "text-muted-foreground group-hover:text-orange-400/70",
                  )}
                />
                <span className="flex-1 truncate font-medium">{cat.name}</span>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-xs",
                    isActive ? "bg-orange-500/20 text-orange-400" : "bg-white/5",
                  )}
                >
                  {counts[cat.id] ?? 0}
                </span>
                {isActive && (
                  <motion.span
                    layoutId="category-indicator"
                    className="hidden lg:block"
                  >
                    <ChevronRight className="h-3.5 w-3.5 text-orange-400" />
                  </motion.span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
