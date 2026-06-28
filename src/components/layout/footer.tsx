"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Cloud, Mail, Phone, MapPin } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export function Footer() {
  const t = useTranslations("footer");
  const locale = useLocale();
  const year = new Date().getFullYear();

  const productLinks = ["hardware", "electrical", "safety", "tools"] as const;
  const companyLinks = ["about", "careers", "news", "contact"] as const;
  const supportLinks = ["help", "faq", "shipping", "returns"] as const;
  const legalLinks = ["privacy", "terms", "cookies"] as const;

  return (
    <footer className="border-t border-white/10 bg-[#040810]">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link href="/" className="mb-4 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-500">
                <Cloud className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold">
                {locale === "zh" ? (
                  <span className="text-gradient">速采云</span>
                ) : (
                  <>
                    Su<span className="text-gradient">Cai</span> Cloud
                  </>
                )}
              </span>
            </Link>
            <p className="mb-6 max-w-sm text-sm leading-relaxed text-muted-foreground">
              {t("description")}
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                contact@sucaicloud.com
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                +62 21 1234 5678
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                Jakarta · Shenzhen
              </div>
            </div>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-foreground">{t("products")}</h4>
            <ul className="space-y-2.5">
              {productLinks.map((link) => (
                <li key={link}>
                  <Link
                    href="#categories"
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {t(`links.${link}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-foreground">{t("company")}</h4>
            <ul className="space-y-2.5">
              {companyLinks.map((link) => (
                <li key={link}>
                  <Link
                    href={link === "contact" ? "#contact" : "#"}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {t(`links.${link}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold text-foreground">{t("support")}</h4>
            <ul className="space-y-2.5">
              {supportLinks.map((link) => (
                <li key={link}>
                  <Link
                    href="#"
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {t(`links.${link}`)}
                  </Link>
                </li>
              ))}
            </ul>
            <h4 className="mb-4 mt-8 text-sm font-semibold text-foreground">{t("legal")}</h4>
            <ul className="space-y-2.5">
              {legalLinks.map((link) => (
                <li key={link}>
                  <Link
                    href="#"
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {t(`links.${link}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="my-10 bg-white/10" />

        <p className="text-center text-sm text-muted-foreground">
          {t("copyright", { year })}
        </p>
      </div>
    </footer>
  );
}
