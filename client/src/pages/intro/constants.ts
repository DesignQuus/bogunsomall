/**
 * Intro 페이지 상수 및 유틸리티
 */
import { Building2, Truck, Star, Shield } from "lucide-react";
import type { Center, Department } from "@/contexts/CenterContext";

// ─── 지역 상수 ───────────────────────────────────────────────────────────────
export const REGION_PREFIX: Record<string, string> = {
  "서울특별시": "SEO", "인천광역시": "ICN", "경기도": "GGI",
  "부산광역시": "PUS", "대구광역시": "DAE", "광주광역시": "GWJ",
  "대전광역시": "DJN", "울산광역시": "ULS", "세종특별자치시": "SJG",
  "강원도": "GWO", "충청북도": "CNB", "충청남도": "CNA",
  "전라북도": "JNB", "전라남도": "JNA", "경상북도": "GSB",
  "경상남도": "GSN", "제주특별자치도": "JJU",
};

export const REGION_ORDER = [
  "서울특별시", "경기도", "인천광역시",
  "부산광역시", "대구광역시", "광주광역시", "대전광역시", "울산광역시", "세종특별자치시",
  "강원도", "충청북도", "충청남도", "전라북도", "전라남도", "경상북도", "경상남도", "제주특별자치도",
];

export const REGION_SHORT: Record<string, string> = {
  "서울특별시": "서울", "인천광역시": "인천", "경기도": "경기",
  "부산광역시": "부산", "대구광역시": "대구", "광주광역시": "광주",
  "대전광역시": "대전", "울산광역시": "울산", "세종특별자치시": "세종",
  "강원도": "강원", "충청북도": "충북", "충청남도": "충남",
  "전라북도": "전북", "전라남도": "전남", "경상북도": "경북",
  "경상남도": "경남", "제주특별자치도": "제주",
};

export const getRegionColor = (_region: string) =>
  ({ bg: "from-gray-50 to-gray-100", text: "text-gray-600", btn: "bg-white text-[#1d1d1f] border-[#d1d1d6]" });

export const getRegionInitial = (region: string) => REGION_PREFIX[region]?.slice(0, 2) ?? "??";

// ─── 최근 방문 ───────────────────────────────────────────────────────────────
export interface RecentEntry {
  code: string;
  name: string;
  region: string;
  lastDeptId: string;
  lastDeptName: string;
  lastVisit: string;
}

const STORAGE_KEY = "recentCenters";
const MAX_RECENT = 3;

export function loadRecent(): RecentEntry[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]"); }
  catch { return []; }
}
export function saveRecent(entries: RecentEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_RECENT)));
}
export function addRecent(entry: RecentEntry) {
  const prev = loadRecent().filter(e => e.code !== entry.code);
  saveRecent([entry, ...prev]);
}
export function removeRecent(code: string) {
  saveRecent(loadRecent().filter(e => e.code !== code));
}
export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "방금 전";
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  const d = Math.floor(h / 24);
  if (d === 1) return "어제";
  if (d < 7) return `${d}일 전`;
  return `${Math.floor(d / 7)}주 전`;
}

// ─── 전역 세션 상태 ───────────────────────────────────────────────────────────
export const loginState = {
  isLoggedIn: false,
  center: null as Center | null,
  department: null as Department | null,
  user: null as { name: string } | null,
};

// ─── 타입 ─────────────────────────────────────────────────────────────────────
export type Step = "code" | "dept" | "name" | "success";
export type InputTab = "code" | "region";

// ─── 배경 통계 ────────────────────────────────────────────────────────────────
export const BG_STATS = [
  { icon: null, imageUrl: "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/women-enterprise-mark_ad1a9f66.png", value: "중소벤처기업부", label: "인증 여성기업" },
  { icon: Building2, imageUrl: null, value: "직접 생산", label: "증명 자격업체" },
  { icon: Truck,     imageUrl: null, value: "15년+",  label: "전문 경력" },
  { icon: Star,      imageUrl: null, value: "98%",    label: "고객 만족도" },
  { icon: Shield,    imageUrl: null, value: "100%",   label: "공공기관 전용" },
];

// ─── 차단 기관 타입 ───────────────────────────────────────────────────────────
export interface BlockedCenter {
  name: string;
  code: string;
  status: "suspended" | "expired";
}
