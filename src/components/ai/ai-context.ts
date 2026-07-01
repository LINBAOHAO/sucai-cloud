"use client";

import { createContext, useContext } from "react";

export interface AiChatContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export const AiChatContext = createContext<AiChatContextValue | null>(null);

export function useAiChat() {
  const context = useContext(AiChatContext);
  if (!context) {
    throw new Error("useAiChat must be used within AiProvider");
  }
  return context;
}
