"use client";

import { useCallback, useMemo, useState } from "react";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminFetch } from "@/lib/admin/use-admin-fetch";
import type { AdminSupplier } from "@/lib/admin/types";

const emptyForm = (): Omit<AdminSupplier, "id" | "createdAt" | "updatedAt"> => ({
  companyName: "",
  contactName: "",
  whatsapp: "",
  email: "",
  address: "",
  city: "",
  country: "",
  paymentTerms: "",
  leadTime: 0,
  rating: 0,
  notes: "",
});

export default function AdminSuppliersPage() {
  const { data: suppliers, refresh } = useAdminFetch<AdminSupplier[]>("/api/admin/suppliers");
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AdminSupplier | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    if (!suppliers) return [];
    const q = search.toLowerCase();
    if (!q) return suppliers;
    return suppliers.filter(
      (s) =>
        s.companyName.toLowerCase().includes(q) ||
        s.contactName.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q) ||
        s.country.toLowerCase().includes(q) ||
        s.whatsapp.includes(q) ||
        s.email.toLowerCase().includes(q),
    );
  }, [suppliers, search]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setDialogOpen(true);
  };

  const openEdit = (supplier: AdminSupplier) => {
    setEditing(supplier);
    setForm({
      companyName: supplier.companyName,
      contactName: supplier.contactName,
      whatsapp: supplier.whatsapp,
      email: supplier.email,
      address: supplier.address,
      city: supplier.city,
      country: supplier.country,
      paymentTerms: supplier.paymentTerms,
      leadTime: supplier.leadTime,
      rating: supplier.rating,
      notes: supplier.notes,
    });
    setDialogOpen(true);
  };

  const handleSave = useCallback(async () => {
    if (!form.companyName.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(
        editing ? `/api/admin/suppliers/${editing.id}` : "/api/admin/suppliers",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        },
      );
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        alert(body?.error ?? "保存失败，请确认数据库已配置且可连接。");
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
      if (!confirm("确定删除该供应商？关联的产品采购价也会被移除。")) return;
      const res = await fetch(`/api/admin/suppliers/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        alert(body?.error ?? "删除失败。");
        return;
      }
      await refresh();
    },
    [refresh],
  );

  return (
    <>
      <AdminPageHeader
        title="供应商"
        description="供应商管理"
        action={
          <Button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4" />
            新增供应商
          </Button>
        }
      />

      <div className="relative mb-4 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜索公司、联系人、城市、WhatsApp..."
          className="border-slate-200 bg-white pl-9 text-slate-900"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 text-left text-slate-500">
                <th className="px-4 py-3 font-medium">公司名称</th>
                <th className="px-4 py-3 font-medium">联系人</th>
                <th className="px-4 py-3 font-medium">WhatsApp</th>
                <th className="px-4 py-3 font-medium">城市</th>
                <th className="px-4 py-3 font-medium">国家</th>
                <th className="px-4 py-3 font-medium">交期(天)</th>
                <th className="px-4 py-3 font-medium">评分</th>
                <th className="px-4 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((supplier) => (
                <tr key={supplier.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-medium text-slate-800">{supplier.companyName}</td>
                  <td className="px-4 py-3 text-slate-600">{supplier.contactName || "—"}</td>
                  <td className="px-4 py-3 text-slate-600">{supplier.whatsapp || "—"}</td>
                  <td className="px-4 py-3 text-slate-600">{supplier.city || "—"}</td>
                  <td className="px-4 py-3 text-slate-600">{supplier.country || "—"}</td>
                  <td className="px-4 py-3 text-slate-600">{supplier.leadTime}</td>
                  <td className="px-4 py-3 text-slate-600">{supplier.rating.toFixed(1)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(supplier)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(supplier.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {!filtered.length ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                    暂无供应商，点击「新增供应商」创建。
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto border-slate-200 bg-white text-slate-900 sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "编辑供应商" : "新增供应商"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="公司名称" required>
              <Input
                value={form.companyName}
                onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                className="border-slate-200 bg-white"
              />
            </Field>
            <Field label="联系人">
              <Input
                value={form.contactName}
                onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                className="border-slate-200 bg-white"
              />
            </Field>
            <Field label="WhatsApp">
              <Input
                value={form.whatsapp}
                onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                className="border-slate-200 bg-white"
              />
            </Field>
            <Field label="邮箱">
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="border-slate-200 bg-white"
              />
            </Field>
            <Field label="城市">
              <Input
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="border-slate-200 bg-white"
              />
            </Field>
            <Field label="国家">
              <Input
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                className="border-slate-200 bg-white"
              />
            </Field>
            <Field label="付款条款">
              <Input
                value={form.paymentTerms}
                onChange={(e) => setForm({ ...form, paymentTerms: e.target.value })}
                placeholder="例：T/T 30% 定金"
                className="border-slate-200 bg-white"
              />
            </Field>
            <Field label="默认交期(天)">
              <Input
                type="number"
                value={form.leadTime}
                onChange={(e) => setForm({ ...form, leadTime: Number(e.target.value) })}
                className="border-slate-200 bg-white"
              />
            </Field>
            <Field label="评分 (0-5)">
              <Input
                type="number"
                min={0}
                max={5}
                step={0.1}
                value={form.rating}
                onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
                className="border-slate-200 bg-white"
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="地址">
                <Input
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="border-slate-200 bg-white"
                />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="备注">
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={3}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                />
              </Field>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
              {saving ? "保存中..." : "保存"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label required={required}>{label}</Label>
      {children}
    </div>
  );
}
