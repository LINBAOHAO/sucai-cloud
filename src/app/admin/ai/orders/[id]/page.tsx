"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, FileText, Loader2, Upload } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/ui/button";
import { useAdminFetch } from "@/lib/admin/use-admin-fetch";

interface AiOrderDetail {
  id: string;
  companyName: string;
  contactName: string;
  whatsapp: string;
  email: string;
  country: string;
  port: string;
  destinationCity: string;
  incoterms: string;
  dealStatus: string;
  grossProfit: number | null;
  recommendedSuppliers: unknown;
  messages: Array<{
    id: string;
    role: string;
    content: string;
    metadata: Record<string, unknown> | null;
    createdAt: string;
  }>;
  uploads: Array<{
    id: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    parsedLineCount: number;
    createdAt: string;
  }>;
  quotation: {
    id: string;
    quotationNo: string;
    total: number;
    status: string;
    pdfUrl: string;
    items: Array<{
      productName: string;
      productModel: string;
      quantity: number;
      unitPrice: number;
      subtotal: number;
    }>;
  } | null;
}

const dealStatusLabel: Record<string, string> = {
  pending: "待处理",
  quoted: "已报价",
  won: "已成交",
  lost: "未成交",
};

export default function AdminAiOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const { data: order, loading } = useAdminFetch<AiOrderDetail>(`/api/admin/ai/orders/${params.id}`);

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-12 text-slate-500">
        <Loader2 className="size-5 animate-spin" />
        加载 AI 订单详情...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-12 text-center text-slate-500">
        <p>订单不存在。</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/admin/ai/orders">返回列表</Link>
        </Button>
      </div>
    );
  }

  const suppliers = Array.isArray(order.recommendedSuppliers)
    ? (order.recommendedSuppliers as Array<{ companyName?: string; productName?: string; score?: number }>)
    : [];

  return (
    <>
      <div className="mb-4">
        <Button asChild variant="ghost" size="sm" className="text-slate-600">
          <Link href="/admin/ai/orders">
            <ArrowLeft className="size-4" />
            返回 AI Orders
          </Link>
        </Button>
      </div>

      <AdminPageHeader
        title={order.companyName || order.contactName || "AI 订单"}
        description={`${order.whatsapp || order.email} · ${dealStatusLabel[order.dealStatus] ?? order.dealStatus}`}
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-400">目的地</p>
          <p className="mt-1 font-medium text-slate-900">
            {[order.country, order.port, order.destinationCity].filter(Boolean).join(" · ") || "—"}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-400">Incoterms</p>
          <p className="mt-1 font-medium text-slate-900">{order.incoterms || "—"}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-400">毛利润</p>
          <p className="mt-1 font-medium text-emerald-700">
            {order.grossProfit != null ? `USD ${order.grossProfit.toFixed(2)}` : "—"}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-400">报价单</p>
          {order.quotation ? (
            <a
              href={order.quotation.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 flex items-center gap-1 font-medium text-blue-600 hover:underline"
            >
              <FileText className="size-4" />
              {order.quotation.quotationNo}
            </a>
          ) : (
            <p className="mt-1 font-medium text-slate-400">—</p>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-4">
            <h2 className="font-semibold text-slate-900">聊天记录</h2>
          </div>
          <div className="max-h-[480px] space-y-3 overflow-y-auto p-6">
            {order.messages.map((message) => (
              <div
                key={message.id}
                className={
                  message.role === "user"
                    ? "ml-4 rounded-xl bg-blue-50 px-4 py-3 text-sm"
                    : "mr-4 rounded-xl bg-slate-50 px-4 py-3 text-sm"
                }
              >
                <div className="mb-1 text-xs text-slate-400">
                  {message.role === "user" ? "客户" : "AI"} · {new Date(message.createdAt).toLocaleString()}
                </div>
                <pre className="whitespace-pre-wrap font-sans">{message.content}</pre>
              </div>
            ))}
          </div>
        </section>

        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-6 py-4">
              <h2 className="flex items-center gap-2 font-semibold text-slate-900">
                <Upload className="size-4" />
                上传文件
              </h2>
            </div>
            <div className="p-6">
              {order.uploads.length === 0 ? (
                <p className="text-sm text-slate-400">无上传文件</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {order.uploads.map((file) => (
                    <li key={file.id} className="flex justify-between text-slate-700">
                      <span>
                        {file.fileName}{" "}
                        <span className="text-slate-400">({file.fileType}, {file.parsedLineCount} lines)</span>
                      </span>
                      <span className="text-slate-400">{new Date(file.createdAt).toLocaleDateString()}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-6 py-4">
              <h2 className="font-semibold text-slate-900">推荐供应商</h2>
            </div>
            <div className="p-6">
              {suppliers.length === 0 ? (
                <p className="text-sm text-slate-400">暂无数据</p>
              ) : (
                <ul className="space-y-2 text-sm text-slate-700">
                  {suppliers.map((s, i) => (
                    <li key={i}>
                      {s.companyName} — {s.productName}
                      {s.score != null ? ` (score ${s.score})` : ""}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
