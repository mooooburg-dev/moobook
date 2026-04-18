'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

function Logo() {
  return (
    <Link
      href="/"
      className="group flex items-center gap-2 text-xl text-brand hover:opacity-90 transition-opacity"
      style={{ fontFamily: 'var(--font-heading)' }}
    >
      <span className="relative inline-flex items-center justify-center w-9 h-9 rounded-full bg-linear-to-br from-brand to-brand-pink shadow-[0_2px_8px_rgba(255,140,66,0.35)] group-hover:-rotate-6 transition-transform duration-300">
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
          className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-brand-secondary animate-twinkle"
          aria-hidden="true"
        />
      </span>
      <span className="leading-none tracking-tight">
        무<span className="text-brand-pink">북</span>
      </span>
    </Link>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  if (pathname?.startsWith('/admin')) return null;

  return (
    <header className="bg-cream/80 backdrop-blur-sm sticky top-0 z-50 border-b border-brand/10">
      <nav className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Logo />
        <Link
          href="/create"
          className="group inline-flex items-center gap-1.5 text-sm font-bold text-white bg-linear-to-br from-brand to-brand-pink px-4 py-2 rounded-full shadow-[0_4px_12px_rgba(255,140,66,0.35)] hover:shadow-[0_6px_16px_rgba(255,140,66,0.45)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
        >
          <span className="group-hover:rotate-12 transition-transform duration-300">
            ✨
          </span>
          <span>만들기</span>
        </Link>
      </nav>
    </header>
  );
}

export function SiteFooter() {
  const pathname = usePathname();
  if (pathname?.startsWith('/admin')) return null;

  return (
    <footer className="bg-peach py-10 mt-auto">
      <div className="max-w-5xl mx-auto px-4 text-center">
        <div className="flex justify-center mb-3">
          <Logo />
        </div>
        <p className="text-xs text-text-lighter">
          &copy; 2026 무북(moobook). 아이들의 꿈을 동화책으로 만듭니다.
        </p>
        <div className="mt-4 flex justify-center">
          <Link
            href="/admin"
            aria-label="관리자"
            className="w-7 h-7 rounded-full flex items-center justify-center text-text-lighter/50 hover:text-text-light hover:bg-white/60 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-3.5 h-3.5"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </Link>
        </div>
      </div>
    </footer>
  );
}
