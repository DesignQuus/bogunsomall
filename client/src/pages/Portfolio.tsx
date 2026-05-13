"use client";

/**
 * Portfolio.tsx
 * - 보건소플러스 제작 사례 포트폴리오 페이지
 * - 카테고리별 필터링, 제작 사례 갤러리
 */
import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";

const CATEGORIES = [
  { id: "all", label: "전체" },
  { id: "namecard", label: "명함" },
  { id: "sticker", label: "스티커" },
  { id: "envelope", label: "봉투" },
  { id: "campaign", label: "캠페인 부착물" },
  { id: "digital", label: "디지털소량인쇄" },
  { id: "calendar", label: "캘린더" },
  { id: "shopping", label: "쇼핑백" },
];

const PORTFOLIO_ITEMS = [
  {
    id: 1,
    category: "namecard",
    title: "서울시 강남구 보건소 명함",
    desc: "표준 규격 양면 명함 / 350g 소프트 코팅",
    region: "서울",
    color: "#00A39B",
    bg: "#EBF3FF",
    icon: "🪪",
    tags: ["표준명함", "양면인쇄", "소프트코팅"],
  },
  {
    id: 2,
    category: "campaign",
    title: "금연 캠페인 포스터",
    desc: "A3 사이즈 / 무광 코팅 / 금연 사업",
    region: "부산",
    color: "#34C759",
    bg: "#EDFBF1",
    icon: "🚭",
    tags: ["금연사업", "포스터", "A3"],
  },
  {
    id: 3,
    category: "sticker",
    title: "예방접종 안내 스티커",
    desc: "원형 50mm / 특수지 / 방수 코팅",
    region: "대구",
    color: "#FF9500",
    bg: "#FFF4E5",
    icon: "💉",
    tags: ["예방접종", "원형스티커", "방수"],
  },
  {
    id: 4,
    category: "envelope",
    title: "보건소 공문 봉투",
    desc: "대봉투 / 2도 인쇄 / 기관 로고 포함",
    region: "인천",
    color: "#5856D6",
    bg: "#F0EFFE",
    icon: "✉️",
    tags: ["대봉투", "공문", "2도인쇄"],
  },
  {
    id: 5,
    category: "digital",
    title: "치매 예방 리플렛",
    desc: "3단 접지 / A4 / 4도 풀컬러",
    region: "광주",
    color: "#FF2D55",
    bg: "#FFF0F3",
    icon: "📄",
    tags: ["치매예방", "리플렛", "3단접지"],
  },
  {
    id: 6,
    category: "calendar",
    title: "2025 보건사업 탁상 캘린더",
    desc: "탁상용 / 월별 보건 정보 수록",
    region: "대전",
    color: "#007AFF",
    bg: "#E5F2FF",
    icon: "📅",
    tags: ["탁상캘린더", "2025", "보건정보"],
  },
  {
    id: 7,
    category: "shopping",
    title: "건강 캠페인 쇼핑백",
    desc: "맞춤 쇼핑백 / 무광 코팅 / 기관 로고",
    region: "울산",
    color: "#30B0C7",
    bg: "#E5F7FA",
    icon: "🛍️",
    tags: ["쇼핑백", "맞춤제작", "무광코팅"],
  },
  {
    id: 8,
    category: "campaign",
    title: "심뇌혈관 예방 현수막",
    desc: "현수막 900×2700mm / 디지털 출력",
    region: "경기",
    color: "#FF3B30",
    bg: "#FFF0EF",
    icon: "❤️",
    tags: ["심뇌혈관", "현수막", "디지털출력"],
  },
  {
    id: 9,
    category: "namecard",
    title: "경기도 수원시 보건소 명함",
    desc: "표준 규격 단면 명함 / 250g 유광 코팅",
    region: "경기",
    color: "#00A39B",
    bg: "#EBF3FF",
    icon: "🪪",
    tags: ["표준명함", "단면인쇄", "유광코팅"],
  },
  {
    id: 10,
    category: "digital",
    title: "영양 관리 안내 전단지",
    desc: "A5 전단지 / 4도 풀컬러 / 무광 코팅",
    region: "충북",
    color: "#34C759",
    bg: "#EDFBF1",
    icon: "🥗",
    tags: ["영양관리", "전단지", "A5"],
  },
  {
    id: 11,
    category: "sticker",
    title: "구강 보건 홍보 스티커",
    desc: "사각형 70×70mm / 일반지 / 4도 인쇄",
    region: "전남",
    color: "#5AC8FA",
    bg: "#EAF7FF",
    icon: "🦷",
    tags: ["구강보건", "사각스티커", "4도인쇄"],
  },
  {
    id: 12,
    category: "envelope",
    title: "모자 보건 소봉투",
    desc: "소봉투 / 1도 인쇄 / 기관명 포함",
    region: "경남",
    color: "#FF9500",
    bg: "#FFF4E5",
    icon: "👶",
    tags: ["모자보건", "소봉투", "1도인쇄"],
  },
];

const STATS = [
  { value: "2,000+", label: "누적 제작 건수" },
  { value: "200+", label: "협력 보건기관" },
  { value: "98%", label: "재주문율" },
  { value: "7년+", label: "전문 경력" },
];

export default function Portfolio() {
  const [activeCategory, setActiveCategory] = useState("all");

  const filtered =
    activeCategory === "all"
      ? PORTFOLIO_ITEMS
      : PORTFOLIO_ITEMS.filter((item) => item.category === activeCategory);

  return (
    <div className="min-h-screen bg-[#fbfbfd]">
      {/* 히어로 섹션 */}
      <section className="bg-[#1d1d1f] text-white pt-16 pb-20">
        <div className="max-w-5xl mx-auto px-5">
          {/* 브레드크럼 */}
          <div className="flex items-center gap-1.5 text-[13px] text-white/50 mb-8">
            <Link href="/" className="hover:text-white/80 transition-colors">홈</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white/80">포트폴리오</span>
          </div>

          <p className="text-[13px] font-medium text-[#00A39B] tracking-widest uppercase mb-3">Portfolio</p>
          <h1 className="text-[40px] md:text-[52px] font-bold tracking-tight mb-5 leading-tight">
            보건소플러스<br />제작 사례
          </h1>
          <p className="text-[17px] text-white/60 max-w-xl leading-relaxed">
            전국 200여 개 보건기관과 함께한 제작 사례를 소개합니다.
            신뢰할 수 있는 품질과 7년의 전문 경력을 확인하세요.
          </p>

          {/* 통계 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 pt-12 border-t border-white/10">
            {STATS.map((s) => (
              <div key={s.label}>
                <p className="text-[32px] font-bold text-white tracking-tight">{s.value}</p>
                <p className="text-[13px] text-white/50 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 필터 탭 */}
      <section className="bg-white border-b border-black/5 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-5">
          <div className="flex items-center gap-1 overflow-x-auto py-3 scrollbar-hide">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-[13px] font-medium transition-all ${
                  activeCategory === cat.id
                    ? "bg-[#1d1d1f] text-white"
                    : "text-[#86868b] hover:text-[#1d1d1f] hover:bg-[#f5f5f7]"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 포트폴리오 그리드 */}
      <section className="max-w-5xl mx-auto px-5 py-12">
        <p className="text-[13px] text-[#86868b] mb-6">
          {activeCategory === "all" ? "전체" : CATEGORIES.find(c => c.id === activeCategory)?.label} {filtered.length}건
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl overflow-hidden border border-black/5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
            >
              {/* 썸네일 */}
              <div
                className="h-44 flex items-center justify-center text-6xl"
                style={{ backgroundColor: item.bg }}
              >
                {item.icon}
              </div>

              {/* 내용 */}
              <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                    style={{ color: item.color, backgroundColor: item.bg }}
                  >
                    {CATEGORIES.find(c => c.id === item.category)?.label}
                  </span>
                  <span className="text-[11px] text-[#86868b]">{item.region}</span>
                </div>
                <h3 className="text-[15px] font-semibold text-[#1d1d1f] mb-1">{item.title}</h3>
                <p className="text-[13px] text-[#86868b] mb-3">{item.desc}</p>

                {/* 태그 */}
                <div className="flex flex-wrap gap-1.5">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] text-[#86868b] bg-[#f5f5f7] px-2 py-0.5 rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA 섹션 */}
      <section className="bg-[#00A39B] text-white py-16">
        <div className="max-w-5xl mx-auto px-5 text-center">
          <h2 className="text-[28px] font-bold mb-3">우리 기관도 제작하고 싶으신가요?</h2>
          <p className="text-white/70 text-[15px] mb-8">
            기관 등록 후 간편하게 주문하거나, 맞춤 제작 문의를 남겨주세요.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#00A39B] rounded-full text-[15px] font-semibold hover:bg-white/90 transition-colors"
            >
              기관 등록 신청 <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/custom-order"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/15 text-white rounded-full text-[15px] font-semibold hover:bg-white/25 transition-colors border border-white/30"
            >
              맞춤 제작 문의
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
