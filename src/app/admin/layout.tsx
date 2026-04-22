"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronLeft,
  Layers,
  Loader2,
  ShoppingBag,
  BookText,
  Wand2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

type MenuItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
  ready: boolean;
};
type MenuSection = { title: string; items: MenuItem[] };

const menuSections: MenuSection[] = [
  {
    title: "콘텐츠",
    items: [
      {
        href: "/admin/scenarios",
        label: "시나리오",
        icon: <Layers className="size-4" />,
        ready: true,
      },
    ],
  },
  {
    title: "실험실",
    items: [
      {
        href: "/admin/face-test",
        label: "얼굴 합성 테스트",
        icon: <Wand2 className="size-4" />,
        ready: true,
      },
    ],
  },
  {
    title: "운영",
    items: [
      {
        href: "/admin/orders",
        label: "주문",
        icon: <ShoppingBag className="size-4" />,
        ready: false,
      },
      {
        href: "/admin/books",
        label: "책",
        icon: <BookText className="size-4" />,
        ready: false,
      },
    ],
  },
];

function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      onLogin();
    } else {
      const data = await res.json();
      setError(data.error || "인증 실패");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-muted/40 flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">moobook admin</CardTitle>
          <CardDescription>관리자 비밀번호를 입력해 주세요.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="admin-password">비밀번호</Label>
              <Input
                id="admin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoFocus
              />
            </div>
            {error && (
              <p className="text-destructive text-sm">{error}</p>
            )}
            <Button type="submit" disabled={loading} className="w-full">
              {loading && <Loader2 className="size-4 animate-spin" />}
              {loading ? "확인 중..." : "로그인"}
            </Button>
          </form>
        </CardContent>
      </Card>
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
    fetch("/api/admin/auth/check")
      .then((res) => setAuthed(res.ok))
      .catch(() => setAuthed(false));
  }, []);

  if (authed === null) {
    return (
      <div className="min-h-screen bg-muted/40 flex items-center justify-center text-muted-foreground gap-2">
        <Loader2 className="size-4 animate-spin" />
        로딩 중...
      </div>
    );
  }

  if (!authed) {
    return <AdminLogin onLogin={() => setAuthed(true)} />;
  }

  return (
    <div className="min-h-screen bg-muted/30 flex">
      <aside className="w-60 bg-sidebar border-r border-sidebar-border min-h-screen flex flex-col">
        <div className="px-5 py-5">
          <Link
            href="/admin"
            className="text-base font-semibold text-sidebar-foreground tracking-tight block"
          >
            moobook
            <span className="ml-1 text-muted-foreground font-normal">
              admin
            </span>
          </Link>
          <Link
            href="/"
            className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="size-3" />
            사이트로 돌아가기
          </Link>
        </div>
        <Separator />
        <nav className="flex flex-col gap-5 p-3">
          {menuSections.map((section) => (
            <div key={section.title} className="flex flex-col gap-1">
              <div className="px-2 mb-1 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
                {section.title}
              </div>
              {section.items.map((item) => {
                const isActive = pathname.startsWith(item.href);
                const content = (
                  <span
                    className={cn(
                      "group flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      isActive
                        ? "bg-sidebar-primary text-sidebar-primary-foreground"
                        : item.ready
                          ? "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                          : "text-muted-foreground/60 cursor-not-allowed"
                    )}
                  >
                    {item.icon}
                    <span className="flex-1">{item.label}</span>
                    {!item.ready && (
                      <span className="text-[10px] uppercase tracking-wider rounded bg-muted text-muted-foreground px-1.5 py-0.5">
                        soon
                      </span>
                    )}
                  </span>
                );

                if (!item.ready) {
                  return <div key={item.href}>{content}</div>;
                }

                return (
                  <Link key={item.href} href={item.href}>
                    {content}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </aside>

      <main className="flex-1 p-8">
        <div className="mx-auto w-full max-w-7xl">{children}</div>
      </main>
      <Toaster richColors closeButton position="top-right" />
    </div>
  );
}
