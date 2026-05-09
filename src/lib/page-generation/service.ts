/**
 * 본문 페이지 생성을 polling-driven 방식으로 처리하는 서비스 레이어.
 *
 * 왜 polling-driven 인가:
 *   기존 `/api/generate` 는 1페이지를 동기로 만들고 응답한 뒤 나머지 11페이지를
 *   백그라운드 promise 로 진행했다. 그러나 dev `next dev` / Vercel serverless
 *   양쪽에서 응답 후 promise 가 보장되지 않아 사용자가 미리보기 화면을 잠시
 *   떠나거나 새로고침하면 백그라운드가 끊겼다.
 *
 * 새 구조:
 *   /api/generate 를 호출할 때마다 "아직 안 만들어진 다음 페이지 1장" 만 생성하고
 *   즉시 응답한다. 클라이언트가 폴링하면서 12장이 다 차거나 done:true 가 올
 *   때까지 반복 호출. 한 번 끊겨도 다음 폴링이 그대로 이어 만든다.
 */

import { resolveScenario } from "@/lib/scenarios";
import { resolvePhotos } from "@/lib/face-candidates/service";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateOnePage } from "@/lib/image-pipeline";
import { getDefaultImageModel } from "@/lib/openai-image";
import type { Book, BookStatus } from "@/types";

export interface NextPageResult {
  /** 페이지 1장이 새로 생성됐다 */
  generated?: { pageNumber: number; url: string };
  /** 모든 페이지가 다 차서 더 만들 필요가 없다 */
  done?: boolean;
  /** 다른 워커가 진행 중이라 우리는 락을 못 잡았다 — 클라이언트는 잠시 후 재시도 */
  busy?: boolean;
  /** 우리가 생성한 결과가 다른 워커의 lease 에 의해 폐기됐다 (orphan storage 가능) */
  staleResultDiscarded?: boolean;
  /** busy 일 때 클라이언트가 다음 폴링까지 기다릴 권장 시간 */
  retryAfterMs?: number;
  totalPages: number;
  completedPages: number;
  status: BookStatus;
}

/**
 * 짧은 페이지 단위 lease.
 * 한 페이지 생성에 보통 30~50초이므로 90초로 잡고, 만료되면 다른 워커가 같은
 * 페이지를 다시 시도할 수 있게 한다.
 */
const PAGE_LEASE_TTL_MS = 90 * 1000;

interface PageLease {
  pageNumber: number;
  startedAt: string;
  leaseUntil: string;
  attemptId: string;
}

function isLeaseExpired(lease: PageLease | null): boolean {
  if (!lease?.leaseUntil) return true;
  return new Date(lease.leaseUntil).getTime() <= Date.now();
}

/**
 * 다음 미생성 페이지를 1장 만들고 결과 반환.
 *
 * 흐름:
 *   1) book 조회 + scenario 해석
 *   2) 이미 모든 페이지 완료면 done:true
 *   3) 다음 페이지 번호 결정 (all_pages 길이 + 1)
 *   4) atomic update 로 page lease 잡기 — 다른 워커가 동시 호출하면 busy
 *   5) lease 잡았으면 generateOnePage 호출, 결과를 all_pages 에 append + preview_pages
 *      에 처음 N장만 동기화, lease 해제
 *   6) 모든 페이지 완료 시 status 를 preview_ready 그대로 두되 lease 만 클리어
 */
export async function generateNextPage(
  bookId: string
): Promise<NextPageResult> {
  const supabase = createAdminClient();

  const { data: bookRow, error: fetchError } = await supabase
    .from("moobook_books")
    .select("*")
    .eq("id", bookId)
    .single();
  if (fetchError || !bookRow) {
    throw new Error("book을 찾을 수 없습니다.");
  }
  const book = bookRow as Book & {
    page_generation_lease?: PageLease | null;
  };

  const scenario = resolveScenario(book);
  const totalPages = scenario.pages.length;
  const allPages = book.all_pages ?? [];
  const completedPages = allPages.length;

  if (completedPages >= totalPages) {
    return {
      done: true,
      totalPages,
      completedPages,
      status: book.status,
    };
  }

  // busy 응답 시 클라이언트가 다음 폴링까지 기다릴 권장 시간 계산
  const computeRetryAfter = (lease: PageLease | null): number => {
    if (!lease?.leaseUntil) return 3000;
    const remaining = new Date(lease.leaseUntil).getTime() - Date.now();
    if (remaining <= 0) return 1000; // 곧 만료 → 짧게 폴링해 회수
    if (remaining < 5000) return 1000;
    return Math.min(5000, remaining);
  };

  const photos = resolvePhotos(book);
  const primary = photos.find((p) => p.isPrimary) ?? photos[0];
  const photoUrl = primary?.url ?? book.photo_url ?? null;
  if (!photoUrl) {
    throw new Error("사진 정보가 없는 book입니다.");
  }

  const nextPageNumber = completedPages + 1;
  const targetPage = scenario.pages.find(
    (p) => p.pageNumber === nextPageNumber
  );
  if (!targetPage) {
    throw new Error(`pageNumber ${nextPageNumber} 가 시나리오에 없음`);
  }

  // 락 시도 1: lease 가 비어있거나 만료됐을 때만 잡기
  const currentLease = book.page_generation_lease ?? null;
  const canTakeLease = !currentLease || isLeaseExpired(currentLease);
  if (!canTakeLease) {
    return {
      busy: true,
      retryAfterMs: computeRetryAfter(currentLease),
      totalPages,
      completedPages,
      status: book.status,
    };
  }

  // 처음 진입할 때만 status 를 generating 으로 (preview_ready 가 이미면 유지)
  if (book.status === "pending" || book.status === "faces_ready") {
    await supabase
      .from("moobook_books")
      .update({ status: "generating" })
      .eq("id", bookId)
      .in("status", ["pending", "faces_ready"]);
  }

  // atomic update: 같은 attemptId 가 그대로일 때만 우리가 lease 를 잡는다.
  const newLease: PageLease = {
    pageNumber: nextPageNumber,
    startedAt: new Date().toISOString(),
    leaseUntil: new Date(Date.now() + PAGE_LEASE_TTL_MS).toISOString(),
    attemptId: crypto.randomUUID(),
  };

  let query = supabase
    .from("moobook_books")
    .update({ page_generation_lease: newLease })
    .eq("id", bookId);
  if (currentLease?.attemptId) {
    query = query.eq(
      "page_generation_lease->>attemptId",
      currentLease.attemptId
    );
  } else {
    query = query.is("page_generation_lease", null);
  }
  const { data: locked } = await query.select("id").maybeSingle();
  if (!locked) {
    // 거의 동시에 다른 워커가 lease 를 set 한 케이스. 그 lease 기준으로 retry 안내.
    const { data: refreshed } = await supabase
      .from("moobook_books")
      .select("page_generation_lease")
      .eq("id", bookId)
      .single();
    return {
      busy: true,
      retryAfterMs: computeRetryAfter(
        (refreshed as { page_generation_lease?: PageLease | null } | null)
          ?.page_generation_lease ?? null
      ),
      totalPages,
      completedPages,
      status: book.status,
    };
  }

  // 페이지 1장 생성
  const imageModel = book.image_model ?? getDefaultImageModel();
  const url = await generateOnePage({
    page: targetPage,
    photoUrl,
    bookId,
    scenarioId: scenario.id,
    gender: book.child_gender,
    anchorFaceUrl: book.anchor_face_url ?? null,
    imageModel,
  });

  // 결과 반영: all_pages append + preview_pages 처음 N장 한정 동기화 + lease 해제.
  // 다른 워커가 동시 진행하지 않도록 attemptId 일치 조건. update 결과를 select 로
  // 확인해 우리가 실제로 반영했는지 검증한다 (Codex #1).
  const newAllPages = [...allPages, url];
  const PUBLIC_PREVIEW_LIMIT = 3;
  const newPreviewPages = newAllPages.slice(0, PUBLIC_PREVIEW_LIMIT);
  // preview_ready 는 최소 PUBLIC_PREVIEW_LIMIT 장 채워진 후에 진입.
  // (Codex #7: 1장 만으로 결제 CTA 가 노출되지 않게)
  const reachedPreviewReady = newAllPages.length >= PUBLIC_PREVIEW_LIMIT;

  const update: Record<string, unknown> = {
    all_pages: newAllPages,
    preview_pages: newPreviewPages,
    page_generation_lease: null,
  };
  if (reachedPreviewReady && book.status === "generating") {
    update.status = "preview_ready";
  }

  const { data: applied } = await supabase
    .from("moobook_books")
    .update(update)
    .eq("id", bookId)
    .eq("page_generation_lease->>attemptId", newLease.attemptId)
    .select("all_pages,status")
    .maybeSingle();

  if (!applied) {
    // 우리 lease 가 만료/교체돼서 update 가 통과 못 함 — 결과는 폐기.
    // 방금 업로드한 페이지 이미지가 orphan 으로 남으니 정리 시도.
    const orphanPath = url.split("/moobook_photos/")[1];
    if (orphanPath) {
      try {
        await supabase.storage.from("moobook_photos").remove([orphanPath]);
      } catch (err) {
        console.warn(
          "[page-generation] orphan storage 정리 실패:",
          orphanPath,
          err
        );
      }
    }
    // fresh state 로 응답
    const { data: fresh } = await supabase
      .from("moobook_books")
      .select("status, all_pages")
      .eq("id", bookId)
      .single();
    const freshAll = (fresh?.all_pages as string[] | null) ?? newAllPages;
    return {
      staleResultDiscarded: true,
      totalPages,
      completedPages: freshAll.length,
      status: (fresh?.status as BookStatus) ?? book.status,
    };
  }

  const appliedAllPages =
    ((applied as { all_pages?: string[] | null }).all_pages as string[] | null) ??
    newAllPages;
  const appliedStatus =
    ((applied as { status?: BookStatus }).status as BookStatus) ?? book.status;

  return {
    generated: { pageNumber: nextPageNumber, url },
    totalPages,
    completedPages: appliedAllPages.length,
    status: appliedStatus,
  };
}
