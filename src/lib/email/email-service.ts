import { render } from "@react-email/render";
import { Resend } from "resend";
import type { AdminInquiry } from "@/lib/admin/types";
import InquiryEmail from "@/lib/email/templates/inquiry-email";
import QuotationEmail from "@/lib/email/templates/quotation-email";
import type { AdminQuotation } from "@/lib/admin/types";

export type SendInquiryEmailResult = {
  ok: boolean;
  error?: string;
};

export function isEmailConfigured(): boolean {
  return Boolean(
    process.env.RESEND_API_KEY?.trim() &&
      process.env.FROM_EMAIL?.trim() &&
      process.env.ADMIN_EMAIL?.trim(),
  );
}

function buildSubject(inquiry: AdminInquiry): string {
  const sourceLabel = inquiry.source === "product" ? "产品询价" : "联系表单";
  return `[速采云] 新${sourceLabel} - ${inquiry.companyName}`;
}

export async function sendInquiryNotification(
  inquiry: AdminInquiry,
): Promise<SendInquiryEmailResult> {
  if (!isEmailConfigured()) {
    console.warn("[email] Resend is not configured; skipping inquiry notification", {
      inquiryId: inquiry.id,
    });
    return { ok: false, error: "Email not configured" };
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const html = await render(InquiryEmail({ inquiry }));

    const { error } = await resend.emails.send({
      from: process.env.FROM_EMAIL!,
      to: process.env.ADMIN_EMAIL!,
      subject: buildSubject(inquiry),
      html,
    });

    if (error) {
      console.error("[email] Resend API error:", {
        inquiryId: inquiry.id,
        message: error.message,
        name: error.name,
      });
      return { ok: false, error: error.message };
    }

    console.info("[email] Inquiry notification sent", {
      inquiryId: inquiry.id,
      to: process.env.ADMIN_EMAIL,
    });
    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown email error";
    console.error("[email] Failed to send inquiry notification:", {
      inquiryId: inquiry.id,
      message,
    });
    return { ok: false, error: message };
  }
}

/** Fire-and-forget wrapper — never throws; logs failures only. */
export function notifyInquiryCreated(inquiry: AdminInquiry): void {
  void sendInquiryNotification(inquiry).then((result) => {
    if (!result.ok && result.error !== "Email not configured") {
      console.error("[email] notifyInquiryCreated failed:", {
        inquiryId: inquiry.id,
        error: result.error,
      });
    }
  });
}

export async function sendQuotationToCustomer(options: {
  quotation: AdminQuotation;
  recipientEmail: string;
  pdfBuffer: Buffer;
  pdfUrl: string;
}): Promise<SendInquiryEmailResult> {
  if (!isEmailConfigured()) {
    return { ok: false, error: "Email not configured" };
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const html = await render(
      QuotationEmail({
        quotation: options.quotation,
        pdfUrl: options.pdfUrl,
        siteName: "SuCai Cloud",
      }),
    );

    const { error } = await resend.emails.send({
      from: process.env.FROM_EMAIL!,
      to: options.recipientEmail,
      subject: `[SuCai Cloud] Quotation ${options.quotation.quotationNo}`,
      html,
      attachments: [
        {
          filename: `${options.quotation.quotationNo}.pdf`,
          content: options.pdfBuffer.toString("base64"),
        },
      ],
    });

    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown email error";
    return { ok: false, error: message };
  }
}
