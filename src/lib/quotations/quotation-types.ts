export type QuotationStatus = "draft" | "sent" | "accepted" | "rejected" | "expired";

export interface QuotationItemInput {
  productId?: string;
  productName: string;
  productModel?: string;
  quantity: number;
  unitPrice: number;
}

export interface QuotationWriteInput {
  companyName: string;
  contactName: string;
  email?: string;
  whatsapp: string;
  country?: string;
  destinationCity?: string;
  inquiryId?: string;
  currency?: string;
  terms?: string;
  notes?: string;
  status?: QuotationStatus;
  validUntil?: string;
  incoterms?: string;
  deliveryDays?: number | null;
  shippingCost?: number;
  items: QuotationItemInput[];
}

/** Legacy single-product input */
export interface QuotationDraftInput {
  productName?: string;
  quantity?: string;
  destinationCity?: string;
  companyName: string;
  contactName: string;
  whatsapp: string;
  email?: string;
  message?: string;
  inquiryId?: string;
  /** Natural-language procurement request (multi-product) */
  orderMessage?: string;
}

export interface QuotationLinePreview {
  productName: string;
  productModel: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface QuotationParseResult {
  destinationCity: string;
  incoterms: string;
  deliveryDays: number | null;
  items: QuotationLinePreview[];
  shippingCost: number;
  shippingLabel: string;
  goodsSubtotal: number;
  total: number;
  currency: string;
  extraNotes: string;
}

export interface QuotationDraftResult {
  id: string;
  quotationNo: string;
  pdfUrl: string;
  total: number;
  goodsSubtotal: number;
  shippingCost: number;
  currency: string;
  items: QuotationLinePreview[];
  incoterms: string;
  deliveryDays: number | null;
  destinationCity: string;
  emailSent: boolean;
  whatsAppUrl: string;
}

export const DEFAULT_QUOTATION_TERMS = `Terms & Conditions:
1. Prices are valid for 30 days from the quotation date.
2. Payment terms: 30% deposit, 70% before shipment.
3. Delivery time is subject to stock availability and shipping schedule.
4. All prices exclude shipping, insurance, and customs duties unless stated otherwise.
5. Product specifications are based on manufacturer data; final confirmation required before order.`;

export function buildQuotationTerms(incoterms: string, deliveryDays: number | null): string {
  const lines = [DEFAULT_QUOTATION_TERMS];
  if (incoterms) {
    lines.unshift(`Incoterms: ${incoterms}`);
  }
  if (deliveryDays) {
    lines.unshift(`Requested delivery: within ${deliveryDays} days after order confirmation.`);
  }
  return lines.join("\n");
}
