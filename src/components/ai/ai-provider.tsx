"use client";

import { useCallback, useMemo, useState } from "react";
import { AiChatButton } from "@/components/ai/ai-chat-button";
import { AiChatWindow } from "@/components/ai/ai-chat-window";
import { AiChatContext } from "@/components/ai/ai-context";

export { useAiChat } from "@/components/ai/ai-context";

export function AiProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpenState] = useState(false);

  const setOpen = useCallback((next: boolean) => {
    setOpenState(next);
  }, []);

  const value = useMemo(() => ({ open, setOpen }), [open, setOpen]);

  return (
    <AiChatContext.Provider value={value}>
      {children}
      <AiChatButton />
      <AiChatWindow open={open} onOpenChange={setOpen} />
    </AiChatContext.Provider>
  );
}
