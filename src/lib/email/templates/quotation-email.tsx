import { Body, Container, Head, Heading, Hr, Html, Link, Preview, Text } from "@react-email/components";
import type { AdminQuotation } from "@/lib/admin/types";

interface QuotationEmailProps {
  quotation: AdminQuotation;
  pdfUrl: string;
  siteName: string;
}

export default function QuotationEmail({ quotation, pdfUrl, siteName }: QuotationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        {quotation.quotationNo} — {siteName}
      </Preview>
      <Body style={{ backgroundColor: "#f8fafc", fontFamily: "Arial, sans-serif" }}>
        <Container style={{ margin: "0 auto", padding: "24px", maxWidth: "560px" }}>
          <Heading style={{ color: "#0050B5" }}>{siteName} — Official Quotation</Heading>
          <Text>Hello {quotation.contactName},</Text>
          <Text>
            Thank you for your inquiry. Please find your official quotation{" "}
            <strong>{quotation.quotationNo}</strong> below.
          </Text>
          <Text>
            Destination: {quotation.destinationCity || "—"}
            <br />
            Incoterms: {quotation.incoterms || "—"}
            <br />
            Total: {quotation.currency} {quotation.total.toFixed(2)}
          </Text>
          <Link href={pdfUrl} style={{ color: "#0050B5", fontWeight: "bold" }}>
            Download Quotation PDF
          </Link>
          <Hr />
          <Text style={{ color: "#64748b", fontSize: "12px" }}>
            {siteName} — Industrial Procurement for Indonesia
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
