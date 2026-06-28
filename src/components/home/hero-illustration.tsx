import { Factory, Globe2, Package, Truck } from "lucide-react";

export function HeroIllustration() {
  return (
    <div className="relative mx-auto aspect-[4/3] w-full max-w-lg">
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-600/20 via-blue-500/10 to-transparent" />
      <div className="absolute inset-4 rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/90 to-blue-950/80 shadow-2xl shadow-blue-900/30 backdrop-blur-sm">
        <div className="absolute inset-0 grid-pattern opacity-20" />

        <div className="relative flex h-full flex-col justify-between p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <div className="rounded-xl bg-blue-600/20 p-3 ring-1 ring-blue-400/30">
              <Factory className="h-8 w-8 text-blue-300" />
            </div>
            <div className="rounded-full bg-orange-500/15 px-3 py-1 text-xs font-medium text-orange-300 ring-1 ring-orange-500/30">
              B2B Procurement
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
              <Package className="h-5 w-5 shrink-0 text-orange-400" />
              <div className="min-w-0 flex-1">
                <div className="h-2 w-3/4 rounded-full bg-blue-400/40" />
                <div className="mt-2 h-2 w-1/2 rounded-full bg-white/10" />
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
              <Globe2 className="h-5 w-5 shrink-0 text-blue-400" />
              <div className="min-w-0 flex-1">
                <div className="h-2 w-2/3 rounded-full bg-blue-400/40" />
                <div className="mt-2 h-2 w-2/5 rounded-full bg-white/10" />
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
              <Truck className="h-5 w-5 shrink-0 text-emerald-400" />
              <div className="min-w-0 flex-1">
                <div className="h-2 w-4/5 rounded-full bg-emerald-400/30" />
                <div className="mt-2 h-2 w-1/3 rounded-full bg-white/10" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            {["5000+", "1M+", "24h"].map((val, i) => (
              <div
                key={val}
                className="rounded-lg bg-blue-600/10 py-2 ring-1 ring-blue-500/20"
              >
                <div className="text-sm font-bold text-white">{val}</div>
                <div className="text-[10px] text-blue-200/70">
                  {["Suppliers", "SKUs", "Quote"][i]}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-blue-500/20 blur-2xl" />
      <div className="absolute -bottom-6 -left-6 h-32 w-32 rounded-full bg-orange-500/15 blur-3xl" />
    </div>
  );
}
