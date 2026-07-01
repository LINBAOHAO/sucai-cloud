"use client";

import { FolderTree, MessageSquareQuote, Package, ShoppingCart, Tag } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { useAdminFetch } from "@/lib/admin/use-admin-fetch";
import type { AdminInquiry } from "@/lib/admin/types";

export default function AdminDashboardPage() {
  const { data: productStats } = useAdminFetch<{ count: number }>("/api/admin/products/count");
  const { data: categoryStats } = useAdminFetch<{ count: number }>("/api/admin/categories/count");
  const { data: brandStats } = useAdminFetch<{ count: number }>("/api/admin/brands/count");
  const { data: orderStats } = useAdminFetch<{ count: number }>("/api/admin/orders/count");
  const { data: inquiryStats } = useAdminFetch<{ todayInquiries: number; monthInquiries: number }>(
    "/api/admin/inquiries/stats",
  );
  const { data: recentInquiries } = useAdminFetch<AdminInquiry[]>("/api/admin/inquiries?limit=5");

  return (
    <>
      <AdminPageHeader
        title="Dashboard"
        description="速采云后台数据概览"
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <AdminStatCard label="产品数量" value={productStats?.count ?? 0} icon={Package} accent="blue" />
        <AdminStatCard label="分类数量" value={categoryStats?.count ?? 0} icon={FolderTree} accent="emerald" />
        <AdminStatCard label="品牌数量" value={brandStats?.count ?? 0} icon={Tag} accent="violet" />
        <AdminStatCard label="订单数量" value={orderStats?.count ?? 0} icon={ShoppingCart} accent="amber" />
        <AdminStatCard label="今日询价" value={inquiryStats?.todayInquiries ?? 0} icon={MessageSquareQuote} accent="blue" />
        <AdminStatCard label="本月询价" value={inquiryStats?.monthInquiries ?? 0} icon={MessageSquareQuote} accent="emerald" />
      </div>

      <section className="mt-8 rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="font-semibold text-slate-900">最近询价</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 text-left text-slate-500">
                <th className="px-6 py-3 font-medium">公司</th>
                <th className="px-6 py-3 font-medium">联系人</th>
                <th className="px-6 py-3 font-medium">产品</th>
                <th className="px-6 py-3 font-medium">时间</th>
              </tr>
            </thead>
            <tbody>
              {(recentInquiries ?? []).length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                    暂无询价记录
                  </td>
                </tr>
              ) : (
                recentInquiries?.map((item) => (
                  <tr key={item.id} className="border-b border-slate-50">
                    <td className="px-6 py-3 font-medium text-slate-800">{item.companyName}</td>
                    <td className="px-6 py-3 text-slate-600">{item.contactName}</td>
                    <td className="px-6 py-3 text-slate-600">{item.productName || "联系我们"}</td>
                    <td className="px-6 py-3 text-slate-500">
                      {new Date(item.submittedAt).toLocaleString("zh-CN")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
