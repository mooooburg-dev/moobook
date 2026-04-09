import Button from "@/components/ui/Button";

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      {/* 히어로 섹션 */}
      <section className="w-full py-20 px-4 text-center bg-gradient-to-b from-violet-50 to-white">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight">
          우리 아이가 주인공인
          <br />
          <span className="text-violet-600">동화책</span>을 만들어 보세요!
        </h1>
        <p className="mt-4 text-lg text-gray-500 max-w-xl mx-auto">
          사진 한 장이면 충분해요. AI가 아이의 얼굴을 유지한 채 세상에 하나뿐인
          동화책을 만들어 드려요.
        </p>
        <div className="mt-8">
          <a href="/create">
            <Button size="lg">지금 만들기</Button>
          </a>
        </div>
      </section>

      {/* 3단계 안내 */}
      <section className="w-full py-16 px-4 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-10">
          3단계로 완성!
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          {[
            {
              step: "1",
              title: "사진 업로드",
              desc: "아이의 정면 사진 1장을 올려주세요",
            },
            {
              step: "2",
              title: "테마 선택",
              desc: "숲속 대모험, 우주 탐험대 중 선택!",
            },
            {
              step: "3",
              title: "동화책 완성",
              desc: "AI가 12페이지 동화책을 만들어요",
            },
          ].map((item) => (
            <div key={item.step}>
              <div className="w-14 h-14 mx-auto rounded-full bg-violet-100 text-violet-600 flex items-center justify-center text-xl font-bold">
                {item.step}
              </div>
              <h3 className="mt-4 font-bold text-gray-900">{item.title}</h3>
              <p className="mt-1 text-sm text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 가격 안내 */}
      <section className="w-full py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">가격 안내</h2>
          <p className="text-gray-500 mb-8">
            미리보기는 무료! 마음에 드시면 결제해주세요.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            <div className="bg-white rounded-3xl shadow-md p-6">
              <h3 className="font-bold text-lg">디지털 PDF</h3>
              <p className="text-3xl font-extrabold mt-2">
                9,900
                <span className="text-sm font-normal text-gray-500">원</span>
              </p>
              <p className="text-sm text-gray-500 mt-2">
                고해상도 PDF 즉시 다운로드
              </p>
            </div>
            <div className="bg-white rounded-3xl shadow-md p-6 ring-2 ring-violet-500 relative">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-violet-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                인기
              </span>
              <h3 className="font-bold text-lg mt-1">소프트커버 책</h3>
              <p className="text-3xl font-extrabold mt-2">
                29,900
                <span className="text-sm font-normal text-gray-500">원</span>
              </p>
              <p className="text-sm text-gray-500 mt-2">
                실물 동화책 + PDF (무료 배송)
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
