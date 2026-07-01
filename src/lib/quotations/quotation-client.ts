import type {
  QuotationDraftInput,
  QuotationDraftResult,
  QuotationParseResult,
} from "@/lib/quotations/quotation-types";

export async function parseProcurementOrder(message: string): Promise<QuotationParseResult> {
  const res = await fetch("/api/quotations/parse", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? "Failed to parse order.");
  }

  return (await res.json()) as QuotationParseResult;
}

export async function requestQuotationDraft(
  data: QuotationDraftInput,
): Promise<QuotationDraftResult> {
  const res = await fetch("/api/quotations/draft", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(body?.error ?? "Failed to create quotation draft.");
  }

  return (await res.json()) as QuotationDraftResult;
}
