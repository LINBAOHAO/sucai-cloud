export type InquirySource = "product" | "contact";
export type InquiryStatus = "pending" | "contacted" | "quoted" | "completed" | "closed";

export interface InquiryFormData {
  companyName: string;
  contactName: string;
  email?: string;
  whatsapp: string;
  country?: string;
  productName?: string;
  productModel?: string;
  quantity?: string;
  notes?: string;
  productSlug?: string;
  source: InquirySource;
  status?: InquiryStatus;
}

export async function submitInquiry(data: InquiryFormData): Promise<void> {
  const res = await fetch("/api/inquiries", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? "提交失败，请稍后重试。");
  }
}
