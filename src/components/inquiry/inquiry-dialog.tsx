"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitInquiry } from "@/lib/inquiry-storage";
import type { InquiryPrefill } from "@/components/inquiry/inquiry-context";

interface InquiryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prefill: InquiryPrefill | null;
}

const emptyForm = {
  companyName: "",
  contactName: "",
  email: "",
  whatsapp: "",
  country: "",
  productName: "",
  productModel: "",
  quantity: "",
  notes: "",
  productSlug: "",
};

export function InquiryDialog({ open, onOpenChange, prefill }: InquiryDialogProps) {
  const t = useTranslations("inquiry");
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSuccess(false);
    setErrors({});
    setForm({
      ...emptyForm,
      productName: prefill?.productName ?? "",
      productModel: prefill?.productModel ?? "",
      productSlug: prefill?.productSlug ?? "",
    });
  }, [open, prefill]);

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.companyName.trim()) next.companyName = t("errors.required");
    if (!form.contactName.trim()) next.contactName = t("errors.required");
    if (!form.whatsapp.trim()) next.whatsapp = t("errors.required");
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await submitInquiry({
        companyName: form.companyName.trim(),
        contactName: form.contactName.trim(),
        email: form.email.trim(),
        whatsapp: form.whatsapp.trim(),
        country: form.country.trim(),
        productName: form.productName.trim(),
        productModel: form.productModel.trim(),
        quantity: form.quantity.trim(),
        notes: form.notes.trim(),
        productSlug: form.productSlug || undefined,
        source: "product",
      });
      setSuccess(true);
    } catch {
      alert("提交失败，请稍后重试。");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setSuccess(false);
      setErrors({});
    }
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-xl border-slate-200 bg-white text-slate-900 sm:max-w-2xl">
        {success ? (
          <div className="flex flex-col items-center py-8 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            </div>
            <DialogHeader className="items-center">
              <DialogTitle className="text-xl text-slate-900">{t("successTitle")}</DialogTitle>
              <DialogDescription className="max-w-sm text-base text-slate-600">
                {t("successMessage")}
              </DialogDescription>
            </DialogHeader>
            <Button
              type="button"
              className="mt-6 bg-blue-600 hover:bg-blue-700"
              onClick={() => handleOpenChange(false)}
            >
              {t("close")}
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl text-slate-900">{t("title")}</DialogTitle>
              <DialogDescription className="text-slate-600">{t("subtitle")}</DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  id="companyName"
                  label={t("fields.companyName")}
                  required
                  error={errors.companyName}
                >
                  <Input
                    id="companyName"
                    value={form.companyName}
                    onChange={(e) => updateField("companyName", e.target.value)}
                    placeholder={t("placeholders.companyName")}
                    className="border-slate-200 bg-white text-slate-900"
                  />
                </Field>
                <Field
                  id="contactName"
                  label={t("fields.contactName")}
                  required
                  error={errors.contactName}
                >
                  <Input
                    id="contactName"
                    value={form.contactName}
                    onChange={(e) => updateField("contactName", e.target.value)}
                    placeholder={t("placeholders.contactName")}
                    className="border-slate-200 bg-white text-slate-900"
                  />
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="email" label={t("fields.email")}>
                  <Input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    placeholder={t("placeholders.email")}
                    className="border-slate-200 bg-white text-slate-900"
                  />
                </Field>
                <Field
                  id="whatsapp"
                  label={t("fields.whatsapp")}
                  required
                  error={errors.whatsapp}
                >
                  <Input
                    id="whatsapp"
                    value={form.whatsapp}
                    onChange={(e) => updateField("whatsapp", e.target.value)}
                    placeholder={t("placeholders.whatsapp")}
                    className="border-slate-200 bg-white text-slate-900"
                  />
                </Field>
              </div>

              <Field id="country" label={t("fields.country")}>
                <Input
                  id="country"
                  value={form.country}
                  onChange={(e) => updateField("country", e.target.value)}
                  placeholder={t("placeholders.country")}
                  className="border-slate-200 bg-white text-slate-900"
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="productName" label={t("fields.productName")}>
                  <Input
                    id="productName"
                    value={form.productName}
                    readOnly
                    className="cursor-not-allowed border-slate-200 bg-slate-50 text-slate-700"
                  />
                </Field>
                <Field id="productModel" label={t("fields.productModel")}>
                  <Input
                    id="productModel"
                    value={form.productModel}
                    readOnly
                    className="cursor-not-allowed border-slate-200 bg-slate-50 text-slate-700"
                  />
                </Field>
              </div>

              <Field id="quantity" label={t("fields.quantity")}>
                <Input
                  id="quantity"
                  value={form.quantity}
                  onChange={(e) => updateField("quantity", e.target.value)}
                  placeholder={t("placeholders.quantity")}
                  className="border-slate-200 bg-white text-slate-900"
                />
              </Field>

              <Field id="notes" label={t("fields.notes")}>
                <Textarea
                  id="notes"
                  value={form.notes}
                  onChange={(e) => updateField("notes", e.target.value)}
                  placeholder={t("placeholders.notes")}
                  className="min-h-[96px] border-slate-200 bg-white text-slate-900"
                />
              </Field>

              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  className="border-slate-300 text-slate-700 hover:bg-slate-50"
                  onClick={() => handleOpenChange(false)}
                >
                  {t("cancel")}
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {t("submit")}
                </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Field({
  id,
  label,
  required,
  error,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} required={required}>
        {label}
      </Label>
      {children}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
