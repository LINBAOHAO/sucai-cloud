"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Building2, DollarSign, FileText, Loader2, MessageSquareQuote, ShoppingCart } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import { Button } from "@/components/ui/button";
import { useAdminFetch } from "@/lib/admin/use-admin-fetch";
import type { AdminCustomerDetail } from "@/lib/admin/types";

const inquiryStatusLabel: Record<string, string> = {
  pending: "待处理",
  contacted: "已联系",
  quoted: "已报价",
  completed: "已完成",
  closed: "已关闭",
};

const quotationStatusLabel: Record<string, string> = {
  draft: "草稿",
  sent: "已发送",
  accepted: "已接受",
  rejected: "已拒绝",
  expired: "已过期",
};

const orderStatusLabel: Record<string, string> = {
  pending: "待确认",
  confirmed: "已确认",
  processing: "处理中",
  shipped: "已发货",
  delivered: "已送达",
  completed: "已完成",
  cancelled: "已取消",
};

export default function AdminCustomerDetailPage() {
  const params = useParams<{ id: string }>();
  const customerId = params.id;
  const { data: customer, loading } = useAdminFetch<AdminCustomerDetail>(
    `/api/admin/customers/${customerId}`,
  );

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-12 text-slate-500">
        <Loader2 className="size-5 animate-spin" />
        加载客户详情...
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="py-12 text-center text-slate-500">
        <p>客户不存在或无法加载。</p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/admin/customers">返回客户列表</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="mb-4">
        <Button asChild variant="ghost" size="sm" className="text-slate-600">
          <Link href="/admin/customers">
            <ArrowLeft className="size-4" />
            返回客户列表
          </Link>
        </Button>
      </div>

      <AdminPageHeader
        title={customer.companyName}
        description={`联系人：${customer.contactName || "—"} · ${customer.whatsapp || customer.email || "无联系方式"}`}
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStatCard label="历史询价" value={customer.inquiries.length} icon={MessageSquareQuote} accent="blue" />
        <AdminStatCard label="历史报价" value={customer.quotations.length} icon={FileText} accent="violet" />
        <AdminStatCard label="历史订单" value={customer.orders.length} icon={ShoppingCart} accent="emerald" />
        <AdminStatCard
          label="总成交金额"
          value={`${customer.currency} ${customer.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          accent="amber"
        />
      </div>

      <div className="mb-6 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Building2 className="size-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-slate-900">客户信息</h2>
        </div>
        <dl className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
          <InfoItem label="联系人" value={customer.contactName} />
          <InfoItem label="WhatsApp" value={customer.whatsapp} />
          <InfoItem label="Email" value={customer.email} />
          <InfoItem label="电话" value={customer.phone} />
          <InfoItem label="国家" value={customer.country} />
          <InfoItem label="城市" value={customer.city} />
          <InfoItem label="地址" value={customer.address} />
          <InfoItem label="税号" value={customer.taxNumber} />
          <InfoItem label="创建时间" value={new Date(customer.createdAt).toLocaleString()} />
        </dl>
        {customer.notes ? (
          <p className="mt-4 text-sm text-slate-600">
            <span className="font-medium text-slate-700">备注：</span>
            {customer.notes}
          </p>
        ) : null}
      </div>

      <Section title="历史询价" empty={customer.inquiries.length === 0}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/80 text-left text-slate-500">
              <th className="px-4 py-2 font-medium">时间</th>
              <th className="px-4 py-2 font-medium">产品</th>
              <th className="px-4 py-2 font-medium">数量</th>
              <th className="px-4 py-2 font-medium">状态</th>
            </tr>
          </thead>
          <tbody>
            {customer.inquiries.map((inquiry) => (
              <tr key={inquiry.id} className="border-b border-slate-50">
                <td className="px-4 py-2 text-slate-600">
                  {new Date(inquiry.submittedAt).toLocaleString()}
                </td>
                <td className="px-4 py-2 text-slate-800">
                  {inquiry.productName || inquiry.productModel || "—"}
                </td>
                <td className="px-4 py-2 text-slate-600">{inquiry.quantity || "—"}</td>
                <td className="px-4 py-2">
                  <StatusBadge label={inquiryStatusLabel[inquiry.status] ?? inquiry.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Section title="历史报价" empty={customer.quotations.length === 0}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/80 text-left text-slate-500">
              <th className="px-4 py-2 font-medium">报价单号</th>
              <th className="px-4 py-2 font-medium">时间</th>
              <th className="px-4 py-2 font-medium">金额</th>
              <th className="px-4 py-2 font-medium">状态</th>
            </tr>
          </thead>
          <tbody>
            {customer.quotations.map((quotation) => (
              <tr key={quotation.id} className="border-b border-slate-50">
                <td className="px-4 py-2 font-medium text-slate-800">{quotation.quotationNo}</td>
                <td className="px-4 py-2 text-slate-600">
                  {new Date(quotation.createdAt).toLocaleString()}
                </td>
                <td className="px-4 py-2 text-slate-600">
                  {quotation.currency} {quotation.total.toLocaleString()}
                </td>
                <td className="px-4 py-2">
                  <StatusBadge
                    label={quotationStatusLabel[quotation.status] ?? quotation.status}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Section title="历史订单" empty={customer.orders.length === 0}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/80 text-left text-slate-500">
              <th className="px-4 py-2 font-medium">订单号</th>
              <th className="px-4 py-2 font-medium">时间</th>
              <th className="px-4 py-2 font-medium">金额</th>
              <th className="px-4 py-2 font-medium">状态</th>
            </tr>
          </thead>
          <tbody>
            {customer.orders.map((order) => (
              <tr key={order.id} className="border-b border-slate-50">
                <td className="px-4 py-2 font-medium text-slate-800">{order.orderNo}</td>
                <td className="px-4 py-2 text-slate-600">
                  {new Date(order.createdAt).toLocaleString()}
                </td>
                <td className="px-4 py-2 text-slate-600">
                  {order.currency} {order.total.toLocaleString()}
                </td>
                <td className="px-4 py-2">
                  <StatusBadge label={orderStatusLabel[order.orderStatus] ?? order.orderStatus} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>
    </>
  );
}

function Section({
  title,
  empty,
  children,
}: {
  title: string;
  empty: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-6 py-4">
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      </div>
      {empty ? (
        <p className="px-6 py-8 text-center text-sm text-slate-500">暂无记录</p>
      ) : (
        <div className="overflow-x-auto">{children}</div>
      )}
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="font-medium text-slate-800">{value || "—"}</dd>
    </div>
  );
}

function StatusBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
      {label}
    </span>
  );
}
