import type { ShipLocation, StockStatus } from "@/lib/product-types";

export interface AdminProductImage {
  id: string;
  url: string;
  alt: string | null;
  sortOrder: number;
}

export interface AdminProduct {
  id: string;
  slug: string;
  sku: string;
  name: string;
  categoryId: string;
  brandId: string;
  model: string;
  moq: number;
  stockStatus: StockStatus;
  location: ShipLocation;
  price: number;
  hotScore: number;
  sortOrder: number;
  updatedAt: string;
  imageCount: number;
  images: AdminProductImage[];
}

export interface AdminCategory {
  id: string;
  name: string;
  icon: string;
  sortOrder: number;
}

export interface AdminBrand {
  id: string;
  name: string;
  color: string;
}

export interface AdminSupplier {
  id: string;
  companyName: string;
  contactName: string;
  whatsapp: string;
  email: string;
  address: string;
  city: string;
  country: string;
  paymentTerms: string;
  leadTime: number;
  rating: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminSupplierProduct {
  supplierId: string;
  productId: string;
  supplierName?: string;
  purchasePrice: number;
  moq: number;
  stock: number;
  leadTime: number;
  preferred: boolean;
}

export interface AdminSettings {
  siteName: string;
  logo: string;
  contactEmail: string;
  whatsapp: string;
  address: string;
}

export type InquiryStatus = "pending" | "contacted" | "quoted" | "completed" | "closed";

export interface AdminInquiry {
  id: string;
  submittedAt: string;
  companyName: string;
  contactName: string;
  email: string;
  whatsapp: string;
  country: string;
  productName: string;
  productModel: string;
  quantity: string;
  notes: string;
  productSlug?: string;
  source: "product" | "contact";
  status: InquiryStatus;
  customerId?: string;
}

export interface DashboardStats {
  productCount: number;
  categoryCount: number;
  brandCount: number;
  orderCount: number;
  todayInquiries: number;
  monthInquiries: number;
}

export type QuotationStatus = "draft" | "sent" | "accepted" | "rejected" | "expired";

export interface AdminQuotationItem {
  id: string;
  productId?: string;
  productName: string;
  productModel: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  sortOrder: number;
}

export interface AdminQuotation {
  id: string;
  quotationNo: string;
  companyName: string;
  contactName: string;
  email: string;
  whatsapp: string;
  country: string;
  destinationCity: string;
  inquiryId?: string;
  customerId?: string;
  subtotal: number;
  total: number;
  currency: string;
  terms: string;
  notes: string;
  status: QuotationStatus;
  incoterms: string;
  deliveryDays?: number;
  shippingCost: number;
  validUntil?: string;
  pdfPath: string;
  pdfUrl: string;
  parentId?: string;
  revision: number;
  createdAt: string;
  updatedAt: string;
  items: AdminQuotationItem[];
}

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "completed"
  | "cancelled";

export type PaymentStatus = "unpaid" | "partial" | "paid" | "refunded";

export interface AdminOrderItem {
  id: string;
  orderId: string;
  productId?: string;
  productName: string;
  quantity: number;
  purchasePrice: number;
  sellingPrice: number;
  subtotal: number;
}

export interface AdminOrder {
  id: string;
  orderNo: string;
  customerId: string;
  customerName?: string;
  quotationId?: string;
  supplierId?: string;
  supplierName?: string;
  subtotal: number;
  shippingCost: number;
  total: number;
  currency: string;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  trackingNo: string;
  shippingMethod: string;
  eta?: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  items: AdminOrderItem[];
}

export interface AdminCustomer {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  whatsapp: string;
  phone: string;
  country: string;
  city: string;
  address: string;
  taxNumber?: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminCustomerDetail extends AdminCustomer {
  inquiries: AdminInquiry[];
  quotations: AdminQuotation[];
  orders: AdminOrder[];
  totalRevenue: number;
  currency: string;
}
