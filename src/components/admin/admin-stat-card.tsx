import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminStatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  accent?: "blue" | "emerald" | "amber" | "violet";
}

const accentStyles = {
  blue: "bg-blue-50 text-blue-600",
  emerald: "bg-emerald-50 text-emerald-600",
  amber: "bg-amber-50 text-amber-600",
  violet: "bg-violet-50 text-violet-600",
};

export function AdminStatCard({ label, value, icon: Icon, accent = "blue" }: AdminStatCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{value}</p>
        </div>
        <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl", accentStyles[accent])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
