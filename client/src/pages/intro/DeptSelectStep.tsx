/**
 * DeptSelectStep — Step 2: 부서 선택
 */
import {
  ArrowLeft, CheckCircle2, Clock, Users, ChevronRight, Sparkles,
} from "lucide-react";
import type { Center, Department } from "@/contexts/CenterContext";
import { getRegionInitial } from "./constants";

interface Props {
  center: Center;
  preselectedDeptId: string | null;
  onSelectDept: (dept: Department) => void;
  onAddDept: (name: string) => void;
  onBack: () => void;
}

export default function DeptSelectStep({ center, preselectedDeptId, onSelectDept, onBack }: Props) {
  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-[12px] text-[#86868b] hover:text-[#00A39B] transition-colors mb-4 group"
      >
        <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
        다른 보건소 선택
      </button>

      {/* 기관 확인 카드 */}
      <div className="flex items-center gap-3 p-3.5 bg-blue-50 rounded-2xl mb-5 border border-[#00A39B]/15">
        <div className="w-10 h-10 rounded-xl bg-[#f5f5f7] border border-[#d1d1d6] flex items-center justify-center shrink-0">
          <span className="text-[11px] font-bold text-[#1d1d1f]">{getRegionInitial(center.region)}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-semibold text-[#1d1d1f] truncate">{center.name}</p>
          <p className="text-[11px] text-[#00A39B] font-code">{center.code}</p>
        </div>
        <CheckCircle2 className="w-4.5 h-4.5 text-[#00A39B] shrink-0" />
      </div>

      <div className="mb-4">
        <h2 className="text-[18px] font-bold text-[#1d1d1f] tracking-tight mb-1">부서를 선택하세요</h2>
        {preselectedDeptId && (
          <div className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-0.5">
            <Sparkles className="w-2.5 h-2.5 text-amber-500" />
            <p className="text-[10px] text-amber-700 font-medium">마지막 방문 부서가 강조됩니다</p>
          </div>
        )}
      </div>

      {/* 부서 목록 */}
      <div className="space-y-1.5" style={{ maxHeight: "240px", overflowY: "auto", WebkitOverflowScrolling: "touch" }}>
        {(center.departments || []).map(dept => {
          const isPreselected = dept.id === preselectedDeptId;
          return (
            <button
              key={dept.id}
              onClick={() => onSelectDept(dept)}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl border transition-all text-left ${
                dept.status === "pending"
                  ? "bg-amber-50 border-amber-200 opacity-70 cursor-not-allowed"
                  : isPreselected
                    ? "bg-blue-50 border-[#00A39B]/40 ring-1 ring-[#00A39B]/20"
                    : "bg-[#f5f5f7] border-transparent hover:border-[#00A39B]/30 hover:bg-blue-50/40"
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                dept.status === "pending" ? "bg-amber-100"
                  : isPreselected ? "bg-[#00A39B]"
                  : "bg-white"
              }`}>
                {dept.status === "pending"
                  ? <Clock className="w-3.5 h-3.5 text-amber-600" />
                  : isPreselected
                    ? <Users className="w-3.5 h-3.5 text-white" />
                    : <Users className="w-3.5 h-3.5 text-[#424245]" />
                }
              </div>
              <div className="flex-1">
                <p className={`text-[13px] font-semibold ${isPreselected ? "text-[#00A39B]" : "text-[#1d1d1f]"}`}>
                  {dept.name}
                </p>
                {dept.status === "pending" && (
                  <p className="text-[10px] text-amber-600">관리자 승인 대기 중</p>
                )}
                {isPreselected && dept.status === "active" && (
                  <p className="text-[10px] text-[#00A39B]/70">마지막 방문 부서</p>
                )}
              </div>
              {isPreselected && dept.status === "active" && (
                <span className="text-[9px] font-semibold bg-[#00A39B] text-white px-1.5 py-0.5 rounded-full">최근</span>
              )}
              {dept.status === "active" && !isPreselected && (
                <ChevronRight className="w-3.5 h-3.5 text-[#c7c7cc] shrink-0" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
