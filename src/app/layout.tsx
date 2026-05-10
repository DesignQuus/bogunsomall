import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TRPCProvider } from "@/providers/TRPCProvider";
import { LegacyProviders } from "@/providers/LegacyProviders";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "보건소플러스 — 보건소 명함·인쇄 전문 플랫폼",
  description: "전국 보건소 담당자를 위한 명함·인쇄물 주문 전문 플랫폼",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <TRPCProvider>
          <LegacyProviders>{children}</LegacyProviders>
        </TRPCProvider>
      </body>
    </html>
  );
}
