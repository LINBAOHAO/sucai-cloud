"use client";

import { useLocale } from "next-intl";
import { ArrowDown, ClipboardList, FileCheck, Plane, Truck, Zap } from "lucide-react";
import { FadeIn, SectionHeader } from "@/components/motion/fade-in";
import { homeServiceProcess } from "@/lib/home-content";
import type { Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

const stepIcons = [ClipboardList, Zap, FileCheck, Plane, Truck];

export function ServiceProcess() {
  const locale = useLocale() as Locale;
  const content = homeServiceProcess[locale];

  return (
    <section id="process" className="section-padding relative bg-slate-50 text-slate-900">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(37,99,235,0.06),transparent_60%)]" />

      <div className="relative mx-auto max-w-7xl">
        <SectionHeader title={content.title} subtitle={content.subtitle} />

        <div className="hidden lg:block">
          <FadeIn>
            <div className="flex items-start justify-between gap-2">
              {content.steps.map((step, index) => {
                const Icon = stepIcons[index];
                return (
                  <div key={step} className="flex flex-1 items-start">
                    <div className="flex flex-1 flex-col items-center text-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/25">
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="mt-3 text-sm font-semibold text-slate-800">{step}</div>
                      <div className="mt-1 text-xs font-medium text-blue-600">
                        {String(index + 1).padStart(2, "0")}
                      </div>
                    </div>
                    {index < content.steps.length - 1 && (
                      <div className="mt-7 flex shrink-0 items-center px-1">
                        <div className="h-px w-full min-w-[2rem] bg-gradient-to-r from-blue-300 to-blue-200" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </FadeIn>
        </div>

        <div className="lg:hidden">
          <div className="mx-auto max-w-sm space-y-0">
            {content.steps.map((step, index) => {
              const Icon = stepIcons[index];
              return (
                <FadeIn key={step} delay={index * 0.06}>
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "flex w-full items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm",
                      )}
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-600/20">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-xs font-medium text-blue-600">
                          Step {index + 1}
                        </div>
                        <div className="font-semibold text-slate-800">{step}</div>
                      </div>
                    </div>
                    {index < content.steps.length - 1 && (
                      <ArrowDown className="my-2 h-5 w-5 text-blue-400" />
                    )}
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
