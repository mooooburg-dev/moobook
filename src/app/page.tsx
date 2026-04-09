import Button from "@/components/ui/Button";

function WaveDivider({ fillFrom, fillTo }: { fillFrom: string; fillTo: string }) {
  return (
    <div className="wave-divider">
      <svg viewBox="0 0 1440 48" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id={`wave-${fillFrom}-${fillTo}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={fillFrom} />
            <stop offset="100%" stopColor={fillTo} />
          </linearGradient>
        </defs>
        <path
          d="M0,24 C240,48 480,0 720,24 C960,48 1200,0 1440,24 L1440,48 L0,48 Z"
          fill={fillTo}
        />
      </svg>
    </div>
  );
}

function FloatingDecorations() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <span className="absolute top-[10%] left-[8%] text-3xl animate-float opacity-40" style={{ animationDelay: '0s' }}>⭐</span>
      <span className="absolute top-[15%] right-[12%] text-2xl animate-float opacity-30" style={{ animationDelay: '1s' }}>🌙</span>
      <span className="absolute top-[40%] left-[5%] text-2xl animate-float opacity-25" style={{ animationDelay: '2s' }}>☁️</span>
      <span className="absolute top-[60%] right-[8%] text-3xl animate-float opacity-30" style={{ animationDelay: '0.5s' }}>✨</span>
      <span className="absolute bottom-[20%] left-[15%] text-2xl animate-float opacity-35" style={{ animationDelay: '1.5s' }}>🌟</span>
      <span className="absolute bottom-[10%] right-[20%] text-2xl animate-float opacity-25" style={{ animationDelay: '2.5s' }}>☁️</span>
    </div>
  );
}

function StoryBookMockup() {
  return (
    <div className="relative w-72 h-80 sm:w-80 sm:h-96 mx-auto">
      {/* 책 그림자 */}
      <div className="absolute inset-4 bg-primary/10 rounded-2xl blur-xl" />
      {/* 뒷표지 */}
      <div className="absolute top-4 left-4 w-full h-full bg-secondary/30 rounded-2xl border-2 border-secondary/40" />
      {/* 앞표지 */}
      <div className="relative w-full h-full bg-white rounded-2xl border-2 border-primary/20 shadow-xl flex flex-col items-center justify-center p-6 overflow-hidden">
        <div className="absolute top-3 right-3 text-2xl animate-twinkle">✨</div>
        <div className="absolute bottom-3 left-3 text-xl opacity-40">🌿</div>
        <div className="text-6xl mb-4">🧒</div>
        <p
          className="text-primary text-xl text-center leading-relaxed"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          우리 아이의
          <br />
          특별한 모험
        </p>
        <div className="mt-4 flex gap-2">
          <span className="w-2 h-2 rounded-full bg-primary" />
          <span className="w-2 h-2 rounded-full bg-secondary" />
          <span className="w-2 h-2 rounded-full bg-accent-blue" />
          <span className="w-2 h-2 rounded-full bg-accent-pink" />
        </div>
        {/* 책 접힘선 */}
        <div className="absolute left-0 top-0 bottom-0 w-4 bg-linear-to-r from-black/5 to-transparent" />
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      {/* 히어로 섹션 */}
      <section className="w-full py-16 sm:py-24 px-4 bg-cream relative overflow-hidden">
        <FloatingDecorations />
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center gap-12 relative z-10">
          {/* 좌측 텍스트 + CTA */}
          <div className="flex-1 text-center sm:text-left">
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl text-text leading-tight"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              우리 아이가
              <br />
              주인공인{" "}
              <span className="text-primary relative">
                동화책
                <svg className="absolute -bottom-2 left-0 w-full h-3" viewBox="0 0 200 12" preserveAspectRatio="none">
                  <path d="M0,8 Q50,0 100,8 T200,8" stroke="#FF8C42" strokeWidth="3" fill="none" opacity="0.4" />
                </svg>
              </span>
            </h1>
            <p className="mt-6 text-lg text-text-light max-w-md mx-auto sm:mx-0 leading-relaxed">
              사진 한 장이면 충분해요.
              <br />
              AI가 아이의 얼굴을 유지한 채
              <br />
              <strong className="text-text">세상에 하나뿐인 동화책</strong>을 만들어 드려요.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center sm:justify-start">
              <a href="/create">
                <Button size="lg">
                  📖 지금 만들기
                </Button>
              </a>
            </div>
            <p className="mt-4 text-sm text-text-lighter">
              ✨ 미리보기는 무료! 3분이면 완성돼요
            </p>
          </div>

          {/* 우측 동화책 모크업 */}
          <div className="flex-1 flex justify-center">
            <StoryBookMockup />
          </div>
        </div>
      </section>

      <WaveDivider fillFrom="#FFF8F0" fillTo="#FEF3E2" />

      {/* 3단계 안내 */}
      <section className="w-full py-16 px-4 bg-peach relative cloud-pattern">
        <div className="max-w-4xl mx-auto relative z-10">
          <h2
            className="text-3xl text-center text-text mb-4"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            이렇게 만들어져요!
          </h2>
          <p className="text-center text-text-light mb-12">
            단 3단계로 세상에 하나뿐인 동화책 완성
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center relative">
            {/* 점선 화살표 연결선 (데스크탑) */}
            <div className="hidden sm:block absolute top-16 left-[22%] right-[22%] z-0">
              <div className="flex items-center justify-between px-4">
                <div className="flex-1 dashed-arrow mx-4" />
                <div className="flex-1 dashed-arrow mx-4" />
              </div>
            </div>

            {[
              {
                step: "1",
                emoji: "📸",
                title: "사진 업로드",
                desc: "아이의 정면 사진 1장을 올려주세요",
                color: "bg-primary",
              },
              {
                step: "2",
                emoji: "🎨",
                title: "테마 선택",
                desc: "숲속 대모험, 우주 탐험대 중 선택!",
                color: "bg-secondary",
              },
              {
                step: "3",
                emoji: "📖",
                title: "동화책 완성",
                desc: "AI가 12페이지 동화책을 만들어요",
                color: "bg-accent-blue",
              },
            ].map((item) => (
              <div key={item.step} className="relative z-10">
                <div className="w-24 h-24 mx-auto rounded-full bg-white shadow-lg flex items-center justify-center text-5xl border-4 border-white">
                  {item.emoji}
                </div>
                <div className={`w-8 h-8 mx-auto -mt-3 rounded-full ${item.color} text-white flex items-center justify-center text-sm font-bold shadow-md`}
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {item.step}
                </div>
                <h3
                  className="mt-3 text-lg text-text"
                  style={{ fontFamily: "var(--font-heading)" }}
                >
                  {item.title}
                </h3>
                <p className="mt-1 text-sm text-text-light">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <WaveDivider fillFrom="#FEF3E2" fillTo="#FFF8F0" />

      {/* 가격 안내 */}
      <section className="w-full py-16 px-4 bg-cream relative">
        <div className="max-w-4xl mx-auto text-center">
          <h2
            className="text-3xl text-text mb-2"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            가격 안내
          </h2>
          <p className="text-text-light mb-10">
            미리보기는 무료! 마음에 드시면 결제해주세요 💛
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-2xl mx-auto">
            {/* 디지털 PDF */}
            <div className="bg-white rounded-3xl shadow-md p-8 border-2 border-accent-blue/20 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="text-4xl mb-3">💾</div>
              <h3
                className="text-lg text-text"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                디지털 PDF
              </h3>
              <p className="text-3xl font-extrabold mt-3 text-text">
                9,900
                <span className="text-sm font-normal text-text-light">원</span>
              </p>
              <p className="text-sm text-text-light mt-2">
                고해상도 PDF 즉시 다운로드
              </p>
            </div>

            {/* 소프트커버 책 */}
            <div className="bg-white rounded-3xl shadow-lg p-8 border-2 border-primary relative overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              {/* 리본 뱃지 */}
              <div className="ribbon-badge">
                <span>인기</span>
              </div>
              <div className="text-4xl mb-3">📚</div>
              <h3
                className="text-lg text-text"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                소프트커버 책
              </h3>
              <p className="text-3xl font-extrabold mt-3 text-primary">
                29,900
                <span className="text-sm font-normal text-text-light">원</span>
              </p>
              <p className="text-sm text-text-light mt-2">
                실물 동화책 + PDF (무료 배송)
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA 섹션 */}
      <section className="w-full py-16 px-4 bg-linear-to-b from-cream to-peach text-center">
        <div className="text-5xl mb-4 animate-gentle-bounce">📖</div>
        <h2
          className="text-2xl sm:text-3xl text-text mb-4"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          지금 바로 만들어 볼까요?
        </h2>
        <p className="text-text-light mb-8 max-w-md mx-auto">
          사진 한 장이면 3분 만에 미리보기를 받아볼 수 있어요
        </p>
        <a href="/create">
          <Button size="lg">
            ✨ 동화책 만들기 시작
          </Button>
        </a>
      </section>
    </div>
  );
}
