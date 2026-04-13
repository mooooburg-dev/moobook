"use client";

import Link from "next/link";
import { getAllScenarios } from "@/lib/scenarios";
import type { ScenarioCategory } from "@/types";

const categoryLabel: Record<ScenarioCategory, string> = {
  adventure: "모험",
  "daily-life": "일상생활",
  emotion: "감정/성장",
  celebration: "기념일",
  science: "과학",
};

const categoryColor: Record<ScenarioCategory, string> = {
  adventure: "bg-orange-100 text-orange-700",
  "daily-life": "bg-green-100 text-green-700",
  emotion: "bg-yellow-100 text-yellow-700",
  celebration: "bg-pink-100 text-pink-700",
  science: "bg-cyan-100 text-cyan-700",
};

export default function AdminScenariosPage() {
  const scenarios = getAllScenarios();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Scenarios</h1>
        <p className="text-sm text-gray-500 mt-1">
          {scenarios.length}개 시나리오
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {scenarios.map((scenario) => (
          <Link
            key={scenario.id}
            href={`/admin/scenarios/${scenario.id}`}
            className="block bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md hover:border-gray-300 transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-900">
                {scenario.title}
              </h2>
              <span
                className={`text-xs font-medium px-2 py-1 rounded-full ${
                  categoryColor[scenario.category]
                }`}
              >
                {categoryLabel[scenario.category]}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {scenario.description}
            </p>
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span>{scenario.targetAge}</span>
              <span>·</span>
              <span>{scenario.pageCount}페이지</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
