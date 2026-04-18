import { Button } from "@/components/ui/button";
import type { OrderTier } from "@/types";

interface PricingTableProps {
  onSelect: (tier: OrderTier) => void;
}

const tiers = [
  {
    id: "softcover" as OrderTier,
    name: "소프트커버 책",
    emoji: "📚",
    price: 29900,
    description: "실물 동화책 배송",
    features: [
      "12페이지 풀 컬러",
      "소프트커버 실물 책",
      "무료 배송 (3~5일)",
    ],
    popular: true,
    borderColor: "border-brand",
    checkColor: "text-brand",
  },
];

export default function PricingTable({ onSelect }: PricingTableProps) {
  return (
    <div className="max-w-md mx-auto">
      {tiers.map((tier) => (
        <div
          key={tier.id}
          className={`relative bg-white rounded-3xl shadow-md p-6 border-2 ${tier.borderColor} text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden`}
        >
          {tier.popular && (
            <div className="ribbon-badge">
              <span>인기</span>
            </div>
          )}

          <div className="text-4xl mb-2">{tier.emoji}</div>
          <h3
            className="text-lg text-text mt-2"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            {tier.name}
          </h3>
          <p className="text-sm text-text-light mt-1">{tier.description}</p>

          <div className="my-4">
            <span
              className={`text-3xl ${tier.popular ? "text-brand" : "text-text"}`}
              style={{ fontFamily: "var(--font-heading)" }}
            >
              {tier.price.toLocaleString()}
            </span>
            <span className="text-text-light text-sm">원</span>
          </div>

          <ul className="text-sm text-text-light space-y-2 mb-6 text-left">
            {tier.features.map((feature) => (
              <li key={feature} className="flex items-center gap-2">
                <span className={tier.checkColor}>✓</span>
                {feature}
              </li>
            ))}
          </ul>

          <Button
            variant={tier.popular ? "default" : "outline"}
            className="w-full"
            onClick={() => onSelect(tier.id)}
          >
            선택하기
          </Button>
        </div>
      ))}
    </div>
  );
}
