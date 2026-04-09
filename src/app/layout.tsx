import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-gray-900">
        <header className="border-b border-gray-100">
          <nav className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
            <a href="/" className="text-xl font-extrabold text-violet-600">
              무북
            </a>
            <a
              href="/create"
              className="text-sm font-medium text-gray-600 hover:text-violet-600 transition-colors"
            >
              만들기
            </a>
          </nav>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t border-gray-100 py-8">
          <div className="max-w-5xl mx-auto px-4 text-center text-xs text-gray-400">
            &copy; 2026 무북(moobook). All rights reserved.
          </div>
        </footer>
      </body>
    </html>
  );
}
