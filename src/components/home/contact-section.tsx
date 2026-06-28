"use client";

import { useTranslations } from "next-intl";
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FadeIn, SectionHeader } from "@/components/motion/fade-in";

const contactInfo = [
  { key: "address", icon: MapPin, valueKey: "addressValue" },
  { key: "email", icon: Mail, valueKey: "emailValue" },
  { key: "phone", icon: Phone, valueKey: "phoneValue" },
  { key: "hours", icon: Clock, valueKey: "hoursValue" },
] as const;

export function ContactSection() {
  const t = useTranslations("contact");

  return (
    <section id="contact" className="section-padding relative">
      <div className="absolute inset-0 bg-gradient-to-t from-orange-500/[0.04] to-transparent" />

      <div className="relative mx-auto max-w-7xl">
        <SectionHeader title={t("title")} subtitle={t("subtitle")} />

        <div className="grid gap-10 lg:grid-cols-5">
          <FadeIn direction="left" className="lg:col-span-2">
            <div className="space-y-6">
              {contactInfo.map((info) => (
                <div key={info.key} className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <info.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">
                      {t(`info.${info.key}`)}
                    </div>
                    <div className="mt-0.5 font-medium">{t(`info.${info.valueKey}`)}</div>
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>

          <FadeIn direction="right" delay={0.15} className="lg:col-span-3">
            <form
              onSubmit={(e) => e.preventDefault()}
              className="glass-card rounded-2xl p-6 sm:p-8"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">{t("form.name")}</label>
                  <Input placeholder={t("form.namePlaceholder")} />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">{t("form.company")}</label>
                  <Input placeholder={t("form.companyPlaceholder")} />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">{t("form.email")}</label>
                  <Input type="email" placeholder={t("form.emailPlaceholder")} />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">{t("form.phone")}</label>
                  <Input placeholder={t("form.phonePlaceholder")} />
                </div>
              </div>
              <div className="mt-5">
                <label className="mb-2 block text-sm font-medium">{t("form.message")}</label>
                <Textarea placeholder={t("form.messagePlaceholder")} />
              </div>
              <Button type="submit" size="lg" className="mt-6 w-full sm:w-auto">
                <Send className="h-4 w-4" />
                {t("form.submit")}
              </Button>
            </form>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
