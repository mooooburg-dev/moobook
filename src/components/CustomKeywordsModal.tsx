"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface CustomKeywordsModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (keywords: [string, string, string]) => void;
}

const KEYWORD_PATTERN = /^[가-힣a-zA-Z0-9\s]{1,12}$/;
const PLACEHOLDERS: [string, string, string] = ["사자", "무지개", "사탕"];

export default function CustomKeywordsModal({
  open,
  onClose,
  onSubmit,
}: CustomKeywordsModalProps) {
  const [values, setValues] = useState<[string, string, string]>(["", "", ""]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const updateValue = (idx: 0 | 1 | 2, value: string) => {
    const next = [...values] as [string, string, string];
    next[idx] = value;
    setValues(next);
    setError(null);
  };

  const handleSubmit = () => {
    const trimmed = values.map((v) => v.trim()) as [string, string, string];
    if (trimmed.some((v) => !v)) {
      setError("키워드 3개를 모두 입력해주세요.");
      return;
    }
    if (trimmed.some((v) => !KEYWORD_PATTERN.test(v))) {
      setError("각 키워드는 1~12자의 한글/영문/숫자만 가능합니다.");
      return;
    }
    onSubmit(trimmed);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-40 overflow-hidden sm:rounded-t-3xl rounded-t-3xl bg-gradient-to-br from-brand/20 to-brand-secondary/20 flex items-center justify-center">
          <div className="text-6xl">✨</div>
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-md flex items-center justify-center text-text-light text-xl"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>

        <div className="p-6 sm:p-8 space-y-5">
          <div>
            <h2
              className="text-2xl text-text"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              우리 아이만의 동화 만들기
            </h2>
            <p className="mt-2 text-sm text-text-light">
              아이가 좋아하는 것 3가지를 알려주세요. AI가 이 키워드들을 엮어 세상에 단 하나뿐인 동화를 만들어드려요.
            </p>
          </div>

          <div className="space-y-3">
            {[0, 1, 2].map((idx) => (
              <div key={idx}>
                <label className="text-xs text-text-light block mb-1">
                  키워드 {idx + 1}
                </label>
                <input
                  type="text"
                  value={values[idx]}
                  onChange={(e) =>
                    updateValue(idx as 0 | 1 | 2, e.target.value)
                  }
                  placeholder={PLACEHOLDERS[idx]}
                  maxLength={12}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-base outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                />
              </div>
            ))}
          </div>

          {error && (
            <div className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
            >
              취소
            </Button>
            <Button
              type="button"
              className="flex-1"
              onClick={handleSubmit}
            >
              이 키워드로 만들기
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
