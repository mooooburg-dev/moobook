"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PhotoUploader from "@/components/PhotoUploader";
import ThemeSelector from "@/components/ThemeSelector";
import CustomKeywordsModal from "@/components/CustomKeywordsModal";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import type { ChildGender, ThemeId } from "@/types";

export default function CreatePage() {
  const router = useRouter();
  const [photo, setPhoto] = useState<File | null>(null);
  const [theme, setTheme] = useState<ThemeId | null>(null);
  const [customKeywords, setCustomKeywords] = useState<
    [string, string, string] | null
  >(null);
  const [customTopic, setCustomTopic] = useState<string | null>(null);
  const [customModalOpen, setCustomModalOpen] = useState(false);
  const [childName, setChildName] = useState("");
  const [childGender, setChildGender] = useState<ChildGender>("boy");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit =
    photo &&
    theme &&
    childName.trim() &&
    (theme !== "custom" || customKeywords !== null);

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
          child_gender: childGender,
          photo_url: photoUrl,
        })
        .select("id")
        .single();

      if (insertError || !book) {
        throw new Error(insertError?.message || "Book 생성 실패");
      }

      // 3. 커스텀 시나리오면 LLM으로 시나리오 생성 후 저장
      if (theme === "custom") {
        if (!customKeywords) throw new Error("키워드가 선택되지 않았습니다.");
        const customRes = await fetch("/api/custom-scenario", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bookId: book.id,
            keywords: customKeywords,
            topic: customTopic,
            childName: childName.trim(),
            childGender,
          }),
        });
        if (!customRes.ok) {
          const customErr = await customRes.json().catch(() => ({}));
          throw new Error(
            customErr.error || "커스텀 시나리오 생성에 실패했습니다."
          );
        }
      }

      // 4. 생성된 bookId로 이동
      router.push(`/create/${book.id}`);
    } catch (err) {
      console.error("생성 실패:", err);
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 page-enter">
      <div className="text-center mb-8">
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

      <div className="mb-10 flex items-center justify-center gap-3 bg-linear-to-r from-brand/10 via-brand-secondary/10 to-brand-blue/10 border border-brand/20 rounded-2xl px-5 py-4">
        <span className="text-2xl" aria-hidden>
          ✨
        </span>
        <div className="text-left">
          <p
            className="text-sm text-text"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            회원가입 없이 바로 미리볼 수 있어요
          </p>
          <p className="text-xs text-text-light mt-0.5">
            결제 전까지 부담 없이 시안을 확인해보세요
          </p>
        </div>
      </div>

      {/* Step 1: 사진 업로드 */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-8 h-8 rounded-full bg-brand text-white flex items-center justify-center text-sm" style={{ fontFamily: "var(--font-heading)" }}>1</span>
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
          <span className="w-8 h-8 rounded-full bg-brand-secondary text-white flex items-center justify-center text-sm" style={{ fontFamily: "var(--font-heading)" }}>2</span>
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
          className="w-full max-w-md mx-auto block px-5 py-3 border-2 border-brand/20 rounded-full text-center text-text bg-white focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition-all"
          style={{ fontFamily: "var(--font-body)" }}
          maxLength={20}
        />
      </section>

      {/* Step 3: 아이 성별 */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-8 h-8 rounded-full bg-brand-pink text-white flex items-center justify-center text-sm" style={{ fontFamily: "var(--font-heading)" }}>3</span>
          <h2
            className="text-lg text-text"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            아이 성별
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
          {([
            { id: "boy" as const, emoji: "👦", label: "남자아이" },
            { id: "girl" as const, emoji: "👧", label: "여자아이" },
          ]).map((opt) => {
            const selected = childGender === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setChildGender(opt.id)}
                className={`flex flex-col items-center gap-2 py-5 rounded-2xl border-2 transition-all bg-white ${
                  selected
                    ? "border-brand ring-2 ring-brand/30 shadow-md"
                    : "border-brand/20 hover:border-brand/50"
                }`}
              >
                <span className="text-4xl">{opt.emoji}</span>
                <span
                  className="text-sm text-text"
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {opt.label}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Step 4: 테마 선택 */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-8 h-8 rounded-full bg-brand-blue text-white flex items-center justify-center text-sm" style={{ fontFamily: "var(--font-heading)" }}>4</span>
          <h2
            className="text-lg text-text"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            테마 선택
          </h2>
        </div>
        <ThemeSelector
          selectedTheme={theme}
          onSelect={(id) => {
            setTheme(id);
            setCustomKeywords(null);
            setCustomTopic(null);
          }}
          onSelectCustom={() => setCustomModalOpen(true)}
          customKeywords={customKeywords}
          customTopic={customTopic}
        />
      </section>

      <CustomKeywordsModal
        open={customModalOpen}
        onClose={() => setCustomModalOpen(false)}
        onSubmit={(kw, topic) => {
          setCustomKeywords(kw);
          setCustomTopic(topic);
          setTheme("custom");
          setCustomModalOpen(false);
        }}
      />

      {/* 에러 메시지 */}
      {error && (
        <p className="text-center text-brand-pink text-sm mb-4">{error}</p>
      )}

      {/* 제출 */}
      <div className="text-center">
        <Button
          size="lg"
          disabled={!canSubmit || isSubmitting}
          onClick={handleSubmit}
        >
          {isSubmitting
            ? theme === "custom"
              ? "✨ 시나리오 만드는 중..."
              : "✨ 동화책 만드는 중..."
            : "📖 동화책 만들기 시작!"}
        </Button>
      </div>
    </div>
  );
}
