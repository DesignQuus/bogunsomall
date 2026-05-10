/**
 * BackButton — 스마트 뒤로가기 공통 컴포넌트
 *
 * NavigationContext의 방문 스택을 참조하여 실제 직전 페이지로 이동합니다.
 * - 최상위 페이지(dashboard, intro 등)에서는 렌더링하지 않음
 * - variant: "header" (헤더 내 인라인), "floating" (좌측 고정 플로팅)
 */

import { useNavigation } from "@/contexts/NavigationContext";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  /** 버튼 스타일 변형 */
  variant?: "header" | "inline" | "floating";
  /** 커스텀 레이블 (지정하지 않으면 NavigationContext의 backLabel 사용) */
  label?: string;
  /** 추가 className */
  className?: string;
}

export default function BackButton({ variant = "inline", label, className = "" }: BackButtonProps) {
  const { goBack, isRootPage, backLabel } = useNavigation();

  // 최상위 페이지에서는 렌더링하지 않음
  if (isRootPage) return null;

  const displayLabel = label ?? backLabel;

  if (variant === "header") {
    return (
      <button
        onClick={goBack}
        className={`flex items-center gap-1.5 text-[13px] font-medium text-[#00A39B] hover:text-[#0055AA] transition-colors group ${className}`}
        aria-label={`${displayLabel} 이동`}
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
        <span>{displayLabel}</span>
      </button>
    );
  }

  if (variant === "floating") {
    return (
      <button
        onClick={goBack}
        className={`fixed left-4 top-1/2 -translate-y-1/2 z-40 flex items-center gap-1.5 px-3 py-2 bg-white/90 backdrop-blur-md border border-black/8 rounded-full shadow-md text-[13px] font-medium text-[#1d1d1f] hover:bg-white hover:shadow-lg transition-all group md:hidden ${className}`}
        aria-label={`${displayLabel} 이동`}
      >
        <ArrowLeft className="w-4 h-4 text-[#00A39B] transition-transform group-hover:-translate-x-0.5" />
        <span className="text-[#00A39B]">{displayLabel}</span>
      </button>
    );
  }

  // inline (default)
  return (
    <button
      onClick={goBack}
      className={`inline-flex items-center gap-1.5 px-4 py-2 text-[13px] font-medium text-[#1d1d1f] bg-[#f5f5f7] hover:bg-[#e8e8ed] rounded-full transition-colors group ${className}`}
      aria-label={`${displayLabel} 이동`}
    >
      <ArrowLeft className="w-4 h-4 text-[#00A39B] transition-transform group-hover:-translate-x-0.5" />
      <span>{displayLabel}</span>
    </button>
  );
}
