"use client";

import { useCallback, useMemo, useState } from "react";
import { InquiryDialog } from "@/components/inquiry/inquiry-dialog";
import {
  InquiryContext,
  type InquiryContextValue,
  type InquiryPrefill,
} from "@/components/inquiry/inquiry-context";

export type { InquiryPrefill } from "@/components/inquiry/inquiry-context";

export function InquiryProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [prefill, setPrefill] = useState<InquiryPrefill | null>(null);

  const openInquiry = useCallback((data: InquiryPrefill) => {
    setPrefill(data);
    setOpen(true);
  }, []);

  const value = useMemo<InquiryContextValue>(() => ({ openInquiry }), [openInquiry]);

  return (
    <InquiryContext.Provider value={value}>
      {children}
      <InquiryDialog open={open} onOpenChange={setOpen} prefill={prefill} />
    </InquiryContext.Provider>
  );
}

export { useInquiry, useInquiryOptional } from "@/components/inquiry/inquiry-context";
