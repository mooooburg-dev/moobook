import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import type { OrderTier } from "@/types";

interface PricingTableProps {
  onSelect: (tier: OrderTier) => void;
}

const tiers = [
  {
    id: "digital" as OrderTier,
    name: "디지털 PDF",
    price: 9900,
    description: "고해상도 PDF 다운로드",
    features: ["12페이지 풀 컬러", "고해상도 PDF", "즉시 다운로드", "무제한 출력 가능"],
  },
  {
    id: "softcover" as OrderTier,
    name: "소프트커버 책",
    price: 29900,
    description: "실물 동화책 배송",
    features: [
      "12페이지 풀 컬러",
      "고해상도 PDF 포함",
      "소프트커버 실물 책",
      "무료 배송 (3~5일)",
    ],
    popular: true,
  },
];

export default function PricingTable({ onSelect }: PricingTableProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
      {tiers.map((tier) => (
        <Card
          key={tier.id}
          className={`relative text-center ${
            tier.popular ? "ring-2 ring-violet-500" : ""
          }`}
        >
          {tier.popular && (
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-violet-600 text-white text-xs font-bold px-3 py-1 rounded-full">
              인기
            </span>
          )}

          <h3 className="text-lg font-bold text-gray-900 mt-2">{tier.name}</h3>
          <p className="text-sm text-gray-500 mt-1">{tier.description}</p>

          <div className="my-4">
            <span className="text-3xl font-extrabold text-gray-900">
              {tier.price.toLocaleString()}
            </span>
            <span className="text-gray-500 text-sm">원</span>
          </div>

          <ul className="text-sm text-gray-600 space-y-2 mb-6">
            {tier.features.map((feature) => (
              <li key={feature} className="flex items-center gap-2">
                <span className="text-violet-500">&#10003;</span>
                {feature}
              </li>
            ))}
          </ul>

          <Button
            variant={tier.popular ? "primary" : "outline"}
            className="w-full"
            onClick={() => onSelect(tier.id)}
          >
            선택하기
          </Button>
        </Card>
      ))}
    </div>
  );
}
