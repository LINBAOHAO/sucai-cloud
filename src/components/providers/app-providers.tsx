"use client";

import { InquiryProvider } from "@/components/inquiry/inquiry-provider";
import { AiProvider } from "@/components/ai/ai-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <InquiryProvider>
      <AiProvider>{children}</AiProvider>
    </InquiryProvider>
  );
}
