"use client";

/**
 * OrderCategory — 상품 카테고리 선택 페이지 (/order)
 * UX 개선:
 * 1. 최근 주문 바로가기
 * 2. 검색창
 * 3. 단일 세부카테고리 직행 (바로주문 배지)
 * 4. 탭 필터 (인쇄물 / 홍보물 / 기념품)
 * 5. 상품 썸네일 이미지
 * 6. 사업 일정 연동 추천 배너
 */

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronRight, Search, Clock, Sparkles, X } from "lucide-react";
import BackButton from "@/components/BackButton";
import { categories } from "@/data/categories";
import { useTemplate } from "@/contexts/TemplateContext";

// ─── 카테고리 메타데이터 ─────────────────────────────────────────────────────

const categoryMeta: Record<string, {
  icon: string;
  desc: string;
  tab: "인쇄물" | "홍보물" | "기념품";
  thumb: string;
}> = {
  "10": {
    icon: "🪪",
    desc: "표준명함 · 특수명함",
    tab: "인쇄물",
    thumb: "https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=400&h=300&fit=crop",
  },
  "20": {
    icon: "🏷️",
    desc: "일반지 · 특수지 스티커",
    tab: "인쇄물",
    thumb: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&h=300&fit=crop",
  },
  "30": {
    icon: "✉️",
    desc: "대봉투 · 소봉투",
    tab: "인쇄물",
    thumb: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&h=300&fit=crop",
  },
  "40": {
    icon: "📢",
    desc: "캠페인 · 기념품 · 인쇄물",
    tab: "홍보물",
    thumb: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&h=300&fit=crop",
  },
  "50": {
    icon: "🛍️",
    desc: "규격 · 맞춤 쇼핑백",
    tab: "인쇄물",
    thumb: "https://images.unsplash.com/photo-1591085686350-798c0f9faa7f?w=400&h=300&fit=crop",
  },
  "60": {
    icon: "📅",
    desc: "탁상용 · 벽걸이용",
    tab: "인쇄물",
    thumb: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=400&h=300&fit=crop",
  },
  "70": {
    icon: "🖨️",
    desc: "전단지 · 포스터 · 리플렛",
    tab: "홍보물",
    thumb: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
  },
  "80": {
    icon: "📌",
    desc: "금연 · 암예방 · 예방접종 외",
    tab: "홍보물",
    thumb: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=300&fit=crop",
  },
  "4050": {
    icon: "🎁",
    desc: "금연성공 기념품",
    tab: "기념품",
    thumb: "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=400&h=300&fit=crop",
  },
};

// productType → categoryId 매핑
const productTypeToCategoryId: Record<string, string> = {
  namecard: "10",
  sticker: "20",
  envelope: "30",
  flyer: "70",
  poster: "70",
  leaflet: "70",
  shopping_bag: "50",
  calendar: "60",
  digital: "70",
};

const DISPLAY_ORDER = ["10", "20", "30", "40", "50", "60", "70", "80", "4050"];
const TABS = ["전체", "인쇄물", "홍보물", "기념품"] as const;

// 이번 달 사업 일정 기반 추천
const THIS_MONTH_EVENTS = [
  { title: "세계 예방접종 주간", date: "4월 26~30일", items: ["캠페인 부착물", "홍보물"], categoryId: "80" },
  { title: "세계 금연의 날", date: "5월 31일", items: ["금연성공 기념품", "캠페인 부착물"], categoryId: "4050" },
];

export default function OrderCategory() {
  const router = useRouter();
  const { orderHistory } = useTemplate();
  const [activeTab, setActiveTab] = useState<typeof TABS[number]>("전체");
  const [searchQuery, setSearchQuery] = useState("");

  // 최근 주문 3건
  const recentOrders = useMemo(() => {
    return orderHistory
      .slice()
      .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
      .slice(0, 3)
      .map((o) => ({
        ...o,
        categoryId: productTypeToCategoryId[o.productType] ?? "10",
        categoryName:
          categories.find((c) => c.id === (productTypeToCategoryId[o.productType] ?? "10"))?.name ??
          o.productName,
      }));
  }, [orderHistory]);

  // 탭 + 검색 필터
  const filteredCategories = useMemo(() => {
    return DISPLAY_ORDER.map((id) => categories.find((c) => c.id === id))
      .filter(Boolean)
      .filter((cat) => {
        if (!cat) return false;
        const meta = categoryMeta[cat.id];
        const matchTab = activeTab === "전체" || meta?.tab === activeTab;
        const matchSearch =
          searchQuery === "" ||
          cat.name.includes(searchQuery) ||
          (meta?.desc ?? "").includes(searchQuery);
        return matchTab && matchSearch;
      }) as (typeof categories)[0][];
  }, [activeTab, searchQuery]);

  // 세부카테고리 1개면 직행
  function handleCategoryClick(cat: (typeof categories)[0]) {
    if (cat.sub.length === 1) {
      router.push(`/category/${cat.sub[0].id}`);
    } else {
      router.push(`/category/${cat.id}`);
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      {/* 헤더 */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-[#e5e5ea] sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-5 h-14 flex items-center gap-3">
          <BackButton variant="header" />
          <span className="text-[#d2d2d7]">|</span>
          <h1 className="text-[15px] font-semibold text-[#1d1d1f]">상품 선택</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-5 py-6 space-y-6">
        {/* 타이틀 */}
        <div>
          <h2 className="text-[22px] font-bold text-[#1d1d1f] tracking-tight">어떤 상품을 주문하시겠어요?</h2>
          <p className="text-[14px] text-[#86868b] mt-1">카테고리를 선택하면 세부 상품을 확인할 수 있습니다.</p>
        </div>

        {/* ① 검색창 */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#aeaeb2]" />
          <input
            type="text"
            placeholder="상품명 검색 (예: 명함, 리플렛, 금연)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-3 bg-white border border-[#e5e5ea] rounded-2xl text-[14px] text-[#1d1d1f] placeholder-[#aeaeb2] focus:outline-none focus:ring-2 focus:ring-[#00A39B]/20 focus:border-[#00A39B] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#aeaeb2] hover:text-[#86868b]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* ⑥ 사업 일정 연동 추천 배너 */}
        {searchQuery === "" && (
          <div className="bg-gradient-to-r from-[#EBF4FF] to-[#F0F8FF] border border-[#C7E0FF] rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-[#00A39B]" />
              <span className="text-[13px] font-semibold text-[#00A39B]">이번 달 추천 주문</span>
              <span className="text-[11px] text-[#86868b] ml-auto">사업 일정 기반</span>
            </div>
            <div className="space-y-2">
              {THIS_MONTH_EVENTS.map((ev) => (
                <button
                  key={ev.title}
                  onClick={() => router.push(`/category/${ev.categoryId}`)}
                  className="w-full flex items-center gap-3 bg-white rounded-xl px-3 py-2.5 text-left hover:bg-[#f5f5f7] transition-colors border border-[#e5e5ea]"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#EBF4FF] flex items-center justify-center text-[16px] shrink-0">
                    {categoryMeta[ev.categoryId]?.icon ?? "📦"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-[#1d1d1f] truncate">{ev.title}</p>
                    <p className="text-[11px] text-[#86868b]">{ev.date} · {ev.items.join(", ")}</p>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-[#aeaeb2] shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ② 최근 주문 바로가기 */}
        {searchQuery === "" && recentOrders.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-[#86868b]" />
              <span className="text-[13px] font-semibold text-[#424245]">최근 주문</span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {recentOrders.map((order) => {
                const meta = categoryMeta[order.categoryId];
                return (
                  <button
                    key={order.id}
                    onClick={() => router.push(`/category/${order.categoryId}`)}
                    className="flex-shrink-0 bg-white border border-[#e5e5ea] rounded-2xl px-4 py-3 flex items-center gap-3 hover:bg-[#f5f5f7] active:scale-[0.97] transition-all min-w-[180px]"
                  >
                    <div className="w-9 h-9 rounded-xl bg-[#f5f5f7] flex items-center justify-center text-[18px] shrink-0">
                      {meta?.icon ?? "📦"}
                    </div>
                    <div className="text-left min-w-0">
                      <p className="text-[13px] font-semibold text-[#1d1d1f] truncate">{order.categoryName}</p>
                      <p className="text-[11px] text-[#86868b]">{order.orderDate}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ④ 탭 필터 */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-[13px] font-medium transition-all ${
                activeTab === tab
                  ? "bg-[#1d1d1f] text-white"
                  : "bg-white border border-[#e5e5ea] text-[#424245] hover:bg-[#f5f5f7]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ⑤ 카테고리 그리드 (썸네일 이미지) */}
        {filteredCategories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[14px] text-[#86868b]">검색 결과가 없습니다.</p>
            <button
              onClick={() => { setSearchQuery(""); setActiveTab("전체"); }}
              className="mt-2 text-[13px] text-[#00A39B] hover:underline"
            >
              전체 보기
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filteredCategories.map((cat) => {
              const meta = categoryMeta[cat.id];
              const isSingleSub = cat.sub.length === 1;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat)}
                  className="bg-white rounded-2xl overflow-hidden text-left hover:shadow-md active:scale-[0.97] transition-all border border-[#e5e5ea] group"
                >
                  {/* ⑤ 썸네일 */}
                  <div className="relative h-[90px] overflow-hidden bg-[#f5f5f7]">
                    {meta?.thumb ? (
                      <img
                        src={meta.thumb}
                        alt={cat.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[32px]">
                        {meta?.icon ?? "📦"}
                      </div>
                    )}
                    {/* 탭 배지 */}
                    {meta?.tab && (
                      <span className="absolute top-2 left-2 text-[10px] font-semibold bg-black/40 text-white px-1.5 py-0.5 rounded-full backdrop-blur-sm">
                        {meta.tab}
                      </span>
                    )}
                    {/* ③ 직행 배지 */}
                    {isSingleSub && (
                      <span className="absolute top-2 right-2 text-[10px] font-semibold bg-[#00A39B] text-white px-1.5 py-0.5 rounded-full">
                        바로주문
                      </span>
                    )}
                  </div>
                  {/* 텍스트 */}
                  <div className="p-3">
                    <p className="text-[13px] font-semibold text-[#1d1d1f] leading-tight">{cat.name}</p>
                    <p className="text-[11px] text-[#86868b] mt-0.5 truncate">{meta?.desc ?? ""}</p>
                    {!isSingleSub && cat.sub.length > 0 && (
                      <p className="text-[10px] text-[#aeaeb2] mt-1">{cat.sub.length}개 세부 카테고리</p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* 맞춤 주문 배너 */}
        <button
          onClick={() => router.push("/custom-order")}
          className="w-full bg-[#1d1d1f] text-white rounded-2xl p-5 flex items-center gap-4 text-left hover:bg-[#2d2d2f] active:scale-[0.99] transition-all"
        >
          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-[24px] shrink-0">
            ✏️
          </div>
          <div className="flex-1">
            <p className="text-[16px] font-semibold leading-tight">맞춤 주문 문의</p>
            <p className="text-[12px] text-white/60 mt-0.5">목록에 없는 상품은 맞춤 주문으로 문의해 주세요.</p>
          </div>
          <ChevronRight className="w-4 h-4 text-white/40 shrink-0" />
        </button>

      </main>
    </div>
  );
}
