"use client";

import { useCallback, useState } from "react";
import { validateFacePhoto } from "@/lib/utils/face-detection";
import Button from "@/components/ui/Button";

interface PhotoUploaderProps {
  onPhotoSelected: (file: File) => void;
}

export default function PhotoUploader({ onPhotoSelected }: PhotoUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setError(null);
      setIsValidating(true);

      const result = await validateFacePhoto(file);

      if (!result.valid) {
        setError(result.message);
        setIsValidating(false);
        return;
      }

      setPreview(URL.createObjectURL(file));
      setIsValidating(false);
      onPhotoSelected(file);
    },
    [onPhotoSelected]
  );

  return (
    <div className="w-full max-w-md mx-auto">
      <label
        className={`frame-border flex flex-col items-center justify-center w-full h-64 cursor-pointer transition-all duration-300 ${
          preview
            ? ""
            : "hover:shadow-lg"
        }`}
      >
        {preview ? (
          <img
            src={preview}
            alt="업로드된 사진"
            className="w-full h-full object-cover rounded-2xl"
          />
        ) : (
          <div className="flex flex-col items-center gap-3 text-text-light">
            {/* 카메라 + 액자 아이콘 */}
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl border-3 border-dashed border-primary/40 flex items-center justify-center bg-peach/50">
                <span className="text-4xl">📷</span>
              </div>
              <span className="absolute -bottom-1 -right-1 text-lg">✨</span>
            </div>
            <span
              className="text-sm text-text"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              아이의 정면 사진을 올려주세요
            </span>
            <span className="text-xs text-text-lighter">
              JPG, PNG, WEBP / 최대 10MB
            </span>
          </div>
        )}
        <input
          type="file"
          className="hidden"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
        />
      </label>

      {isValidating && (
        <p className="mt-3 text-sm text-primary text-center animate-pulse">
          ✨ 사진을 확인하고 있어요...
        </p>
      )}

      {error && (
        <p className="mt-3 text-sm text-accent-pink text-center">{error}</p>
      )}

      {preview && (
        <Button
          variant="outline"
          size="sm"
          className="mt-3 w-full"
          onClick={() => {
            setPreview(null);
            setError(null);
          }}
        >
          다른 사진 선택
        </Button>
      )}
    </div>
  );
}
