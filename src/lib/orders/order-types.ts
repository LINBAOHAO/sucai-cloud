import type { OrderStatus, PaymentStatus } from "@/lib/admin/types";

export type OrderItemWriteInput = {
  productId?: string;
  productName?: string;
  quantity: number;
  purchasePrice?: number;
  sellingPrice: number;
};

export type OrderWriteInput = {
  customerId: string;
  quotationId?: string;
  supplierId?: string;
  subtotal: number;
  shippingCost?: number;
  total: number;
  currency?: string;
  paymentStatus?: PaymentStatus;
  orderStatus?: OrderStatus;
  trackingNo?: string;
  shippingMethod?: string;
  eta?: string;
  notes?: string;
  items?: OrderItemWriteInput[];
};

export type OrderUpdateInput = Partial<
  Omit<OrderWriteInput, "customerId" | "quotationId" | "items">
>;

export const ORDER_STATUS_FLOW: OrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "completed",
  "cancelled",
];

export const PAYMENT_STATUSES: PaymentStatus[] = ["unpaid", "partial", "paid", "refunded"];

export const SHIPPING_METHODS = [
  "Sea Freight",
  "Air Freight",
  "Express Courier",
  "Local Delivery",
  "Customer Pickup",
] as const;
