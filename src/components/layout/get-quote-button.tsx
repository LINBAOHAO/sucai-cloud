"use client";

import { useTranslations } from "next-intl";
import { Button, type ButtonProps } from "@/components/ui/button";
import { useGetQuoteAction } from "@/components/layout/use-get-quote-action";

interface GetQuoteButtonProps extends ButtonProps {
  onAfterClick?: () => void;
}

export function GetQuoteButton({
  onAfterClick,
  children,
  onClick,
  ...props
}: GetQuoteButtonProps) {
  const t = useTranslations("nav");
  const handleGetQuote = useGetQuoteAction();

  return (
    <Button
      {...props}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) {
          return;
        }
        handleGetQuote();
        onAfterClick?.();
      }}
    >
      {children ?? t("getQuote")}
    </Button>
  );
}
