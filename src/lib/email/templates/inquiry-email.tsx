import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type { AdminInquiry } from "@/lib/admin/types";

export type InquiryEmailProps = {
  inquiry: AdminInquiry;
};

function formatSubmittedAt(iso: string): string {
  return new Date(iso).toLocaleString("zh-CN", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <Section style={fieldRow}>
      <Text style={fieldLabel}>{label}</Text>
      <Text style={fieldValue}>{value || "—"}</Text>
    </Section>
  );
}

export default function InquiryEmail({ inquiry }: InquiryEmailProps) {
  const sourceLabel = inquiry.source === "product" ? "产品询价" : "联系表单";
  const preview = `新${sourceLabel}：${inquiry.companyName} · ${inquiry.contactName}`;

  return (
    <Html lang="zh-CN">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>速采云 · 新询价通知</Heading>
          <Text style={subheading}>
            来源：{sourceLabel} · Inquiry ID: {inquiry.id}
          </Text>
          <Hr style={hr} />
          <FieldRow label="客户姓名" value={inquiry.contactName} />
          <FieldRow label="公司名称" value={inquiry.companyName} />
          <FieldRow label="邮箱" value={inquiry.email} />
          <FieldRow label="电话 / WhatsApp" value={inquiry.whatsapp} />
          <FieldRow label="国家" value={inquiry.country} />
          <FieldRow label="产品名称" value={inquiry.productName || (inquiry.source === "contact" ? "联系我们" : "—")} />
          <FieldRow label="留言" value={inquiry.notes} />
          <FieldRow label="提交时间" value={formatSubmittedAt(inquiry.submittedAt)} />
          <Hr style={hr} />
          <Text style={footer}>此邮件由速采云系统自动发送，请勿直接回复。</Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "32px 24px",
  borderRadius: "8px",
  maxWidth: "560px",
};

const heading = {
  color: "#0f172a",
  fontSize: "22px",
  fontWeight: "700",
  lineHeight: "1.3",
  margin: "0 0 8px",
};

const subheading = {
  color: "#64748b",
  fontSize: "13px",
  lineHeight: "1.5",
  margin: "0 0 16px",
};

const hr = {
  borderColor: "#e2e8f0",
  margin: "20px 0",
};

const fieldRow = {
  margin: "0 0 12px",
};

const fieldLabel = {
  color: "#64748b",
  fontSize: "12px",
  fontWeight: "600",
  letterSpacing: "0.02em",
  margin: "0 0 4px",
  textTransform: "uppercase" as const,
};

const fieldValue = {
  color: "#0f172a",
  fontSize: "15px",
  lineHeight: "1.5",
  margin: "0",
  whiteSpace: "pre-wrap" as const,
};

const footer = {
  color: "#94a3b8",
  fontSize: "12px",
  lineHeight: "1.5",
  margin: "0",
};
