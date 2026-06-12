import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "특허 기한 계산기";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    <div
      style={{
        background: "#0f172a",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px",
        gap: "32px",
      }}
    >
      <div
        style={{
          fontSize: "72px",
          fontWeight: "700",
          color: "#f8fafc",
          textAlign: "center",
          lineHeight: "1.1",
        }}
      >
        특허 기한 계산기
      </div>
      <div
        style={{
          fontSize: "32px",
          color: "#94a3b8",
          textAlign: "center",
          lineHeight: "1.4",
        }}
      >
        OA 발송일만 넣으면 연장 6개월치 기한과 수수료까지 한 번에
      </div>
    </div>,
    { width: 1200, height: 630 },
  );
}
