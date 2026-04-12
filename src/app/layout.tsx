import type { Metadata } from "next";
import Link from "next/link";
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
            <Link
              href="/"
              className="group flex items-center gap-2 text-xl text-primary hover:opacity-90 transition-opacity"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              <span className="relative inline-flex items-center justify-center w-9 h-9 rounded-full bg-linear-to-br from-primary to-accent-pink shadow-[0_2px_8px_rgba(255,140,66,0.35)] group-hover:-rotate-6 transition-transform duration-300">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="w-5 h-5 text-white"
                  aria-hidden="true"
                >
                  <path
                    d="M3 5.5C3 4.67 3.67 4 4.5 4H10a2 2 0 0 1 2 2v13a1.5 1.5 0 0 0-1.5-1.5H4.5A1.5 1.5 0 0 1 3 16V5.5Z"
                    fill="currentColor"
                    fillOpacity="0.95"
                  />
                  <path
                    d="M21 5.5C21 4.67 20.33 4 19.5 4H14a2 2 0 0 0-2 2v13a1.5 1.5 0 0 1 1.5-1.5h6A1.5 1.5 0 0 0 21 16V5.5Z"
                    fill="currentColor"
                    fillOpacity="0.8"
                  />
                </svg>
                <span
                  className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-secondary animate-twinkle"
                  aria-hidden="true"
                />
              </span>
              <span className="leading-none tracking-tight">
                무<span className="text-accent-pink">북</span>
              </span>
            </Link>
            <Link
              href="/create"
              className="group inline-flex items-center gap-1.5 text-sm font-bold text-white bg-linear-to-br from-primary to-accent-pink px-4 py-2 rounded-full shadow-[0_4px_12px_rgba(255,140,66,0.35)] hover:shadow-[0_6px_16px_rgba(255,140,66,0.45)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
            >
              <span className="group-hover:rotate-12 transition-transform duration-300">✨</span>
              <span>만들기</span>
            </Link>
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
