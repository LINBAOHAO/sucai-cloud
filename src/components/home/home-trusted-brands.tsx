"use client";

import type { CSSProperties } from "react";
import { useLocale } from "next-intl";
import { SectionHeader } from "@/components/motion/fade-in";
import { homeTrustedBrands } from "@/lib/home-content";
import type { AdminBrand } from "@/lib/admin/types";
import type { Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

function BrandLogoPlaceholder({ name, color }: { name: string; color: string }) {
  const compact = name.length > 10;

  return (
    <div
      className={cn(
        "group flex h-20 items-center justify-center rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:h-24",
        "transition-all duration-300 ease-out",
        "hover:-translate-y-1 hover:border-blue-200 hover:shadow-md hover:shadow-blue-100/60",
      )}
    >
      <span
        className={cn(
          "text-center font-bold leading-tight tracking-tight text-slate-400 transition-colors duration-300 group-hover:text-[var(--brand-color)]",
          compact ? "text-xs sm:text-sm" : "text-sm sm:text-base",
        )}
        style={{ "--brand-color": color } as CSSProperties}
      >
        {name}
      </span>
    </div>
  );
}

interface HomeTrustedBrandsProps {
  brands: AdminBrand[];
}

export function HomeTrustedBrands({ brands }: HomeTrustedBrandsProps) {
  const locale = useLocale() as Locale;
  const content = homeTrustedBrands[locale];

  return (
    <section id="brands" className="section-padding relative bg-white text-slate-900">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(37,99,235,0.04),transparent_70%)]" />

      <div className="relative mx-auto max-w-7xl">
        <SectionHeader title={content.title} subtitle={content.subtitle} />

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 lg:gap-5">
          {brands.map((brand) => (
            <BrandLogoPlaceholder key={brand.id} name={brand.name} color={brand.color} />
          ))}
        </div>

        <div className="mt-12 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-6 shadow-sm sm:p-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {content.stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold tracking-tight text-blue-600 sm:text-4xl">
                  {stat.value}
                </div>
                <div className="mt-1.5 text-sm font-medium text-slate-600 sm:text-base">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
