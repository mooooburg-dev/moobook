"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronLeft, ChevronDown, ChevronUp, Eye, Sparkles } from "lucide-react";

import { getScenario } from "@/lib/scenarios";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
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
      <div className="text-center py-20 text-muted-foreground">
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
    <div className="flex flex-col gap-6">
      <Link
        href="/admin/scenarios"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
      >
        <ChevronLeft className="size-4" />
        목록으로
      </Link>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5">
              <CardTitle className="text-2xl">{scenario.title}</CardTitle>
              <CardDescription>{scenario.description}</CardDescription>
            </div>
            <Badge variant="secondary" className="shrink-0">
              {categoryLabel[scenario.category]}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="space-y-0.5">
              <div className="text-xs text-muted-foreground">ID</div>
              <div className="font-mono text-xs">{scenario.id}</div>
            </div>
            <div className="space-y-0.5">
              <div className="text-xs text-muted-foreground">타겟 연령</div>
              <div>{scenario.targetAge}</div>
            </div>
            <div className="space-y-0.5">
              <div className="text-xs text-muted-foreground">페이지 수</div>
              <div>{scenario.pageCount}</div>
            </div>
            <div className="space-y-0.5">
              <div className="text-xs text-muted-foreground">카테고리</div>
              <div>{categoryLabel[scenario.category]}</div>
            </div>
          </div>

          <Separator />

          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">교육 메시지</div>
            <p className="text-sm">{scenario.educationMessage}</p>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <Button asChild>
              <Link href={`/admin/backgrounds/${scenario.id}`}>
                <Sparkles className="size-4" />
                배경·캐릭터 생성
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/admin/preview/${scenario.id}`}>
                <Eye className="size-4" />
                동화책 미리보기
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            페이지 목록{" "}
            <span className="text-muted-foreground font-normal">
              ({scenario.pages.length})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <div className="divide-y divide-border">
            {scenario.pages.map((page) => {
              const expanded = expandedPrompts.has(page.pageNumber);
              return (
                <div key={page.pageNumber} className="px-6 py-5">
                  <div className="flex items-start gap-4">
                    <div className="shrink-0 size-8 rounded-full bg-muted flex items-center justify-center text-sm font-bold text-foreground/70">
                      {page.pageNumber}
                    </div>

                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-start gap-2">
                        <span
                          className="shrink-0 text-lg"
                          title={page.emotion}
                        >
                          {getEmoji(page.emotion)}
                        </span>
                        <p className="leading-relaxed">
                          {previewText(page.text)}
                        </p>
                      </div>

                      <div className="text-sm text-muted-foreground">
                        <span className="text-xs uppercase tracking-wide mr-2">
                          장면
                        </span>
                        {page.sceneDescription}
                      </div>

                      <Badge variant="outline" className="text-muted-foreground">
                        {page.emotion}
                      </Badge>

                      <div>
                        <button
                          onClick={() => togglePrompt(page.pageNumber)}
                          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
                        >
                          프롬프트 {expanded ? "접기" : "펼치기"}
                          {expanded ? (
                            <ChevronUp className="size-3" />
                          ) : (
                            <ChevronDown className="size-3" />
                          )}
                        </button>
                        {expanded && (
                          <pre
                            className={cn(
                              "mt-2 p-3 bg-muted rounded-md text-xs whitespace-pre-wrap font-mono leading-relaxed text-muted-foreground"
                            )}
                          >
                            {page.illustrationPrompt}
                          </pre>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
