"use client";

import { cn } from "@/lib/utils";

interface AiMessageProps {
  role: "assistant" | "user";
  children: React.ReactNode;
  className?: string;
}

export function AiMessage({ role, children, className }: AiMessageProps) {
  const isAssistant = role === "assistant";

  return (
    <div
      className={cn(
        "flex w-full",
        isAssistant ? "justify-start" : "justify-end",
        className,
      )}
    >
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm",
          isAssistant
            ? "rounded-bl-md border border-blue-500/20 bg-blue-950/80 text-blue-50"
            : "rounded-br-md bg-blue-600 text-white",
        )}
      >
        {children}
      </div>
    </div>
  );
}
