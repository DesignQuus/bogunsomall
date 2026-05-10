/**
 * RegionSelectTab — Tab B: 지역별 보건소 선택 → 4자리 발급코드 입력 (서버 검증)
 * 흐름: 시/도 선택 → 보건소 클릭 → 4자리 발급코드 입력 → 서버 검증 → 입장
 */
import { useState, useRef, useEffect } from "react";
import { Search, ChevronRight, ChevronLeft, MapPin, Ban, CalendarX, PhoneCall, Lock, Phone, Loader2 } from "lucide-react";
import type { Center } from "@/contexts/CenterContext";
import { type BlockedCenter, REGION_SHORT, getRegionColor, getRegionInitial } from "./constants";
import { trpc } from "@/lib/trpc";

interface Props {
  availableRegions: string[];
  regionCenters: Center[];
  blockedCenter: BlockedCenter | null;
  setBlockedCenter: (v: BlockedCenter | null) => void;
  onCenterClick: (center: Center) => void;
  isActive: boolean;
}

type SubStep = "region" | "center" | "deptcode";

export default function RegionSelectTab({
  availableRegions, regionCenters,
  blockedCenter, setBlockedCenter,
  onCenterClick, isActive,
}: Props) {
  const [subStep, setSubStep] = useState<SubStep>("region");
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedCenter, setSelectedCenter] = useState<Center | null>(null);
  const [regionSearch, setRegionSearch] = useState("");
  const [deptCode, setDeptCode] = useState("");
  const [deptCodeError, setDeptCodeError] = useState("");
  const [hoveredIdx, setHoveredIdx] = useState(-1);
  const [isVerifying, setIsVerifying] = useState(false);

  const regionSearchRef = useRef<HTMLInputElement>(null);
  const deptCodeRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const utils = trpc.useUtils();

  const filteredCenters = regionSearch.trim()
    ? regionCenters.filter(c => c.region === selectedRegion && (
        c.name.includes(regionSearch) || c.code.toLowerCase().includes(regionSearch.toLowerCase())
      ))
    : regionCenters.filter(c => c.region === selectedRegion);

  useEffect(() => {
    if (isActive && subStep === "center" && selectedRegion) {
      setTimeout(() => regionSearchRef.current?.focus(), 80);
    }
    if (isActive && subStep === "deptcode") {
      setTimeout(() => deptCodeRef.current?.focus(), 80);
    }
  }, [isActive, subStep, selectedRegion]);

  // 지역 선택 후 보건소 목록으로
  const handleRegionSelect = (region: string) => {
    setSelectedRegion(region);
    setRegionSearch("");
    setHoveredIdx(-1);
    setSubStep("center");
  };

  // 보건소 선택 후 간편 로그인 번호 입력으로
  const handleCenterSelect = (center: Center) => {
    if (center.status === "suspended" || center.codeStatus === "suspended") {
      setBlockedCenter({ name: center.name, code: center.code, status: "suspended" }); return;
    }
    if (center.codeStatus === "expired") {
      setBlockedCenter({ name: center.name, code: center.code, status: "expired" }); return;
    }
    setSelectedCenter(center);
    setDeptCode("");
    setDeptCodeError("");
    setSubStep("deptcode");
  };

  // 4자리 발급코드 입력 후 서버 검증
  const handleDeptCodeSubmit = async () => {
    const code = deptCode.trim();
    if (!code) { setDeptCodeError("간편 로그인 번호를 입력해 주세요."); return; }
    if (!/^\d{4}$/.test(code)) {
      setDeptCodeError("간편 로그인 번호는 숫자 4자리입니다. (예: 0023)"); return;
    }
    if (!selectedCenter) return;

    setIsVerifying(true);
    setDeptCodeError("");
    try {
      const result = await utils.requests.verifyIssuedCode.fetch({
        centerCode: selectedCenter.code,
        issuedCode: code,
      });
      if (!result.valid) {
        setDeptCodeError("등록되지 않은 코드입니다. 코드를 다시 확인해 주세요.");
        return;
      }
      // 검증 성공 → 입장
      onCenterClick(selectedCenter);
    } catch (err) {
      setDeptCodeError("코드 확인 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleListKeyDown = (e: React.KeyboardEvent) => {
    if (!filteredCenters.length) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setHoveredIdx(i => Math.min(i + 1, filteredCenters.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setHoveredIdx(i => Math.max(i - 1, 0)); }
    else if (e.key === "Enter" && hoveredIdx >= 0) { e.preventDefault(); handleCenterSelect(filteredCenters[hoveredIdx]); }
  };

  return (
    <div>
      {/* ── STEP: 시/도 선택 ── */}
      {subStep === "region" && (
        <div>
          <div className="mb-4">
            <h2 className="text-[17px] font-bold text-[#1d1d1f] tracking-tight mb-0.5">지역으로 보건소 찾기</h2>
            <p className="text-[12px] text-[#86868b]">시/도를 선택하세요</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {availableRegions.map(region => {
              const color = getRegionColor(region);
              return (
                <button
                  key={region}
                  onClick={() => handleRegionSelect(region)}
                  className="px-3 py-1.5 rounded-xl text-[12px] font-medium border border-[#d1d1d6] bg-white text-[#1d1d1f] hover:border-[#00A39B] hover:text-[#00A39B] transition-all"
                >
                  {REGION_SHORT[region] ?? region}
                </button>
              );
            })}
          </div>
          {availableRegions.length === 0 && (
            <div className="py-8 text-center border border-dashed border-black/10 rounded-2xl bg-[#f9f9fb] mt-4">
              <MapPin className="w-6 h-6 text-[#c7c7cc] mx-auto mb-2" />
              <p className="text-[13px] text-[#86868b]">등록된 지역이 없습니다</p>
            </div>
          )}
        </div>
      )}

      {/* ── STEP: 보건소 선택 ── */}
      {subStep === "center" && selectedRegion && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={() => { setSubStep("region"); setSelectedRegion(null); setRegionSearch(""); }}
              className="flex items-center gap-1 text-[12px] text-[#00A39B] hover:text-[#007a73] transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              시/도 선택
            </button>
            <span className="text-[12px] text-[#c7c7cc]">/</span>
            <span className="text-[12px] font-semibold text-[#1d1d1f]">{REGION_SHORT[selectedRegion] ?? selectedRegion}</span>
          </div>
          <div className="mb-3">
            <h2 className="text-[16px] font-bold text-[#1d1d1f] tracking-tight mb-0.5">보건소 선택</h2>
            <p className="text-[12px] text-[#86868b]">입장할 보건소를 선택하세요</p>
          </div>
          <div className="relative mb-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#86868b] pointer-events-none" />
            <input
              ref={regionSearchRef}
              type="text"
              value={regionSearch}
              onChange={e => { setRegionSearch(e.target.value); setHoveredIdx(-1); }}
              onKeyDown={handleListKeyDown}
              placeholder={`${REGION_SHORT[selectedRegion] ?? selectedRegion} 보건소 검색...`}
              className="w-full pl-9 pr-3 py-2.5 text-[13px] bg-[#f5f5f7] border border-transparent rounded-xl focus:outline-none focus:bg-white focus:border-[#00A39B] focus:ring-2 focus:ring-[#00A39B]/10 transition-all placeholder:text-[#c7c7cc]"
            />
          </div>
          <div
            ref={listRef}
            className="rounded-2xl border border-black/5 overflow-hidden"
            style={{ maxHeight: "240px", overflowY: "auto", WebkitOverflowScrolling: "touch" }}
          >
            {filteredCenters.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-[13px] text-[#86868b]">{regionSearch ? "검색 결과가 없습니다" : "등록된 보건소가 없습니다"}</p>
              </div>
            ) : (
              filteredCenters.map((center, idx) => {
                const color = getRegionColor(center.region);
                const isHovered = hoveredIdx === idx;
                return (
                  <button
                    key={center.code}
                    onClick={() => handleCenterSelect(center)}
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onMouseLeave={() => setHoveredIdx(-1)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all ${
                      isHovered ? "bg-[#f0faf9]" : "bg-white hover:bg-[#f9f9fb]"
                    } ${idx < filteredCenters.length - 1 ? "border-b border-black/[0.04]" : ""}`}
                  >
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${color.bg} flex items-center justify-center shrink-0`}>
                      <span className={`text-[11px] font-bold ${color.text}`}>{getRegionInitial(center.region)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-[13px] font-semibold truncate transition-colors ${isHovered ? "text-[#00A39B]" : "text-[#1d1d1f]"}`}>
                        {center.name}
                      </p>
                      <span className="text-[10px] font-code text-[#00A39B]/70">{center.code}</span>
                    </div>
                    <ChevronRight className={`w-4 h-4 shrink-0 transition-all ${isHovered ? "text-[#00A39B] translate-x-0.5" : "text-[#c7c7cc]"}`} />
                  </button>
                );
              })
            )}
          </div>
          {filteredCenters.length > 1 && (
            <p className="text-[10px] text-[#c7c7cc] text-center mt-2">↑↓ 방향키로 이동 · Enter로 선택</p>
          )}
        </div>
      )}

      {/* ── STEP: 4자리 발급코드 입력 ── */}
      {subStep === "deptcode" && selectedCenter && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={() => { setSubStep("center"); setSelectedCenter(null); setDeptCode(""); setDeptCodeError(""); }}
              className="flex items-center gap-1 text-[12px] text-[#00A39B] hover:text-[#007a73] transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              보건소 선택
            </button>
            <span className="text-[12px] text-[#c7c7cc]">/</span>
            <span className="text-[12px] font-semibold text-[#1d1d1f] truncate">{selectedCenter.name}</span>
          </div>

          {/* 선택된 보건소 정보 */}
          <div className="flex items-center gap-3 p-3 bg-[#f0faf9] rounded-xl border border-[#00A39B]/20 mb-5">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getRegionColor(selectedCenter.region).bg} flex items-center justify-center shrink-0`}>
              <span className={`text-[12px] font-bold ${getRegionColor(selectedCenter.region).text}`}>{getRegionInitial(selectedCenter.region)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-semibold text-[#1d1d1f] truncate">{selectedCenter.name}</p>
              <span className="text-[11px] font-code text-[#00A39B]">{selectedCenter.code}</span>
            </div>
          </div>

          <div className="mb-1">
            <h2 className="text-[16px] font-bold text-[#1d1d1f] tracking-tight mb-0.5">간편 로그인 번호 입력</h2>
            <p className="text-[12px] text-[#86868b]">발급받은 4자리 간편 로그인 번호를 입력하세요 (예: 0023)</p>
          </div>

          <div className="flex items-center gap-2 mt-3">
            <div className="relative flex-1">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868b] pointer-events-none" />
              <input
                ref={deptCodeRef}
                type="text"
                inputMode="numeric"
                value={deptCode}
                onChange={e => {
                  const val = e.target.value.replace(/[^0-9]/g, "").slice(0, 4);
                  setDeptCode(val);
                  setDeptCodeError("");
                }}
                onKeyDown={e => e.key === "Enter" && !isVerifying && handleDeptCodeSubmit()}
                placeholder="간편 로그인 번호를 입력하세요"
                maxLength={4}
                className="w-full pl-10 pr-3 py-3.5 text-[18px] font-mono tracking-[0.4em] bg-[#f5f5f7] border border-transparent rounded-xl focus:outline-none focus:bg-white focus:border-[#00A39B] focus:ring-2 focus:ring-[#00A39B]/10 transition-all placeholder:text-[#c7c7cc] placeholder:font-sans placeholder:tracking-normal placeholder:text-[14px]"
              />
            </div>
            <button
              onClick={handleDeptCodeSubmit}
              disabled={isVerifying || deptCode.length !== 4}
              className="px-5 py-3.5 bg-[#00A39B] text-white text-[13px] font-semibold rounded-xl hover:bg-[#007a73] active:scale-[0.97] transition-all shrink-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  확인 중
                </>
              ) : "간편로그인"}
            </button>
          </div>

          {/* 에러 메시지 */}
          {deptCodeError && (
            <div className="mt-2 p-3 bg-red-50 rounded-xl border border-red-100">
              <p className="text-[12px] text-red-600 leading-relaxed">{deptCodeError}</p>
            </div>
          )}

          {/* 코드 모를 때 안내 */}
          <div className="mt-4 p-3.5 bg-[#f5f5f7] rounded-xl border border-black/5">
            <p className="text-[12px] text-[#86868b] leading-relaxed">
              간편 로그인 번호를 모르시면{" "}
              <a href="tel:15226401" className="text-[#00A39B] font-semibold hover:underline">
                고객지원센터 1522-6401
              </a>
              로 연락 주시면 확인 가능합니다.
            </p>
            <a
              href="tel:15226401"
              className="mt-2.5 flex items-center justify-center gap-2 w-full py-2.5 bg-white border border-[#00A39B]/30 rounded-lg hover:bg-[#f0faf9] transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-[#00A39B]" />
              <span className="text-[13px] font-semibold text-[#00A39B]">1522-6401 전화하기</span>
            </a>
          </div>
        </div>
      )}

      {/* 정지/만료 기관 안내 */}
      {blockedCenter && (
        <div className="mt-3 rounded-2xl overflow-hidden border border-red-200">
          <div className={`flex items-center gap-2 px-4 py-2.5 ${blockedCenter.status === "suspended" ? "bg-red-500" : "bg-orange-500"}`}>
            {blockedCenter.status === "suspended"
              ? <Ban className="w-3.5 h-3.5 text-white shrink-0" />
              : <CalendarX className="w-3.5 h-3.5 text-white shrink-0" />
            }
            <p className="text-[12px] font-semibold text-white">
              {blockedCenter.status === "suspended" ? "이용이 정지된 기관입니다" : "코드 유효기간이 만료되었습니다"}
            </p>
          </div>
          <div className="bg-white px-4 py-3 flex gap-2">
            <a href="tel:15226401" className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-[#f5f5f7] rounded-lg hover:bg-blue-50 transition-colors">
              <PhoneCall className="w-3.5 h-3.5 text-[#00A39B]" />
              <span className="text-[12px] font-semibold text-[#00A39B]">1522-6401</span>
            </a>
            <button
              onClick={() => setBlockedCenter(null)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-black/10 rounded-lg hover:bg-[#f5f5f7] transition-colors"
            >
              <span className="text-[12px] text-[#86868b]">닫기</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
