"use client";

import { useLocale } from "next-intl";
import {
  ArrowRight,
  Boxes,
  CircleDot,
  Cylinder,
  HardHat,
  LayoutGrid,
  Settings2,
  Warehouse,
  Wrench,
  Zap,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { SectionHeader } from "@/components/motion/fade-in";
import { categoryGradient } from "@/lib/catalog/catalog-display";
import {
  categoryDescriptions,
  categoryNames,
  homeCategories,
} from "@/lib/home-content";
import type { AdminCategory } from "@/lib/admin/types";
import type { Locale } from "@/i18n/routing";
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
  LayoutGrid,
} as const;

interface CategoriesProps {
  categories: AdminCategory[];
}

export function Categories({ categories }: CategoriesProps) {
  const locale = useLocale() as Locale;
  const section = homeCategories[locale];
  const names = categoryNames[locale];
  const descriptions = categoryDescriptions[locale];
  const browseLabel =
    locale === "zh" ? "进入分类" : locale === "id" ? "Lihat" : "Browse";

  return (
    <section id="categories" className="section-padding relative bg-slate-50 text-slate-900">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(37,99,235,0.06),transparent_60%)]" />

      <div className="relative mx-auto max-w-7xl">
        <SectionHeader title={section.title} subtitle={section.subtitle} />

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5 lg:gap-6">
          {categories.map((cat, index) => {
            const Icon = iconMap[cat.icon as keyof typeof iconMap] ?? LayoutGrid;
            const gradient = categoryGradient(index);
            const localizedName = names[cat.id as keyof typeof names];
            const displayName = localizedName ?? cat.name;
            const description =
              descriptions[cat.id as keyof typeof descriptions] ?? "";

            return (
              <Link
                key={cat.id}
                href={`/products?category=${cat.id}`}
                className={cn(
                  "group flex h-full flex-col rounded-2xl border border-slate-200/80 bg-white p-5 shadow-md shadow-slate-200/60",
                  "transition-all duration-300 ease-out",
                  "hover:-translate-y-1.5 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-100/80",
                  "sm:p-6",
                )}
              >
                <div
                  className={cn(
                    "mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br shadow-md shadow-black/5 transition-transform duration-300 group-hover:scale-110",
                    gradient,
                  )}
                >
                  <Icon className="h-6 w-6 text-white" />
                </div>

                <h3 className="mb-2 text-base font-semibold text-slate-900 transition-colors group-hover:text-blue-700 sm:text-lg">
                  {displayName}
                </h3>

                {description ? (
                  <p className="mb-4 flex-1 text-xs leading-relaxed text-slate-500 sm:text-sm">
                    {description}
                  </p>
                ) : (
                  <p className="mb-4 flex-1" />
                )}

                <span className="flex items-center gap-1 text-xs font-medium text-blue-600 opacity-80 transition-all group-hover:gap-1.5 group-hover:opacity-100">
                  {browseLabel}
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
