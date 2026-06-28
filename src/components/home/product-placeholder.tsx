import { Package } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductPlaceholderProps {
  label?: string;
  className?: string;
}

export function ProductPlaceholder({ label, className }: ProductPlaceholderProps) {
  return (
    <div
      className={cn(
        "relative flex aspect-square items-center justify-center overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#1a2332] to-[#0d1424]",
        className,
      )}
    >
      <div className="absolute inset-0 grid-pattern opacity-40" />
      <div className="absolute inset-0 bg-gradient-to-t from-orange-500/10 via-transparent to-transparent" />
      <div className="relative flex flex-col items-center gap-2">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-orange-500/20 bg-orange-500/10">
          <Package className="h-8 w-8 text-orange-400/60" />
        </div>
        {label && (
          <span className="max-w-[80%] truncate text-xs text-muted-foreground/60">{label}</span>
        )}
      </div>
    </div>
  );
}
