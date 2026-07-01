"use client";

import { Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { useAiChat } from "@/components/ai/ai-context";

export function AiChatButton() {
  const t = useTranslations("procurementAssistant");
  const { open, setOpen } = useAiChat();

  return (
    <button
      type="button"
      onClick={() => setOpen(!open)}
      aria-label={t("fabLabel")}
      aria-expanded={open}
      className={cn(
        "fixed bottom-6 right-6 z-[60] flex items-center gap-2 rounded-full px-4 py-3",
        "bg-gradient-to-r from-blue-700 to-blue-600 text-white shadow-xl shadow-blue-700/40",
        "transition-all duration-300 hover:scale-105 hover:from-blue-600 hover:to-blue-500",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#060a12]",
        open && "scale-95 opacity-90",
      )}
    >
      <Sparkles className="size-5" />
      <span className="hidden text-sm font-medium sm:inline">{t("fabLabel")}</span>
    </button>
  );
}
