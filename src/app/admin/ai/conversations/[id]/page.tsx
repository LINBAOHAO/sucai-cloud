"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, FileText, Loader2, MessageSquare } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/ui/button";
import { useAdminFetch } from "@/lib/admin/use-admin-fetch";
import type { AiConversationRecord } from "@/lib/ai/ai-types";

const statusLabel: Record<string, string> = {
  active: "进行中",
  completed: "已完成",
  abandoned: "已放弃",
};

export default function AdminAiConversationDetailPage() {
  const params = useParams<{ id: string }>();
  const conversationId = params.id;
  const { data: conversation, loading } = useAdminFetch<AiConversationRecord>(
    `/api/admin/ai/conversations/${conversationId}`,
  );

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-12 text-slate-500">
        <Loader2 className="size-5 animate-spin" />
        加载会话详情...
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="py-12 text-center text-slate-500">
        <p>会话不存在或无法加载。</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/admin/ai/conversations">返回会话列表</Link>
        </Button>
      </div>
    );
  }

  const messages = conversation.messages ?? [];

  return (
    <>
      <div className="mb-4">
        <Button asChild variant="ghost" size="sm" className="text-slate-600">
          <Link href="/admin/ai/conversations">
            <ArrowLeft className="size-4" />
            返回会话列表
          </Link>
        </Button>
      </div>

      <AdminPageHeader
        title={conversation.companyName || conversation.contactName || "AI 会话"}
        description={`${conversation.whatsapp || "无 WhatsApp"} · ${conversation.destinationCity || "未指定城市"} · ${statusLabel[conversation.status] ?? conversation.status}`}
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-400">联系人</p>
          <p className="mt-1 font-medium text-slate-900">{conversation.contactName || "—"}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-400">贸易术语</p>
          <p className="mt-1 font-medium text-slate-900">{conversation.incoterms || "—"}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-400">消息数</p>
          <p className="mt-1 flex items-center gap-1 font-medium text-slate-900">
            <MessageSquare className="size-4 text-blue-600" />
            {messages.length}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-400">关联报价</p>
          {conversation.quotationId ? (
            <Link
              href={`/admin/quotations`}
              className="mt-1 flex items-center gap-1 font-medium text-blue-600 hover:underline"
            >
              <FileText className="size-4" />
              已生成
            </Link>
          ) : (
            <p className="mt-1 font-medium text-slate-400">—</p>
          )}
        </div>
      </div>

      <section className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-4">
          <h2 className="font-semibold text-slate-900">聊天记录</h2>
        </div>
        <div className="space-y-4 p-6">
          {messages.length === 0 ? (
            <p className="text-sm text-slate-400">暂无消息</p>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={
                  message.role === "user"
                    ? "ml-8 rounded-xl bg-blue-50 px-4 py-3 text-sm text-slate-800"
                    : "mr-8 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-800"
                }
              >
                <div className="mb-1 text-xs font-medium text-slate-400">
                  {message.role === "user" ? "客户" : "AI 助手"} ·{" "}
                  {new Date(message.createdAt).toLocaleString()}
                </div>
                <pre className="whitespace-pre-wrap font-sans">{message.content}</pre>
                {message.metadata?.pdfUrl && typeof message.metadata.pdfUrl === "string" ? (
                  <a
                    href={message.metadata.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block text-xs text-blue-600 hover:underline"
                  >
                    查看 PDF 报价
                  </a>
                ) : null}
              </div>
            ))
          )}
        </div>
      </section>
    </>
  );
}
