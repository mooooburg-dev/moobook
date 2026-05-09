"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { validateFacePhoto } from "@/lib/utils/face-detection";
import { Button } from "@/components/ui/button";

const MAX_FILES = 3;

export interface UploadedPhoto {
  file: File;
  previewUrl: string;
  isPrimary: boolean;
}

interface MultiPhotoUploaderProps {
  photos: UploadedPhoto[];
  onChange: (photos: UploadedPhoto[]) => void;
}

export default function MultiPhotoUploader({
  photos,
  onChange,
}: MultiPhotoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const handleFiles = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const incoming = Array.from(e.target.files ?? []);
      if (incoming.length === 0) return;

      const remainingSlots = MAX_FILES - photos.length;
      if (remainingSlots <= 0) {
        setError(`최대 ${MAX_FILES}장까지 올릴 수 있어요.`);
        e.target.value = "";
        return;
      }

      const toAdd = incoming.slice(0, remainingSlots);
      setError(null);
      setIsValidating(true);

      const validated: UploadedPhoto[] = [];
      for (const file of toAdd) {
        const result = await validateFacePhoto(file);
        if (!result.valid) {
          setError(result.message);
          setIsValidating(false);
          e.target.value = "";
          return;
        }
        validated.push({
          file,
          previewUrl: URL.createObjectURL(file),
          isPrimary: false,
        });
      }

      // 첫 사진이 처음 들어오면 자동으로 primary 지정
      const next = [...photos, ...validated];
      if (!next.some((p) => p.isPrimary) && next.length > 0) {
        next[0].isPrimary = true;
      }

      onChange(next);
      setIsValidating(false);
      e.target.value = "";
    },
    [photos, onChange]
  );

  const removePhoto = useCallback(
    (index: number) => {
      const target = photos[index];
      URL.revokeObjectURL(target.previewUrl);
      const next = photos.filter((_, i) => i !== index);
      // primary가 사라지면 첫 항목으로 승격
      if (target.isPrimary && next.length > 0 && !next.some((p) => p.isPrimary)) {
        next[0].isPrimary = true;
      }
      onChange(next);
      setError(null);
    },
    [photos, onChange]
  );

  const setPrimary = useCallback(
    (index: number) => {
      const next = photos.map((p, i) => ({ ...p, isPrimary: i === index }));
      onChange(next);
    },
    [photos, onChange]
  );

  const triggerPicker = () => inputRef.current?.click();

  const slots = Array.from({ length: MAX_FILES }, (_, i) => photos[i] ?? null);

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="grid grid-cols-3 gap-3">
        {slots.map((photo, index) => {
          if (photo) {
            return (
              <div
                key={`photo-${index}`}
                className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all ${
                  photo.isPrimary
                    ? "border-brand ring-2 ring-brand/30 shadow-md"
                    : "border-brand/20"
                }`}
              >
                <Image
                  src={photo.previewUrl}
                  alt={`업로드 사진 ${index + 1}`}
                  fill
                  sizes="160px"
                  className="object-cover"
                  unoptimized
                />
                {photo.isPrimary && (
                  <div className="absolute top-1.5 left-1.5 bg-brand text-white text-[10px] px-2 py-0.5 rounded-full">
                    대표
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-white/90 text-text shadow flex items-center justify-center text-xs"
                  aria-label="사진 제거"
                >
                  ✕
                </button>
                {!photo.isPrimary && (
                  <button
                    type="button"
                    onClick={() => setPrimary(index)}
                    className="absolute bottom-1.5 left-1.5 right-1.5 bg-white/90 text-text-light text-[11px] py-1 rounded-full hover:bg-white"
                  >
                    대표로 지정
                  </button>
                )}
              </div>
            );
          }
          return (
            <button
              key={`slot-${index}`}
              type="button"
              onClick={triggerPicker}
              className="aspect-square rounded-2xl border-2 border-dashed border-brand/30 bg-peach/30 flex flex-col items-center justify-center gap-1 text-text-light hover:border-brand/60 hover:bg-peach/50 transition-all"
            >
              <span className="text-2xl">📷</span>
              <span className="text-[11px]">{index === 0 ? "필수" : "선택"}</span>
            </button>
          );
        })}
      </div>

      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={handleFiles}
      />

      <p className="text-[12px] text-text-light text-center mt-3">
        정면 얼굴 사진을 1~3장 올려주세요. 다양한 표정/각도면 더 좋아요.
      </p>

      {isValidating && (
        <p className="mt-2 text-sm text-brand text-center animate-pulse">
          ✨ 사진 확인 중...
        </p>
      )}

      {error && (
        <p className="mt-2 text-sm text-brand-pink text-center">{error}</p>
      )}

      {photos.length > 0 && photos.length < MAX_FILES && (
        <div className="mt-3 text-center">
          <Button variant="outline" size="sm" onClick={triggerPicker}>
            사진 더 추가하기
          </Button>
        </div>
      )}
    </div>
  );
}
