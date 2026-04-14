import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader, SiteFooter } from "@/components/SiteChrome";

export const metadata: Metadata = {
  title: "무북 - 우리 아이가 주인공인 동화책",
  description:
    "AI가 만드는 맞춤형 동화책. 아이의 사진 한 장으로 세상에 하나뿐인 동화책을 만들어 보세요!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body
        className="min-h-full flex flex-col bg-cream text-text"
        style={{ fontFamily: "var(--font-body)" }}
      >
        <SiteHeader />
        <main className="flex-1 page-enter">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
