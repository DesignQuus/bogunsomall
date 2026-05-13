/**
 * Intro — 기관 입장 모달 (이중 입력 모드)
 *
 * 배경: 보건소 현장 사진 슬라이드 + 블러 오버레이
 * 중앙 모달:
 *   Tab A — 코드 직접 입력 (기관코드 or 보건소명 검색)
 *   Tab B — 지역별 선택 (시/도 버튼 → 보건소 리스트 커서 선택)
 * Step 2 : 부서 선택
 * Step 3 : 담당자 이름
 * Step 4 : 성공 → 대시보드
 */

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { X, KeyRound, List, Plus } from "lucide-react";
import { toast } from "sonner";
import { useCenters, type Center, type Department } from "@/contexts/CenterContext";
import { saveLoginInfo, getSavedLogins } from "@/lib/quickLoginStorage";
import { addAccessLog } from "@/lib/centerStorage";
import { trpc } from "@/lib/trpc";
import { useSession } from "@/contexts/SessionContext";

import { CodeInputTab } from "./intro";
import { RegionSelectTab } from "./intro";
import SignupTab from "./intro/SignupTab";
import { DeptSelectStep } from "./intro";
import { NameInputStep } from "./intro";
import { SuccessStep } from "./intro";
import {
  type Step, type InputTab, type RecentEntry, type BlockedCenter,
  REGION_ORDER, BG_STATS,
  loadRecent, addRecent, removeRecent,
  loginState,
} from "./intro";

// ─── 전역 세션 상태 (re-export) ──────────────────────────────────────────────
export { loginState } from "./intro";

// ─── 컴포넌트 ────────────────────────────────────────────────────────────────
export default function Intro() {
  const { centers, getCenterByCode, findCenterByCode, addDepartment, incrementUsage } = useCenters();
  const router = useRouter();
  const { setSession } = useSession();

  const [step, setStep] = useState<Step>("code");
  const [inputTab, setInputTab] = useState<InputTab>("code");

  // ── Tab A: 코드 입력 (드릴다운 방식으로 변경됨 - 상태는 CodeInputTab 내부에서 관리)
  const [query, setQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [codeError, setCodeError] = useState("");
  const [blockedCenter, setBlockedCenter] = useState<BlockedCenter | null>(null);

  // ── 공통 선택 상태 ────────────────────────────────────────────────────────
  const [selectedCenter, setSelectedCenter] = useState<Center | null>(null);
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);
  const [preselectedDeptId, setPreselectedDeptId] = useState<string | null>(null);

  // 이름
  const [userName, setUserName] = useState("");

  // 최근 방문
  const [recentList, setRecentList] = useState<RecentEntry[]>(loadRecent);

  // ── 코드 입력 탭 로그인 검증 상태 ────────────────────────────────────────
  const [codeLoginError, setCodeLoginError] = useState("");
  const [codeLoginLoading, setCodeLoginLoading] = useState(false);
  // 검증 대기 중인 입력값 임시 저장
  const pendingCodeLogin = useRef<{ centerCode: string; centerName: string; region: string; deptCode: string } | null>(null);

  const utils = trpc.useUtils();

  const handleCodeEnter = async (centerCode: string, centerName: string, region: string, deptCode: string) => {
    setCodeLoginError("");
    setCodeLoginLoading(true);
    try {
      const result = await utils.centers.verify.fetch({ centerCode });
      if (!result.registered) {
        setCodeLoginError("해당 보건소는 아직 등록되지 않았습니다.\n입장하려면 먼저 회원가입 신청을 해 주세요.");
        setCodeLoginLoading(false);
        return;
      }
      // 발급코드 검증: DB에 실제 등록된 발급코드인지 확인
      const codeVerify = await utils.requests.verifyIssuedCode.fetch({ centerCode, issuedCode: deptCode });
      if (!codeVerify.valid) {
        setCodeLoginError("등록되지 않은 간편 로그인 번호입니다.\n발급받은 4자리 번호를 다시 확인해 주세요.");
        setCodeLoginLoading(false);
        return;
      }
      // 등록된 보건소 + 유효한 발급코드: 로그인 허용
      const verifiedDeptName = codeVerify.dept?.deptName || deptCode;
      const verifiedManagerName = codeVerify.dept?.managerName || "";
      
      const foundCenter = centers.find(c => c.code === centerCode);
      const dbCenter = result.center;
      const centerObj: Center = {
        ...(foundCenter || {
          id: centerCode,
          code: centerCode,
          name: centerName,
          region: region,
          status: "active" as const,
          codeStatus: "active" as const,
          address: "",
          contactName: "",
          contactPhone: "",
          contactEmail: "",
          departments: [],
          usageCount: 0,
          createdAt: new Date().toISOString(),
          codeExpiresAt: "",
        }),
        ...(dbCenter?.address ? { address: dbCenter.address } : {}),
        ...(dbCenter?.phone ? { contactPhone: dbCenter.phone } : {}),
      };

      setSession({
        isLoggedIn: true,
        center: centerObj,
        department: { id: deptCode, name: verifiedDeptName, status: "active", createdAt: new Date().toISOString() },
        user: { name: verifiedManagerName }
      });
      addAccessLog({ centerCode, centerName, region, district: "" });
      saveLoginInfo({ centerCode, centerName, region, deptId: deptCode, deptName: verifiedDeptName, userName: verifiedManagerName });
      router.push("/dashboard");
    } catch (e) {
      setCodeLoginError("서버 연결에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setCodeLoginLoading(false);
    }
  };

  // ── 관리자 숨김 접근 (로고 "보" 3회 클릭) ────────────────────────────────
  const [logoClickCount, setLogoClickCount] = useState(0);
  const [logoClickTimer, setLogoClickTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminPw, setAdminPw] = useState("");
  const [adminPwError, setAdminPwError] = useState("");
  const [showAdminPw, setShowAdminPw] = useState(false);

  const handleLogoClick = () => {
    const newCount = logoClickCount + 1;
    setLogoClickCount(newCount);
    if (logoClickTimer) clearTimeout(logoClickTimer);
    if (newCount >= 3) {
      setLogoClickCount(0);
      setAdminPw("");
      setAdminPwError("");
      setShowAdminPw(false);
      setShowAdminModal(true);
      return;
    }
    const t = setTimeout(() => setLogoClickCount(0), 1500);
    setLogoClickTimer(t);
  };

  const verifyAdminPasswordMutation = trpc.admin.verifyPassword.useMutation({
    onSuccess: () => {
      sessionStorage.setItem("admin_auth", "true");
      setShowAdminModal(false);
      router.push("/admin");
    },
    onError: () => {
      setAdminPwError("비밀번호가 올바르지 않습니다.");
    },
  });

  const handleAdminLogin = () => {
    verifyAdminPasswordMutation.mutate({ password: adminPw });
  };

  // ── 자동완성 필터 (Tab A) ─────────────────────────────────────────────────
  // DEV-000 기관은 일반 입력창에서 노출/검색 차단 (DEV 섹션 버튼으로만 접근 가능)
  const suggestions = centers.filter(c => {
    if (c.status !== "active") return false;
    if (!query) return false;
    const q = query.toLowerCase();
    const codeWithoutHyphen = c.code.toLowerCase().replace(/-/g, "");
    const queryWithoutHyphen = q.replace(/-/g, "");
    // 영문 입력 시: 코드 앞자리 일치 (startsWith)
    // 한글 입력 시: 보건소명 포함 검색 (includes)
    const isEnglish = /^[a-zA-Z0-9\-]+$/.test(query);
    if (isEnglish) {
      return codeWithoutHyphen.startsWith(queryWithoutHyphen);
    }
    return c.name.includes(query);
  }).slice(0, 12);

  // ── 지역별 기관 목록 (Tab B) ──────────────────────────────────────────────
  const regionCenters = centers.filter(c => c.status === "active");
  const availableRegions = REGION_ORDER.filter(r => centers.some(c => c.region === r && c.status === "active"));

  // ── 기관 선택 공통 처리 ──────────────────────────────────────────────────
  const selectCenter = useCallback((center: Center, prefillDeptId?: string) => {
    setSelectedCenter(center);
    setQuery(center.name);
    setShowDropdown(false);
    setCodeError("");
    setPreselectedDeptId(prefillDeptId ?? null);
    setSelectedDept(null);
    setTimeout(() => setStep("dept"), 120);
  }, []);

  // ── Tab A: Enter / 입장 버튼 ──────────────────────────────────────────────
  const handleSubmit = () => {
    const q = query.trim();
    if (!q) return;
    setBlockedCenter(null);
    // TEST 단축 코드: TEST 입력 시 테스트 보건소로 바로 입장
    if (q.toUpperCase() === "TEST") {
      const testCenter = centers.find(c => c.code.toUpperCase() === "TEST001");
      if (testCenter) { selectCenter(testCenter); return; }
    }
    if (/^[A-Z]{2,3}\d{3}$/i.test(q)) {

      const found = findCenterByCode(q.toUpperCase());
      if (found) {
        if (found.status === "suspended" || found.codeStatus === "suspended") {
          setBlockedCenter({ name: found.name, code: found.code, status: "suspended" }); return;
        }
        if (found.codeStatus === "expired") {
          setBlockedCenter({ name: found.name, code: found.code, status: "expired" }); return;
        }
        selectCenter(found); return;
      }
      setCodeError("등록된 기관 코드가 아닙니다. 관리자에게 문의해 주세요."); return;
    }
    // 정확한 이름 매칭 또는 코드 매칭 (대소문자 무시)
    const exactAny = centers.find(c => c.name === q || c.code.toUpperCase() === q.toUpperCase());
    if (exactAny) {
      if (exactAny.status === "suspended" || exactAny.codeStatus === "suspended") {
        setBlockedCenter({ name: exactAny.name, code: exactAny.code, status: "suspended" }); return;
      }
      if (exactAny.codeStatus === "expired") {
        setBlockedCenter({ name: exactAny.name, code: exactAny.code, status: "expired" }); return;
      }
      selectCenter(exactAny); return;
    }
    if (suggestions.length === 1) { selectCenter(suggestions[0]); return; }
    if (suggestions.length === 0) {
      setCodeError("검색 결과가 없습니다. 기관 코드 또는 보건소명을 다시 확인해 주세요.");
    } else {
      setShowDropdown(true);
    }
  };

  // ── 기관 코드 대소문자 무시 검색 ─────────────────────────────────────────
  const findCenterByCodeCaseInsensitive = (code: string) => {
    return centers.find(c => c.code.toUpperCase() === code.toUpperCase());
  };

  // ── Tab B: 지역 선택 후 기관 클릭 ────────────────────────────────────────
  const handleRegionCenterClick = (center: Center) => {
    if (center.status === "suspended" || center.codeStatus === "suspended") {
      setBlockedCenter({ name: center.name, code: center.code, status: "suspended" }); return;
    }
    if (center.codeStatus === "expired") {
      setBlockedCenter({ name: center.name, code: center.code, status: "expired" }); return;
    }
    selectCenter(center);
  };

  // ── 최근 방문 ─────────────────────────────────────────────────────────────
  const handleQuickLogin = (login: import("@/lib/quickLoginStorage").SavedLoginInfo) => {
    const center = getCenterByCode(login.centerCode);
    if (!center) { toast.error("기관 정보를 찾을 수 없습니다."); return; }
    if (center.status === "suspended" || center.codeStatus === "suspended") {
      setBlockedCenter({ name: center.name, code: center.code, status: "suspended" }); return;
    }
    if (center.codeStatus === "expired") {
      setBlockedCenter({ name: center.name, code: center.code, status: "expired" }); return;
    }
    selectCenter(center, login.deptId);
  };

  const handleRecentClick = (entry: RecentEntry) => {
    const center = getCenterByCode(entry.code);
    if (!center) { toast.error("기관 정보를 찾을 수 없습니다."); return; }
    if (center.status === "suspended" || center.codeStatus === "suspended") {
      setBlockedCenter({ name: center.name, code: center.code, status: "suspended" }); return;
    }
    if (center.codeStatus === "expired") {
      setBlockedCenter({ name: center.name, code: center.code, status: "expired" }); return;
    }
    selectCenter(center, entry.lastDeptId);
  };

  const handleRecentRemove = (e: React.MouseEvent, code: string) => {
    e.stopPropagation();
    removeRecent(code);
    setRecentList(loadRecent());
  };

  // ── 부서 / 이름 핸들러 ────────────────────────────────────────────────────
  const handleSelectDept = (dept: Department) => {
    if (dept.status === "pending") { toast.warning("해당 부서는 관리자 승인 대기 중입니다."); return; }
    setSelectedDept(dept);
    setStep("name");
  };

  const handleAddDept = (name: string) => {
    if (!selectedCenter) return;
    const newDept = addDepartment(selectedCenter.id, name, false);
    setSelectedDept(newDept);
    setStep("name");
    toast.success(`"${newDept.name}" 부서로 진행합니다.`);
  };

  const handleEnter = async () => {
    if (!userName.trim()) { toast.error("담당자 이름을 입력해 주세요."); return; }
    if (!selectedCenter || !selectedDept) return;
    const centerObj = selectedCenter;
    setSession({
      isLoggedIn: true,
      center: centerObj,
      department: selectedDept,
      user: { name: userName }
    });
    incrementUsage(selectedCenter.id);
    addRecent({
      code: selectedCenter.code,
      name: selectedCenter.name,
      region: selectedCenter.region,
      lastDeptId: selectedDept.id,
      lastDeptName: selectedDept.name,
      lastVisit: new Date().toISOString(),
    });
    // localStorage에 빠른 로그인 정보 저장
    saveLoginInfo({
      centerCode: selectedCenter.code,
      centerName: selectedCenter.name,
      region: selectedCenter.region,
      deptId: selectedDept.id,
      deptName: selectedDept.name,
      userName: userName,
    });
    setRecentList(loadRecent());
    router.push("/dashboard");
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      {/* ── 배경: 보건소 현장 사진 슬라이드 + 블러 오버레이 ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <style>{`
          @keyframes bgFade {
            0%,28%   { opacity: 1; }
            33%,61%  { opacity: 0; }
            66%,94%  { opacity: 0; }
            100%     { opacity: 1; }
          }
          @keyframes bgFade2 {
            0%,5%    { opacity: 0; }
            33%,61%  { opacity: 1; }
            66%,94%  { opacity: 0; }
            100%     { opacity: 0; }
          }
          @keyframes bgFade3 {
            0%,38%   { opacity: 0; }
            66%,94%  { opacity: 1; }
            100%     { opacity: 0; }
          }
        `}</style>
        <img
          src="https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/bg-health-center-1_3911b883.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ animation: "bgFade 18s ease-in-out infinite", filter: "blur(3px) brightness(0.55) saturate(0.8)", transform: "scale(1.05)" }}
        />
        <img
          src="https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/bg-health-center-2_5ae07247.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ animation: "bgFade2 18s ease-in-out infinite", filter: "blur(3px) brightness(0.5) saturate(0.8)", transform: "scale(1.05)" }}
        />
        <img
          src="https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/bg-health-center-3_05993ff3.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ animation: "bgFade3 18s ease-in-out infinite", filter: "blur(3px) brightness(0.5) saturate(0.8)", transform: "scale(1.05)" }}
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(160deg, rgba(0,40,100,0.55) 0%, rgba(0,80,180,0.35) 50%, rgba(0,20,60,0.6) 100%)" }}
        />
        <div className="absolute bottom-0 left-0 right-0 h-40" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.3), transparent)" }} />
      </div>

      {/* ── 헤더 ── */}
      <header className="relative z-10 w-full py-3 px-4 sm:py-4 sm:px-6 flex items-center justify-between gap-2 min-h-[52px]">
        {/* 로고 — "보" 3회 클릭 시 관리자 모달 표시 */}
        <div className="flex items-center shrink-0 min-w-0">
          <img
            src="https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/bogunsoplus-logo-600_617d837b.png"
            alt="보건소플러스"
            className="h-7 sm:h-8 w-auto object-contain brightness-0 invert cursor-pointer select-none"
            onClick={handleLogoClick}
            draggable={false}
          />
        </div>

      </header>

      {/* ── 관리자 비밀번호 모달 ── */}
      {showAdminModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-[340px] p-7 flex flex-col gap-5">
            <div className="flex flex-col gap-1">
              <p className="text-[18px] font-bold text-[#1d1d1f]">관리자 인증</p>
              <p className="text-[13px] text-[#86868b]">관리자 비밀번호를 입력하세요.</p>
            </div>
            <div className="flex flex-col gap-2">
              <div className={`flex items-center gap-2 rounded-xl px-3.5 py-3 border transition-all ${
                adminPwError ? "border-red-400 bg-red-50/30" : "border-[#d2d2d7] focus-within:border-[#00b398]"
              }`}>
                <svg className="w-4 h-4 text-[#86868b] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <input
                  type={showAdminPw ? "text" : "password"}
                  value={adminPw}
                  onChange={e => { setAdminPw(e.target.value); setAdminPwError(""); }}
                  onKeyDown={e => e.key === "Enter" && handleAdminLogin()}
                  placeholder="비밀번호 입력"
                  autoFocus
                  className="flex-1 bg-transparent text-[15px] text-[#1d1d1f] placeholder:text-[#c7c7cc] outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowAdminPw(v => !v)}
                  className="text-[#86868b] hover:text-[#1d1d1f] transition-colors p-0.5"
                >
                  {showAdminPw ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  )}
                </button>
              </div>
              {adminPwError && (
                <p className="text-[12px] text-red-500 pl-1 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  {adminPwError}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { setShowAdminModal(false); setAdminPw(""); setAdminPwError(""); }}
                className="flex-1 py-3 rounded-xl text-[14px] font-medium text-[#86868b] bg-[#f5f5f7] hover:bg-[#e5e5ea] transition-colors"
              >취소</button>
              <button
                onClick={handleAdminLogin}
                className="flex-1 py-3 rounded-xl text-[14px] font-semibold text-white transition-opacity active:opacity-80"
                style={{ background: "#00b398" }}
              >확인</button>
            </div>
          </div>
        </div>
      )}

      {/* ── 메인: 배경 + 모달 ── */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-8">

        {/* 브랜드 타이틀 (모달 위) - 간소화 */}
        <div className="text-center mb-5">
          {/* 모바일: 3줄 22px / PC(md 이상): 1줄 36px */}
          <p className="md:hidden font-medium text-white/80 leading-snug text-[22px]" style={{ textShadow: "0 1px 8px rgba(0,0,0,0.3)", fontSize: '25px' }}>
            디자인 지원부터 발주,<br />
            이력 관리까지<br />
            <span className="text-[#7EC8FF] font-semibold">보건소 전용 플랫폼</span>
          </p>
          <p className="hidden md:block font-medium text-white/80 leading-snug text-[36px]" style={{ textShadow: "0 1px 8px rgba(0,0,0,0.3)" }}>
            디자인 지원부터 발주, 이력 관리까지 — <span className="text-[#7EC8FF] font-semibold">보건소 전용 플랫폼</span>
          </p>
        </div>

        {/* ══════════════════════════════════════════════
            모달 카드
        ══════════════════════════════════════════════ */}
        <div
          className="w-full max-w-[600px] bg-white/92 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 flex flex-col"
          style={{ boxShadow: "0 24px 64px rgba(0,0,0,0.18), 0 0 0 1px rgba(255,255,255,0.6)" }}
        >
          {/* 진행 표시: 부서/이름 단계에서만 헤더 표시 */}
          {step !== "success" && step !== "code" && (
            <div className="flex items-center justify-between px-5 py-4 border-b border-black/5 flex-shrink-0">
              <h2 className="text-[17px] font-semibold text-[#1d1d1f]">
                {step === "dept" ? "부서 선택" : step === "name" ? "담당자 확인" : ""}
              </h2>
            </div>
          )}

          {/* 탭 네비게이션 (Step 1에서만 표시) */}
          {step === "code" && (
            <div className="flex gap-1 p-3 bg-[#f5f5f7] border-b border-black/5 flex-shrink-0 rounded-t-3xl">
              <button
                onClick={() => { setInputTab("code"); setBlockedCenter(null); setCodeError(""); }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[13px] font-semibold transition-all ${
                  inputTab === "code"
                    ? "bg-white text-[#00A39B] shadow-sm"
                    : "text-[#86868b] hover:text-[#424245]"
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                간편 로그인
              </button>
              <button
                onClick={() => { setInputTab("region"); setBlockedCenter(null); setCodeError(""); }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[13px] font-semibold transition-all ${
                  inputTab === "region"
                    ? "bg-white text-[#00A39B] shadow-sm"
                    : "text-[#86868b] hover:text-[#424245]"
                }`}
              >
                <List className="w-3.5 h-3.5" />
                회원가입
              </button>
            </div>
          )}

          {/* 모달 본문 */}
          <div className={`overflow-visible flex-1 ${step === "code" && inputTab === "region" ? "" : "p-5"}`}>

            {/* ════════════════════════════════
                STEP 1 — 기관 선택 (탭 UI)
            ════════════════════════════════ */}
            {step === "code" && (
              <div>

                {/* Tab A: 코드 입력 (드릴다운 보건소 선택 + 숫자 4자리) */}
                {inputTab === "code" && (
                  <div>
                    <CodeInputTab
                      isActive={inputTab === "code"}
                      onEnter={handleCodeEnter}
                      isLoading={codeLoginLoading}
                    />
                    {/* 미등록 보건소 오류 메시지 */}
                    {codeLoginError && (
                      <div className="mt-3 p-3 bg-red-50 rounded-xl border border-red-100 flex items-start gap-2">
                        <svg className="w-4 h-4 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          {codeLoginError.split("\n").map((line, i) => (
                            <p key={i} className="text-[12px] text-red-600 leading-relaxed">{line}</p>
                          ))}
                          <button
                            onClick={() => { setInputTab("region"); setCodeLoginError(""); }}
                            className="mt-1 text-[12px] text-[#00A39B] font-semibold hover:underline"
                          >
                            회원가입 신청하기 →
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Tab B: 회원가입 */}
                {inputTab === "region" && (
                  <SignupTab isActive={inputTab === "region"} />
                )}
              </div>
            )}

            {/* ════════════════════════════════
                STEP 2 — 부서 선택
            ════════════════════════════════ */}
            {step === "dept" && selectedCenter && (
              <DeptSelectStep
                center={selectedCenter}
                preselectedDeptId={preselectedDeptId}
                onSelectDept={handleSelectDept}
                onAddDept={handleAddDept}
                onBack={() => { setStep("code"); setSelectedCenter(null); setSelectedDept(null); setPreselectedDeptId(null); }}
              />
            )}

            {/* ════════════════════════════════
                STEP 3 — 담당자 이름
            ════════════════════════════════ */}
            {step === "name" && selectedCenter && selectedDept && (
              <NameInputStep
                center={selectedCenter}
                dept={selectedDept}
                userName={userName}
                setUserName={setUserName}
                onEnter={handleEnter}
                onBack={() => setStep("dept")}
              />
            )}

            {/* ════════════════════════════════
                STEP 4 — 성공
            ════════════════════════════════ */}
            {step === "success" && (
              <SuccessStep
                center={selectedCenter}
                dept={selectedDept}
                userName={userName}
              />
            )}

          </div>
        </div>



        {/* 통계 배지 (모달 아래) */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
          {BG_STATS.map(({ icon: Icon, imageUrl, value, label }) => (
            <div key={label} className="flex items-center gap-2 bg-white/15 backdrop-blur-md rounded-full px-4 py-2 border border-white/25">
              {imageUrl
                ? <img src={imageUrl} alt={label} className="w-5 h-5 object-contain" />
                : Icon && <Icon className="w-3.5 h-3.5 text-[#7EC8FF]" />
              }
              <span className="text-[13px] font-bold text-white">{value}</span>
              <span className="text-[12px] text-white/70">{label}</span>
            </div>
          ))}
        </div>

      </div>

      {/* ── 푸터 ── */}
      <footer className="relative z-10 py-4 text-center border-t border-white/10 bg-black/20 backdrop-blur-sm">
        <p className="text-[11px] text-white/60">© 2026 보건소플러스 · 고객센터 1522-6401 · 평일 09:00~18:00</p>
        <p className="text-[10px] text-white/40 mt-0.5">본 서비스는 보건소 및 공공기관 전용입니다</p>
      </footer>
    </div>
  );
}
