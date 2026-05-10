/**
 * DrilldownPicker — 시·도 → 시·군·구 → 보건소 3단계 드릴다운 선택 컴포넌트
 * SignupTab과 CodeInputTab에서 공유 사용
 */
import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { HEALTH_CENTERS } from "@/data/healthCenters";

// ── 드릴다운 유틸 ─────────────────────────────────────────────────────────────
export const SIDO_LIST = Array.from(
  new Set(HEALTH_CENTERS.filter(c => c.region !== "테스트").map(c => c.region))
).sort();

export function getDistrictList(sido: string): string[] {
  return Array.from(
    new Set(HEALTH_CENTERS.filter(c => c.region === sido).map(c => c.district))
  ).sort();
}

export function getCentersByDistrict(sido: string, district: string) {
  return HEALTH_CENTERS.filter(c => c.region === sido && c.district === district);
}

export interface SelectedCenterInfo {
  name: string;
  code: string;
  region: string;
  district: string;
  address: string;
  phone: string;
}

interface DrilldownPickerProps {
  onSelect: (center: SelectedCenterInfo) => void;
  /** 외부에서 드릴다운 상태를 리셋하고 싶을 때 사용하는 key */
  resetKey?: number;
}

export default function DrilldownPicker({ onSelect, resetKey }: DrilldownPickerProps) {
  const [step, setStep] = useState<"sido" | "center">("sido");
  const [selectedSido, setSelectedSido] = useState("");

  // resetKey 변경 시 내부 상태 초기화
  // (key prop으로 부모에서 제어 가능)
  void resetKey;

  const centerList = selectedSido ? HEALTH_CENTERS.filter(c => c.region === selectedSido) : [];

  const handleSidoSelect = (sido: string) => {
    setSelectedSido(sido);
    setStep("center");
  };

  return (
    <div className="bg-white/60 flex flex-col">
      {/* 단계 브레드크럼 */}
      <div className="flex items-center gap-1 px-3.5 pt-3 pb-2 border-b border-[#f0f0f5]">
        <button
          onClick={() => { setStep("sido"); setSelectedSido(""); }}
          className={`text-[12px] font-medium px-2 py-0.5 rounded-full transition-colors ${step === "sido" ? "text-white" : "text-[#86868b] hover:text-[#00b398]"}`}
          style={step === "sido" ? { background: "#00b398" } : {}}
        >
          시·도
        </button>
        <ChevronRight className="w-3 h-3 text-[#c7c7cc]" />
        <span
          className={`text-[12px] font-medium px-2 py-0.5 rounded-full ${step === "center" ? "text-white" : "text-[#c7c7cc]"}`}
          style={step === "center" ? { background: "#00b398" } : {}}
        >
          보건소
        </span>
      </div>

      {/* 목록 — 보건소 단계는 스크롤 허용 */}
      <div className={step === "center" ? "max-h-52 overflow-y-auto" : ""}>
        {step === "sido" && (
          <div className="grid grid-cols-3 md:grid-cols-4 gap-0">
            {SIDO_LIST.map((sido, i) => (
              <button
                key={sido}
                onClick={() => handleSidoSelect(sido)}
                className={`px-3 py-2.5 text-[13px] font-medium text-left transition-colors hover:text-white border-r border-[#f0f0f5] ${i % 3 === 2 ? "border-r-0" : ""} ${i % 4 === 3 ? "md:border-r-0" : ""}`}
                style={{ borderBottom: "1px solid #f0f0f5" }}
                onMouseEnter={e => (e.currentTarget.style.background = "#00b398")}
                onMouseLeave={e => (e.currentTarget.style.background = "")}
              >
                {sido}
              </button>
            ))}
          </div>
        )}



        {step === "center" && (
          <div className="flex flex-col">
            {centerList.map((center) => (
              <button
                key={center.code}
                onClick={() => onSelect({
                  name: center.name,
                  code: center.code,
                  region: center.region,
                  district: center.district,
                  address: center.address || "",
                  phone: center.phone || "",
                })}
                className="flex items-center justify-between px-3.5 py-2.5 text-left transition-colors hover:text-white group"
                style={{ borderBottom: "1px solid #f0f0f5" }}
                onMouseEnter={e => (e.currentTarget.style.background = "#00b398")}
                onMouseLeave={e => (e.currentTarget.style.background = "")}
              >
                <span className="text-[13px] font-medium">{center.name}</span>
                <span className="text-[11px] font-mono opacity-50 group-hover:opacity-80">{center.code}</span>
              </button>
            ))}
            {centerList.length === 0 && (
              <p className="text-center text-[13px] text-[#86868b] py-6">등록된 보건소가 없습니다</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
