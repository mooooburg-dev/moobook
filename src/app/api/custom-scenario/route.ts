import { NextRequest, NextResponse } from "next/server";
import { generateCustomScenario } from "@/lib/openai";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ChildGender } from "@/types";

const KEYWORD_PATTERN = /^[가-힣a-zA-Z0-9\s]{1,12}$/;

function sanitizeKeywords(raw: unknown): [string, string, string] | null {
  if (!Array.isArray(raw) || raw.length !== 3) return null;
  const trimmed = raw.map((k) => (typeof k === "string" ? k.trim() : ""));
  if (trimmed.some((k) => !k || !KEYWORD_PATTERN.test(k))) return null;
  return [trimmed[0], trimmed[1], trimmed[2]];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookId, keywords, childName, childAge, childGender } = body as {
      bookId?: string;
      keywords?: unknown;
      childName?: string;
      childAge?: number | null;
      childGender?: ChildGender;
    };

    if (!bookId || !childName || !childGender) {
      return NextResponse.json(
        { error: "bookId, childName, childGender는 필수 값입니다." },
        { status: 400 }
      );
    }

    const sanitized = sanitizeKeywords(keywords);
    if (!sanitized) {
      return NextResponse.json(
        {
          error:
            "키워드 3개가 필요합니다. 각 키워드는 1~12자의 한글/영문/숫자여야 합니다.",
        },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // book 존재 및 theme이 custom인지 확인
    const { data: book, error: fetchError } = await supabase
      .from("moobook_books")
      .select("id, theme, status")
      .eq("id", bookId)
      .single();

    if (fetchError || !book) {
      return NextResponse.json(
        { error: "해당 동화책을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    if (book.theme !== "custom") {
      return NextResponse.json(
        { error: "커스텀 시나리오가 아닙니다." },
        { status: 400 }
      );
    }

    let scenario;
    try {
      scenario = await generateCustomScenario({
        keywords: sanitized,
        childName: childName.trim(),
        childAge: childAge ?? null,
        childGender,
      });
    } catch (err) {
      console.error("커스텀 시나리오 생성 실패:", err);
      // book 롤백 삭제 (pending 상태일 때만)
      if (book.status === "pending") {
        await supabase.from("moobook_books").delete().eq("id", bookId);
      }
      return NextResponse.json(
        {
          error:
            "시나리오 생성에 실패했습니다. 잠시 후 다른 키워드로 다시 시도해주세요.",
        },
        { status: 500 }
      );
    }

    const { error: updateError } = await supabase
      .from("moobook_books")
      .update({ custom_scenario: scenario })
      .eq("id", bookId);

    if (updateError) {
      console.error("custom_scenario 저장 실패:", updateError);
      return NextResponse.json(
        { error: "시나리오 저장에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      bookId,
      title: scenario.title,
    });
  } catch (error) {
    console.error("/api/custom-scenario 요청 처리 실패:", error);
    return NextResponse.json(
      { error: "요청을 처리할 수 없습니다." },
      { status: 500 }
    );
  }
}
