export type AiMessageRole = "user" | "assistant" | "system";

export type AiIntent =
  | "quote"
  | "inventory"
  | "leadtime"
  | "warehouse"
  | "confirm"
  | "recommend"
  | "supplier"
  | "profit"
  | "upload"
  | "modify"
  | "general";

export type AiConversationPhase = "gathering" | "preview" | "completed";

export interface ConversationProductLine {
  rawText: string;
  productId?: string;
  productName?: string;
  productModel?: string;
  quantity?: number;
  unit?: string;
  unitPrice?: number;
}

export type AiPendingField =
  | "products"
  | "quantity"
  | "country"
  | "port"
  | "destinationCity"
  | "incoterms"
  | "companyName"
  | "contactName"
  | "whatsapp";

export interface StoredProductRecommendation {
  productId: string;
  productName: string;
  productModel: string;
  unitPrice: number;
  reason: string;
}

export interface PendingAmbiguousMatch {
  rawText: string;
  options: Array<{
    productId: string;
    productName: string;
    productModel: string;
    unitPrice: number;
    score: number;
  }>;
}

export interface QuotePreviewLineSummary {
  productName: string;
  productModel: string;
  quantity: number;
  unit: string;
  subtotalUsd: number;
  subtotalIdr: number;
}

export interface QuotePreviewSummary {
  lines: QuotePreviewLineSummary[];
  goodsSubtotalUsd: number;
  shippingUsd: number;
  insuranceUsd: number;
  subtotalUsd: number;
  totalUsd: number;
  goodsSubtotalIdr: number;
  shippingIdr: number;
  insuranceIdr: number;
  subtotalIdr: number;
  totalIdr: number;
  idrRate: number;
  incoterms: string;
  destination: string;
}

export interface AiConversationState {
  products: ConversationProductLine[];
  country: string;
  port: string;
  destinationCity: string;
  incoterms: string;
  deliveryDays: number | null;
  companyName: string;
  contactName: string;
  whatsapp: string;
  email: string;
  phase: AiConversationPhase;
  lastIntent?: AiIntent;
  pendingField?: AiPendingField;
  pendingAmbiguous?: PendingAmbiguousMatch;
  discussedProductIds?: string[];
  lastRecommendations?: StoredProductRecommendation[];
  quotePreview?: QuotePreviewSummary;
  stockWarnings?: string[];
  unmatchedProducts?: string[];
}

export interface AiMessageRecord {
  id: string;
  role: AiMessageRole;
  content: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface AiConversationRecord {
  id: string;
  sessionKey: string;
  locale: string;
  status: "active" | "completed" | "abandoned";
  state: AiConversationState;
  companyName: string;
  contactName: string;
  whatsapp: string;
  email: string;
  country: string;
  port: string;
  destinationCity: string;
  incoterms: string;
  deliveryDays?: number;
  quotationId?: string;
  dealStatus?: string;
  grossProfit?: number;
  createdAt: string;
  updatedAt: string;
  messages?: AiMessageRecord[];
}

export interface ProfitLineSummary {
  productName: string;
  quantity: number;
  purchaseTotal: number;
  sellingTotal: number;
  grossProfit: number;
  marginPercent: number;
}

export interface ProfitAnalysisSummary {
  lines: ProfitLineSummary[];
  totalPurchase: number;
  totalSelling: number;
  shippingCost: number;
  grossProfit: number;
  marginPercent: number;
}

export interface AiAgentReply {
  conversation: AiConversationRecord;
  message: AiMessageRecord;
  pdfUrl?: string;
  whatsAppUrl?: string;
  emailSent?: boolean;
  canConfirm?: boolean;
  canModify?: boolean;
  awaitingField?: AiPendingField;
  profitAnalysis?: ProfitAnalysisSummary;
  quotePreview?: QuotePreviewSummary;
}

export interface AiDashboardStats {
  receptionCount: number;
  quotationCount: number;
  activeSessions: number;
  messageCount: number;
  conversionRate: number;
  avgQuotationAmount: number;
  hotProducts: Array<{ name: string; model: string; count: number }>;
  hotCities: Array<{ city: string; count: number }>;
}

export interface AdminAiConversationSummary {
  id: string;
  sessionKey: string;
  locale: string;
  status: "active" | "completed" | "abandoned";
  companyName: string;
  contactName: string;
  whatsapp: string;
  destinationCity: string;
  messageCount: number;
  quotationId?: string;
  createdAt: string;
  updatedAt: string;
}

export const EMPTY_CONVERSATION_STATE: AiConversationState = {
  products: [],
  country: "",
  port: "",
  destinationCity: "",
  incoterms: "",
  deliveryDays: null,
  companyName: "",
  contactName: "",
  whatsapp: "",
  email: "",
  phase: "gathering",
};

export function parseConversationState(raw: unknown): AiConversationState {
  if (!raw || typeof raw !== "object") {
    return { ...EMPTY_CONVERSATION_STATE };
  }
  const value = raw as Partial<AiConversationState>;
  return {
    products: Array.isArray(value.products) ? value.products : [],
    country: value.country ?? "",
    port: value.port ?? "",
    destinationCity: value.destinationCity ?? "",
    incoterms: value.incoterms ?? "",
    deliveryDays: value.deliveryDays ?? null,
    companyName: value.companyName ?? "",
    contactName: value.contactName ?? "",
    whatsapp: value.whatsapp ?? "",
    email: value.email ?? "",
    phase:
      (value.phase as string) === "confirming"
        ? "preview"
        : (value.phase ?? "gathering"),
    lastIntent: value.lastIntent,
    pendingField: value.pendingField,
    pendingAmbiguous: value.pendingAmbiguous,
    discussedProductIds: Array.isArray(value.discussedProductIds) ? value.discussedProductIds : [],
    lastRecommendations: Array.isArray(value.lastRecommendations) ? value.lastRecommendations : [],
    quotePreview: value.quotePreview,
    stockWarnings: Array.isArray(value.stockWarnings) ? value.stockWarnings : [],
    unmatchedProducts: Array.isArray(value.unmatchedProducts) ? value.unmatchedProducts : [],
  };
}
