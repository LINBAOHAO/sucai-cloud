"use client";

import { useCallback, useMemo, useState } from "react";
import { Download, FileText, Pencil, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAdminFetch } from "@/lib/admin/use-admin-fetch";
import type { AdminProduct, AdminQuotation, QuotationStatus } from "@/lib/admin/types";
import { DEFAULT_QUOTATION_TERMS } from "@/lib/quotations/quotation-types";
import { cn } from "@/lib/utils";

const statusLabels: Record<QuotationStatus, string> = {
  draft: "草稿",
  sent: "已发送",
  accepted: "已接受",
  rejected: "已拒绝",
  expired: "已过期",
};

const statusStyles: Record<QuotationStatus, string> = {
  draft: "bg-slate-50 text-slate-700 border-slate-200",
  sent: "bg-blue-50 text-blue-700 border-blue-200",
  accepted: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
  expired: "bg-amber-50 text-amber-700 border-amber-200",
};

interface ItemFormRow {
  productId: string;
  productName: string;
  productModel: string;
  quantity: number;
  unitPrice: number;
}

const emptyItem = (): ItemFormRow => ({
  productId: "",
  productName: "",
  productModel: "",
  quantity: 1,
  unitPrice: 0,
});

const emptyForm = () => ({
  companyName: "",
  contactName: "",
  email: "",
  whatsapp: "",
  country: "Indonesia",
  destinationCity: "",
  inquiryId: "",
  currency: "USD",
  terms: DEFAULT_QUOTATION_TERMS,
  notes: "",
  status: "draft" as QuotationStatus,
  items: [emptyItem()],
});

export default function AdminQuotationsPage() {
  const { data: quotations, refresh } = useAdminFetch<AdminQuotation[]>("/api/admin/quotations");
  const { data: products } = useAdminFetch<AdminProduct[]>("/api/admin/products");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AdminQuotation | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);

  const totals = useMemo(() => {
    const subtotal = form.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    return {
      subtotal: Math.round(subtotal * 100) / 100,
      total: Math.round(subtotal * 100) / 100,
    };
  }, [form.items]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setDialogOpen(true);
  };

  const openEdit = (quotation: AdminQuotation) => {
    setEditing(quotation);
    setForm({
      companyName: quotation.companyName,
      contactName: quotation.contactName,
      email: quotation.email,
      whatsapp: quotation.whatsapp,
      country: quotation.country,
      destinationCity: quotation.destinationCity,
      inquiryId: quotation.inquiryId ?? "",
      currency: quotation.currency,
      terms: quotation.terms,
      notes: quotation.notes,
      status: quotation.status,
      items: quotation.items.map((item) => ({
        productId: item.productId ?? "",
        productName: item.productName,
        productModel: item.productModel,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
    });
    setDialogOpen(true);
  };

  const handleSave = useCallback(async () => {
    if (!form.companyName.trim() || !form.contactName.trim() || !form.whatsapp.trim()) {
      return;
    }
    if (!form.items.length || !form.items[0].productName.trim()) {
      return;
    }

    setSaving(true);
    try {
      const payload = {
        companyName: form.companyName,
        contactName: form.contactName,
        email: form.email,
        whatsapp: form.whatsapp,
        country: form.country,
        destinationCity: form.destinationCity,
        inquiryId: form.inquiryId || undefined,
        currency: form.currency,
        terms: form.terms,
        notes: form.notes,
        status: form.status,
        items: form.items.map((item) => ({
          productId: item.productId || undefined,
          productName: item.productName,
          productModel: item.productModel,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      };

      const res = await fetch(
        editing ? `/api/admin/quotations/${editing.id}` : "/api/admin/quotations",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        alert(body?.error ?? "保存失败。");
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
      if (!confirm("确定删除该报价？")) return;
      const res = await fetch(`/api/admin/quotations/${id}`, { method: "DELETE" });
      if (!res.ok) {
        alert("删除失败。");
        return;
      }
      await refresh();
    },
    [refresh],
  );

  const handleConvertToOrder = useCallback(
    async (id: string, quotationNo: string) => {
      if (!confirm(`将报价 ${quotationNo} 转换为订单？`)) return;
      const res = await fetch(`/api/admin/quotations/${id}/convert-to-order`, {
        method: "POST",
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        alert(body?.error ?? "转换失败");
        return;
      }
      const order = (await res.json()) as { orderNo: string };
      alert(`订单 ${order.orderNo} 已创建`);
      await refresh();
    },
    [refresh],
  );

  const updateItem = (index: number, patch: Partial<ItemFormRow>) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    }));
  };

  const addItem = () => {
    setForm((prev) => ({ ...prev, items: [...prev.items, emptyItem()] }));
  };

  const removeItem = (index: number) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.length > 1 ? prev.items.filter((_, i) => i !== index) : prev.items,
    }));
  };

  const fillProduct = (index: number, productId: string) => {
    const product = products?.find((item) => item.id === productId);
    if (!product) return;
    updateItem(index, {
      productId: product.id,
      productName: product.name,
      productModel: product.model,
      unitPrice: product.price,
    });
  };

  return (
    <>
      <AdminPageHeader
        title="Quotations"
        description="客户报价管理 — 创建、编辑、生成 PDF"
        action={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            新建报价
          </Button>
        }
      />

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 text-left text-slate-500">
                <th className="px-4 py-3 font-medium">报价单号</th>
                <th className="px-4 py-3 font-medium">客户</th>
                <th className="px-4 py-3 font-medium">联系人</th>
                <th className="px-4 py-3 font-medium">总价</th>
                <th className="px-4 py-3 font-medium">状态</th>
                <th className="px-4 py-3 font-medium">时间</th>
                <th className="px-4 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {(quotations ?? []).length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    暂无报价记录。
                  </td>
                </tr>
              ) : (
                quotations?.map((item) => (
                  <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-medium text-slate-800">{item.quotationNo}</td>
                    <td className="px-4 py-3 text-slate-600">{item.companyName}</td>
                    <td className="px-4 py-3 text-slate-600">{item.contactName}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {item.currency} {item.total.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "rounded-lg border px-2 py-1 text-xs font-medium",
                          statusStyles[item.status],
                        )}
                      >
                        {statusLabels[item.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-500">
                      {new Date(item.createdAt).toLocaleString("zh-CN")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {item.pdfUrl ? (
                          <Button variant="ghost" size="icon" asChild title="下载 PDF">
                            <a href={item.pdfUrl} target="_blank" rel="noopener noreferrer">
                              <Download className="h-4 w-4 text-blue-600" />
                            </a>
                          </Button>
                        ) : (
                          <Button variant="ghost" size="icon" disabled title="PDF 未生成">
                            <FileText className="h-4 w-4 text-slate-300" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          title="转换为订单"
                          onClick={() => void handleConvertToOrder(item.id, item.quotationNo)}
                        >
                          <ShoppingCart className="h-4 w-4 text-emerald-600" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => openEdit(item)}>
                          <Pencil className="h-4 w-4 text-slate-600" />
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto bg-white text-slate-900">
          <DialogHeader>
            <DialogTitle>{editing ? "编辑报价" : "新建报价"}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>公司名称</Label>
                <Input
                  value={form.companyName}
                  onChange={(e) => setForm((prev) => ({ ...prev, companyName: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>联系人</Label>
                <Input
                  value={form.contactName}
                  onChange={(e) => setForm((prev) => ({ ...prev, contactName: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>WhatsApp</Label>
                <Input
                  value={form.whatsapp}
                  onChange={(e) => setForm((prev) => ({ ...prev, whatsapp: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  value={form.email}
                  onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>目的城市</Label>
                <Input
                  value={form.destinationCity}
                  onChange={(e) => setForm((prev) => ({ ...prev, destinationCity: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>关联 Inquiry ID（可选）</Label>
                <Input
                  value={form.inquiryId}
                  onChange={(e) => setForm((prev) => ({ ...prev, inquiryId: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>产品明细</Label>
                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                  添加产品
                </Button>
              </div>
              {form.items.map((item, index) => (
                <div key={index} className="rounded-xl border border-slate-200 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500">Item #{index + 1}</span>
                    {form.items.length > 1 ? (
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(index)}>
                        删除
                      </Button>
                    ) : null}
                  </div>
                  {products && products.length > 0 ? (
                    <select
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      value={item.productId}
                      onChange={(e) => fillProduct(index, e.target.value)}
                    >
                      <option value="">从已有产品选择…</option>
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>
                          {product.name} ({product.model})
                        </option>
                      ))}
                    </select>
                  ) : null}
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Input
                      placeholder="产品名称"
                      value={item.productName}
                      onChange={(e) => updateItem(index, { productName: e.target.value })}
                    />
                    <Input
                      placeholder="型号"
                      value={item.productModel}
                      onChange={(e) => updateItem(index, { productModel: e.target.value })}
                    />
                    <Input
                      type="number"
                      min={1}
                      placeholder="数量"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, { quantity: Number(e.target.value) || 1 })}
                    />
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      placeholder="单价"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(index, { unitPrice: Number(e.target.value) || 0 })}
                    />
                  </div>
                  <p className="text-xs text-slate-500">
                    小计: {form.currency} {(item.quantity * item.unitPrice).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            <div className="rounded-xl bg-slate-50 p-3 text-sm">
              <p>Subtotal: {form.currency} {totals.subtotal.toFixed(2)}</p>
              <p className="font-semibold text-blue-700">Total: {form.currency} {totals.total.toFixed(2)}</p>
            </div>

            <div className="space-y-2">
              <Label>备注</Label>
              <Textarea
                rows={2}
                value={form.notes}
                onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Terms</Label>
              <Textarea
                rows={4}
                value={form.terms}
                onChange={(e) => setForm((prev) => ({ ...prev, terms: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>状态</Label>
              <select
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                value={form.status}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, status: e.target.value as QuotationStatus }))
                }
              >
                {(Object.keys(statusLabels) as QuotationStatus[]).map((status) => (
                  <option key={status} value={status}>
                    {statusLabels[status]}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                取消
              </Button>
              <Button onClick={() => void handleSave()} disabled={saving}>
                {saving ? "保存中…" : "保存并生成 PDF"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
