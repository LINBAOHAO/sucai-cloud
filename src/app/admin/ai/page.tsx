"use client";

import Link from "next/link";
import {
  Bot,
  DollarSign,
  FileText,
  MapPin,
  MessageSquare,
  Package,
  Percent,
  TrendingUp,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { Button } from "@/components/ui/button";
import { useAdminFetch } from "@/lib/admin/use-admin-fetch";
import type { AiDashboardStats } from "@/lib/ai/ai-types";

export default function AdminAiDashboardPage() {
  const { data: stats } = useAdminFetch<AiDashboardStats>("/api/admin/ai/dashboard");

  return (
    <>
      <AdminPageHeader
        title="AI 采购助手"
        description="AI 采购销售助手数据看板"
        action={
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/ai/conversations">会话历史</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/ai/orders">AI 订单</Link>
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard
          label="AI 使用次数"
          value={stats?.messageCount ?? 0}
          icon={MessageSquare}
          accent="blue"
        />
        <AdminStatCard
          label="生成报价次数"
          value={stats?.quotationCount ?? 0}
          icon={FileText}
          accent="emerald"
        />
        <AdminStatCard
          label="成交率"
          value={`${stats?.conversionRate ?? 0}%`}
          icon={Percent}
          accent="violet"
        />
        <AdminStatCard
          label="平均报价金额"
          value={stats?.avgQuotationAmount ? `USD ${stats.avgQuotationAmount}` : "—"}
          icon={DollarSign}
          accent="amber"
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <AdminStatCard
          label="接待会话"
          value={stats?.receptionCount ?? 0}
          icon={TrendingUp}
          accent="blue"
        />
        <AdminStatCard
          label="活跃会话"
          value={stats?.activeSessions ?? 0}
          icon={Bot}
          accent="emerald"
        />
        <AdminStatCard
          label="热门产品条目"
          value={stats?.hotProducts?.length ?? 0}
          icon={Package}
          accent="violet"
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-4">
            <h2 className="flex items-center gap-2 font-semibold text-slate-900">
              <Package className="size-4 text-blue-600" />
              热门产品
            </h2>
          </div>
          <div className="p-6">
            {(stats?.hotProducts ?? []).length === 0 ? (
              <p className="text-sm text-slate-400">暂无数据</p>
            ) : (
              <ul className="space-y-3">
                {stats?.hotProducts.map((item) => (
                  <li key={`${item.name}-${item.model}`} className="flex items-center justify-between text-sm">
                    <span className="text-slate-700">
                      {item.name} <span className="text-slate-400">({item.model})</span>
                    </span>
                    <span className="font-medium text-blue-700">{item.count}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-4">
            <h2 className="flex items-center gap-2 font-semibold text-slate-900">
              <MapPin className="size-4 text-emerald-600" />
              热门城市
            </h2>
          </div>
          <div className="p-6">
            {(stats?.hotCities ?? []).length === 0 ? (
              <p className="text-sm text-slate-400">暂无数据</p>
            ) : (
              <ul className="space-y-3">
                {stats?.hotCities.map((item) => (
                  <li key={item.city} className="flex items-center justify-between text-sm">
                    <span className="text-slate-700">{item.city}</span>
                    <span className="font-medium text-emerald-700">{item.count}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
