"use client";

import { createContext, useContext } from "react";

export interface InquiryPrefill {
  productName: string;
  productModel: string;
  productSlug?: string;
}

export interface InquiryContextValue {
  openInquiry: (prefill: InquiryPrefill) => void;
}

export const InquiryContext = createContext<InquiryContextValue | null>(null);

export function useInquiryOptional() {
  return useContext(InquiryContext);
}

export function useInquiry() {
  const ctx = useContext(InquiryContext);
  if (!ctx) {
    throw new Error("useInquiry must be used within InquiryProvider");
  }
  return ctx;
}
