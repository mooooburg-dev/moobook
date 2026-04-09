"use client";

import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import type { Order } from "@/types";

const statusLabels: Record<string, string> = {
  pending: "결제 대기",
  paid: "결제 완료",
  refunded: "환불 완료",
};

const shippingLabels: Record<string, string> = {
  printing: "인쇄 중",
  shipped: "배송 중",
  delivered: "배송 완료",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Supabase에서 주문 목록 조회
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center text-gray-500">
        불러오는 중...
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-500">아직 주문 내역이 없어요.</p>
        <a
          href="/create"
          className="inline-block mt-4 text-violet-600 font-medium hover:underline"
        >
          동화책 만들러 가기
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-extrabold text-gray-900 mb-8">
        내 주문 내역
      </h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order.id}>
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold text-gray-900">
                  {order.tier === "digital" ? "디지털 PDF" : "소프트커버 책"}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {new Date(order.created_at).toLocaleDateString("ko-KR")}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold">
                  {order.amount.toLocaleString()}원
                </p>
                <p className="text-sm text-violet-600 mt-1">
                  {statusLabels[order.payment_status]}
                </p>
                {order.shipping_status && (
                  <p className="text-xs text-gray-500 mt-1">
                    {shippingLabels[order.shipping_status]}
                    {order.tracking_number && ` (${order.tracking_number})`}
                  </p>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
