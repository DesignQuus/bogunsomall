/**
 * CodeInputTab — Tab A: 드릴다운 보건소 선택 → 숫자 4자리 간편 로그인 번호 입력
 *
 * 흐름:
 *   1단계: DrilldownPicker로 시·도 → 시·군·구 → 보건소 선택
 *   2단계: 숫자 4자리 간편 로그인 번호 입력 (0000~9999)
 *   → 입장 버튼 클릭 시 메인 플랫폼으로 이동
 *
 * 보안 정책:
 *   - localStorage: 보건소 정보만 저장 (centerCode, centerName, region, district)
 *   - 4자리 코드: 저장하지 않음 (세션 내에서만 사용)
 *   - 접속 이력: 최근 5회 일시 기록
 *
 * 중복 확인:
 *   - admin_signup_requests에서 동일 centerCode + deptCode 조합 확인
 *   - 중복 시 "이미 등록된 번호입니다." 표시
 */
import { useRef, useEffect, useState } from "react";
import {
  ChevronLeft, ChevronRight, AlertCircle, MapPin, Building2, KeyRound,
  Clock, History, Trash2, CheckCircle2, XCircle,
} from "lucide-react";
import DrilldownPicker, { type SelectedCenterInfo } from "@/components/DrilldownPicker";
import {
  saveCenterInfo, getSavedCenter, clearSavedCenter,
  addAccessLog, getAccessLog, formatAccessTime,
  isDeptCodeDuplicate,
  type AccessLogEntry,
} from "@/lib/centerStorage";
import { getRegionColor, getRegionInitial } from "./constants";

interface Props {
  /** 탭이 활성화되어 있는지 여부 */
  isActive: boolean;
  /** 보건소 + 간편 로그인 번호 입력 완료 시 호출 */
  onEnter: (centerCode: string, centerName: string, region: string, deptCode: string) => void;
  /** 외부 로딩 상태 (등록 여부 확인 중) */
  isLoading?: boolean;
}

export default function CodeInputTab({ isActive, onEnter, isLoading = false }: Props) {
  const deptCodeRef = useRef<HTMLInputElement>(null);

  // ── 1단계: 드릴다운 보건소 선택 ─────────────────────────────────────────
  const [selectedCenter, setSelectedCenter] = useState<SelectedCenterInfo | null>(null);
  const [drilldownKey, setDrilldownKey] = useState(0); // 드릴다운 리셋용

  // ── 2단계: 숫자 4자리 간편 로그인 번호 입력 ─────────────────────────────────────
  const [deptCode, setDeptCode] = useState("");
  const [deptCodeError, setDeptCodeError] = useState("");
  const [dupStatus, setDupStatus] = useState<"idle" | "checking" | "ok" | "duplicate">("idle");

  // ── 접속 이력 ─────────────────────────────────────────────────────────────
  const [accessLog, setAccessLog] = useState<AccessLogEntry[]>([]);

  // ── 저장된 보건소 자동 복원 ───────────────────────────────────────────────
  const [savedCenter, setSavedCenter] = useState<ReturnType<typeof getSavedCenter>>(null);

  // 마운트 시 저장된 보건소 + 접속 이력 불러오기
  useEffect(() => {
    setSavedCenter(getSavedCenter());
    setAccessLog(getAccessLog());
  }, []);

  // 탭 활성화 시 포커스
  useEffect(() => {
    if (isActive && selectedCenter) {
      setTimeout(() => deptCodeRef.current?.focus(), 80);
    }
  }, [isActive, selectedCenter]);

  // 보건소 선택 처리
  const handleCenterSelect = (center: SelectedCenterInfo) => {
    setSelectedCenter(center);
    setDeptCode("");
    setDeptCodeError("");
    setDupStatus("idle");
    // 보건소 정보를 localStorage에 저장 (코드 제외)
    saveCenterInfo({
      centerCode: center.code,
      centerName: center.name,
      region: center.region,
      district: center.district,
    });
    setSavedCenter(getSavedCenter());
    setTimeout(() => deptCodeRef.current?.focus(), 80);
  };

  // 보건소 선택 취소 (뒤로가기)
  const handleBack = () => {
    setSelectedCenter(null);
    setDeptCode("");
    setDeptCodeError("");
    setDupStatus("idle");
    setDrilldownKey(k => k + 1); // 드릴다운 초기화
  };

  // 저장된 보건소로 빠른 선택
  const handleQuickSelectSaved = () => {
    if (!savedCenter) return;
    setSelectedCenter({
      name: savedCenter.centerName,
      code: savedCenter.centerCode,
      region: savedCenter.region,
      district: savedCenter.district,
      address: "",
      phone: "",
    });
    setDeptCode("");
    setDeptCodeError("");
    setDupStatus("idle");
    setTimeout(() => deptCodeRef.current?.focus(), 80);
  };

  // 저장된 보건소 삭제
  const handleClearSaved = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearSavedCenter();
    setSavedCenter(null);
  };

  // 코드 입력 변경 처리 (실시간 중복 확인)
  const handleDeptCodeChange = (value: string) => {
    const raw = value;
    // 한글 감지
    const hasKorean = /[\uAC00-\uD7A3\u1100-\u11FF\u3130-\u318F]/.test(raw);
    // 특수문자 감지 (영문·숫자 외)
    const hasSpecial = /[^A-Za-z0-9\uAC00-\uD7A3\u1100-\u11FF\u3130-\u318F]/.test(raw);

    if (hasKorean) {
      setDeptCodeError("한글은 입력할 수 없습니다. 영문 대문자와 숫자만 사용 가능합니다.");
    } else if (hasSpecial) {
      setDeptCodeError("특수문자는 입력할 수 없습니다. 영문 대문자와 숫자만 사용 가능합니다.");
    } else {
      setDeptCodeError("");
    }

    const v = raw.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8);
    setDeptCode(v);

    if (v.length >= 1 && selectedCenter) {
      setDupStatus("checking");
      // 실시간 중복 확인
      const isDup = isDeptCodeDuplicate(selectedCenter.code, v);
      setDupStatus(isDup ? "duplicate" : "ok");
      if (isDup) {
        setDeptCodeError("이미 등록된 번호입니다.");
      }
    } else {
      setDupStatus("idle");
    }
  };

  // 입장 처리
  const handleEnter = () => {
    if (!selectedCenter) return;

    const trimmed = deptCode.trim();
    if (trimmed.length === 0) {
      setDeptCodeError("간편 로그인 번호를 입력해 주세요.");
      return;
    }
    if (!/^[A-Z0-9]{1,8}$/.test(trimmed)) {
      setDeptCodeError("영문 대문자(A–Z)와 숫자(0–9)만 사용 가능합니다. (예: M001)");
      return;
    }
    if (dupStatus === "duplicate") {
      setDeptCodeError("이미 등록된 번호입니다.");
      return;
    }

    // 빠른 재접속 이력 기록
    addAccessLog({
      centerCode: selectedCenter.code,
      centerName: selectedCenter.name,
      region: selectedCenter.region,
      district: selectedCenter.district ?? "",
    });
    setAccessLog(getAccessLog());

    // 부모 컴포넌트에 알림
    onEnter(selectedCenter.code, selectedCenter.name, selectedCenter.region, trimmed);
  };

  // ── 2단계: 간편 로그인 번호 입력 화면 ──────────────────────────────────────────────
  if (selectedCenter) {
    const color = getRegionColor(selectedCenter.region);
    return (
      <div>
        {/* 헤더 */}
        <div className="mb-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-1 text-[12px] text-[#86868b] hover:text-[#1d1d1f] transition-colors mb-2"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            보건소 다시 선택
          </button>
          <h2 className="text-[17px] font-bold text-[#1d1d1f] tracking-tight mb-0.5">간편 로그인 번호 입력</h2>
          <p className="text-[12px] text-[#86868b]">담당 부서의 간편 로그인 번호를 입력하세요 (영문 대문자·숫자, 최대 8자)</p>
        </div>

        {/* 선택된 보건소 표시 */}
        <div className="flex items-center gap-3 p-3 bg-[#f0faf9] rounded-xl border border-[#00A39B]/20 mb-4">
          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${color.bg} flex items-center justify-center shrink-0`}>
            <span className={`text-[11px] font-bold ${color.text}`}>{getRegionInitial(selectedCenter.region)}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-[#1d1d1f] truncate">{selectedCenter.name}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] font-mono text-[#00A39B] font-semibold">{selectedCenter.code}</span>
              <span className="text-[10px] text-[#86868b] flex items-center gap-0.5">
                <MapPin className="w-2 h-2" />{selectedCenter.region}
              </span>
            </div>
          </div>
          <Building2 className="w-4 h-4 text-[#00A39B] shrink-0" />
        </div>

        {/* 간편 로그인 번호 입력창 */}
        <div className="flex items-center gap-2 mb-2">
          <div className="relative flex-1">
            <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868b] pointer-events-none" />
            <input
              ref={deptCodeRef}
              type="text"
              autoComplete="off"
              value={deptCode}
              onChange={e => handleDeptCodeChange(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleEnter()}
              placeholder="간편 로그인 번호를 입력하세요"
              maxLength={8}
              className={`w-full pl-10 pr-12 py-3.5 text-[15px] font-mono tracking-widest bg-[#f5f5f7] border rounded-xl focus:outline-none focus:bg-white focus:ring-2 transition-all placeholder:text-[#c7c7cc] placeholder:font-sans placeholder:tracking-normal ${
                dupStatus === "duplicate"
                  ? "border-red-400 focus:border-red-400 focus:ring-red-100"
                  : dupStatus === "ok"
                  ? "border-[#00A39B] focus:border-[#00A39B] focus:ring-[#00A39B]/10"
                  : "border-transparent focus:border-[#00A39B] focus:ring-[#00A39B]/10"
              }`}
            />
            {/* 상태 아이콘 */}
            <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {dupStatus === "ok" && <CheckCircle2 className="w-4 h-4 text-[#00A39B]" />}
              {dupStatus === "duplicate" && <XCircle className="w-4 h-4 text-red-500" />}
              {dupStatus === "idle" && (
                <span className="text-[11px] text-[#c7c7cc] font-mono">{deptCode.length}/8</span>
              )}
            </span>
          </div>
          <button
            onClick={handleEnter}
            disabled={deptCode.length < 1 || dupStatus === "duplicate" || isLoading}
            className="px-5 py-3.5 bg-[#00A39B] text-white text-[13px] font-semibold rounded-xl hover:bg-[#007a73] active:scale-[0.97] transition-all shrink-0 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            {isLoading ? (
              <>
                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                확인 중
              </>
            ) : "간편로그인"}
          </button>
        </div>

        {/* 에러 */}
        {deptCodeError && (
          <div className="flex items-start gap-2 mt-2 p-3 bg-red-50 rounded-xl border border-red-100">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <p className="text-[12px] text-red-600 leading-relaxed">{deptCodeError}</p>
          </div>
        )}

        {/* 코드 안내 */}
        <div className="mt-3 p-3 bg-[#f5f5f7] rounded-xl">
          <p className="text-[14px] text-[#86868b] leading-relaxed">
            <span className="font-semibold text-[#1d1d1f]">간편 로그인 코드란?</span><br />
            전국 보건소별 발주 담당자 간편 로그인 코드 입니다.<br />
            타인에게 노출이 안되도록 각별히 관리 바랍니다.<br />
            수정 및 변경 요청은{" "}
            <a href="tel:15226401" className="text-[#00A39B] font-semibold underline-offset-2 hover:underline">
              고객지원센터 1522-6401
            </a>
            로 연락 주시면 확인 가능 합니다.
          </p>
        </div>

        {/* 접속 이력 - 최종 1개만 표시 */}
        {accessLog.length > 0 && (() => {
          const latest = accessLog[0];
          const ts = typeof latest.lastAccessAt === "number" && !isNaN(latest.lastAccessAt)
            ? latest.lastAccessAt
            : null;
          return (
            <div className="mt-4">
              <div className="flex items-center gap-1.5 mb-2">
                <History className="w-3.5 h-3.5 text-[#86868b]" />
                <span className="text-[11px] font-semibold text-[#86868b] uppercase tracking-wider">최근 접속 이력</span>
              </div>
              <div className="flex items-center justify-between px-3 py-2 bg-[#f5f5f7] rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3 text-[#c7c7cc]" />
                  <span className="text-[12px] text-[#1d1d1f] font-medium truncate max-w-[160px]">{latest.centerName}</span>
                </div>
                <span className="text-[11px] text-[#86868b]">{ts ? formatAccessTime(ts) : ""}</span>
              </div>
            </div>
          );
        })()}
      </div>
    );
  }

  // ── 1단계: 드릴다운 보건소 선택 화면 ──────────────────────────────────────
  // 빠른 재접속: 접속 이력 중 가장 최근 1개
  const lastEntry = accessLog[0] ?? null;

  return (
    <div>
      {/* 안내 문구 */}
      <div className="mb-4">
        <h2 className="text-[17px] font-bold text-[#1d1d1f] tracking-tight mb-0.5">보건소 선택</h2>
        <p className="text-[12px] text-[#86868b]">지역별 보건소를 선택 후 간편 로그인 번호를 입력하세요.</p>
      </div>

      {/* 빠른 재접속 — 최근 접속 보건소 1개 */}
      {lastEntry && (
        <div className="mb-3">
          <p className="text-[11px] font-semibold text-[#86868b] uppercase tracking-wider mb-1.5 flex items-center gap-1">
            <History className="w-3 h-3" />
            빠른 재접속
          </p>
          <div
            role="button"
            tabIndex={0}
            onClick={() => {
              setSelectedCenter({
                code: lastEntry.centerCode,
                name: lastEntry.centerName,
                region: lastEntry.region,
                district: lastEntry.district,
                address: "",
                phone: "",
              });
              setTimeout(() => deptCodeRef.current?.focus(), 80);
            }}
            onKeyDown={(e) => e.key === 'Enter' && (() => {
              setSelectedCenter({
                code: lastEntry.centerCode,
                name: lastEntry.centerName,
                region: lastEntry.region,
                district: lastEntry.district,
                address: "",
                phone: "",
              });
              setTimeout(() => deptCodeRef.current?.focus(), 80);
            })()}
            className="w-full flex items-center gap-3 p-3 bg-[#f0faf9] rounded-xl border border-[#00A39B]/20 hover:border-[#00A39B]/50 hover:bg-[#e6f7f5] transition-all group cursor-pointer" style={{paddingTop: '0px', paddingBottom: '0px'}}
          >
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${getRegionColor(lastEntry.region).bg} flex items-center justify-center shrink-0`}>
              <span className={`text-[10px] font-bold ${getRegionColor(lastEntry.region).text}`}>
                {getRegionInitial(lastEntry.region)}
              </span>
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-[13px] font-semibold text-[#1d1d1f] truncate leading-tight">{lastEntry.centerName}</p>
              <p className="text-[11px] text-[#86868b] leading-tight">
                {lastEntry.region}{lastEntry.district ? ` · ${lastEntry.district}` : ""}
                <span className="ml-2 text-[#b0b0b5]">{formatAccessTime(lastEntry.lastAccessAt)}</span>
              </p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[11px] text-[#00A39B] font-medium opacity-0 group-hover:opacity-100 transition-opacity">접속</span>
              <ChevronRight className="w-4 h-4 text-[#00A39B]/60 group-hover:text-[#00A39B] transition-colors" />
            </div>
          </div>
        </div>
      )}

      {/* 드릴다운 선택기 */}
      <div className="rounded-xl border border-[#e5e5ea] overflow-hidden">
        <DrilldownPicker
          key={drilldownKey}
          onSelect={handleCenterSelect}
        />
      </div>
    </div>
  );
}
