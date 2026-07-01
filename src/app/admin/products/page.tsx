"use client";

import dynamic from "next/dynamic";
import { useCallback, useMemo, useState } from "react";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
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
import { useAdminFetch } from "@/lib/admin/use-admin-fetch";
import type { AdminProduct, AdminBrand, AdminCategory } from "@/lib/admin/types";
import type { ShipLocation, StockStatus } from "@/lib/product-types";

const AdminProductImages = dynamic(
  () =>
    import("@/components/admin/admin-product-images").then((mod) => mod.AdminProductImages),
  { ssr: false },
);

const AdminProductSuppliers = dynamic(
  () =>
    import("@/components/admin/admin-product-suppliers").then((mod) => mod.AdminProductSuppliers),
  { ssr: false },
);

const locations: ShipLocation[] = ["shenzhen", "guangzhou", "yiwu", "ningbo", "shanghai"];
const stockOptions: StockStatus[] = ["inStock", "preOrder"];

const emptyProduct = (): Omit<AdminProduct, "id" | "updatedAt"> => ({
  slug: "",
  sku: "",
  name: "",
  categoryId: "",
  brandId: "",
  model: "",
  moq: 1,
  stockStatus: "inStock",
  location: "shenzhen",
  price: 0,
  hotScore: 0,
  sortOrder: 0,
  imageCount: 0,
  images: [],
});

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function AdminProductsPage() {
  const { data: products, refresh } = useAdminFetch<AdminProduct[]>("/api/admin/products");
  const { data: categories } = useAdminFetch<AdminCategory[]>("/api/admin/categories");
  const { data: brands } = useAdminFetch<AdminBrand[]>("/api/admin/brands");
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const [form, setForm] = useState(emptyProduct());
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    if (!products) return [];
    const q = search.toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.model.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q),
    );
  }, [products, search]);

  const categoryMap = Object.fromEntries((categories ?? []).map((c) => [c.id, c.name]));
  const brandMap = Object.fromEntries((brands ?? []).map((b) => [b.id, b.name]));

  const openCreate = () => {
    setEditing(null);
    setForm({
      ...emptyProduct(),
      categoryId: categories?.[0]?.id ?? "",
      brandId: brands?.[0]?.id ?? "",
      location: "shenzhen",
    });
    setDialogOpen(true);
  };

  const openEdit = (product: AdminProduct) => {
    setEditing(product);
    setForm({ ...product });
    setDialogOpen(true);
  };

  const handleSave = useCallback(async () => {
    if (!form.name.trim() || !form.sku.trim()) return;
    const payload = {
      ...form,
      slug: form.slug || slugify(form.name),
      categoryId: form.categoryId,
      brandId: form.brandId,
    };
    setSaving(true);
    try {
      const res = await fetch(
        editing ? `/api/admin/products/${editing.id}` : "/api/admin/products",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
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
      if (!confirm("确定删除该产品？")) return;
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      if (!res.ok) {
        alert("删除失败，请确认数据库已配置且产品存在于数据库中。");
        return;
      }
      await refresh();
    },
    [refresh],
  );

  return (
    <>
      <AdminPageHeader
        title="产品"
        description="产品列表管理"
        action={
          <Button onClick={openCreate} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4" />
            新增产品
          </Button>
        }
      />

      <div className="mb-4 relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜索产品名称、SKU、型号..."
          className="border-slate-200 bg-white pl-9 text-slate-900"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 text-left text-slate-500">
                <th className="px-4 py-3 font-medium">产品名称</th>
                <th className="px-4 py-3 font-medium">SKU</th>
                <th className="px-4 py-3 font-medium">品牌</th>
                <th className="px-4 py-3 font-medium">分类</th>
                <th className="px-4 py-3 font-medium">型号</th>
                <th className="px-4 py-3 font-medium">价格</th>
                <th className="px-4 py-3 font-medium">库存</th>
                <th className="px-4 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-medium text-slate-800">{p.name}</td>
                  <td className="px-4 py-3 text-slate-600">{p.sku}</td>
                  <td className="px-4 py-3 text-slate-600">{brandMap[p.brandId] ?? p.brandId}</td>
                  <td className="px-4 py-3 text-slate-600">{categoryMap[p.categoryId] ?? p.categoryId}</td>
                  <td className="px-4 py-3 text-slate-600">{p.model}</td>
                  <td className="px-4 py-3 text-slate-600">¥{p.price}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${p.stockStatus === "inStock" ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700"}`}>
                      {p.stockStatus === "inStock" ? "现货" : "可订货"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(p)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto border-slate-200 bg-white text-slate-900 sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "编辑产品" : "新增产品"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="产品名称" required>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border-slate-200 bg-white" />
            </Field>
            <Field label="链接别名">
              <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="自动生成" className="border-slate-200 bg-white" />
            </Field>
            <Field label="SKU" required>
              <Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} className="border-slate-200 bg-white" />
            </Field>
            <Field label="型号">
              <Input value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} className="border-slate-200 bg-white" />
            </Field>
            <Field label="分类">
              <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm">
                {(categories ?? []).map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </Field>
            <Field label="品牌">
              <select value={form.brandId} onChange={(e) => setForm({ ...form, brandId: e.target.value })} className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm">
                {(brands ?? []).map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </Field>
            <Field label="MOQ">
              <Input type="number" value={form.moq} onChange={(e) => setForm({ ...form, moq: Number(e.target.value) })} className="border-slate-200 bg-white" />
            </Field>
            <Field label="价格">
              <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} className="border-slate-200 bg-white" />
            </Field>
            <Field label="库存状态">
              <select value={form.stockStatus} onChange={(e) => setForm({ ...form, stockStatus: e.target.value as StockStatus })} className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm">
                {stockOptions.map((s) => (
                  <option key={s} value={s}>{s === "inStock" ? "现货" : "可订货"}</option>
                ))}
              </select>
            </Field>
            <Field label="发货地">
              <select value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value as ShipLocation })} className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm">
                {locations.map((l) => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </Field>
            <Field label="热度">
              <Input type="number" value={form.hotScore} onChange={(e) => setForm({ ...form, hotScore: Number(e.target.value) })} className="border-slate-200 bg-white" />
            </Field>
            <Field label="排序">
              <Input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} className="border-slate-200 bg-white" />
            </Field>
          </div>
          {editing && <AdminProductImages productId={editing.id} />}
          {editing && <AdminProductSuppliers productId={editing.id} />}
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

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label required={required}>{label}</Label>
      {children}
    </div>
  );
}
