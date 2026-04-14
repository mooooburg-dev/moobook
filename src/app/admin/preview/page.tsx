"use client";

import Link from "next/link";
import { getAllScenarios } from "@/lib/scenarios";
import type { Scenario } from "@/types";

export default function AdminPreviewPage() {
  const allScenarios = getAllScenarios();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">미리보기</h1>
        <p className="text-sm text-gray-500 mt-1">
          시나리오별 동화책 미리보기 (배경 + 본문 텍스트)
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {allScenarios.map((scenario: Scenario) => (
          <Link
            key={scenario.id}
            href={`/admin/preview/${scenario.id}`}
            className="bg-white rounded-lg border border-gray-200 p-5 hover:border-gray-400 hover:shadow-sm transition"
          >
            <h2 className="text-lg font-semibold text-gray-900">
              {scenario.title}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">{scenario.id}</p>
            <p className="text-sm text-gray-600 mt-2 line-clamp-2">
              {scenario.description}
            </p>
            <p className="text-xs text-gray-500 mt-3">
              {scenario.pageCount}페이지 · {scenario.targetAge}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
