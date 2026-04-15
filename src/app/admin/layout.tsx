'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type MenuItem = { href: string; label: string; ready: boolean };
type MenuSection = { title: string; items: MenuItem[] };

const menuSections: MenuSection[] = [
  {
    title: '콘텐츠',
    items: [{ href: '/admin/scenarios', label: '시나리오', ready: true }],
  },
  {
    title: '운영',
    items: [
      { href: '/admin/orders', label: '주문', ready: false },
      { href: '/admin/books', label: '책', ready: false },
    ],
  },
];

function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      onLogin();
    } else {
      const data = await res.json();
      setError(data.error || '인증 실패');
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm"
      >
        <h1 className="text-xl font-bold text-gray-900 mb-6 text-center">
          Admin 로그인
        </h1>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="비밀번호"
          className="w-full px-4 py-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-gray-400 text-gray-900"
          autoFocus
        />
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gray-900 text-white py-2 rounded-md hover:bg-gray-800 disabled:opacity-50 transition-colors"
        >
          {loading ? '확인 중...' : '로그인'}
        </button>
      </form>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    fetch('/api/admin/auth/check')
      .then((res) => setAuthed(res.ok))
      .catch(() => setAuthed(false));
  }, []);

  if (authed === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400">로딩 중...</div>
      </div>
    );
  }

  if (!authed) {
    return <AdminLogin onLogin={() => setAuthed(true)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* 사이드바 */}
      <aside className="w-56 bg-white border-r border-gray-200 min-h-screen p-4 flex flex-col">
        <Link
          href="/admin"
          className="text-lg font-bold text-gray-900 mb-1 block"
        >
          moobook admin
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900 mb-8 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-3 h-3"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
          사이트로 돌아가기
        </Link>
        <nav className="flex flex-col gap-6">
          {menuSections.map((section) => (
            <div key={section.title} className="flex flex-col gap-1">
              <div className="px-3 mb-1 text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
                {section.title}
              </div>
              {section.items.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.ready ? item.href : '#'}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-gray-900 text-white'
                        : item.ready
                          ? 'text-gray-700 hover:bg-gray-100'
                          : 'text-gray-400 cursor-not-allowed'
                    }`}
                    onClick={(e) => !item.ready && e.preventDefault()}
                  >
                    {item.label}
                    {!item.ready && (
                      <span className="ml-2 text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                        준비 중
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </aside>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
