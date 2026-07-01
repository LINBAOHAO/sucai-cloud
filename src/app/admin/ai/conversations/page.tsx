"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Eye, MessageSquare, Search } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAdminFetch } from "@/lib/admin/use-admin-fetch";
import type { AdminAiConversationSummary } from "@/lib/ai/ai-types";

const statusLabel: Record<string, string> = {
  active: "进行中",
  completed: "已完成",
  abandoned: "已放弃",
};

export default function AdminAiConversationsPage() {
  const { data: conversations } = useAdminFetch<AdminAiConversationSummary[]>(
    "/api/admin/ai/conversations",
  );
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!conversations) return [];
    const q = search.toLowerCase().trim();
    if (!q) return conversations;
    return conversations.filter(
      (item) =>
        item.companyName.toLowerCase().includes(q) ||
        item.contactName.toLowerCase().includes(q) ||
        item.whatsapp.includes(q) ||
        item.destinationCity.toLowerCase().includes(q),
    );
  }, [conversations, search]);

  return (
    <>
      <AdminPageHeader
        title="AI 会话历史"
        description="查看每位客户的 AI 聊天记录"
      />

      <div className="mb-4 flex items-center gap-2">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索公司 / 联系人 / WhatsApp / 城市..."
            className="pl-9"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/80 text-left text-slate-500">
              <th className="px-4 py-3 font-medium">客户</th>
              <th className="px-4 py-3 font-medium">WhatsApp</th>
              <th className="px-4 py-3 font-medium">目的城市</th>
              <th className="px-4 py-3 font-medium">消息数</th>
              <th className="px-4 py-3 font-medium">状态</th>
              <th className="px-4 py-3 font-medium">更新时间</th>
              <th className="px-4 py-3 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                  暂无会话记录
                </td>
              </tr>
            ) : (
              filtered.map((item) => (
                <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">
                      {item.companyName || item.contactName || "—"}
                    </div>
                    {item.companyName && item.contactName ? (
                      <div className="text-xs text-slate-400">{item.contactName}</div>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{item.whatsapp || "—"}</td>
                  <td className="px-4 py-3 text-slate-600">{item.destinationCity || "—"}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 text-slate-600">
                      <MessageSquare className="size-3.5" />
                      {item.messageCount}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        item.status === "completed"
                          ? "text-emerald-600"
                          : item.status === "active"
                            ? "text-blue-600"
                            : "text-slate-400"
                      }
                    >
                      {statusLabel[item.status] ?? item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {new Date(item.updatedAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/admin/ai/conversations/${item.id}`}>
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
