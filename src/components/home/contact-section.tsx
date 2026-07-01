"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle2, Mail, Phone, MapPin, Clock, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FadeIn, SectionHeader } from "@/components/motion/fade-in";
import { useSiteSettings } from "@/components/providers/site-settings-provider";
import { submitInquiry } from "@/lib/inquiry-storage";

const contactInfo = [
  { key: "address", icon: MapPin, valueKey: "addressValue" },
  { key: "email", icon: Mail, valueKey: "emailValue" },
  { key: "phone", icon: Phone, valueKey: "phoneValue" },
  { key: "hours", icon: Clock, valueKey: "hoursValue" },
] as const;

export function ContactSection() {
  const t = useTranslations("contact");
  const settings = useSiteSettings();
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !company.trim() || !phone.trim()) return;

    setSubmitting(true);
    try {
      await submitInquiry({
        companyName: company.trim(),
        contactName: name.trim(),
        email: email.trim(),
        whatsapp: phone.trim(),
        country: "",
        productName: "",
        productModel: "",
        quantity: "",
        notes: message.trim(),
        source: "contact",
      });

      setSuccess(true);
      setName("");
      setCompany("");
      setEmail("");
      setPhone("");
      setMessage("");
    } catch {
      alert("提交失败，请稍后重试。");
    } finally {
      setSubmitting(false);
    }
  };

  const getContactValue = (key: (typeof contactInfo)[number]["key"], valueKey: string) => {
    if (key === "address") return settings.address;
    if (key === "email") return settings.contactEmail;
    if (key === "phone") return settings.whatsapp;
    return t(`info.${valueKey}`);
  };

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
                    <div className="mt-0.5 font-medium">{getContactValue(info.key, info.valueKey)}</div>
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>

          <FadeIn direction="right" delay={0.15} className="lg:col-span-3">
            {success ? (
              <div className="glass-card flex flex-col items-center rounded-2xl p-8 text-center sm:p-12">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15">
                  <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                </div>
                <h3 className="text-lg font-semibold">{t("form.successTitle")}</h3>
                <p className="mt-2 max-w-sm text-sm text-muted-foreground">{t("form.successMessage")}</p>
                <Button
                  type="button"
                  className="mt-6"
                  onClick={() => setSuccess(false)}
                >
                  {t("form.submitAnother")}
                </Button>
              </div>
            ) : (
              <form id="contact-form" onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 sm:p-8">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium">{t("form.name")}</label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder={t("form.namePlaceholder")}
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium">{t("form.company")}</label>
                    <Input
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder={t("form.companyPlaceholder")}
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium">{t("form.email")}</label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t("form.emailPlaceholder")}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium">{t("form.phone")}</label>
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder={t("form.phonePlaceholder")}
                      required
                    />
                  </div>
                </div>
                <div className="mt-5">
                  <label className="mb-2 block text-sm font-medium">{t("form.message")}</label>
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={t("form.messagePlaceholder")}
                  />
                </div>
                <Button type="submit" size="lg" className="mt-6 w-full sm:w-auto" disabled={submitting}>
                  <Send className="h-4 w-4" />
                  {t("form.submit")}
                </Button>
              </form>
            )}
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
