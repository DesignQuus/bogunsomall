/*
 * Design: Apple "Clean Canvas" — 보건소플러스 담당자 개인 대시보드
 * 로그인 후 진입하는 메인 화면
 * - 주문 이력, 재주문, 보건 사업 캘린더, 예산 현황
 */

import { useState, useRef, useEffect } from "react";
import { useLocation, Link } from "wouter";
import {
  Package, RefreshCw, Calendar, BarChart3, Bell, LogOut,
  ChevronRight, Clock, CheckCircle2, Truck, FileText,
  TrendingUp, AlertCircle, Star, Download, Plus,
  LayoutList, LayoutGrid, Table2,
  ShieldCheck, BadgeCheck, User, CreditCard,
  ArrowLeftRight, X, Loader2, KeyRound
} from "lucide-react";
import { toast } from "sonner";
import { loginState } from "./Intro";
import BackButton from "@/components/BackButton";
import BannerSlider, { BannerSlide } from "@/components/BannerSlider";
import { useTemplate } from "@/contexts/TemplateContext";
import { saveLoginInfo } from "@/lib/quickLoginStorage";
import { trpc } from "@/lib/trpc";

/// 슬라이더 데이터 (5개)
const ALL_SLIDES: BannerSlide[] = [
  {
    id: "slide-1",
    bgImage: "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/slide_new1_ae933a3e.webp",
    textContent: {
      badge: "OPEN",
      badgeColor: "#1d1d1f",
      line1: "보건소 전문 발주 플랫폼 OPEN!",
      line2: "보건소플러스, 지금 시작합니다!",
      line3: "명함부터 홍보물까지 더 쉽게 주문하세요",
      bgColor: "#dce4ed",
    },
  },
  {
    id: "slide-2",
    bgImage: "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/slide_new2_77e6ae61.webp",
    textContent: {
      badge: "NEW",
      badgeColor: "#1d1d1f",
      line1: "전국보건소 표준 디자인",
      line2: "통일된 이미지, 신뢰를 만듭니다",
      line3: "지침에 맞는 안전한 디자인 제공",
      bgColor: "#f0ece6",
    },
  },
  {
    id: "slide-3",
    bgImage: "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/slide_new3_ca8f6264.webp",
    textContent: {
      badge: "NEW",
      badgeColor: "#1d1d1f",
      line1: "명함 발주, 클릭으로 끝!",
      line2: "복잡한 과정 없이 바로 주문",
      line3: "이력관리로 재주문도 빠르게",
      bgColor: "#e8edf2",
    },
  },
  {
    id: "slide-4",
    bgImage: "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/slide_new4_2e3090df.webp",
    textContent: {
      badge: "NEW",
      badgeColor: "#1d1d1f",
      line1: "보건소 맞춤 캘린더 제작",
      line2: "실무에 바로 쓰는 실용 디자인",
      line3: "금연캘린더부터 건강캘린더 원하는대로!",
      bgColor: "#ede8f0",
    },
  },
  {
    id: "slide-5",
    bgImage: "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/slide_new5_0d05d9c9.webp",
    textContent: {
      badge: "NEW",
      badgeColor: "#1d1d1f",
      line1: "보건소 디자인 이력 통합관리",
      line2: "디자인 전문 인력의 체계적 운영·관리",
      line3: "업무 효율을 높이는 스마트 관리 서비스!",
      bgColor: "#dce8e7",
    },
  },
];

// 샘플 주문 이력 데이터
const RECENT_ORDERS = [
  {
    id: "ORD-2026-0312",
    product: "명함 500매",
    category: "명함",
    date: "2026.03.12",
    status: "배송완료",
    amount: "45,000원",
    statusColor: "text-green-600 bg-green-50",
    preview: "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/card_basic_b12b00e0.webp",
  },
  {
    id: "ORD-2026-0228",
    product: "금연 캠페인 포스터 A2 100매",
    category: "홍보물",
    date: "2026.02.28",
    status: "배송완료",
    amount: "180,000원",
    statusColor: "text-green-600 bg-green-50",
    preview: "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/poster_campaign_d3661202.jpg",
  },
  {
    id: "ORD-2026-0215",
    product: "대봉투 (A4) 1,000매",
    category: "봉투",
    date: "2026.02.15",
    status: "배송완료",
    amount: "95,000원",
    statusColor: "text-green-600 bg-green-50",
    preview: "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/envelope_large_4301378b.jpg",
  },
  {
    id: "ORD-2026-0110",
    product: "치매 예방 리플렛 3단 500매",
    category: "홍보물",
    date: "2026.01.10",
    status: "배송완료",
    amount: "120,000원",
    statusColor: "text-green-600 bg-green-50",
    preview: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=320&h=220&fit=crop&auto=format",
  },
];

// 주문 파일명 hover 시 이미지 미리보기 툴팁 컴포넌트
function ProductPreviewTooltip({
  product,
  preview,
  children,
}: {
  product: string;
  preview: string;
  children: React.ReactNode;
}) {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    // 툴팁을 커서 오른쪽 위에 표시
    setPos({ x: e.clientX + 16, y: e.clientY - 140 });
  };

  return (
    <div
      ref={containerRef}
      className="relative inline-block"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onMouseMove={handleMouseMove}
    >
      {children}
      {visible && (
        <div
          className="fixed z-[9999] pointer-events-none"
          style={{ left: pos.x, top: pos.y }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl border border-black/8 overflow-hidden"
            style={{
              width: 240,
              opacity: visible ? 1 : 0,
              transform: visible ? "scale(1) translateY(0)" : "scale(0.95) translateY(4px)",
              transition: "opacity 0.15s ease, transform 0.15s ease",
            }}
          >
            <img
              src={preview}
              alt={product}
              className="w-full object-cover"
              style={{ height: 160 }}
              loading="lazy"
            />
            <div className="px-3 py-2 bg-white">
              <p className="text-[12px] font-semibold text-[#1d1d1f] leading-tight line-clamp-2">{product}</p>
              <p className="text-[10px] text-[#86868b] mt-0.5">미리보기</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 새 알림 데이터 (신제품 출시 / 공지 등 — 비어 있으면 "새 알림 없음" 표시)
const NEW_NOTIFICATIONS: { id: number; title: string; desc: string; date: string; isNew: boolean }[] = [
  // 알림이 있을 때 아래처럼 추가하세요:
  // { id: 1, title: "[신제품] 고급 무광 명함 출시", desc: "UV 코팅 무광 명함 신규 출시", date: "2026.04.27", isNew: true },
  // { id: 2, title: "[공지] 5월 납기 일정 안내", desc: "황금연휴 기간 납기 변경 안내", date: "2026.04.25", isNew: true },
];

// 보건 사업 캘린더 알림
const CALENDAR_ALERTS = [
  {
    id: 1,
    event: "세계 금연의 날",
    date: "5월 31일",
    dDay: "D-80",
    urgency: "high",
    suggestion: "금연 캠페인 포스터 A2 · 리플렛 3단",
    lastOrder: "2025년 동일 주문 이력 있음",
  },
  {
    id: 2,
    event: "암 예방의 날",
    date: "3월 21일",
    dDay: "D-9",
    urgency: "urgent",
    suggestion: "암 예방 홍보 포스터 · 스티커",
    lastOrder: "2025년 동일 주문 이력 있음",
  },
  {
    id: 3,
    event: "치매 극복의 날",
    date: "9월 21일",
    dDay: "D-193",
    urgency: "low",
    suggestion: "치매 예방 리플렛 · 현수막",
    lastOrder: "2025년 동일 주문 이력 있음",
  },
];

// 예산 현황
const BUDGET = {
  total: 2000000,
  used: 330000,   // 2026년 사용 금액 (명함 1건)
  remaining: 1670000,
};

const statusIcons: Record<string, React.ReactNode> = {
  "배송완료": <CheckCircle2 className="w-3.5 h-3.5" />,
  "배송중": <Truck className="w-3.5 h-3.5" />,
  "제작중": <Clock className="w-3.5 h-3.5" />,
  "주문접수": <FileText className="w-3.5 h-3.5" />,
  // OrderHistory status
  "completed": <CheckCircle2 className="w-3.5 h-3.5" />,
  "in_progress": <Clock className="w-3.5 h-3.5" />,
  "pending": <FileText className="w-3.5 h-3.5" />,
  "cancelled": <AlertCircle className="w-3.5 h-3.5" />,
};

const statusKorean: Record<string, string> = {
  completed: "완료",
  in_progress: "진행중",
  pending: "대기",
  cancelled: "취소",
};

const statusColorMap: Record<string, string> = {
  completed: "text-green-600 bg-green-50",
  in_progress: "text-blue-600 bg-blue-50",
  pending: "text-yellow-600 bg-yellow-50",
  cancelled: "text-red-600 bg-red-50",
};

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"overview" | "orders" | "calendar">("overview");
  const [viewMode, setViewMode] = useState<"list" | "grid" | "table">("list");

  const center = loginState.center;
  const user = loginState.user;
  const { orderHistory } = useTemplate();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const notifTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 부서 변경 모달
  const [deptChangeOpen, setDeptChangeOpen] = useState(false);
  const [newDeptCode, setNewDeptCode] = useState("");
  const [deptChangeError, setDeptChangeError] = useState("");
  const [deptChangeLoading, setDeptChangeLoading] = useState(false);
  const [deptChangeSuccess, setDeptChangeSuccess] = useState(false);
  const utils = trpc.useUtils();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node))
        setProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node))
        setNotifOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleNotifOpen = () => {
    if (notifTimerRef.current) clearTimeout(notifTimerRef.current);
    setNotifOpen(prev => {
      const next = !prev;
      if (next && NEW_NOTIFICATIONS.length === 0) {
        notifTimerRef.current = setTimeout(() => setNotifOpen(false), 3000);
      }
      return next;
    });
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // 로그인 안 된 경우 인트로로 리다이렉트 (useEffect로 처리 — 렌더링 중 setState 방지)
  useEffect(() => {
    if (!loginState.isLoggedIn || !loginState.center) {
      setLocation("/");
    }
  }, [setLocation]);

  if (!loginState.isLoggedIn || !center) {
    return null;
  }

  const handleLogout = () => {
    loginState.isLoggedIn = false;
    loginState.center = null;
    loginState.user = null;
    toast.success("로그아웃 되었습니다.");
    setLocation("/");
  };

  const handleDeptChange = async () => {
    const code = newDeptCode.trim().toUpperCase();
    if (!code) { setDeptChangeError("간편 로그인 번호를 입력해 주세요."); return; }
    if (!/^[A-Z0-9]{4}$/.test(code)) { setDeptChangeError("영문 대문자와 숫자 4자리를 입력해 주세요."); return; }
    if (!center) return;
    setDeptChangeLoading(true);
    setDeptChangeError("");
    try {
      const result = await utils.requests.verifyIssuedCode.fetch({ centerCode: center.code, issuedCode: code });
      if (!result.valid || !result.dept) {
        setDeptChangeError("등록되지 않은 번호입니다. 발급받은 4자리를 다시 확인해 주세요.");
        return;
      }
      loginState.department = { id: code, name: result.dept.deptName, status: "active", createdAt: new Date().toISOString() };
      loginState.user = { name: result.dept.managerName || user?.name || "" };
      saveLoginInfo({ centerCode: center.code, centerName: center.name, region: center.region || "", deptId: code, deptName: result.dept.deptName, userName: result.dept.managerName || "" });
      setDeptChangeSuccess(true);
      toast.success(`부서가 "${result.dept.deptName}"으로 변경되었습니다.`);
      setTimeout(() => { setDeptChangeOpen(false); setDeptChangeSuccess(false); setNewDeptCode(""); setDeptChangeError(""); window.location.reload(); }, 1200);
    } catch {
      setDeptChangeError("서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setDeptChangeLoading(false);
    }
  };

  const budgetPercent = Math.round((BUDGET.used / BUDGET.total) * 100);

  return (
    <div className="min-h-screen bg-[#FBFBFD]">
      {/* 통합 헤더 — 로고 + 공지·캠페인 + 알림 + 프로필 (1행) */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-black/5 shadow-sm">
        <div className="w-full px-[5%] py-2.5 flex items-center justify-between">
          {/* 왼쪽: 로고 + 공지·캠페인 */}
          <div className="flex items-center gap-3">
            <BackButton variant="header" />
            <Link href="/" className="flex items-center shrink-0">
              <img
                src="https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/bogunsoplus-logo-600_617d837b.png"
                alt="보건소플러스"
                className="w-auto object-contain"
                style={{ height: '22px', width: '91px' }}
              />
            </Link>
            <h2 className="text-[15px] font-semibold text-[#1d1d1f]">공지 · 캠페인</h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* 알림 드롭다운 */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={handleNotifOpen}
                className="relative p-2 rounded-xl hover:bg-[#f5f5f7] transition-colors"
                aria-label="알림"
              >
                <Bell className="w-5 h-5 text-[#424245]" />
                {NEW_NOTIFICATIONS.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl border border-black/8 overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-black/5 flex items-center justify-between">
                    <span className="text-[13px] font-semibold text-[#1d1d1f]">새 알림</span>
                    {NEW_NOTIFICATIONS.length > 0 && (
                      <span className="text-[11px] font-medium text-white bg-[#00A39B] px-2 py-0.5 rounded-full">{NEW_NOTIFICATIONS.length}</span>
                    )}
                  </div>
                  {NEW_NOTIFICATIONS.length === 0 ? (
                    <div className="px-4 py-5 flex items-center gap-2.5 text-[13px] text-[#86868b]">
                      <svg className="w-4 h-4 text-[#86868b] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <span>새 알림이 없습니다.</span>
                      <span className="ml-auto text-[11px] text-[#c0c0c0]">3초 후 닫힐</span>
                    </div>
                  ) : (
                    <ul className="max-h-60 overflow-y-auto divide-y divide-black/5">
                      {NEW_NOTIFICATIONS.map(n => (
                        <li key={n.id} className="px-4 py-3 hover:bg-[#fafafa] transition-colors cursor-pointer">
                          <div className="flex items-start gap-2">
                            <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-[#00A39B] shrink-0" />
                            <div>
                              <p className="text-[13px] font-medium text-[#1d1d1f] leading-snug">{n.title}</p>
                              <p className="text-[11px] text-[#86868b] mt-0.5">{n.desc}</p>
                              <p className="text-[10px] text-[#c0c0c0] mt-1">{n.date}</p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
            {/* 프로필 드롭다운 */}
            <div className="relative mr-4" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(v => !v)}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#f5f5f7] rounded-xl hover:bg-[#ebebed] transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-[#00A39B] flex items-center justify-center">
                  <span className="text-white text-[10px] font-bold">{user?.name?.[0] || "담"}</span>
                </div>
                <span className="text-[13px] font-medium text-[#1d1d1f]">{user?.name || "담당자"}</span>
                <svg className={`w-3 h-3 text-[#86868b] transition-transform ${profileOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-black/8 overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-black/5">
                    <p className="text-[13px] font-semibold text-[#1d1d1f]">{user?.name || "담당자"}</p>
                    <p className="text-[11px] text-[#86868b] mt-0.5">{center.name}</p>
                    <p className="text-[11px] text-[#86868b]">{loginState.department?.name || "건강증진팀"}</p>
                  </div>
                  <button
                    onClick={() => { setProfileOpen(false); setDeptChangeOpen(true); }}
                    className="w-full flex items-center gap-2.5 px-4 py-3 text-[13px] text-[#1d1d1f] hover:bg-[#f5f5f7] transition-colors border-b border-black/5"
                  >
                    <ArrowLeftRight className="w-4 h-4 text-[#00A39B]" />
                    부서 변경
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-3 text-[13px] text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    로그아웃
                  </button>
                </div>
              )}

              {/* 부서 변경 모달 */}
              {deptChangeOpen && (
                <div
                  className="fixed inset-0 z-[200] flex items-center justify-center"
                  style={{ background: "rgba(0,0,0,0.35)" }}
                  onClick={e => { if (e.target === e.currentTarget) { setDeptChangeOpen(false); setNewDeptCode(""); setDeptChangeError(""); } }}
                >
                  <div className="bg-white rounded-3xl shadow-2xl w-[340px] overflow-hidden">
                    <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-black/5">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-[#00A39B]/10 flex items-center justify-center">
                          <ArrowLeftRight className="w-4 h-4 text-[#00A39B]" />
                        </div>
                        <div>
                          <p className="text-[14px] font-semibold text-[#1d1d1f]">부서 변경</p>
                          <p className="text-[11px] text-[#86868b]">{center.name}</p>
                        </div>
                      </div>
                      <button onClick={() => { setDeptChangeOpen(false); setNewDeptCode(""); setDeptChangeError(""); }} className="p-1.5 rounded-lg hover:bg-[#f5f5f7] transition-colors">
                        <X className="w-4 h-4 text-[#86868b]" />
                      </button>
                    </div>
                    <div className="px-5 pt-4">
                      <p className="text-[11px] text-[#86868b] mb-1.5">현재 부서</p>
                      <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-[#f5f5f7]">
                        <div className="w-6 h-6 rounded-full bg-[#00A39B] flex items-center justify-center shrink-0">
                          <span className="text-white text-[9px] font-bold">{user?.name?.[0] || "담"}</span>
                        </div>
                        <div>
                          <p className="text-[13px] font-medium text-[#1d1d1f]">{loginState.department?.name || "건강증진팀"}</p>
                          <p className="text-[11px] text-[#86868b]">{user?.name || "담당자"}</p>
                        </div>
                      </div>
                    </div>
                    <div className="px-5 pt-4 pb-5">
                      <p className="text-[11px] text-[#86868b] mb-1.5">변경할 부서의 간편 로그인 번호</p>
                      <div className={`flex items-center gap-2 px-3.5 py-3 rounded-xl border transition-all ${
                        deptChangeError ? "border-red-400 bg-red-50/30" : "border-[#e5e5ea] bg-white"
                      }`}>
                        <KeyRound className="w-4 h-4 text-[#86868b] shrink-0" />
                        <input
                          type="text"
                          value={newDeptCode}
                          onChange={e => {
                            const raw = e.target.value;
                            if (/[\uAC00-\uD7A3\u1100-\u11FF\u3130-\u318F]/.test(raw)) { setDeptChangeError("한글은 입력할 수 없습니다."); return; }
                            setDeptChangeError("");
                            setNewDeptCode(raw.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4));
                          }}
                          onKeyDown={e => e.key === "Enter" && handleDeptChange()}
                          placeholder="4자리 입력 (예: 1234, ABCD)"
                          maxLength={4}
                          autoComplete="off"
                          autoCapitalize="characters"
                          spellCheck={false}
                          className="flex-1 bg-transparent text-[14px] text-[#1d1d1f] placeholder:text-[#c7c7cc] outline-none font-mono tracking-widest uppercase"
                        />
                        {newDeptCode.length > 0 && <span className="text-[11px] text-[#86868b] font-mono shrink-0">{newDeptCode.length}/4</span>}
                      </div>
                      {deptChangeError && (
                        <div className="flex items-start gap-2 mt-2 p-3 bg-red-50 rounded-xl border border-red-100">
                          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                          <p className="text-[12px] text-red-600 leading-relaxed">{deptChangeError}</p>
                        </div>
                      )}
                      {deptChangeSuccess && (
                        <div className="flex items-center gap-2 mt-2 p-3 bg-[#f0faf9] rounded-xl border border-[#00A39B]/20">
                          <CheckCircle2 className="w-4 h-4 text-[#00A39B] shrink-0" />
                          <p className="text-[12px] text-[#00A39B] font-medium">부서가 변경되었습니다!</p>
                        </div>
                      )}
                      <p className="text-[11px] text-[#86868b] mt-2.5 leading-relaxed">변경할 부서의 간편 로그인 번호를 입력하면 해당 부서로 전환됩니다.</p>
                      <button
                        onClick={handleDeptChange}
                        disabled={deptChangeLoading || newDeptCode.length < 4 || deptChangeSuccess}
                        className="w-full mt-4 py-3 rounded-xl text-[14px] font-semibold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                        style={{ background: "linear-gradient(135deg, #00A39B 0%, #007a73 100%)" }}
                      >
                        {deptChangeLoading ? (<><Loader2 className="w-4 h-4 animate-spin" />확인 중...</>) : deptChangeSuccess ? (<><CheckCircle2 className="w-4 h-4" />변경 완료!</>) : (<><ArrowLeftRight className="w-4 h-4" />부서 변경하기</>)}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ── 배너 슬라이더 ── */}
      <div className="bg-white border-b border-black/5" style={{paddingTop: '44px'}}>
        <div className="w-full">
          <BannerSlider
            slides={ALL_SLIDES}
            autoPlayInterval={5000}
            className="rounded-none"
            fullWidth={true}
          />
        </div>
      </div>

      <div className="w-full py-8">
        {/* 환영 메시지 */}
        <div className="mb-8 w-full px-[5%] flex items-start justify-between gap-4">
          <div>
            <h1 className="text-[26px] font-bold text-[#1d1d1f] tracking-tight mb-1">
              안녕하세요, <span className="text-[#00A39B]">{user?.name || "담당자"}</span>님 👋
            </h1>
            <p className="text-[14px] text-[#86868b] flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-[#86868b]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              {center.name}
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#00A39B]/10 text-[#00A39B]">
                {loginState.department?.name || "건강증진팀"}
              </span>
            </p>
          </div>
          <div className="hidden md:flex flex-col items-end gap-1 pt-1">
            <span className="text-[12px] text-[#86868b]">{new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })}</span>
            <span className="text-[11px] text-[#00A39B] font-medium">오늘도 좋은 하루 되세요 ☀️</span>
          </div>
        </div>

        {/* 안내 문구 */}
        <div className="mb-6 w-full px-[15%] text-center">
          <p className="text-[15px] text-[#515154] leading-relaxed" style={{fontSize: '20px'}}>
            어떤 제작물을 원하시나요. 제품 이미지를 클릭하시면 원하시는 디자인과 제품을 발주 하실 수 있습니다.
          </p>
        </div>

        {/* 제품 카테고리 카드 — 1행 5열 + 2행(앞 3카 + 금연사업 2카 병합) */}
        <div className="mb-8 w-full px-[15%]">
          <h2 className="text-[18px] font-semibold text-[#1d1d1f] mb-4">제품 카테고리</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>

            {/* 1행 + 2행: 8개 카드 (4열 2행) */}
            {[
              { id: "namecard", name: "명함", image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/표준명함_AType_0355d32c.png", imageScale: 1.365, hoverScale: 1.638 },
              { id: "sticker", name: "스티커", image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/대시보드스티커이미지_31fb88dc.png", imageScale: 1.365, hoverScale: 1.638 },
              { id: "form", name: "일반서식", image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/NuxSflzJ1Et1_a2d6fcf9.jpg", imageScale: 1.365, hoverScale: 1.638 },
              { id: "promo", name: "홍보물", image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/category-business-card-Vp6QmGVxNzNo4FirbbW9oT.webp", imageScale: 1.365, hoverScale: 1.638 },
              { id: "calendar", name: "캘린더", image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/캘린더_488afa48.png", imageScale: 1.365, hoverScale: 1.638 },
              { id: "signage", name: "표지판", image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/금연표지판001-320_05f07d54.png", imageScale: 1.365, hoverScale: 1.638 },
              { id: "largeformat", name: "실사출력", image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/category-digital-KuQAG9p2Muw5sABAm9GmNn.webp", imageScale: 1.365, hoverScale: 1.638 },
              { id: "digital", name: "소량인쇄", image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/SLIV2sS1E5to_55c9fd1f.jpg", imageScale: 1.365, hoverScale: 1.638 },
            ].map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  const routeMap: Record<string, string> = {
                    namecard: "/category/namecard",
                    sticker: "/category/sticker",
                    form: "/category/form",
                    promo: "/category/promo",
                    calendar: "/category/calendar",
                    signage: "/category/signage",
                    largeformat: "/category/largeformat",
                    digital: "/category/digital",
                  };
                  if (routeMap[category.id]) setLocation(routeMap[category.id]);
                  else toast.info(`${category.name} 카테고리 준비 중입니다.`);
                }}
                className="group overflow-hidden rounded-[12px] bg-white border border-black/5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col p-0"
                style={{ isolation: 'isolate' }}
              >
                <div className="relative w-full overflow-hidden flex items-center justify-center" style={{ aspectRatio: '5 / 4.2' }}>
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-300"
                    style={{ transform: `scale(${category.imageScale ?? 1.0})`, marginRight: '8px', marginBottom: '15px' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLImageElement).style.transform = `scale(${category.hoverScale ?? 1.1})`; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLImageElement).style.transform = `scale(${category.imageScale ?? 1.0})`; }}
                  />
                </div>
                <div className="w-full px-3 py-2 text-center bg-white">
                  <p className="text-[13px] font-semibold text-[#1d1d1f] line-clamp-1">{category.name}</p>
                </div>
              </button>
            ))}

          </div>
        </div>



        {/* 보건 캐페인 카드 3개 — 7:4 비율 이미지 상단, 텍스트 하단 */}
        <div className="mb-8 w-full px-[15%]">
          <h2 className="text-[18px] font-semibold text-[#1d1d1f] mb-4">보건 캠페인</h2>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {[
              {
                id: "smoking",
                name: "금연",
                subtitle: "금연 캠페인에 필요한 인쇄물을 주문해보세요",
                image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/금연캠페인_6462a8b5.png",
                route: "/category/8010",
              },
              {
                id: "dementia",
                name: "치매·정신건강",
                subtitle: "치매·정신건강센터에 필요한 인쇄물을 주문해보세요",
                image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/정신건강캠페인_d9c91a3a.png",
                route: "/category/8040",
              },
              {
                id: "chronic",
                name: "만성질환",
                subtitle: "만성질환 관리에 관한 인쇄물을 주문해보세요",
                image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/만성질환캠페인_c1af4dbe.png",
                route: "/category/8080",
              },
            ].map((card) => (
              <button
                key={card.id}
                onClick={() => setLocation(card.route)}
                className="group overflow-hidden rounded-[16px] bg-white border border-black/5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col p-0 text-left"
              >
                {/* 이미지 영역 — 7:4 비율 */}
                <div className="relative w-full overflow-hidden" style={{ aspectRatio: '7 / 4' }}>
                  <img
                    src={card.image}
                    alt={card.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                {/* 텍스트 영역 */}
                <div className="px-4 py-3">
                  <p className="text-[15px] font-bold text-[#1d1d1f] mb-1">{card.name}</p>
                  <p className="text-[12px] text-[#86868b] leading-snug">{card.subtitle}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 탭 네비게이션 + 뷰 전환 필터 */}
        <div className="flex items-center justify-between mb-8 w-full px-[15%]">
          {/* 탭 버튼 그룹 */}
          <div className="flex gap-1 bg-[#f5f5f7] p-1 rounded-2xl">
            {[
              { id: "overview", label: "대시보드", icon: BarChart3 },
              { id: "orders", label: "주문 이력", icon: Package },
              { id: "calendar", label: "사업 캘린더", icon: Calendar },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[14px] font-medium transition-all ${
                  activeTab === id
                    ? "bg-white text-[#1d1d1f] shadow-sm"
                    : "text-[#86868b] hover:text-[#424245]"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {/* 뷰 전환 필터 — 주문 이력 탭에서만 표시 */}
          {activeTab === "orders" && (
            <div className="flex items-center gap-1 bg-[#f5f5f7] p-1 rounded-2xl">
              {([
                { mode: "list" as const, icon: LayoutList, label: "리스트" },
                { mode: "grid" as const, icon: LayoutGrid, label: "이미지" },
                { mode: "table" as const, icon: Table2, label: "표" },
              ]).map(({ mode, icon: Icon, label }) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  title={`${label}로 보기`}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[13px] font-medium transition-all ${
                    viewMode === mode
                      ? "bg-white text-[#1d1d1f] shadow-sm"
                      : "text-[#86868b] hover:text-[#424245]"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 대시보드 탭 */}
        {activeTab === "overview" && (
          <div className="space-y-6 w-full px-[15%]">
            {/* 요약 카드 4개 */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {[
                { label: "올해 누적 발주금액", value: "330,000", unit: "원", sub: "올해 총 1건 납품 완료", icon: CreditCard, accent: "#00A39B", accentBg: "#EBF3FF" },
                { label: "이번 달 주문", value: "1", unit: "건", sub: "3월 12일 완료", icon: CheckCircle2, accent: "#7c3aed", accentBg: "#F5F3FF" },
                { label: "다가오는 캠페인", value: "2", unit: "개", sub: "D-9 암 예방의 날", icon: AlertCircle, accent: "#ea580c", accentBg: "#FFF7ED" },
              ].map((card) => (
                <div
                  key={card.label}
                  className="bg-white rounded-2xl p-5 border border-black/5 shadow-sm flex flex-col gap-0"
                >
                  {/* 레이블 + 아이콘 — 상단 */}
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[13px] font-semibold tracking-tight" style={{ color: card.accent }}>
                      {card.label}
                    </p>
                    <div
                      className="flex items-center justify-center w-8 h-8 rounded-xl"
                      style={{ background: card.accentBg }}
                    >
                      <card.icon className="w-4 h-4" style={{ color: card.accent }} />
                    </div>
                  </div>

                  {/* 숫자 값 — 크고 굵게 */}
                  <div className="flex items-baseline gap-1 leading-none mb-2">
                    <span
                      className="font-extrabold tracking-tighter"
                      style={{ fontSize: "clamp(2rem, 5vw, 2.75rem)", color: "#1d1d1f", lineHeight: 1, fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif", fontVariantNumeric: "tabular-nums" }}
                    >
                      {card.value}
                    </span>
                    <span className="text-[16px] font-semibold text-[#424245]">{card.unit}</span>
                  </div>

                  {/* 서브 텍스트 */}
                  <p className="text-[11px] font-medium" style={{ color: card.accent }}>{card.sub}</p>
                </div>
              ))}
            </div>

            {/* 누적 발주내역 대시보드 */}
            <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-black/5">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[#00A39B]" />
                  <h3 className="text-[15px] font-semibold text-[#1d1d1f]">누적 발주내역 대시보드</h3>
                </div>
                <span className="text-[11px] text-[#86868b]">2026년 기준</span>
              </div>
              <div className="px-6 py-5">
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4 mb-5">
                  {[
                    { label: "연간 예산", value: "2,000,000", unit: "원", color: "#1d1d1f" },
                    { label: "누적 발주금액", value: "330,000", unit: "원", color: "#00A39B" },
                    { label: "잔여 예산", value: "1,670,000", unit: "원", color: "#34C759" },
                    { label: "연간 주문 건수", value: "1", unit: "건", color: "#FF9500" },
                  ].map((item) => (
                    <div key={item.label} className="bg-[#f5f5f7] rounded-xl p-4">
                      <p className="text-[11px] text-[#86868b] mb-1">{item.label}</p>
                      <p className="text-[18px] font-bold" style={{ color: item.color, fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif", fontVariantNumeric: "tabular-nums" }}>{item.value}<span className="text-[12px] font-medium text-[#86868b] ml-0.5" style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif" }}>{item.unit}</span></p>
                    </div>
                  ))}
                </div>
                {/* 예산 소진율 바 */}
                <div className="mb-4">
                  <div className="flex justify-between text-[12px] mb-1.5">
                    <span className="text-[#86868b]">예산 소진율</span>
                    <span className="font-semibold text-[#00A39B]">16.5%</span>
                  </div>
                  <div className="w-full h-2.5 bg-[#e8e8ed] rounded-full overflow-hidden">
                    <div className="h-full bg-[#00A39B] rounded-full" style={{ width: "16.5%" }} />
                  </div>
                </div>
                {/* 품목별 발주 내역 */}
                <div className="border-t border-black/5 pt-4">
                  <p className="text-[12px] font-semibold text-[#86868b] mb-3">품목별 발주 내역</p>
                  <div className="space-y-2">
                    {[
                      { item: "명함", qty: "200장", amount: "330,000", date: "2026.03.12", status: "납품완료" },
                    ].map((row, i) => (
                      <div key={i} className="flex items-center gap-3 text-[12px] py-2 border-b border-black/4 last:border-0">
                        <span className="w-16 text-[#1d1d1f] font-medium">{row.item}</span>
                        <span className="text-[#86868b]">{row.qty}</span>
                        <span className="flex-1 text-right font-semibold text-[#00A39B]">{row.amount}원</span>
                        <span className="text-[#86868b]">{row.date}</span>
                        <span className="px-2 py-0.5 bg-[#34C759]/10 text-[#34C759] text-[10px] font-semibold rounded-full">{row.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 예산 현황 + 긴급 알림 */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* 행사/캠페인 일정 */}
              <div className="bg-white rounded-2xl p-6 border border-black/5 shadow-sm">
                <h3 className="text-[15px] font-semibold text-[#1d1d1f] mb-4">📅 행사/캠페인 일정</h3>
                <div className="space-y-3">
                  {CALENDAR_ALERTS.slice(0, 2).map((alert) => (
                    <div key={alert.id} className={`flex items-center gap-3 p-3 rounded-xl ${
                      alert.urgency === "urgent" ? "bg-red-50 border border-red-100" : "bg-[#f5f5f7]"
                    }`}>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        alert.urgency === "urgent"
                          ? "bg-red-500 text-white"
                          : "bg-[#00A39B] text-white"
                      }`}>
                        {alert.dDay}
                      </span>
                      <div>
                        <p className="text-[13px] font-semibold text-[#1d1d1f]">{alert.event}</p>
                        <p className="text-[11px] text-[#86868b] mt-0.5">{alert.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setLocation("/calendar")}
                  className="w-full mt-4 px-4 py-2.5 text-[13px] font-semibold text-[#00A39B] hover:bg-[#F0F7FF] rounded-xl transition-colors"
                >
                  전체 일정 보기 →
                </button>
              </div>

              {/* 긴급 알림 */}
              <div className="bg-white rounded-2xl p-6 border border-black/5 shadow-sm">
                <h3 className="text-[15px] font-semibold text-[#1d1d1f] mb-4">📅 다가오는 캠페인</h3>
                <div className="space-y-3">
                  {CALENDAR_ALERTS.slice(0, 2).map((alert) => (
                    <div key={alert.id} className={`flex items-center gap-3 p-3 rounded-xl ${
                      alert.urgency === "urgent" ? "bg-red-50 border border-red-100" : "bg-[#f5f5f7]"
                    }`}>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        alert.urgency === "urgent"
                          ? "bg-red-500 text-white"
                          : "bg-[#00A39B] text-white"
                      }`}>
                        {alert.dDay}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium text-[#1d1d1f] truncate">{alert.event}</p>
                        <p className="text-[11px] text-[#86868b]">{alert.date}</p>
                      </div>
                      <button
                        onClick={() => toast.success(`${alert.event} 관련 상품 페이지로 이동합니다.`)}
                        className="text-[12px] text-[#00A39B] font-medium hover:underline shrink-0"
                      >
                        주문
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 최근 주문 + 빠른 재주문 */}
            <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-black/5">
                <h3 className="text-[15px] font-semibold text-[#1d1d1f]">최근 주문 이력</h3>
                <button
                  onClick={() => setActiveTab("orders")}
                  className="text-[13px] text-[#00A39B] hover:underline flex items-center gap-1"
                >
                  전체 보기 <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="divide-y divide-black/4">
                {orderHistory.length === 0 ? (
                  <div className="px-6 py-8 text-center">
                    <Package className="w-8 h-8 text-[#d2d2d7] mx-auto mb-2" />
                    <p className="text-[13px] text-[#86868b]">아직 주문 이력이 없습니다.</p>
                    <button
                      onClick={() => setLocation("/order/namecard")}
                      className="mt-3 text-[13px] text-[#00A39B] hover:underline"
                    >
                      첫 주문하기 →
                    </button>
                  </div>
                ) : (
                  orderHistory.slice(0, 3).map((order) => (
                    <div key={order.id} className="flex items-center gap-4 px-6 py-4 hover:bg-[#fafafa] transition-colors">
                      <div className="w-9 h-9 rounded-xl bg-[#f5f5f7] flex items-center justify-center shrink-0">
                        <Package className="w-4 h-4 text-[#424245]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-medium text-[#1d1d1f] truncate">
                          {order.productName}
                        </p>
                        <p className="text-[12px] text-[#86868b]">{order.orderDate} · {order.quantity}부</p>
                      </div>
                      <span className={`flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full ${statusColorMap[order.status] || "text-gray-600 bg-gray-50"}`}>
                        {statusIcons[order.status]}
                        {statusKorean[order.status] || order.status}
                      </span>
                      <button
                        onClick={() => {
                          if (order.productType === "namecard") {
                            setLocation(`/order/namecard?orderId=${order.id}`);
                          } else {
                            setLocation(`/order/reorder/${order.productType}?orderId=${order.id}`);
                          }
                          toast.success("재주문 폼으로 이동합니다.");
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] text-[#00A39B] border border-[#00A39B]/20 rounded-xl hover:bg-[#EBF4FF] transition-colors shrink-0"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        재주문
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
            {/* 기관별 승인 담당자 로그 기록 */}
            <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-black/5">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#34C759]" />
                  <h3 className="text-[15px] font-semibold text-[#1d1d1f]">기관별 승인 담당자 로그 기록</h3>
                </div>
                <span className="text-[11px] text-[#86868b]">승인 이력 자동 기록 · 감사 대비</span>
              </div>
              <div className="px-6 py-5">
                <div className="space-y-3">
                  {[
                    { action: "주문 접수", actor: "홍길동 (주무관)", time: "2026.03.10 09:42", detail: "명함 200장 신규 주문 접수", color: "#00A39B" },
                    { action: "결재 요청", actor: "홍길동 (주무관)", time: "2026.03.10 09:43", detail: "부서장 결재 요청 발송", color: "#FF9500" },
                    { action: "결재 승인", actor: "김철수 (건강증진팀장)", time: "2026.03.10 11:15", detail: "주문 승인 완료 → 자동 발주", color: "#34C759" },
                    { action: "납품 확인", actor: "홍길동 (주무관)", time: "2026.03.12 14:30", detail: "명함 200장 수령 완료", color: "#34C759" },
                  ].map((log, i) => (
                    <div key={i} className="flex items-start gap-3 text-[12px]">
                      <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: log.color }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-[#1d1d1f]">{log.action}</span>
                          <span className="text-[#86868b]">— {log.actor}</span>
                        </div>
                        <p className="text-[#86868b] mt-0.5">{log.detail}</p>
                      </div>
                      <span className="text-[11px] text-[#86868b] shrink-0 whitespace-nowrap">{log.time}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-[#86868b] mt-4 pt-3 border-t border-black/5">※ 모든 승인 행위는 담당자명·직위·처리시각이 자동 기록되며 감사 요청 시 즉시 제출 가능합니다.</p>
              </div>
            </div>
          </div>
        )}

        {/* 주문 이력 탭 */}
        {activeTab === "orders" && (
          <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden w-full px-[15%]">
            {/* 헤더 */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-black/5">
              <h3 className="text-[15px] font-semibold text-[#1d1d1f]">전체 주문 이력</h3>
              <button
                onClick={() => toast.info("엑셀 다운로드 기능은 준비 중입니다.")}
                className="flex items-center gap-1.5 text-[13px] text-[#86868b] hover:text-[#00A39B] transition-colors"
              >
                <Download className="w-4 h-4" />
                엑셀 다운로드
              </button>
            </div>

            {/* ① 리스트 뷰 */}
            {viewMode === "list" && (
              <div className="divide-y divide-black/4">
                {orderHistory.length === 0 ? (
                  <div className="px-6 py-10 text-center">
                    <Package className="w-10 h-10 text-[#d2d2d7] mx-auto mb-3" />
                    <p className="text-[14px] text-[#86868b] mb-4">주문 이력이 없습니다.</p>
                    <button onClick={() => setLocation("/order/namecard")} className="text-[13px] text-[#00A39B] hover:underline">첫 주문하기 →</button>
                  </div>
                ) : (
                  orderHistory.map((order) => (
                    <div key={order.id} className="flex items-center gap-4 px-6 py-4 hover:bg-[#fafafa] transition-colors">
                      <div className="w-10 h-10 rounded-xl bg-[#f5f5f7] flex items-center justify-center shrink-0">
                        <Package className="w-5 h-5 text-[#424245]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-semibold text-[#1d1d1f] truncate">{order.productName}</p>
                        <p className="text-[12px] text-[#86868b]">주문번호: {order.id} · {order.orderDate}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[14px] font-semibold text-[#1d1d1f]">{order.quantity}부</p>
                        <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full mt-1 ${statusColorMap[order.status] || "text-gray-600 bg-gray-50"}`}>
                          {statusIcons[order.status]}
                          {statusKorean[order.status] || order.status}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          if (order.productType === "namecard") setLocation(`/order/namecard?orderId=${order.id}`);
                          else setLocation(`/order/reorder/${order.productType}?orderId=${order.id}`);
                          toast.success("재주문 폼으로 이동합니다.");
                        }}
                        className="flex items-center gap-1.5 px-3 py-2 text-[12px] text-[#00A39B] border border-[#00A39B]/20 rounded-xl hover:bg-[#EBF4FF] transition-colors shrink-0"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        재주문
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ② 이미지 그리드 뷰 */}
            {viewMode === "grid" && (
              <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                {orderHistory.length === 0 ? (
                  <div className="col-span-4 py-10 text-center">
                    <Package className="w-10 h-10 text-[#d2d2d7] mx-auto mb-3" />
                    <p className="text-[14px] text-[#86868b]">주문 이력이 없습니다.</p>
                  </div>
                ) : (
                  orderHistory.map((order) => (
                    <div key={order.id} className="group bg-[#FAFAFA] border border-black/5 rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
                      <div className="relative overflow-hidden" style={{ height: 120 }}>
                        {order.productType === "namecard" ? (
                          <img
                            src="https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/namecard-sample_620687ce.png"
                            alt="명함 샘플"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                            <Package className="w-10 h-10 text-[#00A39B]/40" />
                          </div>
                        )}
                        <span className={`absolute top-2 right-2 flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColorMap[order.status] || "text-gray-600 bg-gray-50"}`}>
                          {statusIcons[order.status]}
                          {statusKorean[order.status] || order.status}
                        </span>
                      </div>
                      <div className="p-3">
                        <p className="text-[13px] font-semibold text-[#1d1d1f] leading-tight line-clamp-2 mb-1">{order.productName}</p>
                        <p className="text-[11px] text-[#86868b] mb-2">{order.orderDate} · {order.quantity}부</p>
                        <button
                          onClick={() => {
                            if (order.productType === "namecard") setLocation(`/order/namecard?orderId=${order.id}`);
                            else setLocation(`/order/reorder/${order.productType}?orderId=${order.id}`);
                            toast.success("재주문 폼으로 이동합니다.");
                          }}
                          className="w-full flex items-center justify-center gap-1 px-2 py-1.5 text-[11px] text-[#00A39B] border border-[#00A39B]/20 rounded-lg hover:bg-[#EBF4FF] transition-colors"
                        >
                          <RefreshCw className="w-3 h-3" />
                          재주문
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ③ 테이블 뷰 */}
            {viewMode === "table" && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#F5F5F7] border-b border-black/5">
                      <th className="text-left px-5 py-3 text-[11px] font-semibold text-[#6E6E73] tracking-wide uppercase">주문번호</th>
                      <th className="text-left px-5 py-3 text-[11px] font-semibold text-[#6E6E73] tracking-wide uppercase">상품명</th>
                      <th className="text-left px-5 py-3 text-[11px] font-semibold text-[#6E6E73] tracking-wide uppercase">카테고리</th>
                      <th className="text-left px-5 py-3 text-[11px] font-semibold text-[#6E6E73] tracking-wide uppercase">주문일</th>
                      <th className="text-right px-5 py-3 text-[11px] font-semibold text-[#6E6E73] tracking-wide uppercase">금액</th>
                      <th className="text-center px-5 py-3 text-[11px] font-semibold text-[#6E6E73] tracking-wide uppercase">상태</th>
                      <th className="text-center px-5 py-3 text-[11px] font-semibold text-[#6E6E73] tracking-wide uppercase">액션</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/4">
                    {orderHistory.length === 0 ? (
                      <tr><td colSpan={6} className="px-5 py-10 text-center text-[14px] text-[#86868b]">주문 이력이 없습니다.</td></tr>
                    ) : (
                      orderHistory.map((order) => (
                        <tr key={order.id} className="hover:bg-[#fafafa] transition-colors">
                          <td className="px-5 py-3.5">
                            <span className="text-[12px] font-mono text-[#86868b]">{order.id}</span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="text-[13px] font-medium text-[#1d1d1f]">{order.productName}</span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="text-[12px] text-[#86868b] px-2 py-0.5 bg-[#f5f5f7] rounded-full">{order.productType}</span>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="text-[12px] text-[#424245]">{order.orderDate}</span>
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <span className="text-[13px] font-semibold text-[#1d1d1f]">{order.quantity}부</span>
                          </td>
                          <td className="px-5 py-3.5 text-center">
                            <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full ${statusColorMap[order.status] || "text-gray-600 bg-gray-50"}`}>
                              {statusIcons[order.status]}
                              {statusKorean[order.status] || order.status}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-center">
                            <button
                              onClick={() => {
                                if (order.productType === "namecard") setLocation(`/order/namecard?orderId=${order.id}`);
                                else setLocation(`/order/reorder/${order.productType}?orderId=${order.id}`);
                                toast.success("재주문 폼으로 이동합니다.");
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-[12px] text-[#00A39B] border border-[#00A39B]/20 rounded-lg hover:bg-[#EBF4FF] transition-colors"
                            >
                              <RefreshCw className="w-3 h-3" />
                              재주문
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}


          </div>
        )}

        {/* 사업 캘린더 탭 */}
        {activeTab === "calendar" && (
          <div className="space-y-4 w-full px-[15%]">
            <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-black/5 bg-gradient-to-r from-[#EBF4FF] to-[#F0F7FF]">
                <h3 className="text-[15px] font-semibold text-[#1d1d1f]">📅 2026년 보건 사업 캘린더</h3>
                <p className="text-[12px] text-[#86868b] mt-0.5">캠페인 시작 30일 전 자동 알림을 보내드립니다</p>
              </div>
              <div className="divide-y divide-black/4">
                {CALENDAR_ALERTS.map((alert) => (
                  <div key={alert.id} className="px-6 py-5 hover:bg-[#fafafa] transition-colors">
                    <div className="flex items-start gap-4">
                      <span className={`text-[12px] font-bold px-3 py-1 rounded-full shrink-0 ${
                        alert.urgency === "urgent"
                          ? "bg-red-500 text-white"
                          : alert.urgency === "high"
                          ? "bg-orange-500 text-white"
                          : "bg-[#00A39B] text-white"
                      }`}>
                        {alert.dDay}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-[15px] font-semibold text-[#1d1d1f]">{alert.event}</p>
                          <p className="text-[13px] text-[#86868b]">{alert.date}</p>
                        </div>
                        <p className="text-[13px] text-[#86868b] mt-1">추천 인쇄물: {alert.suggestion}</p>
                        <div className="flex items-center gap-2 mt-3">
                          <span className="flex items-center gap-1 text-[11px] text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                            <Star className="w-3 h-3" />
                            {alert.lastOrder}
                          </span>
                          <button
                            onClick={() => toast.success(`${alert.event} 관련 상품을 장바구니에 추가했습니다.`)}
                            className="ml-auto flex items-center gap-1.5 px-4 py-2 bg-[#00A39B] text-white text-[12px] font-semibold rounded-xl hover:bg-[#0055AA] transition-colors"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            작년과 동일하게 주문
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {/* 연간 계획표 전체 보기 버튼 */}
              <div className="px-6 py-4 bg-gradient-to-r from-[#EBF4FF] to-[#F0F7FF] border-t border-black/5 flex items-center justify-between">
                <div>
                  <p className="text-[13px] font-semibold text-[#1d1d1f]">📋 2026 – 2027 연간 계획표</p>
                  <p className="text-[11px] text-[#86868b] mt-0.5">월별 납품 일정·사업 공모 시기 전체 보기</p>
                </div>
                <Link
                  href="/plan"
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#00A39B] text-white text-[12px] font-semibold rounded-xl hover:bg-[#0055AA] transition-colors whitespace-nowrap"
                >
                  전체 보기 →
                </Link>
              </div>
            </div>
          </div>
        )}


      </div>
    </div>
  );
}
