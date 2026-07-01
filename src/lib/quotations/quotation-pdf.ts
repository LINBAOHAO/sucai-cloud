import { mkdir, writeFile } from "fs/promises";
import path from "path";
import PDFDocument from "pdfkit";
import type { AdminQuotation } from "@/lib/admin/types";
import type { SiteSettings } from "@/lib/settings/settings-repository";

interface GenerateQuotationPdfOptions {
  quotation: AdminQuotation;
  settings: SiteSettings;
}

function formatMoney(amount: number, currency: string): string {
  return `${currency} ${amount.toFixed(2)}`;
}

async function fetchLogoBuffer(logo: string): Promise<Buffer | null> {
  if (!logo.startsWith("http://") && !logo.startsWith("https://")) {
    return null;
  }

  try {
    const response = await fetch(logo);
    if (!response.ok) {
      return null;
    }
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch {
    return null;
  }
}

export async function generateQuotationPdf(
  options: GenerateQuotationPdfOptions,
): Promise<string> {
  const { quotation, settings } = options;
  const outputDir = path.join(process.cwd(), "public", "quotations");
  await mkdir(outputDir, { recursive: true });

  const fileName = `${quotation.quotationNo}.pdf`;
  const filePath = path.join(outputDir, fileName);

  const doc = new PDFDocument({ margin: 50, size: "A4" });
  const chunks: Buffer[] = [];

  doc.on("data", (chunk: Buffer) => chunks.push(chunk));

  const pdfFinished = new Promise<void>((resolve, reject) => {
    doc.on("end", () => resolve());
    doc.on("error", reject);
  });

  const logoBuffer = await fetchLogoBuffer(settings.logo);

  doc.fontSize(20).fillColor("#0050B5").text(settings.siteName, { align: "left" });
  if (logoBuffer) {
    doc.image(logoBuffer, 450, 45, { width: 80 });
  } else if (settings.logo.trim()) {
    doc.fontSize(28).fillColor("#0050B5").text(settings.logo, 450, 50, { width: 100, align: "right" });
  }

  doc.moveDown(0.5);
  doc.fontSize(10).fillColor("#64748b").text(settings.address || "");
  doc.text(`Email: ${settings.contactEmail}`);
  if (settings.whatsapp) {
    doc.text(`WhatsApp: ${settings.whatsapp}`);
  }

  doc.moveDown(1.5);
  doc.fontSize(18).fillColor("#0f172a").text("QUOTATION", { align: "center" });
  doc.moveDown(0.5);
  doc.fontSize(10).fillColor("#334155");
  doc.text(`Quotation No: ${quotation.quotationNo}`);
  doc.text(`Date: ${new Date(quotation.createdAt).toLocaleDateString("en-GB")}`);
  if (quotation.validUntil) {
    doc.text(`Valid Until: ${new Date(quotation.validUntil).toLocaleDateString("en-GB")}`);
  }

  doc.moveDown(1);
  doc.fontSize(12).fillColor("#0f172a").text("Customer Information");
  doc.moveDown(0.3);
  doc.fontSize(10).fillColor("#334155");
  doc.text(`Company: ${quotation.companyName}`);
  doc.text(`Contact: ${quotation.contactName}`);
  doc.text(`WhatsApp: ${quotation.whatsapp}`);
  if (quotation.email) {
    doc.text(`Email: ${quotation.email}`);
  }
  doc.text(`Country: ${quotation.country}`);
  if (quotation.destinationCity) {
    doc.text(`Destination City: ${quotation.destinationCity}`);
  }
  if (quotation.incoterms) {
    doc.text(`Incoterms: ${quotation.incoterms}`);
  }
  if (quotation.deliveryDays) {
    doc.text(`Delivery: within ${quotation.deliveryDays} days`);
  }

  doc.moveDown(1);
  doc.fontSize(12).fillColor("#0f172a").text("Items");

  const tableTop = doc.y + 8;
  const colX = [50, 220, 300, 360, 430, 500];

  doc.fontSize(9).fillColor("#64748b");
  doc.text("Product", colX[0], tableTop);
  doc.text("Model", colX[1], tableTop);
  doc.text("Qty", colX[2], tableTop);
  doc.text("Unit Price", colX[3], tableTop);
  doc.text("Subtotal", colX[4], tableTop);

  let rowY = tableTop + 16;
  doc.fontSize(9).fillColor("#0f172a");

  for (const item of quotation.items) {
    doc.text(item.productName.slice(0, 28), colX[0], rowY, { width: 160 });
    doc.text(item.productModel.slice(0, 16), colX[1], rowY, { width: 70 });
    doc.text(String(item.quantity), colX[2], rowY);
    doc.text(formatMoney(item.unitPrice, quotation.currency), colX[3], rowY);
    doc.text(formatMoney(item.subtotal, quotation.currency), colX[4], rowY);
    rowY += 18;
  }

  doc.moveDown(2);
  doc.y = Math.max(doc.y, rowY + 10);
  doc.fontSize(11).fillColor("#0f172a");
  doc.text(`Goods Subtotal: ${formatMoney(quotation.subtotal, quotation.currency)}`, {
    align: "right",
  });
  if (quotation.shippingCost > 0) {
    doc.text(
      `Shipping (${quotation.incoterms || "CIF"}): ${formatMoney(quotation.shippingCost, quotation.currency)}`,
      { align: "right" },
    );
  }
  doc.fontSize(13).fillColor("#0050B5");
  doc.text(`Total: ${formatMoney(quotation.total, quotation.currency)}`, { align: "right" });

  if (quotation.notes.trim()) {
    doc.moveDown(1);
    doc.fontSize(11).fillColor("#0f172a").text("Notes");
    doc.fontSize(9).fillColor("#334155").text(quotation.notes);
  }

  doc.moveDown(1.5);
  doc.fontSize(11).fillColor("#0f172a").text("Terms & Conditions");
  doc.moveDown(0.3);
  doc.fontSize(8).fillColor("#475569").text(quotation.terms || "", {
    align: "left",
    lineGap: 2,
  });

  doc.moveDown(2);
  const signatureY = doc.y + 40;
  doc.moveTo(50, signatureY).lineTo(250, signatureY).strokeColor("#94a3b8").stroke();
  doc.fontSize(9).fillColor("#64748b").text("Authorized Signature", 50, signatureY + 6);
  doc.text(settings.siteName, 50, signatureY + 20);

  doc.end();
  await pdfFinished;

  const pdfBuffer = Buffer.concat(chunks);
  await writeFile(filePath, pdfBuffer);

  return `/quotations/${fileName}`;
}
