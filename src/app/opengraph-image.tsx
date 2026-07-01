import { ImageResponse } from "next/og";

export const alt = "速采云 SuCai Cloud";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 45%, #431407 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 96,
            height: 96,
            borderRadius: 24,
            background: "linear-gradient(135deg, #f97316 0%, #fbbf24 100%)",
            fontSize: 42,
            fontWeight: 700,
            marginBottom: 32,
          }}
        >
          SC
        </div>
        <div style={{ fontSize: 64, fontWeight: 700, marginBottom: 16 }}>速采云 SuCai Cloud</div>
        <div style={{ fontSize: 28, color: "#fdba74", maxWidth: 900, textAlign: "center" }}>
          B2B Industrial Supplies Procurement Platform
        </div>
      </div>
    ),
    size,
  );
}
