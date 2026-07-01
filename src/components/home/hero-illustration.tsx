import {
  Box,
  Factory,
  Globe2,
  MapPin,
  Package,
  Plane,
  Ship,
  Truck,
  Warehouse,
} from "lucide-react";

const stats = [
  { value: "5,000+", label: "Suppliers", labelZh: "认证供应商", labelId: "Pemasok" },
  { value: "1M+", label: "SKUs", labelZh: "SKU 产品", labelId: "SKU Produk" },
  { value: "24h", label: "Quote", labelZh: "快速报价", labelId: "Penawaran" },
] as const;

interface HeroIllustrationProps {
  locale?: "zh" | "en" | "id";
}

export function HeroIllustration({ locale = "zh" }: HeroIllustrationProps) {
  const statLabel = (item: (typeof stats)[number]) =>
    locale === "zh" ? item.labelZh : locale === "id" ? item.labelId : item.label;

  return (
    <div className="relative mx-auto w-full max-w-xl">
      {/* Glow */}
      <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-blue-400/30 via-white/20 to-blue-200/10 blur-2xl" />

      <div className="relative overflow-hidden rounded-3xl border border-white/40 bg-gradient-to-br from-white via-blue-50/90 to-blue-100/80 p-1 shadow-2xl shadow-blue-900/20">
        <div className="rounded-[1.35rem] bg-gradient-to-br from-slate-900 via-blue-950 to-blue-900 p-5 sm:p-7">
          {/* Header strip */}
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20 ring-1 ring-blue-400/40">
                <Factory className="h-5 w-5 text-blue-300" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Sucai Cloud</p>
                <p className="text-[10px] text-blue-300/80">B2B Procurement</p>
              </div>
            </div>
            <span className="rounded-full bg-orange-500/15 px-2.5 py-1 text-[10px] font-medium text-orange-300 ring-1 ring-orange-400/30">
              Indonesia
            </span>
          </div>

          {/* Supply chain flow */}
          <div className="mb-5 rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
            <p className="mb-3 text-center text-[10px] font-medium tracking-wider text-blue-300/70 uppercase">
              China → Indonesia
            </p>
            <div className="flex items-center justify-between gap-2">
              <div className="flex flex-col items-center gap-1.5">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-500/15 ring-1 ring-red-400/25">
                  <Factory className="h-5 w-5 text-red-300" />
                </div>
                <span className="text-[10px] text-slate-400">China</span>
              </div>
              <div className="flex flex-1 flex-col items-center gap-0.5 px-1">
                <div className="flex w-full items-center justify-center gap-1">
                  <Ship className="h-3.5 w-3.5 text-blue-400" />
                  <div className="h-px flex-1 bg-gradient-to-r from-blue-500/50 via-blue-400/30 to-orange-400/50" />
                  <Plane className="h-3.5 w-3.5 text-orange-400" />
                </div>
                <Truck className="h-3.5 w-3.5 text-emerald-400" />
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/15 ring-1 ring-emerald-400/25">
                  <Warehouse className="h-5 w-5 text-emerald-300" />
                </div>
                <span className="text-[10px] text-slate-400">Indonesia</span>
              </div>
            </div>
          </div>

          {/* Product cards */}
          <div className="mb-5 space-y-2.5">
            {[
              { icon: Package, label: "Hardware & Tools", color: "text-orange-400" },
              { icon: Box, label: "Electrical & Safety", color: "text-blue-400" },
              { icon: Globe2, label: "Global Sourcing", color: "text-emerald-400" },
            ].map(({ icon: Icon, label, color }) => (
              <div
                key={label}
                className="flex items-center gap-3 rounded-xl bg-white/[0.04] px-3 py-2.5 ring-1 ring-white/10"
              >
                <Icon className={`h-4 w-4 shrink-0 ${color}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-white/90">{label}</p>
                  <div className="mt-1.5 h-1.5 w-full rounded-full bg-white/10">
                    <div className="h-full w-2/3 rounded-full bg-blue-400/50" />
                  </div>
                </div>
                <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-500" />
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            {stats.map((item) => (
              <div
                key={item.value}
                className="rounded-xl bg-blue-500/10 py-2.5 text-center ring-1 ring-blue-400/20"
              >
                <p className="text-sm font-bold text-white">{item.value}</p>
                <p className="text-[9px] text-blue-200/70">{statLabel(item)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
