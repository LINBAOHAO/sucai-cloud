"use client";

import { useCallback, useState } from "react";
import { Mail, Trash2 } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/ui/button";
import { useAdminFetch } from "@/lib/admin/use-admin-fetch";
import type { AdminInquiry, InquiryStatus } from "@/lib/admin/types";
import { cn } from "@/lib/utils";

const statusLabels: Record<InquiryStatus, string> = {
  pending: "未处理",
  contacted: "已联系",
  quoted: "已报价",
  completed: "已完成",
  closed: "已关闭",
};

const statusStyles: Record<InquiryStatus, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  contacted: "bg-blue-50 text-blue-700 border-blue-200",
  quoted: "bg-violet-50 text-violet-700 border-violet-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  closed: "bg-slate-50 text-slate-600 border-slate-200",
};

export default function AdminInquiriesPage() {
  const { data: inquiries, refresh } = useAdminFetch<AdminInquiry[]>("/api/admin/inquiries");
  const [resendingId, setResendingId] = useState<string | null>(null);

  const handleStatusChange = useCallback(
    async (id: string, status: InquiryStatus) => {
      const res = await fetch(`/api/admin/inquiries/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        alert("状态更新失败。");
        return;
      }
      await refresh();
    },
    [refresh],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm("确定删除该询价记录？")) return;
      const res = await fetch(`/api/admin/inquiries/${id}`, { method: "DELETE" });
      if (!res.ok) {
        alert("删除失败。");
        return;
      }
      await refresh();
    },
    [refresh],
  );

  const handleResendNotify = useCallback(async (id: string) => {
    setResendingId(id);
    try {
      const res = await fetch(`/api/admin/inquiries/${id}/notify`, { method: "POST" });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        alert(body?.error ?? "通知发送失败，请检查 Resend 配置。");
        return;
      }
      alert("通知已重新发送。");
    } finally {
      setResendingId(null);
    }
  }, []);

  return (
    <>
      <AdminPageHeader
        title="Inquiries"
        description="客户询价记录管理"
      />

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 text-left text-slate-500">
                <th className="px-4 py-3 font-medium">公司</th>
                <th className="px-4 py-3 font-medium">联系人</th>
                <th className="px-4 py-3 font-medium">WhatsApp</th>
                <th className="px-4 py-3 font-medium">产品</th>
                <th className="px-4 py-3 font-medium">数量</th>
                <th className="px-4 py-3 font-medium">时间</th>
                <th className="px-4 py-3 font-medium">状态</th>
                <th className="px-4 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {(inquiries ?? []).length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                    暂无询价记录。前台提交后将显示在此处。
                  </td>
                </tr>
              ) : (
                inquiries?.map((item) => (
                  <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-medium text-slate-800">{item.companyName}</td>
                    <td className="px-4 py-3 text-slate-600">{item.contactName}</td>
                    <td className="px-4 py-3 text-slate-600">{item.whatsapp}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-800">
                        {item.productName || (item.source === "contact" ? "联系我们" : "—")}
                      </div>
                      {item.productModel && (
                        <div className="text-xs text-slate-500">{item.productModel}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{item.quantity || "—"}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-500">
                      {new Date(item.submittedAt).toLocaleString("zh-CN")}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={item.status}
                        onChange={(e) => handleStatusChange(item.id, e.target.value as InquiryStatus)}
                        className={cn(
                          "rounded-lg border px-2 py-1 text-xs font-medium",
                          statusStyles[item.status],
                        )}
                      >
                        {(Object.keys(statusLabels) as InquiryStatus[]).map((s) => (
                          <option key={s} value={s}>{statusLabels[s]}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          title="重新发送通知"
                          disabled={resendingId === item.id}
                          onClick={() => void handleResendNotify(item.id)}
                        >
                          <Mail className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
