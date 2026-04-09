import type { Metadata } from "next";
import "./globals.css";

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
        <header className="bg-cream/80 backdrop-blur-sm sticky top-0 z-50 border-b border-primary/10">
          <nav className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
            <a
              href="/"
              className="flex items-center gap-1.5 text-xl text-primary hover:opacity-80 transition-opacity"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              <span className="text-2xl">📖</span>
              <span>무북</span>
            </a>
            <a
              href="/create"
              className="text-sm font-semibold text-text-light hover:text-primary transition-colors px-4 py-2 rounded-full hover:bg-peach"
            >
              만들기
            </a>
          </nav>
        </header>

        <main className="flex-1 page-enter">{children}</main>

        <footer className="bg-peach py-10 mt-auto">
          <div className="max-w-5xl mx-auto px-4 text-center">
            <p
              className="text-primary text-lg mb-2"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              📖 무북
            </p>
            <p className="text-xs text-text-lighter">
              &copy; 2026 무북(moobook). 아이들의 꿈을 동화책으로 만듭니다.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
