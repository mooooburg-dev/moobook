import Image from 'next/image';
import Link from 'next/link';
import { Button } from "@/components/ui/button";

function WaveDivider({
  fillFrom,
  fillTo,
}: {
  fillFrom: string;
  fillTo: string;
}) {
  return (
    <div className="wave-divider">
      <svg
        viewBox="0 0 1440 48"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient
            id={`wave-${fillFrom}-${fillTo}`}
            x1="0"
            y1="0"
            x2="1"
            y2="0"
          >
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
      <span
        className="absolute top-[10%] left-[8%] text-3xl animate-float opacity-40"
        style={{ animationDelay: '0s' }}
      >
        ⭐
      </span>
      <span
        className="absolute top-[15%] right-[12%] text-2xl animate-float opacity-30"
        style={{ animationDelay: '1s' }}
      >
        🌙
      </span>
      <span
        className="absolute top-[40%] left-[5%] text-2xl animate-float opacity-25"
        style={{ animationDelay: '2s' }}
      >
        ☁️
      </span>
      <span
        className="absolute top-[60%] right-[8%] text-3xl animate-float opacity-30"
        style={{ animationDelay: '0.5s' }}
      >
        ✨
      </span>
      <span
        className="absolute bottom-[20%] left-[15%] text-2xl animate-float opacity-35"
        style={{ animationDelay: '1.5s' }}
      >
        🌟
      </span>
      <span
        className="absolute bottom-[10%] right-[20%] text-2xl animate-float opacity-25"
        style={{ animationDelay: '2.5s' }}
      >
        ☁️
      </span>
    </div>
  );
}

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      {/* 히어로 섹션 */}
      <section className="w-full min-h-[520px] sm:min-h-[600px] lg:min-h-[640px] xl:min-h-[680px] py-16 sm:py-20 px-4 bg-cream relative overflow-hidden flex items-center">
        {/* 배경 사진 영역 */}
        <div className="absolute inset-0 flex justify-center items-center">
          {/* 사진 컨테이너 - 가로 길이를 더 키워 웅장한 느낌을 주되 상하 잘림은 최소화 */}
          <div className="relative w-full max-w-[1100px] xl:max-w-[1300px] h-full mx-auto">
            <Image
              src="/images/hero-child.jpg"
              alt="동화책을 읽고 있는 아이"
              fill
              sizes="(max-width: 1100px) 100vw, 1300px"
              className="object-cover object-[center_40%]"
              style={{
                filter: 'brightness(1.12) contrast(0.93) saturate(1.05)',
              }}
              priority
            />
            {/* 좌측 페이드 — 텍스트 가독성을 위해 넉넉한 범위의 그라데이션 */}
            <div
              className="absolute inset-y-0 left-0 w-[45%] lg:w-[40%]"
              style={{
                background:
                  'linear-gradient(to right, #FFF8F0 0%, rgba(255,248,240,0.8) 30%, transparent 100%)',
              }}
            />
            {/* 우측 페이드 — 가로 양끝을 부드럽게 날림 */}
            <div
              className="absolute inset-y-0 right-0 w-[20%] sm:w-[25%]"
              style={{
                background:
                  'linear-gradient(to left, #FFF8F0 0%, rgba(255,248,240,0.8) 40%, transparent 100%)',
              }}
            />
            {/* 상단 페이드 */}
            <div
              className="absolute inset-x-0 top-0 h-32 lg:h-40"
              style={{
                background:
                  'linear-gradient(to bottom, #FFF8F0 0%, rgba(255,248,240,0.5) 40%, transparent 100%)',
              }}
            />
            {/* 하단 페이드 */}
            <div
              className="absolute inset-x-0 bottom-0 h-40 lg:h-48"
              style={{
                background:
                  'linear-gradient(to top, #FFF8F0 0%, rgba(255,248,240,0.6) 40%, transparent 100%)',
              }}
            />
          </div>
        </div>

        {/* 데스크탑에서 텍스트 영역의 가독성을 확실하게 확보하기 위한 추가 페이드 */}
        <div
          className="absolute inset-y-0 left-0 w-1/2 sm:w-[45%] hidden sm:block pointer-events-none"
          style={{
            background:
              'linear-gradient(to right, #FFF8F0 10%, rgba(255,248,240,0.8) 60%, transparent 100%)',
          }}
        />

        {/* 모바일 화면에서 중앙 텍스트 가독성을 보호하기 위한 상하단 그라데이션 오버레이 */}
        <div
          className="absolute inset-0 sm:hidden pointer-events-none"
          style={{
            background:
              'linear-gradient(to bottom, rgba(255,248,240,0.95) 15%, rgba(255,248,240,0.75) 45%, rgba(255,248,240,0.4) 70%, transparent 100%)',
          }}
        />

        <FloatingDecorations />

        <div className="max-w-5xl mx-auto w-full relative z-10">
          {/* 좌측 텍스트 + CTA */}
          <div className="max-w-xl text-center sm:text-left">
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl text-text leading-tight drop-shadow-sm"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              우리 아이가
              <br />
              주인공인{' '}
              <span className="text-brand relative">
                동화책
                <svg
                  className="absolute -bottom-2 left-0 w-full h-3"
                  viewBox="0 0 200 12"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M0,8 Q50,0 100,8 T200,8"
                    stroke="#FF8C42"
                    strokeWidth="3"
                    fill="none"
                    opacity="0.4"
                  />
                </svg>
              </span>
            </h1>
            <p className="mt-6 text-lg text-text max-w-md mx-auto sm:mx-0 leading-relaxed">
              사진 한 장이면 충분해요.
              <br />
              아이의 얼굴 그대로, 아이가 가장 좋아하는 이야기로,
              <br />
              <strong className="text-text">세상에 하나뿐인 동화책</strong>을
              만들어 드려요.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center sm:justify-start">
              <Link href="/create">
                <Button size="lg">📖 지금 만들기</Button>
              </Link>
            </div>
            <p className="mt-4 text-sm text-text-light">
              ✨ 미리보기는 무료! 3분이면 완성돼요
            </p>
          </div>
        </div>

        {/* 하단 WaveDivider (히어로 내부 배치로 간격 제거) */}
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <WaveDivider fillFrom="#FFF8F0" fillTo="#FEF3E2" />
        </div>
      </section>

      {/* 3단계 안내 */}
      <section className="w-full py-16 px-4 bg-peach relative cloud-pattern">
        <div className="max-w-4xl mx-auto relative z-10">
          <h2
            className="text-3xl text-center text-text mb-4"
            style={{ fontFamily: 'var(--font-heading)' }}
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
                step: '1',
                emoji: '📸',
                title: '사진 업로드',
                desc: '아이의 정면 사진 1장을 올려주세요',
                color: 'bg-brand',
              },
              {
                step: '2',
                emoji: '🎨',
                title: '테마 선택',
                desc: '숲속 대모험, 우주 탐험대 중 선택!',
                color: 'bg-brand-secondary',
              },
              {
                step: '3',
                emoji: '📖',
                title: '동화책 완성',
                desc: '12페이지 동화책이 뚝딱 완성돼요',
                color: 'bg-brand-blue',
              },
            ].map((item) => (
              <div key={item.step} className="relative z-10">
                <div className="w-24 h-24 mx-auto rounded-full bg-white shadow-lg flex items-center justify-center text-5xl border-4 border-white">
                  {item.emoji}
                </div>
                <div
                  className={`w-8 h-8 mx-auto -mt-3 rounded-full ${item.color} text-white flex items-center justify-center text-sm font-bold shadow-md`}
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  {item.step}
                </div>
                <h3
                  className="mt-3 text-lg text-text"
                  style={{ fontFamily: 'var(--font-heading)' }}
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
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            가격 안내
          </h2>
          <p className="text-text-light mb-10">
            미리보기는 무료! 마음에 드시면 결제해주세요 💛
          </p>

          <div className="max-w-md mx-auto">
            {/* 소프트커버 책 */}
            <div className="bg-white rounded-3xl shadow-lg p-8 border-2 border-brand relative overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="text-4xl mb-3">📚</div>
              <h3
                className="text-lg text-text"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                소프트커버 책
              </h3>
              <p className="text-3xl font-extrabold mt-3 text-brand">
                29,900
                <span className="text-sm font-normal text-text-light">원</span>
              </p>
              <p className="text-sm text-text-light mt-2">
                실물 동화책 (무료 배송)
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
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          지금 바로 만들어 볼까요?
        </h2>
        <p className="text-text-light mb-8 max-w-md mx-auto">
          사진 한 장이면 3분 만에 미리보기를 받아볼 수 있어요
        </p>
        <Link href="/create">
          <Button size="lg">✨ 동화책 만들기 시작</Button>
        </Link>
      </section>
    </div>
  );
}
