"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FadeIn } from "@/components/motion/fade-in";
import { searchTags } from "@/lib/data";
import { cn } from "@/lib/utils";

interface AiSearchProps {
  className?: string;
}

export function AiSearch({ className }: AiSearchProps) {
  const t = useTranslations("search");
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const handleSearch = () => {
    if (!query.trim()) return;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className={cn("w-full max-w-3xl", className)}>
      <FadeIn delay={0.55}>
        <div className="mb-3 flex items-center justify-center gap-2">
          <Sparkles className="h-4 w-4 text-orange-400" />
          <span className="text-sm font-medium text-orange-400/90">{t("title")}</span>
        </div>
      </FadeIn>

      <FadeIn delay={0.55}>
        <div className="relative">
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-orange-500/25 via-amber-500/20 to-orange-500/25 blur-xl" />
          <div className="glass-card relative overflow-hidden rounded-2xl border border-orange-500/20 p-2 glow-orange">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-orange-500/5 via-transparent to-orange-500/5" />
            <div className="relative flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Sparkles className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-orange-400" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t("placeholder")}
                  className="h-14 border-0 bg-transparent pl-12 text-base placeholder:text-muted-foreground/70 focus-visible:ring-0"
                />
              </div>
              <Button
                size="lg"
                onClick={handleSearch}
                className="h-14 bg-gradient-to-r from-orange-500 to-amber-500 px-8 shadow-lg shadow-orange-500/30 hover:from-orange-400 hover:to-amber-400"
              >
                <Search className="h-5 w-5" />
                {t("button")}
              </Button>
            </div>
          </div>
        </div>
      </FadeIn>

      <FadeIn delay={0.65} className="mt-5">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="mr-1 text-xs text-muted-foreground">{t("hotLabel")}</span>
          {searchTags.map((tag) => (
            <motion.button
              key={tag}
              whileHover={{ scale: 1.05, y: -1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setActiveTag(tag);
                setQuery(t(`tags.${tag}`));
              }}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-sm transition-all duration-200",
                activeTag === tag
                  ? "border-orange-500 bg-orange-500/20 text-orange-400 shadow-sm shadow-orange-500/20"
                  : "border-white/10 bg-white/5 text-muted-foreground hover:border-orange-500/40 hover:bg-orange-500/10 hover:text-orange-300",
              )}
            >
              {t(`tags.${tag}`)}
            </motion.button>
          ))}
        </div>
      </FadeIn>
    </div>
  );
}
