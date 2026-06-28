"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { contactConfig } from "@/lib/contact-config";
import { WhatsAppIcon } from "./whatsapp-icon";

interface WhatsAppButtonProps {
  className?: string;
  size?: "sm" | "default";
}

export function WhatsAppButton({ className, size = "default" }: WhatsAppButtonProps) {
  const t = useTranslations("nav");
  const url = contactConfig.whatsapp.getUrl(t("whatsappMessage"));

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-300",
        "bg-[#25D366] text-white shadow-md shadow-[#25D366]/25 hover:bg-[#20bd5a] hover:shadow-lg hover:shadow-[#25D366]/30",
        size === "sm" ? "h-9 px-3 text-xs" : "h-10 px-4 text-sm",
        className,
      )}
    >
      <WhatsAppIcon className="transition-transform duration-300 group-hover:scale-110" />
      <span className="hidden xl:inline">{t("whatsapp")}</span>
    </a>
  );
}
