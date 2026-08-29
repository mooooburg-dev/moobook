import type { Metadata } from "next";
import { COMPANY } from "@/lib/company";

export const metadata: Metadata = {
  title: "개인정보처리방침 | 무북",
  description: "무북(moobook) 개인정보처리방침",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 page-enter">
      <h1
        className="text-3xl text-text mb-2"
        style={{ fontFamily: "var(--font-heading)" }}
      >
        개인정보처리방침
      </h1>
      <p className="text-sm text-text-light mb-10">
        시행일: {COMPANY.effectiveDate}
      </p>

      <div className="space-y-8 text-sm leading-7 text-text">
        <section>
          <p>
            {COMPANY.bizName}(이하 &quot;회사&quot;)는 {COMPANY.serviceName}{" "}
            이용자의 개인정보를 중요하게 생각하며, 「개인정보 보호법」 등 관련
            법령을 준수합니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg text-text mb-2" style={{ fontFamily: "var(--font-heading)" }}>
            1. 수집하는 개인정보 항목
          </h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>동화책 제작을 위한 아동 사진(이미지), 아이 이름·성별</li>
            <li>결제 및 배송 시: 주문자 성명, 연락처, 배송지 주소, 결제 정보</li>
            <li>서비스 이용 과정에서 자동 생성되는 접속 로그</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg text-text mb-2" style={{ fontFamily: "var(--font-heading)" }}>
            2. 개인정보의 이용 목적
          </h2>
          <p>
            수집된 정보는 맞춤형 동화책 생성, 주문 처리 및 실물 배송, 고객 문의
            응대의 목적으로만 이용됩니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg text-text mb-2" style={{ fontFamily: "var(--font-heading)" }}>
            3. 아동 사진의 보관 및 파기 (제로 리텐션)
          </h2>
          <p>
            이용자가 업로드한 <strong>원본 사진은 업로드 후 24시간 이내에
            자동으로 영구 삭제</strong>됩니다. 원본 사진은 비공개(private)
            저장소에 보관되며, 동화책 생성 목적 외에는 사용되지 않습니다. 생성이
            완료된 동화책 이미지는 주문 처리·배송 및 재다운로드를 위해
            보관됩니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg text-text mb-2" style={{ fontFamily: "var(--font-heading)" }}>
            4. 개인정보의 제3자 제공 및 처리 위탁
          </h2>
          <p>
            회사는 서비스 제공을 위해 아래와 같이 개인정보 처리를 위탁합니다.
          </p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>AI 이미지 생성: Google(Gemini), OpenAI — 사진 및 생성 프롬프트</li>
            <li>결제 처리: 토스페이먼츠 — 결제 정보</li>
            <li>인프라·호스팅: {COMPANY.hosting}, Supabase — 데이터 저장</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg text-text mb-2" style={{ fontFamily: "var(--font-heading)" }}>
            5. 법정대리인의 동의
          </h2>
          <p>
            아동의 사진 등 개인정보를 업로드하는 이용자는 해당 아동의
            법정대리인이거나 법정대리인의 동의를 받은 자여야 합니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg text-text mb-2" style={{ fontFamily: "var(--font-heading)" }}>
            6. 이용자의 권리
          </h2>
          <p>
            이용자는 자신의 개인정보에 대한 열람·정정·삭제·처리정지를 요청할 수
            있으며, {COMPANY.email} 으로 접수할 수 있습니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg text-text mb-2" style={{ fontFamily: "var(--font-heading)" }}>
            7. 개인정보보호책임자
          </h2>
          <p>
            성명: {COMPANY.privacyOfficer}
            <br />
            연락처: {COMPANY.email} / {COMPANY.phone}
          </p>
        </section>
      </div>
    </div>
  );
}
