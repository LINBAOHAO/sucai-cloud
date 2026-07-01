"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Plus, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AdminSupplier, AdminSupplierProduct } from "@/lib/admin/types";
import { cn } from "@/lib/utils";

interface AdminProductSuppliersProps {
  productId: string;
}

const emptyLinkForm = () => ({
  supplierId: "",
  purchasePrice: 0,
  moq: 1,
  stock: 0,
  leadTime: 0,
  preferred: false,
});

export function AdminProductSuppliers({ productId }: AdminProductSuppliersProps) {
  const [links, setLinks] = useState<AdminSupplierProduct[]>([]);
  const [suppliers, setSuppliers] = useState<AdminSupplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyLinkForm());
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [linksRes, suppliersRes] = await Promise.all([
        fetch(`/api/admin/products/${productId}/suppliers`),
        fetch("/api/admin/suppliers"),
      ]);
      if (!linksRes.ok || !suppliersRes.ok) {
        throw new Error("加载供应商数据失败");
      }
      setLinks((await linksRes.json()) as AdminSupplierProduct[]);
      setSuppliers((await suppliersRes.json()) as AdminSupplier[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "加载失败");
      setLinks([]);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const availableSuppliers = suppliers.filter(
    (s) => !links.some((l) => l.supplierId === s.id),
  );

  const handleAdd = async () => {
    if (!form.supplierId || form.purchasePrice <= 0) {
      alert("请选择供应商并填写采购价");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/products/${productId}/suppliers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        alert(body?.error ?? "添加失败");
        return;
      }
      setForm(emptyLinkForm());
      await refresh();
    } finally {
      setSaving(false);
    }
  };

  const handleSetPreferred = async (supplierId: string) => {
    const res = await fetch(`/api/admin/products/${productId}/suppliers/${supplierId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ preferred: true }),
    });
    if (!res.ok) {
      alert("设置首选供应商失败");
      return;
    }
    await refresh();
  };

  const handleDelete = async (supplierId: string) => {
    if (!confirm("确定移除该供应商？")) return;
    const res = await fetch(`/api/admin/products/${productId}/suppliers/${supplierId}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      alert("删除失败");
      return;
    }
    await refresh();
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-4 text-sm text-slate-500">
        <Loader2 className="size-4 animate-spin" />
        加载供应商...
      </div>
    );
  }

  return (
    <div className="space-y-4 border-t border-slate-200 pt-4">
      <div>
        <Label className="text-base font-semibold text-slate-800">供应商 & 采购价</Label>
        <p className="mt-1 text-xs text-slate-500">
          一个产品可绑定多个供应商，各自设置采购价；仅一个 Preferred Supplier。
        </p>
      </div>

      {error ? <p className="text-sm text-red-500">{error}</p> : null}

      {links.length > 0 ? (
        <div className="overflow-hidden rounded-xl border border-slate-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 text-left text-slate-500">
                <th className="px-3 py-2 font-medium">供应商</th>
                <th className="px-3 py-2 font-medium">采购价</th>
                <th className="px-3 py-2 font-medium">MOQ</th>
                <th className="px-3 py-2 font-medium">库存</th>
                <th className="px-3 py-2 font-medium">交期</th>
                <th className="px-3 py-2 font-medium">首选</th>
                <th className="px-3 py-2 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {links.map((link) => (
                <tr key={link.supplierId} className="border-b border-slate-50">
                  <td className="px-3 py-2 font-medium text-slate-800">
                    {link.supplierName ?? link.supplierId}
                  </td>
                  <td className="px-3 py-2 text-slate-600">¥{link.purchasePrice}</td>
                  <td className="px-3 py-2 text-slate-600">{link.moq}</td>
                  <td className="px-3 py-2 text-slate-600">{link.stock}</td>
                  <td className="px-3 py-2 text-slate-600">{link.leadTime}天</td>
                  <td className="px-3 py-2">
                    {link.preferred ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                        <Star className="size-3 fill-amber-500 text-amber-500" />
                        Preferred
                      </span>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-slate-500"
                        onClick={() => handleSetPreferred(link.supplierId)}
                      >
                        设为首选
                      </Button>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(link.supplierId)}
                    >
                      <Trash2 className="size-4 text-red-500" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm text-slate-500">尚未绑定供应商。</p>
      )}

      {availableSuppliers.length > 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-4">
          <p className="mb-3 text-sm font-medium text-slate-700">添加供应商</p>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1 sm:col-span-3">
              <Label>供应商</Label>
              <select
                value={form.supplierId}
                onChange={(e) => setForm({ ...form, supplierId: e.target.value })}
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
              >
                <option value="">选择供应商...</option>
                {availableSuppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.companyName}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label>采购价</Label>
              <Input
                type="number"
                min={0}
                step={0.01}
                value={form.purchasePrice}
                onChange={(e) => setForm({ ...form, purchasePrice: Number(e.target.value) })}
                className="border-slate-200 bg-white"
              />
            </div>
            <div className="space-y-1">
              <Label>MOQ</Label>
              <Input
                type="number"
                min={1}
                value={form.moq}
                onChange={(e) => setForm({ ...form, moq: Number(e.target.value) })}
                className="border-slate-200 bg-white"
              />
            </div>
            <div className="space-y-1">
              <Label>库存</Label>
              <Input
                type="number"
                min={0}
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                className="border-slate-200 bg-white"
              />
            </div>
            <div className="space-y-1">
              <Label>交期(天)</Label>
              <Input
                type="number"
                min={0}
                value={form.leadTime}
                onChange={(e) => setForm({ ...form, leadTime: Number(e.target.value) })}
                className="border-slate-200 bg-white"
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={form.preferred}
                  onChange={(e) => setForm({ ...form, preferred: e.target.checked })}
                  className="rounded border-slate-300"
                />
                设为 Preferred
              </label>
            </div>
          </div>
          <Button
            onClick={handleAdd}
            disabled={saving}
            className={cn("mt-3 bg-blue-600 hover:bg-blue-700")}
          >
            <Plus className="size-4" />
            {saving ? "添加中..." : "添加供应商"}
          </Button>
        </div>
      ) : suppliers.length === 0 ? (
        <p className="text-sm text-slate-500">
          请先在{" "}
          <Link href="/admin/suppliers" className="text-blue-600 hover:underline">
            供应商管理
          </Link>{" "}
          中创建供应商。
        </p>
      ) : null}
    </div>
  );
}
