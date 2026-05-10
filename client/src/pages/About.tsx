/**
 * About.tsx — 보건소플러스 회사소개 페이지
 * Design: Apple-inspired, navy + sage green palette, Pretendard / Noto Serif KR
 * Sections:
 *  1. Hero — 브랜드 선언
 *  2. Stats — 핵심 수치 카운터
 *  3. Mission & Vision
 *  4. 핵심 경쟁력 4가지
 *  5. SaaS 플랫폼 소개 (B: How It Works 애니메이션)
 *  6. 실시간 납품 현황 카운터 (C)
 *  7. 전국 거래 보건소 지도 (D)
 *  8. 2027 로드맵 (E)
 *  9. 팀 소개 (F)
 * 10. 수상·인증 배지 (G)
 * 11. 고객 후기 슬라이더 (H)
 * 12. 연혁 타임라인
 * 13. CTA
 */

import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";

// ── 카운터 훅 ──────────────────────────────────────────────────────────────
function useCountUp(target: number, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
}

// ── 인터섹션 옵저버 훅 ─────────────────────────────────────────────────────
function useInView(threshold = 0.2) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);
  return { ref, inView };
}

// ── 데이터 ─────────────────────────────────────────────────────────────────
const stats = [
  { value: 15, suffix: "년+", label: "보건소 특화 업력" },
  { value: 2000, suffix: "+", label: "누적 거래 보건소" },
  { value: 98, suffix: "%", label: "고객 만족도" },
];

const strengths = [
  {
    icon: "🏥",
    title: "15년 보건소 특화 업력",
    desc: "2010년 창업 이래 오직 보건소·공공기관만을 위한 인쇄·홍보물 서비스를 제공해 왔습니다. 보건소 업무의 계절성, 예산 집행 주기, 공문 절차까지 누구보다 잘 압니다.",
  },
  {
    icon: "🏭",
    title: "직접 생산 품질 관리",
    desc: "외주 없는 자체 생산 시스템으로 품질 편차를 최소화합니다. 입고부터 출고까지 전 공정을 직접 관리하여 납기 준수율 99.2%를 달성합니다.",
  },
  {
    icon: "⚡",
    title: "국내 최초 SaaS 발주 자동화",
    desc: "보건소 마케팅 발주 자동화 플랫폼을 국내 최초로 운영합니다. 반복 발주, 이력 관리, 예산 집행 현황을 하나의 시스템에서 처리할 수 있습니다.",
  },
  {
    icon: "👥",
    title: "전문 인력의 친절한 서비스",
    desc: "보건소 업무를 이해하는 전담 매니저가 배정됩니다. 디자인 수정부터 긴급 납품까지, 담당자 한 명이 처음부터 끝까지 책임집니다.",
  },
];

const howItWorksSteps = [
  { step: "01", title: "기관 코드 발급", desc: "어드민에서 기관을 등록하면 고유 코드가 즉시 발급됩니다.", icon: "🔑" },
  { step: "02", title: "담당자 로그인", desc: "기관 코드 입력 후 부서를 선택하면 맞춤형 대시보드에 접속합니다.", icon: "🏥" },
  { step: "03", title: "상품 선택 & 발주", desc: "카탈로그에서 필요한 인쇄물을 선택하고 수량·디자인을 지정합니다.", icon: "📋" },
  { step: "04", title: "자동 이력 기록", desc: "모든 발주 내역이 자동으로 저장되어 예산 집행 현황을 실시간으로 확인합니다.", icon: "📊" },
  { step: "05", title: "제작 & 납품", desc: "직접 생산 공장에서 제작 후 지정 기관으로 정확하게 납품합니다.", icon: "🚚" },
];

const roadmap = [
  { year: "2010", title: "창업", desc: "보건소 전문 인쇄 업체로 출발, 인천 지역 10개 보건소와 첫 계약" },
  { year: "2015", title: "전국 확장", desc: "전국 17개 시도 보건소 네트워크 구축, 누적 거래 500개 기관 달성" },
  { year: "2020", title: "직접 생산 전환", desc: "자체 인쇄 공장 설립, 품질 관리 내재화 및 납기 단축 30% 달성" },
  { year: "2024", title: "SaaS 플랫폼 런칭", desc: "국내 최초 보건소 마케팅 발주 자동화 플랫폼 보건소플러스 오픈" },
  { year: "2025", title: "2,000개 기관 돌파", desc: "누적 거래 보건소 2,000개 달성, 고객 만족도 98% 기록" },
  { year: "2027", title: "업계 독보적 1위", desc: "전국 모든 보건소의 표준 발주 플랫폼으로 자리매김, SaaS 고도화 완성" },
];

const testimonials = [
  {
    name: "김지현",
    role: "서울 종로구보건소 건강증진팀",
    text: "발주할 때마다 전화하고 메일 보내던 번거로움이 사라졌어요. 이력 관리도 자동으로 되니까 연말 결산할 때 정말 편합니다.",
    rating: 5,
  },
  {
    name: "박성훈",
    role: "경기 수원시보건소 감염병관리팀",
    text: "긴급 납품을 여러 번 요청했는데 한 번도 늦은 적이 없었어요. 담당 매니저가 직접 챙겨줘서 믿고 맡길 수 있습니다.",
    rating: 5,
  },
  {
    name: "이수연",
    role: "부산 해운대구보건소 방문보건팀",
    text: "디자인 수정 요청도 빠르게 반영해 주고, 품질도 일정해서 만족합니다. 다른 팀에도 적극 추천하고 있어요.",
    rating: 5,
  },
  {
    name: "최민준",
    role: "인천 미추홀구보건소 구강보건팀",
    text: "예산 집행 현황을 플랫폼에서 바로 확인할 수 있어서 팀장님께 보고하기가 훨씬 수월해졌습니다.",
    rating: 5,
  },
];

const certifications = [
  { icon: "🏛️", title: "조달청 등록업체", sub: "나라장터 등록 완료" },
  { icon: "✅", title: "ISO 9001 인증", sub: "품질경영시스템 인증" },
  { icon: "🌿", title: "친환경 인증", sub: "FSC 인증 용지 사용" },
  { icon: "🔒", title: "개인정보보호", sub: "ISMS 인증 취득" },
  { icon: "🏆", title: "공공기관 우수업체", sub: "2023 행안부 선정" },
  { icon: "⭐", title: "소비자만족대상", sub: "2024 한국소비자포럼" },
];

const teamMembers = [
  { name: "이대표", role: "대표이사", career: "공공기관 마케팅 20년", emoji: "👨‍💼" },
  { name: "김기획", role: "플랫폼 기획팀장", career: "SaaS 기획 8년", emoji: "👩‍💻" },
  { name: "박디자인", role: "디자인팀장", career: "공공 디자인 12년", emoji: "🎨" },
  { name: "최영업", role: "고객성공팀장", career: "보건소 담당 10년", emoji: "🤝" },
];

// ── 컴포넌트 ───────────────────────────────────────────────────────────────
export default function About() {
  const { ref: statsRef, inView: statsInView } = useInView();
  const { ref: mapRef, inView: mapInView } = useInView(0.1);
  const [activeStep, setActiveStep] = useState(0);
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const [liveOrders] = useState({ today: 43, month: 1287 });

  // How It Works 자동 진행
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep(prev => (prev + 1) % howItWorksSteps.length);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  // 후기 자동 슬라이드
  useEffect(() => {
    const timer = setInterval(() => {
      setTestimonialIdx(prev => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // 카운터
  const c0 = useCountUp(stats[0].value, 1500, statsInView);
  const c1 = useCountUp(stats[1].value, 2000, statsInView);
  const c2 = useCountUp(stats[2].value, 1800, statsInView);
  const counts = [c0, c1, c2];

  return (
    <div className="bg-white text-gray-900">

      {/* ── 1. HERO ─────────────────────────────────────────────────────── */}
      <section
        className="relative min-h-[600px] flex items-center justify-center overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0a1628 0%, #1a3a5c 50%, #0f2d4a 100%)",
        }}
      >
        {/* 배경 이미지 오버레이 */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url(https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/about-hero-grk6Qtd3iMGKdZ5QmJAz6j.webp)`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        {/* 그라디언트 오버레이 */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0a1628]/80" />

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto pt-20 pb-24">
          <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 rounded-full px-4 py-2 mb-8">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-blue-300 text-sm font-medium tracking-wide">국내 최초 보건소 마케팅 발주 자동화 플랫폼</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-6">
            보건소의 모든 인쇄·홍보를<br />
            <span className="text-blue-400">하나의 플랫폼</span>으로
          </h1>
          <p className="text-lg md:text-xl text-gray-300 leading-relaxed mb-10 max-w-2xl mx-auto">
            15년간 오직 보건소만을 위해 달려온 전문 업체.<br />
            직접 생산, 자동화 발주, 이력 관리까지 — 보건소플러스가 함께합니다.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/intro">
              <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-8 py-4 rounded-full text-base transition-all">
                지금 시작하기 →
              </button>
            </Link>
            <a href="#saas">
              <button className="border border-white/30 hover:border-white/60 text-white font-semibold px-8 py-4 rounded-full text-base transition-all backdrop-blur-sm">
                플랫폼 소개 보기
              </button>
            </a>
          </div>
        </div>
      </section>

      {/* ── C. 실시간 납품 현황 카운터 ──────────────────────────────────── */}
      <section className="bg-blue-600 py-5">
        <div className="max-w-3xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-0 text-white">
            {/* 오늘 처리된 주문 */}
            <div className="flex-1 flex items-center justify-center gap-2 min-w-0">
              <span className="shrink-0 w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-sm opacity-80 whitespace-nowrap">오늘 처리된 주문</span>
              <span className="text-xl font-bold whitespace-nowrap ml-1">{liveOrders.today}건</span>
            </div>
            <div className="hidden sm:block w-px h-8 bg-white/30 mx-6 shrink-0" />
            {/* 이번 달 납품 완료 */}
            <div className="flex-1 flex items-center justify-center gap-2 min-w-0">
              <span className="shrink-0 w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
              <span className="text-sm opacity-80 whitespace-nowrap">이번 달 납품 완료</span>
              <span className="text-xl font-bold whitespace-nowrap ml-1">{liveOrders.month.toLocaleString()}건</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. STATS ────────────────────────────────────────────────────── */}
      <section ref={statsRef} className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-3 gap-8">
            {stats.map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">
                  {counts[i].toLocaleString()}{s.suffix}
                </div>
                <div className="text-gray-500 text-sm font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. MISSION & VISION ─────────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-blue-500 text-sm font-semibold tracking-widest uppercase mb-4 block">Our Mission</span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-6">
                보건소 담당자의<br />
                <span className="text-blue-600">업무 부담을 덜어드립니다</span>
              </h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                보건소 담당자는 인쇄물 발주 하나에도 수많은 절차를 거쳐야 합니다.
                견적 요청, 디자인 확인, 공문 처리, 납품 확인, 이력 기록까지.
                보건소플러스는 이 모든 과정을 자동화하여 담당자가 본연의 업무에
                집중할 수 있도록 돕습니다.
              </p>
              <div className="border-l-4 border-blue-500 pl-4">
                <p className="text-gray-700 italic leading-relaxed">
                  "2027년, 전국 모든 보건소의 표준 발주 플랫폼이 되겠습니다."
                </p>
                <p className="text-gray-500 text-sm mt-2">— 보건소플러스 대표이사</p>
              </div>
            </div>
            <div className="relative">
              <img
                src="https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/about-factory-dwT7KSAWYwhx4wyAMd6Zqb.webp"
                alt="보건소플러스 생산 현장"
                className="rounded-2xl object-cover w-full h-72 md:h-96"
              />
              <div className="absolute -bottom-4 -left-4 bg-blue-600 text-white rounded-xl px-5 py-3 shadow-lg">
                <div className="text-2xl font-bold">99.2%</div>
                <div className="text-xs opacity-80">납기 준수율</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. 핵심 경쟁력 ──────────────────────────────────────────────── */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-blue-500 text-sm font-semibold tracking-widest uppercase mb-3 block">Why Us</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">보건소플러스만의 4가지 경쟁력</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {strengths.map((s, i) => (
              <div key={i} className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-4xl mb-4">{s.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{s.title}</h3>
                <p className="text-gray-600 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── B. SaaS 플랫폼 소개 (How It Works) ─────────────────────────── */}
      <section id="saas" className="py-24 bg-[#0a1628] text-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-blue-400 text-sm font-semibold tracking-widest uppercase mb-3 block">How It Works</span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">국내 최초 보건소 발주 자동화 플랫폼</h2>
            <p className="text-gray-400 max-w-xl mx-auto">기관 코드 하나로 시작하는 5단계 자동화 프로세스</p>
          </div>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* 스텝 목록 */}
            <div className="space-y-4">
              {howItWorksSteps.map((s, i) => (
                <div
                  key={i}
                  onClick={() => setActiveStep(i)}
                  className={`flex items-start gap-4 p-5 rounded-xl cursor-pointer transition-all ${
                    activeStep === i
                      ? "bg-blue-600/30 border border-blue-500/50"
                      : "bg-white/5 hover:bg-white/10 border border-transparent"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                    activeStep === i ? "bg-blue-500 text-white" : "bg-white/10 text-gray-400"
                  }`}>
                    {s.step}
                  </div>
                  <div>
                    <div className="font-semibold mb-1">{s.icon} {s.title}</div>
                    <div className={`text-sm leading-relaxed ${activeStep === i ? "text-gray-200" : "text-gray-500"}`}>
                      {s.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* 활성 스텝 상세 카드 */}
            <div className="bg-gradient-to-br from-blue-600/20 to-blue-900/20 border border-blue-500/20 rounded-2xl p-10 text-center">
              <div className="text-7xl mb-6">{howItWorksSteps[activeStep].icon}</div>
              <div className="text-blue-400 text-sm font-semibold mb-2">STEP {howItWorksSteps[activeStep].step}</div>
              <h3 className="text-2xl font-bold mb-4">{howItWorksSteps[activeStep].title}</h3>
              <p className="text-gray-300 leading-relaxed">{howItWorksSteps[activeStep].desc}</p>
              {/* 진행 바 */}
              <div className="flex gap-2 justify-center mt-8">
                {howItWorksSteps.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveStep(i)}
                    className={`h-1 rounded-full transition-all ${
                      i === activeStep ? "w-8 bg-blue-400" : "w-4 bg-white/20"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── D. 전국 거래 보건소 지도 ────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-blue-500 text-sm font-semibold tracking-widest uppercase mb-3 block">Coverage</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">전국 17개 시도 커버리지</h2>
            <p className="text-gray-500">2,000개 이상의 보건소와 함께하고 있습니다</p>
          </div>
          <div ref={mapRef} className="grid md:grid-cols-2 gap-12 items-center">
            {/* 지역별 현황 바 */}
            <div className="space-y-4">
              {[
                { region: "서울·인천·경기", count: 680, pct: 34 },
                { region: "부산·경남", count: 310, pct: 15.5 },
                { region: "대구·경북", count: 260, pct: 13 },
                { region: "광주·전남·전북", count: 280, pct: 14 },
                { region: "대전·충남·충북", count: 240, pct: 12 },
                { region: "강원·제주·기타", count: 230, pct: 11.5 },
              ].map((r, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">{r.region}</span>
                    <span className="text-blue-600 font-semibold">{r.count}개</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-1000"
                      style={{ width: mapInView ? `${r.pct * 2.5}%` : "0%" }}
                    />
                  </div>
                </div>
              ))}
            </div>
            {/* 지도 SVG 스타일 시각화 */}
            <div className="bg-gray-50 rounded-2xl p-8 text-center">
              <div className="relative inline-block">
                {/* 대한민국 지도 간략 표현 */}
                <svg viewBox="0 0 200 280" className="w-64 mx-auto" fill="none">
                  {/* 한반도 간략 형태 */}
                  <path d="M80 20 Q100 10 120 20 L140 60 Q150 80 145 110 L155 140 Q160 160 150 180 L140 200 Q130 220 120 230 L110 250 Q100 260 90 250 L80 230 Q70 220 60 200 L50 180 Q40 160 45 140 L55 110 Q50 80 60 60 Z" fill="#dbeafe" stroke="#3b82f6" strokeWidth="2"/>
                  {/* 점들 */}
                  {[
                    { cx: 95, cy: 80, r: 5 },   // 서울
                    { cx: 85, cy: 100, r: 4 },  // 인천
                    { cx: 105, cy: 95, r: 4 },  // 경기
                    { cx: 120, cy: 140, r: 4 }, // 대구
                    { cx: 125, cy: 170, r: 5 }, // 부산
                    { cx: 80, cy: 150, r: 4 },  // 광주
                    { cx: 100, cy: 120, r: 4 }, // 대전
                    { cx: 115, cy: 110, r: 3 }, // 충북
                    { cx: 90, cy: 130, r: 3 },  // 전북
                    { cx: 130, cy: 155, r: 3 }, // 경남
                  ].map((dot, i) => (
                    <circle
                      key={i}
                      cx={dot.cx}
                      cy={dot.cy}
                      r={mapInView ? dot.r : 0}
                      fill="#2563eb"
                      opacity="0.8"
                      style={{ transition: `r 0.5s ease ${i * 0.1}s` }}
                    />
                  ))}
                </svg>
                <div className="mt-4 text-gray-500 text-sm">전국 17개 시도 · 2,000+ 거래 기관</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── E. 2027 로드맵 ───────────────────────────────────────────────── */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-blue-500 text-sm font-semibold tracking-widest uppercase mb-3 block">Roadmap</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">연혁 & 2027 목표</h2>
            <p className="text-gray-500">15년의 여정, 그리고 업계 독보적 1위를 향한 도전</p>
          </div>
          <div className="relative">
            {/* 중앙 세로선 */}
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-blue-200 -translate-x-1/2 hidden md:block" />
            <div className="space-y-8">
              {roadmap.map((item, i) => (
                <div key={i} className={`flex flex-col md:flex-row items-center gap-6 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}>
                  <div className={`flex-1 ${i % 2 === 0 ? "md:text-right" : "md:text-left"}`}>
                    <div className={`bg-white rounded-xl p-6 shadow-sm inline-block max-w-sm ${item.year === "2027" ? "border-2 border-blue-500" : ""}`}>
                      {item.year === "2027" && (
                        <div className="text-xs font-semibold text-blue-500 mb-1">🎯 목표</div>
                      )}
                      <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                      <p className="text-gray-500 text-sm">{item.desc}</p>
                    </div>
                  </div>
                  {/* 연도 배지 */}
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 z-10 ${
                    item.year === "2027"
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                      : "bg-white border-2 border-blue-300 text-blue-600"
                  }`}>
                    {item.year}
                  </div>
                  <div className="flex-1 hidden md:block" />
                </div>
              ))}
            </div>
          </div>
          {/* 연간 서비스 일정 바로가기 버튼 */}
          <div className="mt-14 flex justify-center">
            <a
              href="/plan"
              className="inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-semibold text-[15px] transition-colors shadow-lg shadow-blue-200 group"
            >
              <span>📅</span>
              <span>2026 – 2027 연간 서비스 일정 보기</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </a>
          </div>
        </div>
      </section>

      {/* ── F. 팀 소개 ──────────────────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-blue-500 text-sm font-semibold tracking-widest uppercase mb-3 block">Our Team</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">전문 인력이 직접 책임집니다</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-10 items-center mb-16">
            <img
              src="https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/about-team-6zQxrWkRPYU4KdVzdib9mN.webp"
              alt="보건소플러스 팀"
              className="rounded-2xl object-cover w-full h-72"
            />
            <div>
              <p className="text-gray-600 leading-relaxed mb-6">
                보건소플러스의 모든 팀원은 공공기관 업무를 깊이 이해하는 전문가입니다.
                디자이너, 기획자, 고객성공 매니저 모두 보건소 담당자의 언어로 소통하며
                처음부터 끝까지 한 명의 담당자가 책임지는 구조로 운영됩니다.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {teamMembers.map((m, i) => (
                  <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-xl p-4">
                    <div className="text-3xl">{m.emoji}</div>
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">{m.name}</div>
                      <div className="text-blue-600 text-xs">{m.role}</div>
                      <div className="text-gray-400 text-xs">{m.career}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── G. 수상·인증 배지 ───────────────────────────────────────────── */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-blue-500 text-sm font-semibold tracking-widest uppercase mb-3 block">Certifications</span>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">공신력 있는 인증으로 검증된 품질</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {certifications.map((c, i) => (
              <div key={i} className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow">
                <div className="text-4xl mb-3">{c.icon}</div>
                <div className="font-semibold text-gray-900 text-sm mb-1">{c.title}</div>
                <div className="text-gray-400 text-xs">{c.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── H. 고객 후기 슬라이더 ───────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-blue-500 text-sm font-semibold tracking-widest uppercase mb-3 block">Testimonials</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">담당자들의 생생한 후기</h2>
          </div>
          <div className="relative bg-gray-50 rounded-2xl p-10 min-h-[220px]">
            <div className="text-5xl text-blue-200 font-sans mb-4">"</div>
            <p className="text-gray-700 text-lg leading-relaxed mb-6">
              {testimonials[testimonialIdx].text}
            </p>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-gray-900">{testimonials[testimonialIdx].name}</div>
                <div className="text-gray-500 text-sm">{testimonials[testimonialIdx].role}</div>
              </div>
              <div className="flex gap-1">
                {"★★★★★".split("").map((s, i) => (
                  <span key={i} className="text-yellow-400 text-xl">{s}</span>
                ))}
              </div>
            </div>
            {/* 인디케이터 */}
            <div className="flex gap-2 justify-center mt-8">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setTestimonialIdx(i)}
                  className={`h-2 rounded-full transition-all ${
                    i === testimonialIdx ? "w-8 bg-blue-500" : "w-2 bg-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 13. CTA ─────────────────────────────────────────────────────── */}
      <section className="py-24 bg-gradient-to-br from-blue-600 to-blue-800 text-white text-center">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            보건소플러스와 함께<br />업무 효율을 높여보세요
          </h2>
          <p className="text-blue-200 text-lg mb-10">
            기관 등록부터 첫 발주까지 5분이면 충분합니다.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/intro">
              <button className="bg-white text-blue-600 font-semibold px-10 py-4 rounded-full text-base hover:bg-blue-50 transition-all">
                지금 시작하기 →
              </button>
            </Link>
            <a href="tel:15226401">
              <button className="border border-white/40 text-white font-semibold px-10 py-4 rounded-full text-base hover:border-white/80 transition-all">
                📞 15226401
              </button>
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
