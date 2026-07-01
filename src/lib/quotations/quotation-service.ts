import { readFile } from "fs/promises";
import path from "path";
import { getWhatsAppUrl } from "@/lib/contact-config";
import {
  createQuotation,
  calculateItemSubtotal,
  updateQuotationStatus,
} from "@/lib/quotations/quotation-repository";
import { parseProcurementMessage } from "@/lib/quotations/procurement-parser";
import { matchProductByText, matchProductsByText } from "@/lib/quotations/product-matcher";
import {
  buildQuotationTerms,
  type QuotationDraftInput,
  type QuotationDraftResult,
  type QuotationParseResult,
} from "@/lib/quotations/quotation-types";
import {
  buildShippingLineLabel,
  calculateShippingCost,
} from "@/lib/quotations/shipping-service";
import { sendQuotationToCustomer } from "@/lib/email/email-service";
import { getSiteSettings } from "@/lib/settings/settings-repository";

function parseQuantity(input: string): number {
  const match = input.match(/\d+/);
  return match ? Math.max(1, Number.parseInt(match[0], 10)) : 1;
}

function buildNotes(
  destinationCity: string,
  incoterms: string,
  deliveryDays: number | null,
  extraNotes: string,
): string {
  const lines: string[] = [];
  if (destinationCity) {
    lines.push(`Destination: ${destinationCity}`);
  }
  if (incoterms) {
    lines.push(`Incoterms: ${incoterms}`);
  }
  if (deliveryDays) {
    lines.push(`Delivery: within ${deliveryDays} days`);
  }
  if (extraNotes.trim()) {
    lines.push("", extraNotes.trim());
  }
  return lines.join("\n");
}

export async function parseProcurementRequest(message: string): Promise<QuotationParseResult> {
  const parsed = parseProcurementMessage(message);
  if (parsed.productLines.length === 0) {
    throw new Error("No products detected. Use format: Brand Model × quantity");
  }

  const matched = await matchProductsByText(parsed.productLines);
  const items = matched.map(({ product, quantity }) => ({
    productName: product.name,
    productModel: product.model,
    quantity,
    unitPrice: product.price,
    subtotal: calculateItemSubtotal(quantity, product.price),
  }));

  const goodsSubtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const shippingCost = calculateShippingCost(
    parsed.destinationCity,
    items,
    parsed.incoterms || "CIF",
  );

  return {
    destinationCity: parsed.destinationCity,
    incoterms: parsed.incoterms || "CIF",
    deliveryDays: parsed.deliveryDays,
    items,
    shippingCost,
    shippingLabel: buildShippingLineLabel(parsed.destinationCity, parsed.incoterms || "CIF"),
    goodsSubtotal: Math.round(goodsSubtotal * 100) / 100,
    total: Math.round((goodsSubtotal + shippingCost) * 100) / 100,
    currency: "USD",
    extraNotes: parsed.extraNotes,
  };
}

async function createFromParsedPreview(
  preview: QuotationParseResult,
  customer: {
    companyName: string;
    contactName: string;
    whatsapp: string;
    email?: string;
    inquiryId?: string;
  },
  matchedProducts: Array<{ product: { id: string; name: string; model: string; price: number }; quantity: number }>,
): Promise<QuotationDraftResult> {
  const quotation = await createQuotation({
    companyName: customer.companyName,
    contactName: customer.contactName,
    whatsapp: customer.whatsapp,
    email: customer.email,
    country: "Indonesia",
    destinationCity: preview.destinationCity,
    inquiryId: customer.inquiryId,
    incoterms: preview.incoterms,
    deliveryDays: preview.deliveryDays,
    shippingCost: preview.shippingCost,
    notes: buildNotes(
      preview.destinationCity,
      preview.incoterms,
      preview.deliveryDays,
      preview.extraNotes,
    ),
    terms: buildQuotationTerms(preview.incoterms, preview.deliveryDays),
    status: "draft",
    items: matchedProducts.map(({ product, quantity }) => ({
      productId: product.id,
      productName: product.name,
      productModel: product.model,
      quantity,
      unitPrice: product.price,
    })),
  });

  const settings = await getSiteSettings();
  const siteOrigin = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sucaicloud.com";
  const pdfAbsoluteUrl = `${siteOrigin}${quotation.pdfUrl}`;

  let emailSent = false;
  if (customer.email?.trim()) {
    const pdfPath = path.join(
      process.cwd(),
      "public",
      "quotations",
      `${quotation.quotationNo}.pdf`,
    );
    try {
      const pdfBuffer = await readFile(pdfPath);
      const result = await sendQuotationToCustomer({
        quotation,
        recipientEmail: customer.email.trim(),
        pdfBuffer,
        pdfUrl: pdfAbsoluteUrl,
      });
      emailSent = result.ok;
    } catch {
      emailSent = false;
    }
  }

  await updateQuotationStatus(quotation.id, "sent");

  const whatsAppMessage = [
    `Halo ${customer.contactName},`,
    "",
    `Berikut penawaran resmi ${quotation.quotationNo} dari ${settings.siteName}.`,
    `Total: ${quotation.currency} ${quotation.total.toFixed(2)} (${preview.incoterms} → ${preview.destinationCity})`,
    `PDF: ${pdfAbsoluteUrl}`,
  ].join("\n");

  const whatsAppUrl = getWhatsAppUrl(customer.whatsapp, whatsAppMessage);

  return {
    id: quotation.id,
    quotationNo: quotation.quotationNo,
    pdfUrl: quotation.pdfUrl,
    total: quotation.total,
    goodsSubtotal: quotation.subtotal,
    shippingCost: quotation.shippingCost,
    currency: quotation.currency,
    items: preview.items,
    incoterms: preview.incoterms,
    deliveryDays: preview.deliveryDays,
    destinationCity: preview.destinationCity,
    emailSent,
    whatsAppUrl,
  };
}

export async function createQuotationDraftFromAssistant(
  input: QuotationDraftInput,
): Promise<QuotationDraftResult> {
  if (input.orderMessage?.trim()) {
    const preview = await parseProcurementRequest(input.orderMessage);
    const parsed = parseProcurementMessage(input.orderMessage);
    const matched = await matchProductsByText(parsed.productLines);

    return createFromParsedPreview(preview, {
      companyName: input.companyName,
      contactName: input.contactName,
      whatsapp: input.whatsapp,
      email: input.email,
      inquiryId: input.inquiryId,
    }, matched.map(({ product, quantity }) => ({ product, quantity })));
  }

  if (!input.productName?.trim() || !input.quantity?.trim()) {
    throw new Error("Missing product information");
  }

  const quantity = parseQuantity(input.quantity);
  const product = await matchProductByText(input.productName);
  if (!product) {
    throw new Error(`Product not found: ${input.productName}`);
  }

  const preview: QuotationParseResult = {
    destinationCity: input.destinationCity ?? "",
    incoterms: "CIF",
    deliveryDays: null,
    items: [
      {
        productName: product.name,
        productModel: product.model,
        quantity,
        unitPrice: product.price,
        subtotal: calculateItemSubtotal(quantity, product.price),
      },
    ],
    shippingCost: calculateShippingCost(
      input.destinationCity ?? "",
      [{ quantity, unitPrice: product.price }],
      "CIF",
    ),
    shippingLabel: buildShippingLineLabel(input.destinationCity ?? "", "CIF"),
    goodsSubtotal: calculateItemSubtotal(quantity, product.price),
    total:
      calculateItemSubtotal(quantity, product.price) +
      calculateShippingCost(
        input.destinationCity ?? "",
        [{ quantity, unitPrice: product.price }],
        "CIF",
      ),
    currency: "USD",
    extraNotes: input.message ?? "",
  };

  return createFromParsedPreview(
    preview,
    {
      companyName: input.companyName,
      contactName: input.contactName,
      whatsapp: input.whatsapp,
      email: input.email,
      inquiryId: input.inquiryId,
    },
    [{ product, quantity }],
  );
}
