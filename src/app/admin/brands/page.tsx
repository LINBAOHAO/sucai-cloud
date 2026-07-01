"use client";

import { useCallback, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminFetch } from "@/lib/admin/use-admin-fetch";
import type { AdminBrand } from "@/lib/admin/types";

export default function AdminBrandsPage() {
  const { data: brands, refresh } = useAdminFetch<AdminBrand[]>("/api/admin/brands");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AdminBrand | null>(null);
  const [form, setForm] = useState({ name: "", color: "#0050B5" });
  const [saving, setSaving] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", color: "#0050B5" });
    setDialogOpen(true);
  };

  const openEdit = (brand: AdminBrand) => {
    setEditing(brand);
    setForm({ name: brand.name, color: brand.color });
    setDialogOpen(true);
  };

  const handleSave = useCallback(async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(
        editing ? `/api/admin/brands/${editing.id}` : "/api/admin/brands",
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
      if (!confirm("确定删除该品牌？")) return;
      const res = await fetch(`/api/admin/brands/${id}`, { method: "DELETE" });
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
        title="Brands"
        description="合作品牌管理"
        action={
          <Button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4" />
            新增品牌
          </Button>
        }
      />

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/80 text-left text-slate-500">
              <th className="px-6 py-3 font-medium">ID</th>
              <th className="px-6 py-3 font-medium">品牌名称</th>
              <th className="px-6 py-3 font-medium">主题色</th>
              <th className="px-6 py-3 font-medium">预览</th>
              <th className="px-6 py-3 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {(brands ?? []).map((brand) => (
              <tr key={brand.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                <td className="px-6 py-3 font-mono text-xs text-slate-500">{brand.id}</td>
                <td className="px-6 py-3 font-medium text-slate-800">{brand.name}</td>
                <td className="px-6 py-3 font-mono text-slate-600">{brand.color}</td>
                <td className="px-6 py-3">
                  <span
                    className="inline-block rounded-lg px-3 py-1 text-xs font-bold text-white"
                    style={{ backgroundColor: brand.color }}
                  >
                    {brand.name}
                  </span>
                </td>
                <td className="px-6 py-3">
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(brand)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(brand.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="border-slate-200 bg-white text-slate-900">
          <DialogHeader>
            <DialogTitle>{editing ? "编辑品牌" : "新增品牌"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label required>品牌名称</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border-slate-200 bg-white" />
            </div>
            <div className="space-y-2">
              <Label>主题色</Label>
              <div className="flex gap-3">
                <Input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="h-10 w-16 cursor-pointer border-slate-200 bg-white p-1" />
                <Input value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="border-slate-200 bg-white" />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>取消</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
              {saving ? "保存中..." : "保存"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
