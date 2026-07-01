"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Eye, Search } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAdminFetch } from "@/lib/admin/use-admin-fetch";
import type { AdminAiOrderSummary } from "@/lib/ai/ai-upload-repository";

const dealStatusLabel: Record<string, string> = {
  pending: "待处理",
  quoted: "已报价",
  won: "已成交",
  lost: "未成交",
};

export default function AdminAiOrdersPage() {
  const { data: orders } = useAdminFetch<AdminAiOrderSummary[]>("/api/admin/ai/orders");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!orders) return [];
    const q = search.toLowerCase().trim();
    if (!q) return orders;
    return orders.filter(
      (o) =>
        o.companyName.toLowerCase().includes(q) ||
        o.contactName.toLowerCase().includes(q) ||
        o.whatsapp.includes(q) ||
        o.destinationCity.toLowerCase().includes(q),
    );
  }, [orders, search]);

  return (
    <>
      <AdminPageHeader title="AI Orders" description="AI 采购员订单 — 聊天记录、上传文件、报价与利润" />

      <div className="mb-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索客户 / 城市 / WhatsApp..."
            className="pl-9"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/80 text-left text-slate-500">
              <th className="px-4 py-3 font-medium">客户</th>
              <th className="px-4 py-3 font-medium">目的地</th>
              <th className="px-4 py-3 font-medium">成交状态</th>
              <th className="px-4 py-3 font-medium">利润</th>
              <th className="px-4 py-3 font-medium">消息/文件</th>
              <th className="px-4 py-3 font-medium">更新时间</th>
              <th className="px-4 py-3 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                  暂无 AI 订单
                </td>
              </tr>
            ) : (
              filtered.map((order) => (
                <tr key={order.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">{order.companyName || order.contactName || "—"}</div>
                    <div className="text-xs text-slate-400">{order.whatsapp || order.email}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {[order.country, order.port, order.destinationCity].filter(Boolean).join(" · ") || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-blue-700">{dealStatusLabel[order.dealStatus] ?? order.dealStatus}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {order.grossProfit != null ? `USD ${order.grossProfit.toFixed(2)}` : "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {order.messageCount} / {order.uploadCount}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{new Date(order.updatedAt).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/admin/ai/orders/${order.id}`}>
                        <Eye className="size-4" />
                        查看
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
