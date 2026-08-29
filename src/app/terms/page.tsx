import type { Metadata } from "next";
import { COMPANY } from "@/lib/company";

export const metadata: Metadata = {
  title: "이용약관 | 무북",
  description: "무북(moobook) 서비스 이용약관",
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 page-enter">
      <h1
        className="text-3xl text-text mb-2"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        이용약관
      </h1>
      <p className="text-sm text-text-light mb-10">
        시행일: {COMPANY.effectiveDate}
      </p>

      <div className="space-y-8 text-sm leading-7 text-text">
        <section>
          <h2 className="text-lg text-text mb-2" style={{ fontFamily: "var(--font-heading)" }}>
            제1조 (목적)
          </h2>
          <p>
            본 약관은 {COMPANY.bizName}(이하 &quot;회사&quot;)가 운영하는{" "}
            {COMPANY.serviceName}(이하 &quot;서비스&quot;)의 이용과 관련하여
            회사와 이용자의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg text-text mb-2" style={{ fontFamily: "var(--font-heading)" }}>
            제2조 (서비스의 내용)
          </h2>
          <p>
            서비스는 이용자가 업로드한 사진을 바탕으로 AI 이미지 생성 기술을
            이용해 맞춤형 아동 동화책을 제작하고, 디지털 파일 또는 실물 인쇄물
            형태로 제공하는 것을 내용으로 합니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg text-text mb-2" style={{ fontFamily: "var(--font-heading)" }}>
            제3조 (콘텐츠 생성과 지식재산권)
          </h2>
          <p>
            생성된 동화책의 이미지와 텍스트는 이용자의 개인적·비상업적 사용을
            위해 제공됩니다. 이용자는 자신이 적법한 권리를 보유한 사진만을
            업로드해야 하며, 타인(아동 포함)의 사진을 업로드하는 경우 해당
            법정대리인의 동의를 받았음을 보증합니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg text-text mb-2" style={{ fontFamily: "var(--font-heading)" }}>
            제4조 (결제 및 환불)
          </h2>
          <p>
            서비스 이용요금은 결제 시점에 고지된 금액에 따르며, 결제는
            토스페이먼츠를 통해 처리됩니다. 실물 제작·배송 상품의 청약철회 및
            환불은 「전자상거래 등에서의 소비자보호에 관한 법률」에 따릅니다.
            다만 이용자의 요청에 따라 개별적으로 제작되는 상품의 특성상, 제작이
            개시된 이후에는 청약철회가 제한될 수 있습니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg text-text mb-2" style={{ fontFamily: "var(--font-heading)" }}>
            제5조 (금지행위)
          </h2>
          <p>
            이용자는 타인의 권리를 침해하거나, 불법·폭력·선정적 콘텐츠 생성을
            시도하는 등 서비스를 부정하게 이용해서는 안 됩니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg text-text mb-2" style={{ fontFamily: "var(--font-heading)" }}>
            제6조 (책임의 한계)
          </h2>
          <p>
            회사는 AI 생성 결과물의 완전성·정확성을 보증하지 않으며, 천재지변,
            외부 AI 서비스 장애 등 회사의 통제를 벗어난 사유로 인한 서비스 중단에
            대해 책임을 지지 않습니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg text-text mb-2" style={{ fontFamily: "var(--font-heading)" }}>
            제7조 (문의)
          </h2>
          <p>
            서비스 관련 문의는 {COMPANY.email} 또는 {COMPANY.phone} 으로 접수할 수
            있습니다.
          </p>
        </section>
      </div>
    </div>
  );
}
