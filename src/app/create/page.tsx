"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PhotoUploader from "@/components/PhotoUploader";
import ThemeSelector from "@/components/ThemeSelector";
import Button from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import type { ThemeId } from "@/types";

export default function CreatePage() {
  const router = useRouter();
  const [photo, setPhoto] = useState<File | null>(null);
  const [theme, setTheme] = useState<ThemeId | null>(null);
  const [childName, setChildName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = photo && theme && childName.trim();

  async function handleSubmit() {
    if (!canSubmit || !photo || !theme) return;
    setIsSubmitting(true);
    setError(null);

    try {
      // 1. 사진을 Supabase Storage에 업로드
      const formData = new FormData();
      formData.append("file", photo);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        const uploadErr = await uploadRes.json();
        throw new Error(uploadErr.error || "사진 업로드 실패");
      }

      const { url: photoUrl } = await uploadRes.json();

      // 2. books 테이블에 레코드 생성
      const supabase = createClient();
      const { data: book, error: insertError } = await supabase
        .from("moobook_books")
        .insert({
          status: "pending",
          theme,
          child_name: childName.trim(),
          photo_url: photoUrl,
        })
        .select("id")
        .single();

      if (insertError || !book) {
        throw new Error(insertError?.message || "Book 생성 실패");
      }

      // 3. 생성된 bookId로 이동
      router.push(`/create/${book.id}`);
    } catch (err) {
      console.error("생성 실패:", err);
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 page-enter">
      <div className="text-center mb-10">
        <div className="text-4xl mb-3">🎨</div>
        <h1
          className="text-3xl text-text"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          동화책 만들기
        </h1>
        <p className="text-text-light mt-2">
          아이의 사진과 테마를 선택해주세요
        </p>
      </div>

      {/* Step 1: 사진 업로드 */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm" style={{ fontFamily: "var(--font-heading)" }}>1</span>
          <h2
            className="text-lg text-text"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            아이 사진 업로드
          </h2>
        </div>
        <PhotoUploader onPhotoSelected={setPhoto} />
      </section>

      {/* Step 2: 아이 이름 입력 */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center text-sm" style={{ fontFamily: "var(--font-heading)" }}>2</span>
          <h2
            className="text-lg text-text"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            아이 이름
          </h2>
        </div>
        <input
          type="text"
          value={childName}
          onChange={(e) => setChildName(e.target.value)}
          placeholder="동화 속 주인공 이름을 입력하세요"
          className="w-full max-w-md mx-auto block px-5 py-3 border-2 border-primary/20 rounded-full text-center text-text bg-white focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
          style={{ fontFamily: "var(--font-body)" }}
          maxLength={20}
        />
      </section>

      {/* Step 3: 테마 선택 */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-8 h-8 rounded-full bg-accent-blue text-white flex items-center justify-center text-sm" style={{ fontFamily: "var(--font-heading)" }}>3</span>
          <h2
            className="text-lg text-text"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            테마 선택
          </h2>
        </div>
        <ThemeSelector selectedTheme={theme} onSelect={setTheme} />
      </section>

      {/* 에러 메시지 */}
      {error && (
        <p className="text-center text-accent-pink text-sm mb-4">{error}</p>
      )}

      {/* 제출 */}
      <div className="text-center">
        <Button
          size="lg"
          disabled={!canSubmit || isSubmitting}
          onClick={handleSubmit}
        >
          {isSubmitting ? "✨ 동화책 만드는 중..." : "📖 동화책 만들기 시작!"}
        </Button>
      </div>
    </div>
  );
}
