"use client";
/**
 * NavigationContext — 스마트 뒤로가기
 *
 * 설계 원칙:
 * - 방문 경로를 스택으로 관리하여 실제 직전 페이지로 이동
 * - 인트로·로그인 페이지(/intro, /register)는 스택에서 제외 → 로그인 상태 보호
 * - 대시보드(/dashboard)는 스택의 최하단 anchor로 취급 → 뒤로가기의 최종 목적지
 * - 같은 경로 연속 방문 시 중복 스택 방지
 */

import { createContext, useContext, useCallback, useRef, useEffect, ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";

// 뒤로가기 스택에서 제외할 페이지 (로그인/인트로 계열)
const EXCLUDED_PATHS = ["/intro", "/register", "/"];

// 뒤로가기의 최종 목적지 (이 페이지에서는 뒤로가기 버튼 숨김)
const ROOT_PATHS = ["/dashboard", "/intro", "/register", "/"];

interface NavigationContextValue {
  /** 직전 페이지 경로. null이면 뒤로가기 불가 (최상위 페이지) */
  previousPath: string | null;
  /** 스마트 뒤로가기 실행 */
  goBack: () => void;
  /** 현재 페이지가 최상위(뒤로가기 불필요)인지 여부 */
  isRootPage: boolean;
  /** 뒤로가기 버튼에 표시할 레이블 */
  backLabel: string;
}

const NavigationContext = createContext<NavigationContextValue>({
  previousPath: null,
  goBack: () => {},
  isRootPage: true,
  backLabel: "뒤로",
});

/** 경로에 따른 한국어 레이블 매핑 */
function getPageLabel(path: string): string {
  if (path === "/dashboard") return "대시보드";
  if (path.startsWith("/order/namecard")) return "명함 주문";
  if (path.startsWith("/order/reorder")) return "재주문";
  if (path.startsWith("/order/product")) return "상품 주문";
  if (path.startsWith("/order/new")) return "주문";
  if (path === "/order") return "주문 카테고리";
  if (path.startsWith("/category")) return "카테고리";
  if (path === "/order-history") return "주문 이력";
  if (path === "/namecard-history") return "명함 이력";
  if (path === "/namecard-contact") return "명함 문의";
  if (path === "/custom-order") return "맞춤 주문";
  if (path === "/portfolio") return "포트폴리오";
  if (path === "/customer-service") return "고객센터";
  if (path === "/about") return "소개";
  if (path === "/plan") return "연간 계획";
  return "이전 페이지";
}

export function NavigationProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  
  // 방문 스택: 인트로/로그인 제외한 경로만 쌓임
  const stackRef = useRef<string[]>([]);
  const prevLocationRef = useRef<string>(pathname);

  useEffect(() => {
    const prev = prevLocationRef.current;
    const curr = pathname;

    // 경로가 바뀌었을 때만 처리
    if (prev === curr) return;
    prevLocationRef.current = curr;

    // 인트로/로그인 페이지는 스택에 추가하지 않음
    if (EXCLUDED_PATHS.includes(prev)) return;

    // 직전 경로가 현재 스택 최상단과 같으면 뒤로가기로 판단 → 스택에서 제거
    const top = stackRef.current[stackRef.current.length - 1];
    if (top === curr) {
      stackRef.current.pop();
      return;
    }

    // 같은 경로 중복 방지
    if (top === prev) return;

    // 스택에 직전 경로 추가
    stackRef.current.push(prev);

    // 스택 최대 20개 유지
    if (stackRef.current.length > 20) {
      stackRef.current = stackRef.current.slice(-20);
    }
  }, [pathname]);

  const previousPath = stackRef.current.length > 0
    ? stackRef.current[stackRef.current.length - 1]
    : null;

  const isRootPage = ROOT_PATHS.some(p => pathname === p || pathname.startsWith(p + "?"));

  const backLabel = previousPath ? `${getPageLabel(previousPath)}로` : "뒤로";

  const goBack = useCallback(() => {
    if (stackRef.current.length > 0) {
      const target = stackRef.current[stackRef.current.length - 1];
      router.push(target);
    } else {
      // 스택이 비어있으면 대시보드로
      router.push("/dashboard");
    }
  }, [router]);

  return (
    <NavigationContext.Provider value={{ previousPath, goBack, isRootPage, backLabel }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  return useContext(NavigationContext);
}
