import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { z } from "zod";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    z
      .url()
      .catch("https://patent-deadline.vercel.app")
      .parse(
        process.env.NEXT_PUBLIC_APP_URL ?? "https://patent-deadline.vercel.app",
      ),
  ),
  title: "특허 기한 계산기 — OA 대응 기한과 연장 수수료를 한 번에",
  description:
    "OA 발송일을 입력하면 기본 제출 기한과 연장 시나리오별(+1~+6개월) 기한·수수료를 타임라인으로 즉시 계산합니다.",
  openGraph: {
    title: "특허 기한 계산기 — OA 대응 기한과 연장 수수료를 한 번에",
    description:
      "OA 발송일을 입력하면 기본 제출 기한과 연장 시나리오별(+1~+6개월) 기한·수수료를 타임라인으로 즉시 계산합니다.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
