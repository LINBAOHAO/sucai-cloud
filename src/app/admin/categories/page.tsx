"use client";

import { useCallback, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminFetch } from "@/lib/admin/use-admin-fetch";
import type { AdminCategory } from "@/lib/admin/types";

export default function AdminCategoriesPage() {
  const { data: categories, refresh } = useAdminFetch<AdminCategory[]>("/api/admin/categories");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AdminCategory | null>(null);
  const [form, setForm] = useState({ name: "", icon: "Package", sortOrder: 0 });
  const [saving, setSaving] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", icon: "Package", sortOrder: (categories?.length ?? 0) + 1 });
    setDialogOpen(true);
  };

  const openEdit = (cat: AdminCategory) => {
    setEditing(cat);
    setForm({ name: cat.name, icon: cat.icon, sortOrder: cat.sortOrder });
    setDialogOpen(true);
  };

  const handleSave = useCallback(async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const res = await fetch(
        editing ? `/api/admin/categories/${editing.id}` : "/api/admin/categories",
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
      if (!confirm("确定删除该分类？")) return;
      const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
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
        title="分类"
        description="产品分类管理"
        action={
          <Button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4" />
            新增分类
          </Button>
        }
      />

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/80 text-left text-slate-500">
              <th className="px-6 py-3 font-medium">ID</th>
              <th className="px-6 py-3 font-medium">名称</th>
              <th className="px-6 py-3 font-medium">图标</th>
              <th className="px-6 py-3 font-medium">排序</th>
              <th className="px-6 py-3 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {(categories ?? []).map((cat) => (
              <tr key={cat.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                <td className="px-6 py-3 font-mono text-xs text-slate-500">{cat.id}</td>
                <td className="px-6 py-3 font-medium text-slate-800">{cat.name}</td>
                <td className="px-6 py-3 text-slate-600">{cat.icon}</td>
                <td className="px-6 py-3 text-slate-600">{cat.sortOrder}</td>
                <td className="px-6 py-3">
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(cat)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(cat.id)}>
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
            <DialogTitle>{editing ? "编辑分类" : "新增分类"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label required>分类名称</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border-slate-200 bg-white" />
            </div>
            <div className="space-y-2">
              <Label>图标名称</Label>
              <Input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="Lucide 图标名，如 Wrench" className="border-slate-200 bg-white" />
            </div>
            <div className="space-y-2">
              <Label>排序</Label>
              <Input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} className="border-slate-200 bg-white" />
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
