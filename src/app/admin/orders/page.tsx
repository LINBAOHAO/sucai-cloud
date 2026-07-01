"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminFetch } from "@/lib/admin/use-admin-fetch";
import type { AdminOrder, OrderStatus, PaymentStatus } from "@/lib/admin/types";
import {
  ORDER_STATUS_FLOW,
  PAYMENT_STATUSES,
  SHIPPING_METHODS,
} from "@/lib/orders/order-types";
import { cn } from "@/lib/utils";

const orderStatusLabel: Record<OrderStatus, string> = {
  pending: "待确认",
  confirmed: "已确认",
  processing: "处理中",
  shipped: "已发货",
  delivered: "已送达",
  completed: "已完成",
  cancelled: "已取消",
};

const paymentStatusLabel: Record<PaymentStatus, string> = {
  unpaid: "未付款",
  partial: "部分付款",
  paid: "已付款",
  refunded: "已退款",
};

const orderStatusStyles: Record<OrderStatus, string> = {
  pending: "bg-slate-50 text-slate-700 border-slate-200",
  confirmed: "bg-blue-50 text-blue-700 border-blue-200",
  processing: "bg-violet-50 text-violet-700 border-violet-200",
  shipped: "bg-amber-50 text-amber-700 border-amber-200",
  delivered: "bg-emerald-50 text-emerald-700 border-emerald-200",
  completed: "bg-emerald-50 text-emerald-800 border-emerald-300",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

export default function AdminOrdersPage() {
  const { data: orders, refresh } = useAdminFetch<AdminOrder[]>("/api/admin/orders");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AdminOrder | null>(null);
  const [form, setForm] = useState({
    orderStatus: "pending" as OrderStatus,
    paymentStatus: "unpaid" as PaymentStatus,
    trackingNo: "",
    shippingMethod: "",
    eta: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);

  const openEdit = (order: AdminOrder) => {
    setEditing(order);
    setForm({
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
      trackingNo: order.trackingNo,
      shippingMethod: order.shippingMethod,
      eta: order.eta ? order.eta.slice(0, 10) : "",
      notes: order.notes,
    });
    setDialogOpen(true);
  };

  const handleSave = useCallback(async () => {
    if (!editing) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/orders/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          eta: form.eta ? new Date(form.eta).toISOString() : null,
        }),
      });
      if (!res.ok) {
        alert("保存失败");
        return;
      }
      setDialogOpen(false);
      await refresh();
    } finally {
      setSaving(false);
    }
  }, [editing, form, refresh]);

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm("确定删除该订单？")) return;
      const res = await fetch(`/api/admin/orders/${id}`, { method: "DELETE" });
      if (!res.ok) {
        alert("删除失败");
        return;
      }
      await refresh();
    },
    [refresh],
  );

  return (
    <>
      <AdminPageHeader title="订单" description="订单管理与物流跟踪" />

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 text-left text-slate-500">
                <th className="px-4 py-3 font-medium">订单号</th>
                <th className="px-4 py-3 font-medium">客户</th>
                <th className="px-4 py-3 font-medium">金额</th>
                <th className="px-4 py-3 font-medium">订单状态</th>
                <th className="px-4 py-3 font-medium">付款</th>
                <th className="px-4 py-3 font-medium">物流</th>
                <th className="px-4 py-3 font-medium">预计到达</th>
                <th className="px-4 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {(orders ?? []).length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                    暂无订单。可从报价单一键转换。
                  </td>
                </tr>
              ) : (
                orders?.map((order) => (
                  <tr key={order.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-medium text-slate-800">{order.orderNo}</td>
                    <td className="px-4 py-3 text-slate-600">{order.customerName ?? order.customerId}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {order.currency} {order.total.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "rounded-lg border px-2 py-1 text-xs font-medium",
                          orderStatusStyles[order.orderStatus],
                        )}
                      >
                        {orderStatusLabel[order.orderStatus]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {paymentStatusLabel[order.paymentStatus]}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {order.trackingNo || order.shippingMethod || "—"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-500">
                      {order.eta ? new Date(order.eta).toLocaleDateString("zh-CN") : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {order.customerId ? (
                          <Button variant="ghost" size="icon" asChild title="查看客户">
                            <Link href={`/admin/customers/${order.customerId}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                        ) : null}
                        <Button variant="ghost" size="icon" onClick={() => openEdit(order)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(order.id)}>
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto border-slate-200 bg-white text-slate-900">
          <DialogHeader>
            <DialogTitle>编辑订单 {editing?.orderNo}</DialogTitle>
          </DialogHeader>
          {editing ? (
            <div className="space-y-4">
              <div className="rounded-xl bg-slate-50 p-3 text-sm">
                <p>客户：{editing.customerName ?? editing.customerId}</p>
                <p>
                  金额：{editing.currency} {editing.total.toFixed(2)}（含运费{" "}
                  {editing.shippingCost.toFixed(2)}）
                </p>
                {editing.quotationId ? (
                  <p className="text-xs text-slate-500">来源报价：{editing.quotationId}</p>
                ) : null}
              </div>

              {editing.items.length > 0 ? (
                <div className="rounded-xl border border-slate-200 p-3 text-xs text-slate-600">
                  <p className="mb-2 font-medium text-slate-800">订单明细</p>
                  {editing.items.map((item) => (
                    <p key={item.id}>
                      {item.productName || item.productId} ×{item.quantity} — 售{" "}
                      {item.sellingPrice} / 采 {item.purchasePrice}
                    </p>
                  ))}
                </div>
              ) : null}

              <Field label="订单状态">
                <select
                  value={form.orderStatus}
                  onChange={(e) =>
                    setForm({ ...form, orderStatus: e.target.value as OrderStatus })
                  }
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
                >
                  {ORDER_STATUS_FLOW.map((status) => (
                    <option key={status} value={status}>
                      {orderStatusLabel[status]}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="付款状态">
                <select
                  value={form.paymentStatus}
                  onChange={(e) =>
                    setForm({ ...form, paymentStatus: e.target.value as PaymentStatus })
                  }
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
                >
                  {PAYMENT_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {paymentStatusLabel[status]}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="物流方式">
                <select
                  value={form.shippingMethod}
                  onChange={(e) => setForm({ ...form, shippingMethod: e.target.value })}
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
                >
                  <option value="">选择物流方式...</option>
                  {SHIPPING_METHODS.map((method) => (
                    <option key={method} value={method}>
                      {method}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="物流单号">
                <Input
                  value={form.trackingNo}
                  onChange={(e) => setForm({ ...form, trackingNo: e.target.value })}
                  placeholder="物流单号"
                  className="border-slate-200 bg-white"
                />
              </Field>

              <Field label="预计到达">
                <Input
                  type="date"
                  value={form.eta}
                  onChange={(e) => setForm({ ...form, eta: e.target.value })}
                  className="border-slate-200 bg-white"
                />
              </Field>

              <Field label="备注">
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={3}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                />
              </Field>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  取消
                </Button>
                <Button onClick={() => void handleSave()} disabled={saving}>
                  {saving ? "保存中..." : "保存"}
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
