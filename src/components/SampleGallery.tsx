import Image from "next/image";

import { createAdminClient } from "@/lib/supabase/admin";
import { getAllScenarios } from "@/lib/scenarios";

/** 랜딩 샘플 갤러리에 노출할 최대 장수 */
const MAX_SAMPLES = 8;

interface Sample {
  scenarioId: string;
  title: string;
  imageUrl: string;
}

async function loadSamples(): Promise<Sample[]> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("moobook_scenario_illustrations")
      .select("scenario_id, image_url, page_number, status")
      .eq("page_number", 1)
      .in("status", ["approved", "completed"]);

    if (error || !data) return [];

    const titleById = new Map(
      getAllScenarios().map((s) => [s.id, s.title] as const)
    );

    // 시나리오당 1장(1페이지)만, 중복 제거
    const seen = new Set<string>();
    const samples: Sample[] = [];
    for (const row of data) {
      if (!row.image_url || seen.has(row.scenario_id)) continue;
      const title = titleById.get(row.scenario_id);
      if (!title) continue;
      seen.add(row.scenario_id);
      samples.push({
        scenarioId: row.scenario_id,
        title,
        imageUrl: row.image_url,
      });
      if (samples.length >= MAX_SAMPLES) break;
    }
    return samples;
  } catch {
    return [];
  }
}

export default async function SampleGallery() {
  const samples = await loadSamples();

  // 아직 샘플이 없으면 섹션 자체를 렌더하지 않는다 (빈 화면 방지).
  if (samples.length === 0) return null;

  return (
    <section className="w-full py-16 px-4 bg-cream">
      <div className="max-w-5xl mx-auto">
        <h2
          className="text-3xl text-center text-text mb-2"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          이런 그림책이 만들어져요
        </h2>
        <p className="text-center text-text-light mb-10">
          실제 무북에서 생성한 동화 삽화 그림체예요
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {samples.map((s) => (
            <figure
              key={s.scenarioId}
              className="group rounded-2xl overflow-hidden bg-white shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="relative aspect-square">
                <Image
                  src={s.imageUrl}
                  alt={`${s.title} 동화 삽화 예시`}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover"
                />
              </div>
              <figcaption
                className="px-3 py-2 text-sm text-text text-center truncate"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                {s.title}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
