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
        className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-3xl cursor-pointer transition-colors ${
          preview
            ? "border-violet-400 bg-violet-50"
            : "border-gray-300 bg-gray-50 hover:border-violet-400 hover:bg-violet-50"
        }`}
      >
        {preview ? (
          <img
            src={preview}
            alt="업로드된 사진"
            className="w-full h-full object-cover rounded-3xl"
          />
        ) : (
          <div className="flex flex-col items-center gap-3 text-gray-500">
            <svg
              className="w-12 h-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 16v-8m0 0l-3 3m3-3l3 3M6.75 19.25h10.5A2.25 2.25 0 0019.5 17V7A2.25 2.25 0 0017.25 4.75H6.75A2.25 2.25 0 004.5 7v10a2.25 2.25 0 002.25 2.25z"
              />
            </svg>
            <span className="text-sm font-medium">
              아이의 정면 사진을 올려주세요
            </span>
            <span className="text-xs text-gray-400">
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
        <p className="mt-3 text-sm text-violet-600 text-center">
          사진을 확인하고 있어요...
        </p>
      )}

      {error && (
        <p className="mt-3 text-sm text-red-500 text-center">{error}</p>
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
