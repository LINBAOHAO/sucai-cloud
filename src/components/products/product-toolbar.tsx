"use client";

import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ProductToolbarProps {
  keyword: string;
  onKeywordChange: (value: string) => void;
  onSearch: () => void;
}

export function ProductToolbar({
  keyword,
  onKeywordChange,
  onSearch,
}: ProductToolbarProps) {
  const t = useTranslations("productsPage");

  return (
    <div className="mb-6">
      <div className="glass-card rounded-xl p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-orange-400" />
            <Input
              value={keyword}
              onChange={(e) => onKeywordChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSearch()}
              placeholder={t("searchPlaceholder")}
              className="h-11 border-white/10 bg-white/5 pl-10"
            />
          </div>
          <Button
            onClick={onSearch}
            className="h-11 bg-gradient-to-r from-orange-500 to-amber-500 px-6 shadow-md shadow-orange-500/20 hover:from-orange-400 hover:to-amber-400"
          >
            <Search className="h-4 w-4" />
            {t("searchButton")}
          </Button>
        </div>
      </div>
    </div>
  );
}
