-- 얼굴 anchor 흐름 도입: 사진 다중 업로드 + 얼굴 후보 + anchor 선택
-- Phase 0 - GPT Image 메인 전환에 필요한 컬럼

-- 사진 자산 배열 (객체 형태)
-- 각 항목: { url, order, isPrimary, uploadedAt, faceValidation? }
alter table moobook_books
  add column if not exists photos jsonb;

-- 얼굴 후보 URL 배열 (string[])
alter table moobook_books
  add column if not exists face_candidate_urls jsonb;

-- 후보 생성 메타데이터: { model, prompt, hash, sourcePhotoUrls, variantHints, attempts, createdAt }
alter table moobook_books
  add column if not exists face_candidate_metadata jsonb;

-- 부모가 선택한 anchor 얼굴 (일러스트화된 정면 반신)
alter table moobook_books
  add column if not exists anchor_face_url text;

-- anchor 선택 메타데이터: { selectedAt, candidateIndex, model, quality }
alter table moobook_books
  add column if not exists anchor_metadata jsonb;

-- 본문 이미지 생성 모델 (book별로 고정 — 모델 전환 시 기존 books는 그대로)
-- 기본값을 두지 않음: insert 시점에 OPENAI_IMAGE_MODEL env를 resolve해서 명시 저장
alter table moobook_books
  add column if not exists image_model text;

-- 백필: 기존 photo_url을 photos 배열에 미러링
-- 기존 books는 1장만 있으므로 isPrimary=true로 단일 항목 생성
update moobook_books
set photos = jsonb_build_array(
  jsonb_build_object(
    'url', photo_url,
    'order', 0,
    'isPrimary', true,
    'uploadedAt', coalesce(created_at, now())
  )
)
where photos is null and photo_url is not null;

-- status는 text 컬럼이라 ALTER 불필요. 새 단계는 코드에서만 추가.
-- pending → faces_generating → faces_ready → generating → preview_ready → paid → ...
-- faces_failed: 모더레이션 거절 또는 모델 실패 시
