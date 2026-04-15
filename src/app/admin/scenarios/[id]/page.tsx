"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getScenario } from "@/lib/scenarios";
import { replaceChildName } from "@/lib/utils/korean-name";
import type { ThemeId, ScenarioCategory } from "@/types";

const categoryLabel: Record<ScenarioCategory, string> = {
  adventure: "모험",
  "daily-life": "일상생활",
  emotion: "감정/성장",
  celebration: "기념일",
  science: "과학",
};

const emotionEmoji: Record<string, string> = {
  curious: "🧐",
  excited: "🤩",
  amazed: "😲",
  wonder: "✨",
  awe: "😮",
  intrigued: "🤔",
  determined: "💪",
  worried: "😟",
  grateful: "🙏",
  joyful: "😊",
  thrilled: "🎉",
  touched: "🥹",
  happy: "😄",
  hopeful: "🌟",
  delighted: "😋",
  brave: "🦸",
  relieved: "😌",
  content: "☺️",
  concerned: "😥",
  tender: "💕",
  proud: "🏆",
  surprised: "😯",
  compassionate: "🤗",
  kind: "💝",
  shy: "😊",
  nervous: "😬",
  envious: "😣",
  encouraged: "👏",
  confident: "😎",
  friendly: "🤝",
  growing: "🌱",
  moved: "😢",
  focused: "🎯",
  embarrassed: "😅",
  anticipating: "⏳",
  loving: "❤️",
  fascinated: "🔍",
  thoughtful: "💭",
  satisfied: "😊",
  empathetic: "💙",
  patient: "🕊️",
  ecstatic: "🎊",
  challenged: "⚡",
  honored: "👑",
  helpful: "🤲",
  caring: "💗",
  gentle: "🕊️",
  flustered: "😵",
  comforted: "🫂",
  enlightened: "💡",
  peaceful: "😴",
};

function getEmoji(emotion: string): string {
  return emotionEmoji[emotion] || "🎭";
}

export default function AdminScenarioDetailPage() {
  const params = useParams();
  const id = params.id as ThemeId;
  const scenario = getScenario(id);
  const [expandedPrompts, setExpandedPrompts] = useState<Set<number>>(
    new Set()
  );

  if (!scenario) {
    return (
      <div className="text-center py-20 text-gray-500">
        시나리오를 찾을 수 없습니다.
      </div>
    );
  }

  function togglePrompt(pageNumber: number) {
    setExpandedPrompts((prev) => {
      const next = new Set(prev);
      if (next.has(pageNumber)) {
        next.delete(pageNumber);
      } else {
        next.add(pageNumber);
      }
      return next;
    });
  }

  function previewText(text: string): string {
    return text.replace(/\{childName\}/g, "OO");
  }

  return (
    <div>
      {/* 상단 네비게이션 */}
      <Link
        href="/admin/scenarios"
        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        목록으로
      </Link>

      {/* 기본 정보 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">
            {scenario.title}
          </h1>
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
            {categoryLabel[scenario.category]}
          </span>
        </div>
        <p className="text-gray-600 mb-4">{scenario.description}</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-400 block">ID</span>
            <span className="text-gray-900 font-mono">{scenario.id}</span>
          </div>
          <div>
            <span className="text-gray-400 block">타겟 연령</span>
            <span className="text-gray-900">{scenario.targetAge}</span>
          </div>
          <div>
            <span className="text-gray-400 block">페이지 수</span>
            <span className="text-gray-900">{scenario.pageCount}</span>
          </div>
          <div>
            <span className="text-gray-400 block">카테고리</span>
            <span className="text-gray-900">
              {categoryLabel[scenario.category]}
            </span>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100">
          <span className="text-gray-400 text-sm block mb-1">교육 메시지</span>
          <p className="text-gray-700">{scenario.educationMessage}</p>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-2">
          <Link
            href={`/admin/backgrounds/${scenario.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md bg-gray-900 text-white hover:bg-gray-800 transition-colors"
          >
            배경·캐릭터 생성
          </Link>
          <Link
            href={`/admin/preview/${scenario.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            동화책 미리보기
          </Link>
        </div>
      </div>

      {/* 페이지 목록 */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            페이지 목록 ({scenario.pages.length})
          </h2>
        </div>
        <div className="divide-y divide-gray-100">
          {scenario.pages.map((page) => (
            <div key={page.pageNumber} className="px-6 py-5">
              <div className="flex items-start gap-4">
                {/* 페이지 번호 */}
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-600">
                  {page.pageNumber}
                </div>

                <div className="flex-1 min-w-0">
                  {/* 감정 + 본문 */}
                  <div className="flex items-start gap-2 mb-2">
                    <span
                      className="flex-shrink-0 text-lg"
                      title={page.emotion}
                    >
                      {getEmoji(page.emotion)}
                    </span>
                    <p className="text-gray-900 leading-relaxed">
                      {previewText(page.text)}
                    </p>
                  </div>

                  {/* 장면 설명 */}
                  <div className="mb-2">
                    <span className="text-xs text-gray-400">장면: </span>
                    <span className="text-sm text-gray-500">
                      {page.sceneDescription}
                    </span>
                  </div>

                  {/* 감정 뱃지 */}
                  <span className="inline-block text-xs font-medium px-2 py-0.5 rounded bg-gray-50 text-gray-500 mb-2">
                    {page.emotion}
                  </span>

                  {/* 일러스트 프롬프트 (접기/펼치기) */}
                  <div>
                    <button
                      onClick={() => togglePrompt(page.pageNumber)}
                      className="text-xs text-blue-500 hover:text-blue-700 transition-colors"
                    >
                      {expandedPrompts.has(page.pageNumber)
                        ? "프롬프트 접기 ▲"
                        : "프롬프트 펼치기 ▼"}
                    </button>
                    {expandedPrompts.has(page.pageNumber) && (
                      <pre className="mt-2 p-3 bg-gray-50 rounded-md text-xs text-gray-600 whitespace-pre-wrap font-mono leading-relaxed">
                        {page.illustrationPrompt}
                      </pre>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
