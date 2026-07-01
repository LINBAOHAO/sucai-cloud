"use client";

import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAdminFetch } from "@/lib/admin/use-admin-fetch";
import type { AdminSettings } from "@/lib/admin/types";

export default function AdminSettingsPage() {
  const { data, refresh, loading } = useAdminFetch<AdminSettings>("/api/admin/settings");
  const [form, setForm] = useState<AdminSettings | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  const handleSave = async () => {
    if (!form) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        alert("保存失败，请稍后重试。");
        return;
      }
      const updated = (await res.json()) as AdminSettings;
      setForm(updated);
      await refresh();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      alert("保存失败，请稍后重试。");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !form) return null;

  return (
    <>
      <AdminPageHeader
        title="设置"
        description="系统基础设置"
        action={
          <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
            <Save className="h-4 w-4" />
            {saved ? "已保存" : saving ? "保存中…" : "保存设置"}
          </Button>
        }
      />

      <div className="max-w-2xl space-y-6 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="space-y-2">
          <Label required>网站名称</Label>
          <Input
            value={form.siteName}
            onChange={(e) => setForm({ ...form, siteName: e.target.value })}
            className="border-slate-200 bg-white text-slate-900"
          />
        </div>
        <div className="space-y-2">
          <Label>Logo 文字</Label>
          <Input
            value={form.logo}
            onChange={(e) => setForm({ ...form, logo: e.target.value })}
            placeholder="例如：SC"
            className="border-slate-200 bg-white text-slate-900"
          />
          <p className="text-xs text-slate-500">暂用文本 Logo，后续可替换为图片 URL</p>
        </div>
        <div className="space-y-2">
          <Label>联系邮箱</Label>
          <Input
            type="email"
            value={form.contactEmail}
            onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
            className="border-slate-200 bg-white text-slate-900"
          />
        </div>
        <div className="space-y-2">
          <Label>WhatsApp</Label>
          <Input
            value={form.whatsapp}
            onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
            className="border-slate-200 bg-white text-slate-900"
          />
        </div>
        <div className="space-y-2">
          <Label>公司地址</Label>
          <Textarea
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className="min-h-[96px] border-slate-200 bg-white text-slate-900"
          />
        </div>
      </div>
    </>
  );
}
