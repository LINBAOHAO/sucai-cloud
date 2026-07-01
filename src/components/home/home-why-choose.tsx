"use client";

import { useLocale } from "next-intl";
import { FileText, Globe, Users, Warehouse } from "lucide-react";
import { SectionHeader } from "@/components/motion/fade-in";
import { homeWhyChoose } from "@/lib/home-content";
import type { Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

const icons = [Warehouse, Globe, FileText, Users];

export function HomeWhyChoose() {
  const locale = useLocale() as Locale;
  const content = homeWhyChoose[locale];

  return (
    <section id="why-choose" className="section-padding relative bg-slate-50 text-slate-900">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(37,99,235,0.05),transparent_70%)]" />

      <div className="relative mx-auto max-w-7xl">
        <SectionHeader title={content.title} subtitle={content.subtitle} />

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-4 lg:gap-6">
          {content.items.map((item, index) => {
            const Icon = icons[index];
            return (
              <article
                key={item.title}
                className={cn(
                  "group flex h-full flex-col rounded-2xl border border-slate-200/80 bg-white p-6 shadow-md shadow-slate-200/50 sm:p-8",
                  "transition-all duration-300 ease-out",
                  "hover:-translate-y-1.5 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-100/80",
                )}
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-600/20 transition-transform duration-300 group-hover:scale-110">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-slate-900">{item.title}</h3>
                <p className="text-sm leading-relaxed text-slate-600">{item.desc}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
