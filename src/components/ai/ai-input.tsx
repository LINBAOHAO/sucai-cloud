"use client";

import { useState, type FormEvent, type KeyboardEvent } from "react";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface AiInputProps {
  placeholder?: string;
  multiline?: boolean;
  optional?: boolean;
  skipLabel?: string;
  submitLabel?: string;
  loading?: boolean;
  onSubmit: (value: string) => void;
  onSkip?: () => void;
  className?: string;
}

export function AiInput({
  placeholder,
  multiline = false,
  optional = false,
  skipLabel,
  submitLabel,
  loading = false,
  onSubmit,
  onSkip,
  className,
}: AiInputProps) {
  const [value, setValue] = useState("");

  const handleSubmit = (event?: FormEvent) => {
    event?.preventDefault();
    const trimmed = value.trim();
    if (!optional && !trimmed) {
      return;
    }
    onSubmit(trimmed);
    setValue("");
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Enter" && !multiline && !event.shiftKey) {
      event.preventDefault();
      handleSubmit();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("flex flex-col gap-2 border-t border-blue-500/20 bg-[#060a12]/95 p-3", className)}
    >
      <div className="flex items-end gap-2">
        {multiline ? (
          <Textarea
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder={placeholder}
            rows={2}
            disabled={loading}
            className="min-h-[44px] resize-none border-blue-500/30 bg-blue-950/50 text-blue-50 placeholder:text-blue-300/50 focus-visible:ring-blue-500"
          />
        ) : (
          <Input
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={loading}
            className="border-blue-500/30 bg-blue-950/50 text-blue-50 placeholder:text-blue-300/50 focus-visible:ring-blue-500"
          />
        )}
        <Button
          type="submit"
          size="icon"
          disabled={loading || (!optional && !value.trim())}
          className="shrink-0 bg-blue-600 text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500"
          aria-label={submitLabel ?? "Send"}
        >
          {loading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        </Button>
      </div>
      {optional && onSkip && skipLabel ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={loading}
          onClick={() => {
            onSkip();
            setValue("");
          }}
          className="self-start text-blue-300 hover:bg-blue-500/10 hover:text-blue-100"
        >
          {skipLabel}
        </Button>
      ) : null}
    </form>
  );
}
