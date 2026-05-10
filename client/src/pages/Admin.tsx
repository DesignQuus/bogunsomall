/**
 * Admin — 보건소플러스 관리자 페이지
 * 탭 구성:
 *   1) 등록 보건소 — 시·도 → 시·군·구 → 보건소 드릴다운 선택 후 등록
 *   2) 가입 신청  — 신청 내역 + 담당자 코드 자동 생성/수정/발급 + 이메일 안내
 *   3) 발급 이력  — 발급된 담당자 코드 전체 목록 + 검색/필터 + CSV 내보내기
 *   4) 설정       — 관리자 비밀번호 변경 + 코드 생성 규칙 안내
 */

import { useState, useEffect, useMemo, useCallback, lazy, Suspense } from "react";
const AdminNamecardDesigns = lazy(() => import("../admin/pages/AdminNamecardDesigns"));
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { toast } from "sonner";
import {
  Building2, Plus, Trash2, Search, Shield, LogOut,
  CheckCircle2, XCircle, Clock, ChevronRight, Hash, FileText,
  Mail, Settings, Key, Eye, EyeOff, AlertCircle, ExternalLink,
  Pencil, RefreshCw, Sparkles, Download, History, ChevronDown, X, Users, AlertTriangle
} from "lucide-react";
import { HEALTH_CENTERS } from "@/data/healthCenters";

// ── 타입 ─────────────────────────────────────────────────────────────────────
// DB 타입 (서버에서 반환되는 형태)
interface DBCenter {
  id: number;
  centerCode: string;
  centerName: string;
  bizNo?: string | null;
  address?: string | null;
  phone?: string | null;
  region?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface DBRequest {
  id: number;
  centerCode: string;
  centerName: string;
  deptName: string;
  managerName: string;
  deptCode?: string | null;
  phone?: string | null;
  email?: string | null;
  bizNo?: string | null;
  status: "pending" | "approved" | "rejected";
  issuedCode?: string | null;
  rejectReason?: string | null;
  requestedAt: Date;
  processedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// UI 전용 타입 (approving 상태 포함)
interface RegisteredCenter {
  id: string;
  centerName: string;
  centerCode: string;
  bizNumber: string;
  region: string;
  registeredAt: string;
  address?: string;
  phone?: string;
  representative?: string;
}

interface SignupRequest {
  id: string;
  centerName: string;
  centerCode: string;
  bizNumber: string;
  deptName: string;
  deptCode: string;
  issuedCode?: string;
  managerName: string;
  phone: string;
  email: string;
  status: "pending" | "approving" | "approved" | "rejected";
  submittedAt: string;
  approvedAt?: string;
}

// DB → UI 타입 변환 함수
function dbCenterToUI(c: DBCenter): RegisteredCenter {
  return {
    id: String(c.id),
    centerName: c.centerName,
    centerCode: c.centerCode,
    bizNumber: c.bizNo || "",
    region: c.region || "",
    registeredAt: c.createdAt instanceof Date ? c.createdAt.toISOString().slice(0, 10) : String(c.createdAt).slice(0, 10),
    address: c.address || undefined,
    phone: c.phone || undefined,
  };
}

function dbRequestToUI(r: DBRequest): SignupRequest {
  return {
    id: String(r.id),
    centerName: r.centerName,
    centerCode: r.centerCode,
    bizNumber: r.bizNo || "",
    deptName: r.deptName,
    deptCode: r.deptCode || "",
    issuedCode: r.issuedCode || undefined,
    managerName: r.managerName,
    phone: r.phone || "",
    email: r.email || "",
    status: r.status as "pending" | "approved" | "rejected",
    submittedAt: r.requestedAt instanceof Date ? r.requestedAt.toISOString().slice(0, 10) : String(r.requestedAt).slice(0, 10),
    approvedAt: r.processedAt ? (r.processedAt instanceof Date ? r.processedAt.toISOString().slice(0, 10) : String(r.processedAt).slice(0, 10)) : undefined,
  };
}

// ── 로컬스토리지 키 (인증 세션만 유지) ──────────────────────────────────────────────────────────
const ADMIN_AUTH_KEY = "admin_auth";

// 2026-04-24부터 실제 입력 데이터만 사용 (가상 샘플 데이터 없음)

// ── 부서명 이니셜 매핑 ────────────────────────────────────────────────────────
const DEPT_INITIALS: Record<string, string> = {
  "건강증진": "HJ", "건강": "HJ",
  "감염병": "GM", "감염": "GM",
  "금연": "GY", "구강": "GG",
  "모자": "MJ", "영양": "YY",
  "정신": "JS", "재활": "JH",
  "치매": "CM", "결핵": "GT",
  "방문": "BM", "의약": "UY",
  "위생": "WS", "만성": "MC",
};

function getDeptInitial(deptName: string): string {
  for (const [keyword, initial] of Object.entries(DEPT_INITIALS)) {
    if (deptName.includes(keyword)) return initial;
  }
  const cleaned = deptName.replace(/과$|팀$|부$/, "");
  return cleaned.slice(0, 2).toUpperCase().replace(/[^A-Z]/g, "X").padEnd(2, "X");
}

function getNextSeq(prefix: string, existingCodes: string[]): string {
  // 2자리(기존) 또는 3자리(신규) 순번 모두 인식
  const pattern = new RegExp(`^${prefix}(\\d{2,3})$`);
  const nums = existingCodes
    .map(c => { const m = c.match(pattern); return m ? parseInt(m[1]) : 0; })
    .filter(n => n > 0);
  const next = nums.length > 0 ? Math.max(...nums) + 1 : 1;
  // 100 이상이면 3자리, 미만이면 3자리로 통일 (기존 2자리 코드와 구분)
  return String(next).padStart(3, "0");
}

function generateCode(req: SignupRequest, allRequests: SignupRequest[]): string {
  const centerPrefix = req.centerCode.slice(0, 2).toUpperCase();
  const deptInitial = getDeptInitial(req.deptName);
  const prefix = `${centerPrefix}${deptInitial}`;
  const existingCodes = allRequests.filter(r => r.issuedCode).map(r => r.issuedCode!);
  return `${prefix}${getNextSeq(prefix, existingCodes)}`;
}

// ── CSV 유틸 ─────────────────────────────────────────────────────────────────
function escapeCsv(val: string): string {
  if (val.includes(",") || val.includes('"') || val.includes("\n")) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}

function downloadCsv(rows: string[][], filename: string) {
  const bom = "\uFEFF";
  const csv = bom + rows.map(r => r.map(escapeCsv).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ── 유틸 ─────────────────────────────────────────────────────────────────────
const formatBizNumber = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
};

// ── 드릴다운 유틸 ─────────────────────────────────────────────────────────────
const SIDO_LIST = Array.from(new Set(HEALTH_CENTERS.filter(c => c.region !== "테스트").map(c => c.region))).sort();

function getDistrictList(sido: string): string[] {
  return Array.from(new Set(HEALTH_CENTERS.filter(c => c.region === sido).map(c => c.district))).sort();
}

function getCentersByDistrict(sido: string, district: string) {
  return HEALTH_CENTERS.filter(c => c.region === sido && c.district === district);
}

// ── 드릴다운 보건소 선택 컴포넌트 ────────────────────────────────────────────
interface DrilldownPickerProps {
  onSelect: (center: { name: string; code: string; region: string }) => void;
  onCancel: () => void;
}

function DrilldownPicker({ onSelect, onCancel }: DrilldownPickerProps) {
  const [step, setStep] = useState<"sido" | "district" | "center">("sido");
  const [selectedSido, setSelectedSido] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [sidoSearch, setSidoSearch] = useState("");
  const [districtSearch, setDistrictSearch] = useState("");
  const [centerSearch, setCenterSearch] = useState("");

  const filteredSido = SIDO_LIST.filter(s => s.includes(sidoSearch));
  const districtList = selectedSido ? getDistrictList(selectedSido) : [];
  const filteredDistrict = districtList.filter(d => d.includes(districtSearch));
  const centerList = selectedSido && selectedDistrict ? getCentersByDistrict(selectedSido, selectedDistrict) : [];
  const filteredCenters = centerList.filter(c => c.name.includes(centerSearch));

  return (
    <div className="flex flex-col gap-3">
      {/* 단계 표시 */}
      <div className="flex items-center gap-1.5 text-[12px]">
        <span className={`px-2.5 py-1 rounded-full font-medium ${step === "sido" ? "text-white" : "text-[#86868b] bg-[#f5f5f7]"}`}
          style={step === "sido" ? { background: "#00b398" } : {}}>
          1 시·도
        </span>
        <ChevronRight className="w-3 h-3 text-[#c7c7cc]" />
        <span className={`px-2.5 py-1 rounded-full font-medium ${step === "district" ? "text-white" : "text-[#86868b] bg-[#f5f5f7]"}`}
          style={step === "district" ? { background: "#00b398" } : {}}>
          2 시·군·구
        </span>
        <ChevronRight className="w-3 h-3 text-[#c7c7cc]" />
        <span className={`px-2.5 py-1 rounded-full font-medium ${step === "center" ? "text-white" : "text-[#86868b] bg-[#f5f5f7]"}`}
          style={step === "center" ? { background: "#00b398" } : {}}>
          3 보건소
        </span>
      </div>

      {/* 선택 경로 표시 */}
      {(selectedSido || selectedDistrict) && (
        <div className="flex items-center gap-1.5 text-[12px] text-[#86868b]">
          {selectedSido && (
            <button onClick={() => { setStep("sido"); setSelectedSido(""); setSelectedDistrict(""); }}
              className="hover:text-[#00b398] underline underline-offset-2">{selectedSido}</button>
          )}
          {selectedDistrict && (
            <><ChevronRight className="w-3 h-3" />
              <button onClick={() => { setStep("district"); setSelectedDistrict(""); }}
                className="hover:text-[#00b398] underline underline-offset-2">{selectedDistrict}</button>
            </>
          )}
        </div>
      )}

      {/* 시·도 선택 */}
      {step === "sido" && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 rounded-xl px-3 py-2.5 ring-1 ring-[#e5e5ea] focus-within:ring-[#00b398]" style={{ background: "rgba(0,0,0,0.03)" }}>
            <Search className="w-3.5 h-3.5 text-[#86868b]" />
            <input autoFocus value={sidoSearch} onChange={e => setSidoSearch(e.target.value)}
              placeholder="시·도 검색" className="flex-1 bg-transparent text-[13px] text-[#1d1d1f] placeholder:text-[#c7c7cc] outline-none" />
          </div>
          <div className="grid grid-cols-3 gap-1.5 max-h-48 overflow-y-auto">
            {filteredSido.map(sido => (
              <button key={sido} onClick={() => { setSelectedSido(sido); setStep("district"); setSidoSearch(""); }}
                className="px-3 py-2 rounded-xl text-[13px] font-medium text-left hover:text-white transition-colors"
                style={{ background: "rgba(0,0,0,0.03)" }}
                onMouseEnter={e => (e.currentTarget.style.background = "#00b398")}
                onMouseLeave={e => (e.currentTarget.style.background = "rgba(0,0,0,0.03)")}>
                {sido}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 시·군·구 선택 */}
      {step === "district" && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 rounded-xl px-3 py-2.5 ring-1 ring-[#e5e5ea] focus-within:ring-[#00b398]" style={{ background: "rgba(0,0,0,0.03)" }}>
            <Search className="w-3.5 h-3.5 text-[#86868b]" />
            <input autoFocus value={districtSearch} onChange={e => setDistrictSearch(e.target.value)}
              placeholder="시·군·구 검색" className="flex-1 bg-transparent text-[13px] text-[#1d1d1f] placeholder:text-[#c7c7cc] outline-none" />
          </div>
          <div className="grid grid-cols-3 gap-1.5 max-h-48 overflow-y-auto">
            {filteredDistrict.map(district => (
              <button key={district} onClick={() => { setSelectedDistrict(district); setStep("center"); setDistrictSearch(""); }}
                className="px-3 py-2 rounded-xl text-[13px] font-medium text-left hover:text-white transition-colors"
                style={{ background: "rgba(0,0,0,0.03)" }}
                onMouseEnter={e => (e.currentTarget.style.background = "#00b398")}
                onMouseLeave={e => (e.currentTarget.style.background = "rgba(0,0,0,0.03)")}>
                {district}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 보건소 선택 */}
      {step === "center" && (
        <div className="flex flex-col gap-2">
          {filteredCenters.length > 1 && (
            <div className="flex items-center gap-2 rounded-xl px-3 py-2.5 ring-1 ring-[#e5e5ea] focus-within:ring-[#00b398]" style={{ background: "rgba(0,0,0,0.03)" }}>
              <Search className="w-3.5 h-3.5 text-[#86868b]" />
              <input autoFocus value={centerSearch} onChange={e => setCenterSearch(e.target.value)}
                placeholder="보건소명 검색" className="flex-1 bg-transparent text-[13px] text-[#1d1d1f] placeholder:text-[#c7c7cc] outline-none" />
            </div>
          )}
          <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto">
            {filteredCenters.map(center => (
              <button key={center.code} onClick={() => onSelect({ name: center.name, code: center.code, region: center.region })}
                className="flex items-center justify-between px-3.5 py-3 rounded-xl text-left hover:text-white transition-colors group"
                style={{ background: "rgba(0,0,0,0.03)" }}
                onMouseEnter={e => (e.currentTarget.style.background = "#00b398")}
                onMouseLeave={e => (e.currentTarget.style.background = "rgba(0,0,0,0.03)")}>
                <span className="text-[13px] font-medium">{center.name}</span>
                <span className="text-[11px] font-mono opacity-60">{center.code}</span>
              </button>
            ))}
            {filteredCenters.length === 0 && (
              <p className="text-[13px] text-[#86868b] text-center py-4">검색 결과가 없습니다.</p>
            )}
          </div>
        </div>
      )}

      <button onClick={onCancel} className="text-[12px] text-[#86868b] hover:text-[#1d1d1f] text-center mt-1">취소</button>
    </div>
  );
}

// ── 메인 컴포넌트 ─────────────────────────────────────────────────────────────
export default function Admin() {
  const [, setLocation] = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // 페이지 로드 시 sessionStorage에서 인증 상태 복원
    return sessionStorage.getItem(ADMIN_AUTH_KEY) === "true";
  });
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [authError, setAuthError] = useState("");

  // ── tRPC 쿼리 ─────────────────────────────────────────────────────────────
  const utils = trpc.useUtils();
  const centersQuery = trpc.centers.list.useQuery(undefined, { enabled: isAuthenticated });
  const requestsQuery = trpc.requests.list.useQuery(undefined, { enabled: isAuthenticated });

  // DB 데이터를 UI 타입으로 변환
  const dbCenters = (centersQuery.data || []) as DBCenter[];
  const dbRequests = (requestsQuery.data || []) as DBRequest[];

  // UI 상태 (approving 오버레이용 - DB에는 pending으로 저장)
  const [approvingIds, setApprovingIds] = useState<Set<string>>(new Set());

  // UI 타입으로 변환된 데이터
  const centers: RegisteredCenter[] = dbCenters.map(dbCenterToUI);
  const requests: SignupRequest[] = dbRequests.map(r => {
    const ui = dbRequestToUI(r);
    // approving 상태 오버레이
    if (approvingIds.has(ui.id) && ui.status === "pending") {
      return { ...ui, status: "approving" as const };
    }
    return ui;
  });

  // tRPC mutations
  const createCenterMutation = trpc.centers.create.useMutation({
    onSuccess: () => { utils.centers.list.invalidate(); },
    onError: (e) => toast.error("보건소 등록 실패: " + e.message),
  });
  const updateCenterMutation = trpc.centers.update.useMutation({
    onSuccess: () => { utils.centers.list.invalidate(); },
    onError: (e) => toast.error("보건소 수정 실패: " + e.message),
  });
  const deleteCenterMutation = trpc.centers.delete.useMutation({
    onSuccess: () => { utils.centers.list.invalidate(); },
    onError: (e) => toast.error("보건소 삭제 실패: " + e.message),
  });
  const updateRequestMutation = trpc.requests.update.useMutation({
    onSuccess: () => { utils.requests.list.invalidate(); },
    onError: (e) => toast.error("신청 처리 실패: " + e.message),
  });
  const deleteRequestMutation = trpc.requests.delete.useMutation({
    onSuccess: () => { utils.requests.list.invalidate(); },
    onError: (e) => toast.error("신청 삭제 실패: " + e.message),
  });
  const verifyPasswordMutation = trpc.admin.verifyPassword.useMutation({
    onSuccess: () => {
      sessionStorage.setItem(ADMIN_AUTH_KEY, "true");
      setIsAuthenticated(true);
      setAuthError("");
    },
    onError: (e) => setAuthError(e.message || "비밀번호가 올바르지 않습니다."),
  });
  const changePasswordMutation = trpc.admin.changePassword.useMutation({
    onSuccess: () => {
      setPwForm({ current: "", next: "", confirm: "" });
      setPwErrors({});
      setPwSuccess(true);
      setTimeout(() => setPwSuccess(false), 3000);
      toast.success("비밀번호가 성공적으로 변경되었습니다.", {
        description: "다음 로그인부터 새 비밀번호를 사용하세요.",
        duration: 4000,
      });
    },
    onError: (e) => setPwErrors({ current: e.message || "현재 비밀번호가 올바르지 않습니다." }),
  });

  const [activeTab, setActiveTab] = useState<"master" | "requests" | "history" | "settings" | "namecard-designs" | "business-info">("master");
  const [searchQuery, setSearchQuery] = useState("");

  // 보건소 등록 폼 상태
  const [showAddForm, setShowAddForm] = useState(false);
  const [addMode, setAddMode] = useState<"drilldown" | "manual">("drilldown");
  const [newCenter, setNewCenter] = useState({ centerName: "", centerCode: "", bizNumber: "", region: "" });
  const [addErrors, setAddErrors] = useState<Record<string, string>>({});
  const [selectedFromDrilldown, setSelectedFromDrilldown] = useState(false);

  // 비밀번호 변경 상태
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [showPwForm, setShowPwForm] = useState<Record<string, boolean>>({});
  const [pwErrors, setPwErrors] = useState<Record<string, string>>({});
  const [pwSuccess, setPwSuccess] = useState(false);

  // 코드 발급 상태
  const [editingCode, setEditingCode] = useState<Record<string, string>>({});
  const [codeError, setCodeError] = useState<Record<string, string>>({});
  const [emailPreviewId, setEmailPreviewId] = useState<string | null>(null);

  // 이력 탭 상태
  const [historySearch, setHistorySearch] = useState("");
  const [historyRegionFilter, setHistoryRegionFilter] = useState("all");
  const [historySortAsc, setHistorySortAsc] = useState(false);
  const [requestStatusFilter, setRequestStatusFilter] = useState<"all" | "pending" | "approving" | "approved" | "rejected">("all");
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [activeSheetCenter, setActiveSheetCenter] = useState<string>("__all__");
  // 가입신청 탭 추가 필터
  const [reqSearchQuery, setReqSearchQuery] = useState(""); // 가입신청 탭 전용 검색 (공통 searchQuery와 독립)
  const [reqDeptSearch, setReqDeptSearch] = useState("");
  const [reqPage, setReqPage] = useState(1);
  const REQ_PAGE_SIZE = 20;

  // 가입신청 인라인 편집 상태
  const [reqEditId, setReqEditId] = useState<string | null>(null);
  const [reqEditDupError, setReqEditDupError] = useState<string>("");
  const [reqEditCodeWarn, setReqEditCodeWarn] = useState<string>("");
  const [reqEditRow, setReqEditRow] = useState<{
    centerName: string;
    deptName: string;
    managerName: string;
    phone: string;
    email: string;
    bizNo: string;
    issuedCode: string;
    status: "pending" | "approved" | "rejected";
  } | null>(null);

  // 데이터 초기화 확인 상태
  const [clearConfirm, setClearConfirm] = useState<"requests" | "centers" | "all" | null>(null);

  // 보건소 마스터 시트 상태
  const [masterRegionFilter, setMasterRegionFilter] = useState("all");
  const [masterRegFilter, setMasterRegFilter] = useState<"all" | "registered" | "unregistered" | "hasRequest">("all");
  const [masterSearch, setMasterSearch] = useState("");
  const [masterEditId, setMasterEditId] = useState<string | null>(null);
  const [masterEditRow, setMasterEditRow] = useState<{
    code: string; bizNumber: string; name: string;
    region: string; district: string; address: string; phone: string; representative: string;
  } | null>(null);
  // 부서 현황 모달
  const [deptModalCenter, setDeptModalCenter] = useState<{ code: string; name: string } | null>(null);
  // 보건소 마스터 오버라이드 (관리자가 수정한 주소/전화번호)
  const [masterOverrides, setMasterOverrides] = useState<Record<string, { address?: string; phone?: string }>>(() => {
    try { const s = localStorage.getItem("admin_master_overrides"); return s ? JSON.parse(s) : {}; }
    catch { return {}; }
  });
  // 마스터에서 삭제된 보건소 코드 목록
  const [masterDeleted, setMasterDeleted] = useState<string[]>(() => {
    try { const s = localStorage.getItem("admin_master_deleted"); return s ? JSON.parse(s) : []; }
    catch { return []; }
  });
  useEffect(() => { localStorage.setItem("admin_master_overrides", JSON.stringify(masterOverrides)); }, [masterOverrides]);
  useEffect(() => { localStorage.setItem("admin_master_deleted", JSON.stringify(masterDeleted)); }, [masterDeleted]);

  // ── 인증 ────────────────────────────────────────────────────────────────────────
  const handleLogin = () => {
    verifyPasswordMutation.mutate({ password });
  };

  const handleLogout = () => {
    sessionStorage.removeItem(ADMIN_AUTH_KEY);
    setIsAuthenticated(false);
    setPassword("");
  };
  // ── 비밀번호 변경 ────────────────────────────────────────────────────────────────────
  const handleChangePw = () => {
    const errs: Record<string, string> = {};
    if (!pwForm.current) errs.current = "현재 비밀번호를 입력해 주세요.";
    if (!pwForm.next) errs.next = "새 비밀번호를 입력해 주세요.";
    else if (pwForm.next.length < 6) errs.next = "6자 이상 입력해 주세요.";
    if (!pwForm.confirm) errs.confirm = "새 비밀번호를 한 번 더 입력해 주세요.";
    else if (pwForm.next !== pwForm.confirm) errs.confirm = "새 비밀번호가 일치하지 않습니다.";
    setPwErrors(errs);
    if (Object.keys(errs).length > 0) return;
    changePasswordMutation.mutate({ currentPassword: pwForm.current, newPassword: pwForm.next });
  };

  // -- 보건소 등록 --
  const handleDrilldownSelect = (center: { name: string; code: string; region: string }) => {
    setNewCenter({ centerName: center.name, centerCode: center.code, bizNumber: "", region: center.region });
    setSelectedFromDrilldown(true);
    setAddMode("manual"); // 사업자번호 입력 단계로
    setAddErrors({});
  };

  const validateAdd = () => {
    const errs: Record<string, string> = {};
    if (!newCenter.centerName.trim()) errs.centerName = "보건소명을 입력해 주세요.";
    if (!newCenter.centerCode.trim()) errs.centerCode = "보건소 코드를 입력해 주세요.";
    else if (!/^[A-Z0-9]{3,7}$/.test(newCenter.centerCode)) errs.centerCode = "영문+숫자 3~7자 (예: SE16)";
    if (!newCenter.bizNumber.trim()) errs.bizNumber = "사업자번호를 입력해 주세요.";
    else if (!/^\d{3}-\d{2}-\d{5}$/.test(newCenter.bizNumber)) errs.bizNumber = "000-00-00000 형식으로 입력해 주세요.";
    if (!newCenter.region.trim()) errs.region = "지역을 입력해 주세요.";
    setAddErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAddCenter = () => {
    if (!validateAdd()) return;
    createCenterMutation.mutate({
      centerCode: newCenter.centerCode,
      centerName: newCenter.centerName,
      bizNo: newCenter.bizNumber || undefined,
      region: newCenter.region || undefined,
    }, {
      onSuccess: () => {
        setNewCenter({ centerName: "", centerCode: "", bizNumber: "", region: "" });
        setShowAddForm(false);
        setAddMode("drilldown");
        setSelectedFromDrilldown(false);
        setAddErrors({});
        toast.success("보건소가 등록되었습니다.", { description: newCenter.centerName });
      },
    });
  };

  const handleDeleteCenter = (id: string) => {
    if (!confirm("해당 보건소를 삭제하시걌습니까?")) return;
    deleteCenterMutation.mutate({ id: Number(id) }, {
      onSuccess: () => toast.success("보건소가 삭제되었습니다."),
    });
  };

  // ── 코드 발급 플로우 ─────────────────────────────────────────────────────────
  const handleStartApprove = (req: SignupRequest) => {
    const autoCode = generateCode(req, requests);
    setEditingCode(prev => ({ ...prev, [req.id]: autoCode }));
    setCodeError(prev => ({ ...prev, [req.id]: "" }));
    // UI에서만 approving 오버레이 (로컬 상태)
    setApprovingIds(prev => { const n = new Set(prev); n.add(req.id); return n; });
  };

  const handleRegenCode = (req: SignupRequest) => {
    const newCode = generateCode(req, requests.filter(r => r.id !== req.id));
    setEditingCode(prev => ({ ...prev, [req.id]: newCode }));
    setCodeError(prev => ({ ...prev, [req.id]: "" }));
  };

  const handleConfirmApprove = (id: string) => {
    const code = (editingCode[id] || "").trim().toUpperCase();
    if (!code) { setCodeError(prev => ({ ...prev, [id]: "코드를 입력해 주세요." })); return; }
    if (!/^[A-Z0-9]{4,8}$/.test(code)) { setCodeError(prev => ({ ...prev, [id]: "영문+숫자 4~8자리로 입력해 주세요." })); return; }
    const dup = requests.find(r => r.id !== id && r.issuedCode === code);
    if (dup) { setCodeError(prev => ({ ...prev, [id]: `이미 사용 중인 코드입니다. (${dup.centerName})` })); return; }
    const approvedReq = requests.find(r => r.id === id);
    // DB에 승인 처리
    updateRequestMutation.mutate({ id: Number(id), status: "approved", issuedCode: code }, {
      onSuccess: () => {
        // approving 오버레이 제거
        setApprovingIds(prev => { const n = new Set(prev); n.delete(id); return n; });
        setCodeError(prev => ({ ...prev, [id]: "" }));
        setEditingCode(prev => { const n = { ...prev }; delete n[id]; return n; });
        setEmailPreviewId(id);
        // 등록 보건소 자동 이전: 해당 보건소가 아직 centers에 없는 경우만 추가
        if (approvedReq) {
          const alreadyInCenters = centers.some(c => c.centerCode === approvedReq.centerCode);
          if (!alreadyInCenters) {
            createCenterMutation.mutate({
              centerCode: approvedReq.centerCode,
              centerName: approvedReq.centerName,
              bizNo: approvedReq.bizNumber || undefined,
              region: HEALTH_CENTERS.find(hc => hc.code === approvedReq.centerCode)?.region || undefined,
            });
          }
        }
        toast.success("가입 승인 완료하였습니다.", { description: `코드: ${code}` });
      },
    });
  };

  const handleCancelApprove = (id: string) => {
    // approving 오버레이만 제거 (로컬 상태)
    setApprovingIds(prev => { const n = new Set(prev); n.delete(id); return n; });
    setEditingCode(prev => { const n = { ...prev }; delete n[id]; return n; });
    setCodeError(prev => { const n = { ...prev }; delete n[id]; return n; });
  };

  const handleReject = (id: string) => {
    updateRequestMutation.mutate({ id: Number(id), status: "rejected" }, {
      onSuccess: () => toast.success("거절 처리되었습니다."),
    });
  };

  // ── 이력 데이터 ─────────────────────────────────────────────────────────────
  const issuedHistory = useMemo(() => {
    return requests.filter(r => r.status === "approved" && r.issuedCode);
  }, [requests]);

  const regionOptions = useMemo(() => {
    const regions = Array.from(new Set(issuedHistory.map(r => {
      const hc = HEALTH_CENTERS.find(c => c.code === r.centerCode);
      return hc?.region || "";
    }).filter(Boolean))).sort();
    return regions;
  }, [issuedHistory]);

  const filteredHistory = useMemo(() => {
    let list = issuedHistory;
    if (historySearch) {
      const q = historySearch.toLowerCase();
      list = list.filter(r =>
        r.centerName.toLowerCase().includes(q) ||
        r.managerName.toLowerCase().includes(q) ||
        (r.issuedCode || "").toLowerCase().includes(q) ||
        r.deptName.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q)
      );
    }
    if (historyRegionFilter !== "all") {
      list = list.filter(r => {
        const hc = HEALTH_CENTERS.find(c => c.code === r.centerCode);
        return hc?.region === historyRegionFilter;
      });
    }
    list = [...list].sort((a, b) => {
      const da = a.approvedAt || a.submittedAt;
      const db = b.approvedAt || b.submittedAt;
      return historySortAsc ? da.localeCompare(db) : db.localeCompare(da);
    });
    return list;
  }, [issuedHistory, historySearch, historyRegionFilter, historySortAsc]);

  const handleExportCsv = () => {
    const headers = ["담당자 코드", "보건소명", "보건소 코드", "지역", "부서명", "담당자명", "연락처", "이메일", "신청일", "승인일"];
    const rows = filteredHistory.map(r => {
      const hc = HEALTH_CENTERS.find(c => c.code === r.centerCode);
      return [
        r.issuedCode || "",
        r.centerName,
        r.centerCode,
        hc?.region || "",
        r.deptName,
        r.managerName,
        r.phone,
        r.email,
        r.submittedAt,
        r.approvedAt || "",
      ];
    });
    const today = new Date().toISOString().slice(0, 10);
    downloadCsv([headers, ...rows], `담당자코드_발급이력_${today}.csv`);
  };

  // ── 필터 ────────────────────────────────────────────────────────────────────
  const filteredCenters = centers.filter(c =>
    c.centerName.includes(searchQuery) || c.centerCode.toUpperCase().includes(searchQuery.toUpperCase()) || c.bizNumber.includes(searchQuery)
  );
  const filteredRequests = requests.filter(r =>
    (!reqSearchQuery || r.centerName.includes(reqSearchQuery) || r.managerName.includes(reqSearchQuery) || r.email.includes(reqSearchQuery)) &&
    (!reqDeptSearch || r.deptName.includes(reqDeptSearch)) &&
    (requestStatusFilter === "all" || r.status === requestStatusFilter)
  );
  const pendingCount = requests.filter(r => r.status === "pending" || r.status === "approving").length;

  // 페이지네이션
  const reqTotalPages = Math.max(1, Math.ceil(filteredRequests.length / REQ_PAGE_SIZE));
  const reqPageSafe = Math.min(reqPage, reqTotalPages);
  const pagedRequests = filteredRequests.slice((reqPageSafe - 1) * REQ_PAGE_SIZE, reqPageSafe * REQ_PAGE_SIZE);

  // 보건소별 그룹핑 (시트 탭 용 - 모달에서 재활용)
  const groupedRequests = useMemo(() => {
    const groups: Record<string, { centerName: string; centerCode: string; requests: SignupRequest[] }> = {};
    requests.forEach(r => {
      const key = r.centerCode || r.centerName;
      if (!groups[key]) groups[key] = { centerName: r.centerName, centerCode: r.centerCode, requests: [] };
      groups[key].requests.push(r);
    });
    return Object.values(groups).sort((a, b) => a.centerName.localeCompare(b.centerName, "ko"));
  }, [requests]);

  // ── 로그인 화면 ─────────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    const isFirstTime = false; // DB 기반으로 전환됨 - 항상 false (초기 비밀번호 안내 불필요)
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-10" style={{ background: "#f5f5f7" }}>
        <div className="w-full max-w-md flex flex-col gap-5">
          {/* 로고 영역 */}
          <div className="flex flex-col items-center gap-2 mb-2">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-md" style={{ background: "#00b398" }}>
              <Shield className="w-7 h-7 text-white" />
            </div>
            <p className="text-[22px] font-bold text-[#1d1d1f] tracking-tight">보건소플러스 관리자</p>
            <p className="text-[13px] text-[#86868b]">관리자 전용 페이지입니다</p>
          </div>

          {/* 접근 방법 안내 카드 */}
          <div className="bg-white rounded-2xl p-5 flex flex-col gap-4 shadow-sm border border-[#e5e5ea]">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "rgba(0,122,255,0.1)" }}>
                <ExternalLink className="w-3.5 h-3.5" style={{ color: "#007aff" }} />
              </div>
              <p className="text-[13px] font-semibold text-[#1d1d1f]">관리자 페이지 접근 방법</p>
            </div>
            <div className="flex flex-col gap-2.5">
              {[
                { step: "1", text: "웹 브라우저 주소창에 아래 URL을 입력합니다" },
                { step: "2", text: "관리자 비밀번호를 입력하여 로그인합니다" },
                { step: "3", text: "최초 로그인 후 설정 탭에서 비밀번호를 변경하세요" },
              ].map(item => (
                <div key={item.step} className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 mt-0.5" style={{ background: "#00b398" }}>{item.step}</span>
                  <p className="text-[12px] text-[#424245] leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
            <div className="rounded-xl px-3.5 py-2.5 flex items-center gap-2.5" style={{ background: "rgba(0,0,0,0.04)" }}>
              <span className="text-[11px] text-[#86868b] font-medium flex-shrink-0">관리자 URL</span>
              <code className="flex-1 text-[12px] font-mono text-[#1d1d1f] truncate">{window.location.origin}/admin</code>
              <button
                onClick={() => { navigator.clipboard?.writeText(`${window.location.origin}/admin`); }}
                className="text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-colors flex-shrink-0"
                style={{ color: "#00b398", background: "rgba(0,179,152,0.1)" }}
              >복사</button>
            </div>
          </div>

          {/* 초기 비밀번호 안내 (최초 접속 시) */}
          {isFirstTime && (
            <div className="rounded-2xl px-4 py-3.5 flex items-start gap-3" style={{ background: "rgba(255,149,0,0.08)", border: "1px solid rgba(255,149,0,0.25)" }}>
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#ff9500" }} />
              <div className="flex flex-col gap-0.5">
                <p className="text-[12px] font-semibold" style={{ color: "#ff9500" }}>초기 비밀번호 안내</p>
                <p className="text-[12px] text-[#424245] leading-relaxed">
                  초기 비밀번호는 <code className="font-mono font-bold text-[#1d1d1f] bg-white px-1.5 py-0.5 rounded border border-[#e5e5ea]">admin1234</code> 입니다.<br />
                  로그인 후 반드시 <strong>설정 탭</strong>에서 비밀번호를 변경해 주세요.
                </p>
              </div>
            </div>
          )}

          {/* 로그인 폼 */}
          <div className="bg-white rounded-2xl p-6 flex flex-col gap-4 shadow-sm border border-[#e5e5ea]">
            <p className="text-[15px] font-semibold text-[#1d1d1f]">로그인</p>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2.5 rounded-xl px-3.5 py-3 ring-1 ring-transparent focus-within:ring-[#00b398]" style={{ background: "rgba(0,0,0,0.05)" }}>
                <Key className="w-4 h-4 flex-shrink-0 text-[#86868b]" />
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleLogin()}
                  placeholder="관리자 비밀번호를 입력하세요"
                  className="flex-1 bg-transparent text-[14px] text-[#1d1d1f] placeholder:text-[#c7c7cc] outline-none"
                  autoFocus
                />
                <button onClick={() => setShowPw(!showPw)} className="text-[#86868b] hover:text-[#1d1d1f]">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {authError && (
                <p className="text-[12px] text-red-500 pl-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />{authError}
                </p>
              )}
              <button
                onClick={handleLogin}
                className="w-full py-3 rounded-xl text-[15px] font-semibold text-white flex items-center justify-center gap-2 transition-opacity active:opacity-80"
                style={{ background: "#00b398" }}
              >
                로그인 <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <button onClick={() => setLocation("/")} className="text-[13px] text-[#86868b] text-center underline underline-offset-2">
            ← 메인으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  // ── 관리자 메인 ─────────────────────────────────────────────────────────────
  return (
    <>
    <div className="min-h-screen" style={{ background: "#f5f5f7" }}>
      {/* 헤더 */}
      <div className="bg-white border-b border-[#e5e5ea] sticky top-0 z-10">
        <div className="w-[95vw] mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "#00b398" }}>
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-[15px] font-bold text-[#1d1d1f] leading-none">보건소플러스 관리자</p>
              <p className="text-[11px] text-[#86868b] mt-0.5">보건소 사업자번호 등록 및 회원가입 관리</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setLocation("/")} className="text-[13px] text-[#86868b] hover:text-[#1d1d1f] transition-colors">메인으로</button>
            <button onClick={handleLogout} className="flex items-center gap-1.5 text-[13px] text-[#86868b] hover:text-red-500 transition-colors">
              <LogOut className="w-3.5 h-3.5" /> 로그아웃
            </button>
          </div>
        </div>
      </div>

      <div className="w-[95vw] mx-auto px-4 py-6 flex flex-col gap-6">
        {/* 탭 */}
        <div className="flex gap-2 flex-wrap">
          {[
            { key: "master", icon: <Building2 className="w-4 h-4" />, label: `보건소 마스터 (${HEALTH_CENTERS.length - 1})` },
            { key: "requests", icon: <FileText className="w-4 h-4" />, label: `가입 신청 (${requests.length})`, badge: pendingCount },
            { key: "history", icon: <History className="w-4 h-4" />, label: `발급 이력 (${issuedHistory.length})` },
            { key: "namecard-designs", icon: <Sparkles className="w-4 h-4" />, label: "기존 명함 디자인" },
            { key: "business-info", icon: <FileText className="w-4 h-4" />, label: "사업자 정보 관리" },
            { key: "settings", icon: <Settings className="w-4 h-4" />, label: "설정" },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key as typeof activeTab); setSearchQuery(""); }}
              className={`px-5 py-2.5 rounded-xl text-[14px] font-medium transition-all relative ${
                activeTab === tab.key ? "bg-white text-[#1d1d1f] shadow-sm" : "text-[#86868b] hover:text-[#424245]"
              }`}
            >
              <span className="flex items-center gap-2">{tab.icon}{tab.label}</span>
              {tab.badge != null && tab.badge > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-[10px] font-bold text-white flex items-center justify-center" style={{ background: "#ff3b30" }}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* 검색 (설정·이력 탭 제외) */}
        {(activeTab === "requests" || activeTab === "master") && (
          <div className="flex items-center gap-2.5 rounded-xl px-3.5 py-3 bg-white shadow-sm">
            <Search className="w-4 h-4 text-[#86868b]" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={activeTab === "master" ? "보건소명, 코드, 지역 검색" : "보건소명, 담당자, 이매일 검색"}
              className="flex-1 bg-transparent text-[14px] text-[#1d1d1f] placeholder:text-[#c7c7cc] outline-none"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="text-[#86868b] hover:text-[#1d1d1f]">
                <XCircle className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* ── 탭 0: 보건소 마스터 시트 ────────────────────────────────────────── */}
        {activeTab === "master" && (() => {
          // 전국 보건소 목록 (TEST001 제외)
          const hcBase = HEALTH_CENTERS.filter(c => c.code !== "TEST001");
          const hcCodeSet = new Set(hcBase.map(c => c.code));
          // 가입 신청 현황 맵 (보건소 코드 → 신청 목록)
          const requestMap: Record<string, SignupRequest[]> = {};
          requests.forEach(r => {
            if (!requestMap[r.centerCode]) requestMap[r.centerCode] = [];
            requestMap[r.centerCode].push(r);
          });
          // 가입신청에만 있고 마스터에 없는 보건소 → 자동 추가 (신청 데이터 기반)
          const extraFromRequests = requests
            .filter(r => r.centerCode && !hcCodeSet.has(r.centerCode))
            .reduce<Record<string, typeof hcBase[0]>>((acc, r) => {
              if (!acc[r.centerCode]) {
                acc[r.centerCode] = {
                  code: r.centerCode,
                  name: r.centerName,
                  region: "기타",
                  district: "",
                  address: "",
                  phone: "",
                };
              }
              return acc;
            }, {});
          const masterList = [...hcBase, ...Object.values(extraFromRequests)];
          // 지역 목록
          const masterRegions = Array.from(new Set(masterList.map(c => c.region))).sort();
          // 필터 + 검색 (삭제된 항목 제외)
          const filteredMaster = masterList.filter(c => {
            if (masterDeleted.includes(c.code)) return false;
            const q = searchQuery.toLowerCase();
            const matchSearch = !q || c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q) || (c.district || "").toLowerCase().includes(q);
            const matchRegion = masterRegionFilter === "all" || c.region === masterRegionFilter;
            const isReg = centers.some(ct => ct.centerCode === c.code);
            const hasReq = (requestMap[c.code] || []).length > 0;
            const matchRegFilter =
              masterRegFilter === "all" ? true :
              masterRegFilter === "registered" ? isReg :
              masterRegFilter === "unregistered" ? !isReg :
              masterRegFilter === "hasRequest" ? hasReq : true;
            return matchSearch && matchRegion && matchRegFilter;
          });

          return (
            <div className="flex flex-col gap-4">
              {/* 지역 필터 */}
              <div className="flex gap-2 flex-wrap">
                <button onClick={() => setMasterRegionFilter("all")} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${ masterRegionFilter === "all" ? "text-white" : "bg-white text-[#86868b] hover:text-[#424245]" }`} style={masterRegionFilter === "all" ? { background: "#00b398" } : {}}>
                  전체
                  <span className={`text-[10px] font-bold px-1 py-0.5 rounded ${masterRegionFilter === "all" ? "bg-white/25 text-white" : "bg-[#f0f0f5] text-[#86868b]"}`}>{masterList.filter(c => !masterDeleted.includes(c.code)).length}</span>
                </button>
                {masterRegions.map(r => {
                  const cnt = masterList.filter(c => !masterDeleted.includes(c.code) && c.region === r).length;
                  return (
                    <button key={r} onClick={() => setMasterRegionFilter(r)} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${ masterRegionFilter === r ? "text-white" : "bg-white text-[#86868b] hover:text-[#424245]" }`} style={masterRegionFilter === r ? { background: "#00b398" } : {}}>
                      {r.replace("특별시","").replace("광역시","").replace("특별자치시","").replace("특별자치도","").replace("도","")}
                      <span className={`text-[10px] font-bold px-1 py-0.5 rounded ${masterRegionFilter === r ? "bg-white/25 text-white" : "bg-[#f0f0f5] text-[#86868b]"}`}>{cnt}</span>
                    </button>
                  );
                })}
              </div>

              {/* 요약 카드 */}
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: "전체 보건소", value: masterList.filter(c => !masterDeleted.includes(c.code)).length, color: "#1d1d1f" },
                  { label: "등록됨", value: masterList.filter(c => !masterDeleted.includes(c.code) && centers.some(ct => ct.centerCode === c.code)).length, color: "#00b398" },
                  { label: "가입신청 있음", value: masterList.filter(c => !masterDeleted.includes(c.code) && (requestMap[c.code] || []).length > 0).length, color: "#007aff" },
                  { label: "미등록", value: masterList.filter(c => !masterDeleted.includes(c.code) && !centers.some(ct => ct.centerCode === c.code)).length, color: "#86868b" },
                ].map(stat => (
                  <div key={stat.label} className="bg-white rounded-2xl shadow-sm p-4 flex flex-col gap-1">
                    <p className="text-[11px] text-[#86868b]">{stat.label}</p>
                    <p className="text-[24px] font-bold font-mono" style={{ color: stat.color }}>{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* 등록 상태 필터 + 보건소 등록 버튼 */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <p className="text-[13px] text-[#86868b]">열 <span className="font-semibold text-[#1d1d1f]">{filteredMaster.length}</span>개 표시</p>
                  <div className="flex gap-1.5">
                    {[
                      { key: "all", label: "전체" },
                      { key: "registered", label: "등록됨" },
                      { key: "unregistered", label: "미등록" },
                      { key: "hasRequest", label: "신청있음" },
                    ].map(f => (
                      <button key={f.key} onClick={() => setMasterRegFilter(f.key as typeof masterRegFilter)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${ masterRegFilter === f.key ? "text-white" : "bg-white text-[#86868b] hover:text-[#424245]" }`}
                        style={masterRegFilter === f.key ? { background: "#00b398" } : {}}>{f.label}</button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setShowAddForm(!showAddForm); setAddMode("drilldown"); setSelectedFromDrilldown(false); setNewCenter({ centerName: "", centerCode: "", bizNumber: "", region: "" }); setAddErrors({}); }}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12px] font-semibold text-white transition-opacity active:opacity-80"
                    style={{ background: "#00b398" }}
                  >
                    <Plus className="w-3.5 h-3.5" /> 보건소 등록
                  </button>
                  <button
                    onClick={() => {
                      const rows = [["코드","등록상태","보건소명","시·도","시·군·구","주소","전화번호","사업자번호","가입신청","승인","대기"]];
                      filteredMaster.forEach(c => {
                        const ov = masterOverrides[c.code] || {};
                        const reqs = requestMap[c.code] || [];
                        const isReg = centers.some(ct => ct.centerCode === c.code);
                        const ov2 = masterOverrides[c.code] as (typeof masterOverrides[string] & { bizNumber?: string }) | undefined;
                        const biz = ov2?.bizNumber || centers.find(ct => ct.centerCode === c.code)?.bizNumber || reqs.find(r => r.status === "approved" && r.bizNumber)?.bizNumber || "";
                        const dbRegCsv = centers.find(ct => ct.centerCode === c.code);
                        const csvAddress = dbRegCsv?.address || ov.address || c.address;
                        const csvPhone = dbRegCsv?.phone || ov.phone || c.phone;
                        rows.push([c.code, isReg ? "등록됨" : "미등록", c.name, c.region, c.district, csvAddress, csvPhone, biz, String(reqs.length), String(reqs.filter(r=>r.status==="approved").length), String(reqs.filter(r=>r.status==="pending").length)]);
                      });
                      const csv = "\uFEFF" + rows.map(r => r.map(v => `"${v}"`).join(",")).join("\n");
                      const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); a.download = "보건소_마스터_" + new Date().toISOString().slice(0,10) + ".csv"; a.click();
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12px] font-medium bg-white shadow-sm text-[#424245] hover:text-[#1d1d1f] transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" /> CSV
                  </button>
                </div>
              </div>

              {/* 보건소 등록 폼 */}
              {showAddForm && (
                <div className="bg-white rounded-2xl p-5 shadow-sm flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[15px] font-semibold text-[#1d1d1f]">신규 보건소 등록</p>
                    <div className="flex gap-1">
                      {["drilldown", "manual"].map(mode => (
                        <button key={mode}
                          onClick={() => { setAddMode(mode as "drilldown" | "manual"); setSelectedFromDrilldown(false); setNewCenter({ centerName: "", centerCode: "", bizNumber: "", region: "" }); setAddErrors({}); }}
                          className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all ${addMode === mode ? "text-white" : "text-[#86868b] bg-[#f5f5f7]"}`}
                          style={addMode === mode ? { background: "#00b398" } : {}}>
                          {mode === "drilldown" ? "목록에서 선택" : "직접 입력"}
                        </button>
                      ))}
                    </div>
                  </div>
                  {addMode === "drilldown" && !selectedFromDrilldown && (
                    <DrilldownPicker onSelect={handleDrilldownSelect} onCancel={() => { setShowAddForm(false); }} />
                  )}
                  {(addMode === "manual" || selectedFromDrilldown) && (
                    <div className="flex flex-col gap-3">
                      {selectedFromDrilldown && (
                        <div className="flex items-center gap-2.5 rounded-xl px-3.5 py-3" style={{ background: "rgba(0,179,152,0.07)", border: "1px solid rgba(0,179,152,0.2)" }}>
                          <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: "#00b398" }} />
                          <div>
                            <p className="text-[13px] font-semibold text-[#1d1d1f]">{newCenter.centerName}</p>
                            <p className="text-[11px] text-[#86868b]">{newCenter.region} · 코드: <span className="font-mono">{newCenter.centerCode}</span></p>
                          </div>
                          <button onClick={() => { setSelectedFromDrilldown(false); setAddMode("drilldown"); setNewCenter({ centerName: "", centerCode: "", bizNumber: "", region: "" }); }}
                            className="ml-auto text-[11px] text-[#86868b] hover:text-[#00b398] underline">다시 선택</button>
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-3">
                        {(!selectedFromDrilldown ? [
                          { field: "centerName", label: "보건소명", placeholder: "예: 강서구보건소", mono: false },
                          { field: "centerCode", label: "보건소 코드", placeholder: "예: SE16", mono: true },
                          { field: "bizNumber", label: "사업자번호", placeholder: "000-00-00000", mono: true },
                          { field: "region", label: "지역", placeholder: "예: 서울특별시", mono: false },
                        ] : [
                          { field: "bizNumber", label: "사업자번호", placeholder: "000-00-00000", mono: true },
                        ]).map(({ field, label, placeholder, mono }) => (
                          <div key={field} className={`flex flex-col gap-1 ${field === "bizNumber" && selectedFromDrilldown ? "col-span-2" : ""}`}>
                            <label className="text-[12px] font-medium text-[#424245]">{label} <span style={{ color: "#00b398" }}>필수</span></label>
                            <div className={`flex items-center gap-2 rounded-xl px-3 py-2.5 ring-1 focus-within:ring-[#00b398] ${addErrors[field] ? "ring-red-400" : "ring-[#e5e5ea]"}`} style={{ background: "rgba(0,0,0,0.03)" }}>
                              <input type="text" value={(newCenter as Record<string, string>)[field]}
                                onChange={e => { let val = e.target.value; if (field === "centerCode") val = val.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 7); if (field === "bizNumber") val = formatBizNumber(val); setNewCenter(p => ({ ...p, [field]: val })); }}
                                placeholder={placeholder}
                                className={`flex-1 bg-transparent text-[13px] text-[#1d1d1f] placeholder:text-[#c7c7cc] outline-none ${mono ? "font-mono" : ""}`}
                              />
                            </div>
                            {addErrors[field] && <p className="text-[11px] text-red-500">{addErrors[field]}</p>}
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2 justify-end mt-1">
                        <button onClick={() => { setShowAddForm(false); setAddMode("drilldown"); setSelectedFromDrilldown(false); setAddErrors({}); }} className="px-4 py-2 rounded-xl text-[13px] font-medium text-[#86868b] bg-[#f5f5f7]">취소</button>
                        <button onClick={handleAddCenter} className="px-4 py-2 rounded-xl text-[13px] font-medium text-white" style={{ background: "#00b398" }}>등록</button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 마스터 테이블 */}
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-[#e5e5ea]">
                <div className="overflow-x-auto" style={{ maxHeight: "65vh", overflowY: "auto" }}>
                  <table className="w-full text-[13px] border-collapse" style={{ minWidth: "960px" }}>
                    <thead>
                      <tr style={{ background: "#f5f5f7", position: "sticky", top: 0, zIndex: 10 }}>
                        {["#","코드","상태","가입신청","사업자등록번호","보건소명(상호)","대표자","시·도","시·군·구","주소","전화번호","수정/삭제"].map(h => (
                          <th key={h} className="text-left px-3 py-2.5 text-[11px] font-semibold text-[#86868b] border-b border-[#e5e5ea] whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMaster.map((c, idx) => {
                        const ov = masterOverrides[c.code] || {};
                        const reqs = requestMap[c.code] || [];
                        const approved = reqs.filter(r => r.status === "approved").length;
                        const pending = reqs.filter(r => r.status === "pending" || r.status === "approving").length;
                        const isEditing = masterEditId === c.code;
                        // DB 등록된 보건소 데이터 (address/phone 우선)
                        const dbReg = centers.find(ct => ct.centerCode === c.code);
                        const displayAddress = dbReg?.address || ov.address || c.address;
                        const displayPhone = dbReg?.phone || ov.phone || c.phone;
                        return (
                          <tr key={c.code} className={`border-b border-[#f0f0f5] transition-colors ${ isEditing ? "bg-[#f0fdf9]" : "hover:bg-[#fafafa]" }`}>
                            <td className="px-3 py-2.5 text-[#86868b] font-mono text-[11px]">{idx + 1}</td>
                            {/* 코드 */}
                            <td className="px-3 py-2.5">
                              <span className="font-mono text-[11px] px-1.5 py-0.5 rounded" style={{ background: "rgba(0,179,152,0.1)", color: "#00b398" }}>{c.code}</span>
                            </td>
                            {/* 상태 배지 */}
                            <td className="px-3 py-2.5">
                              <div className="flex gap-1 flex-wrap">
                                {approved > 0 && <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-green-50 text-green-600">승인 {approved}</span>}
                                {pending > 0 && <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-600">대기 {pending}</span>}
                                {reqs.length === 0 && <span className="text-[11px] text-[#c7c7cc]">미신청</span>}
                              </div>
                            </td>
                            {/* 가입 신청 건수 */}
                            <td className="px-3 py-2.5 text-center">
                              {reqs.length > 0 ? (
                                <button
                                  onClick={() => setDeptModalCenter({ code: c.code, name: c.name })}
                                  className="text-[12px] font-semibold underline decoration-dotted" style={{ color: "#00b398" }}
                                >
                                  {reqs.length}건
                                </button>
                              ) : <span className="text-[#c7c7cc] text-[12px]">—</span>}
                            </td>
                            {/* 사업자등록번호 — 항상 편집 가능 */}
                            <td className="px-3 py-2.5" style={{ minWidth: "130px" }}>
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={masterEditRow?.bizNumber ?? ""}
                                  onChange={e => {
                                    const val = formatBizNumber(e.target.value);
                                    setMasterEditRow(prev => prev ? { ...prev, bizNumber: val } : prev);
                                  }}
                                  placeholder="000-00-00000"
                                  className="w-full px-2 py-1 rounded-lg border text-[12px] font-mono outline-none"
                                  style={{ borderColor: "#00b398" }}
                                />
                              ) : (() => {
                                const ov2 = masterOverrides[c.code] as (typeof masterOverrides[string] & { bizNumber?: string }) | undefined;
                                if (ov2?.bizNumber) return <span className="font-mono text-[11px] text-[#424245]">{ov2.bizNumber}</span>;
                                const reg = centers.find(ct => ct.centerCode === c.code);
                                if (reg?.bizNumber) return <span className="font-mono text-[11px] text-[#424245]">{reg.bizNumber}</span>;
                                const approvedReq = reqs.find(r => r.status === "approved" && r.bizNumber);
                                if (approvedReq?.bizNumber) return <span className="font-mono text-[11px] text-[#424245]">{approvedReq.bizNumber}</span>;
                                return <span className="text-[11px] text-[#c7c7cc]">—</span>;
                              })()}
                            </td>
                            {/* 보건소명 — 항상 편집 가능 */}
                            <td className="px-3 py-2.5" style={{ minWidth: "160px" }}>
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={masterEditRow?.name ?? ""}
                                  onChange={e => setMasterEditRow(prev => prev ? { ...prev, name: e.target.value } : prev)}
                                  className="w-full px-2 py-1 rounded-lg border text-[13px] font-medium outline-none"
                                  style={{ borderColor: "#00b398" }}
                                />
                              ) : (
                                <span className="font-medium text-[#1d1d1f] whitespace-nowrap">{(masterOverrides[c.code] as (typeof masterOverrides[string] & { name?: string }) | undefined)?.name || c.name}</span>
                              )}
                            </td>
                            {/* 대표자 — 항상 편집 가능 */}
                            <td className="px-3 py-2.5" style={{ minWidth: "100px" }}>
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={masterEditRow?.representative ?? ""}
                                  onChange={e => setMasterEditRow(prev => prev ? { ...prev, representative: e.target.value } : prev)}
                                  placeholder="대표자명"
                                  className="w-full px-2 py-1 rounded-lg border text-[12px] outline-none"
                                  style={{ borderColor: "#00b398" }}
                                />
                              ) : (
                                <span className="text-[12px] text-[#424245] whitespace-nowrap">
                                  {(masterOverrides[c.code] as (typeof masterOverrides[string] & { representative?: string }) | undefined)?.representative || centers.find(ct => ct.centerCode === c.code)?.representative || <span className="text-[#c7c7cc]">—</span>}
                                </span>
                              )}
                            </td>
                            {/* 시·도 — 항상 편집 가능 */}
                            <td className="px-3 py-2.5" style={{ minWidth: "80px" }}>
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={masterEditRow?.region ?? ""}
                                  onChange={e => setMasterEditRow(prev => prev ? { ...prev, region: e.target.value } : prev)}
                                  className="w-full px-2 py-1 rounded-lg border text-[12px] outline-none"
                                  style={{ borderColor: "#00b398" }}
                                />
                              ) : (
                                <span className="text-[12px] text-[#86868b] whitespace-nowrap">{((masterOverrides[c.code] as (typeof masterOverrides[string] & { region?: string }) | undefined)?.region || c.region).replace("특별시","").replace("광역시","").replace("특별자치시","").replace("특별자치도","")}</span>
                              )}
                            </td>
                            {/* 시·군·구 — 항상 편집 가능 */}
                            <td className="px-3 py-2.5" style={{ minWidth: "80px" }}>
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={masterEditRow?.district ?? ""}
                                  onChange={e => setMasterEditRow(prev => prev ? { ...prev, district: e.target.value } : prev)}
                                  className="w-full px-2 py-1 rounded-lg border text-[12px] outline-none"
                                  style={{ borderColor: "#00b398" }}
                                />
                              ) : (
                                <span className="text-[12px] text-[#424245] whitespace-nowrap">{(masterOverrides[c.code] as (typeof masterOverrides[string] & { district?: string }) | undefined)?.district || c.district}</span>
                              )}
                            </td>
                            {/* 주소 — 항상 편집 가능 */}
                            <td className="px-3 py-2.5" style={{ minWidth: "200px" }}>
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={masterEditRow?.address ?? ""}
                                  onChange={e => setMasterEditRow(prev => prev ? { ...prev, address: e.target.value } : prev)}
                                  className="w-full px-2 py-1 rounded-lg border text-[12px] outline-none"
                                  style={{ borderColor: "#00b398" }}
                                />
                              ) : (
                                <span className="text-[12px] text-[#424245]">{displayAddress}</span>
                              )}
                            </td>
                            {/* 전화번호 — 항상 편집 가능 */}
                            <td className="px-3 py-2.5" style={{ minWidth: "130px" }}>
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={masterEditRow?.phone ?? ""}
                                  onChange={e => setMasterEditRow(prev => prev ? { ...prev, phone: e.target.value } : prev)}
                                  className="w-full px-2 py-1 rounded-lg border text-[12px] font-mono outline-none"
                                  style={{ borderColor: "#00b398" }}
                                />
                              ) : (
                                <span className="font-mono text-[12px] text-[#424245] whitespace-nowrap">{displayPhone}</span>
                              )}
                            </td>
                            {/* 수정/삭제 버튼 */}
                            <td className="px-3 py-2.5">
                              {isEditing ? (
                                <div className="flex gap-1.5">
                                  <button
                                    onClick={() => {
                                      if (masterEditRow) {
                                        // 오버라이드에 모든 필드 저장
                                        setMasterOverrides(prev => ({
                                          ...prev,
                                          [c.code]: {
                                            ...prev[c.code],
                                            bizNumber: masterEditRow.bizNumber,
                                            name: masterEditRow.name,
                                            region: masterEditRow.region,
                                            district: masterEditRow.district,
                                            address: masterEditRow.address,
                                            phone: masterEditRow.phone,
                                            representative: masterEditRow.representative,
                                          }
                                        }));
                                        // DB에 모든 필드 동기화 (주소/전화번호/사업자번호/이름/지역/대표자)
                                        const existingCenter = centers.find(ct => ct.centerCode === c.code);
                                        if (existingCenter) {
                                          updateCenterMutation.mutate({
                                            id: Number(existingCenter.id),
                                            bizNo: masterEditRow.bizNumber || undefined,
                                            address: masterEditRow.address || undefined,
                                            phone: masterEditRow.phone || undefined,
                                            centerName: masterEditRow.name || undefined,
                                            region: masterEditRow.region || undefined,
                                            representative: masterEditRow.representative || undefined,
                                          });
                                        } else {
                                          createCenterMutation.mutate({
                                            centerCode: c.code,
                                            centerName: masterEditRow.name || c.name,
                                            bizNo: masterEditRow.bizNumber || undefined,
                                            address: masterEditRow.address || undefined,
                                            phone: masterEditRow.phone || undefined,
                                            region: masterEditRow.region || c.region,
                                            representative: masterEditRow.representative || undefined,
                                          });
                                        }
                                      }
                                      setMasterEditId(null); setMasterEditRow(null);
                                    }}
                                    className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-white whitespace-nowrap"
                                    style={{ background: "#00b398" }}
                                  >저장</button>
                                  <button
                                    onClick={() => { setMasterEditId(null); setMasterEditRow(null); }}
                                    className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-[#86868b] bg-[#f5f5f7] hover:bg-[#e5e5ea] whitespace-nowrap"
                                  >취소</button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={() => {
                                      const ov2 = masterOverrides[c.code] as (typeof masterOverrides[string] & { bizNumber?: string; name?: string; region?: string; district?: string }) | undefined;
                                      const curBiz = ov2?.bizNumber || centers.find(ct => ct.centerCode === c.code)?.bizNumber || reqs.find(r => r.status === "approved" && r.bizNumber)?.bizNumber || "";
                                      setMasterEditId(c.code);
                                      const dbCenter = centers.find(ct => ct.centerCode === c.code);
                                      setMasterEditRow({
                                        code: c.code,
                                        bizNumber: curBiz,
                                        name: ov2?.name || c.name,
                                        region: ov2?.region || c.region,
                                        district: ov2?.district || c.district,
                                        address: displayAddress,
                                        phone: displayPhone,
                                        representative: (ov2 as (typeof masterOverrides[string] & { representative?: string }) | undefined)?.representative || dbCenter?.representative || "",
                                      });
                                    }}
                                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-[#86868b] bg-[#f5f5f7] hover:bg-[#e5e5ea] transition-colors whitespace-nowrap"
                                  >
                                    <Pencil className="w-3 h-3" /> 수정
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (window.confirm(`"${c.name}"을(를) 목록에서 삭제하시겠습니까?\n삭제 후 복구하려면 페이지를 새로고침하세요.`)) {
                                        setMasterDeleted(prev => [...prev, c.code]);
                                      }
                                    }}
                                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-red-400 bg-red-50 hover:bg-red-100 transition-colors whitespace-nowrap"
                                  >
                                    <Trash2 className="w-3 h-3" /> 삭제
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );
        })()}

        {/* ── 탭 B: 가입 신청 ────────────────────────────────────────────────────── */}
        {activeTab === "requests" && (
          <div className="flex flex-col gap-3">
            {/* 요약 통계 */}
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: "전체", value: requests.length, color: "#1d1d1f", filter: "all" },
                { label: "대기중", value: requests.filter(r => r.status === "pending").length, color: "#ff9500", filter: "pending" },
                { label: "승인됨", value: requests.filter(r => r.status === "approved").length, color: "#00b398", filter: "approved" },
                { label: "거절됨", value: requests.filter(r => r.status === "rejected").length, color: "#ff3b30", filter: "rejected" },
              ].map(stat => (
                <button
                  key={stat.filter}
                  onClick={() => { setRequestStatusFilter(stat.filter as typeof requestStatusFilter); setReqPage(1); }}
                  className={`bg-white rounded-2xl shadow-sm p-4 flex flex-col gap-1 text-left transition-all ${
                    requestStatusFilter === stat.filter ? "shadow-md" : "hover:shadow-md"
                  }`}
                  style={requestStatusFilter === stat.filter ? { outline: `2px solid ${stat.color}`, outlineOffset: "0px" } : {}}
                >
                  <span className="text-[22px] font-bold" style={{ color: stat.color }}>{stat.value}</span>
                  <span className="text-[11px] font-medium text-[#86868b]">{stat.label}</span>
                </button>
              ))}
            </div>

            {/* 검색 필터 바 (시트 탭 대체) */}
            <div className="bg-white rounded-2xl shadow-sm px-4 py-3 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 flex-1 min-w-[180px] rounded-xl px-3 py-2 border border-[#e5e5ea] focus-within:border-[#00b398] transition-colors">
                <Search className="w-3.5 h-3.5 text-[#86868b] flex-shrink-0" />
                <input
                  type="text"
                  value={reqSearchQuery}
                  onChange={e => { setReqSearchQuery(e.target.value); setReqPage(1); }}
                  placeholder="보건소명 / 담당자 / 이메일"
                  className="flex-1 bg-transparent text-[13px] text-[#1d1d1f] placeholder:text-[#c7c7cc] outline-none"
                />
                {reqSearchQuery && <button onClick={() => { setReqSearchQuery(""); setReqPage(1); }} className="text-[#c7c7cc] hover:text-[#86868b]"><X className="w-3.5 h-3.5" /></button>}
              </div>
              <div className="flex items-center gap-2 flex-1 min-w-[150px] rounded-xl px-3 py-2 border border-[#e5e5ea] focus-within:border-[#00b398] transition-colors">
                <Users className="w-3.5 h-3.5 text-[#86868b] flex-shrink-0" />
                <input
                  type="text"
                  value={reqDeptSearch}
                  onChange={e => { setReqDeptSearch(e.target.value); setReqPage(1); }}
                  placeholder="부서명 검색"
                  className="flex-1 bg-transparent text-[13px] text-[#1d1d1f] placeholder:text-[#c7c7cc] outline-none"
                />
                {reqDeptSearch && <button onClick={() => { setReqDeptSearch(""); setReqPage(1); }} className="text-[#c7c7cc] hover:text-[#86868b]"><X className="w-3.5 h-3.5" /></button>}
              </div>
              <span className="text-[12px] text-[#86868b] whitespace-nowrap">{filteredRequests.length}건 / 전체 {requests.length}건</span>
            </div>

            {/* 통합 테이블 */}
            {(() => {
              const sheetRows = pagedRequests;

              return (
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  {filteredRequests.length === 0 ? (
                    <div className="py-16 flex flex-col items-center gap-2 text-[#86868b]">
                      <FileText className="w-8 h-8 opacity-30" />
                      <p className="text-[14px]">해당 조건의 가입 신청이 없습니다.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto" style={{ maxHeight: "65vh", overflowY: "auto" }}>
                      <table className="w-full text-[12px] border-collapse" style={{ minWidth: "1100px" }}>
                        {/* 엑셀 스타일 고정 헤더 */}
                        <thead>
                          <tr style={{ background: "#f0f4f8", position: "sticky", top: 0, zIndex: 10, borderBottom: "2px solid #d1d5db" }}>
                            <th className="text-center px-2 py-2 text-[11px] font-bold text-[#374151] border-r border-[#d1d5db] whitespace-nowrap" style={{ width: "36px", minWidth: "36px" }}>#</th>
                            <th className="text-left px-2 py-2 text-[11px] font-bold text-[#374151] border-r border-[#d1d5db] whitespace-nowrap" style={{ width: "140px", minWidth: "140px" }}>보건소명</th>
                            <th className="text-left px-2 py-2 text-[11px] font-bold text-[#374151] border-r border-[#d1d5db] whitespace-nowrap" style={{ width: "96px", minWidth: "96px" }}>보건소 코드</th>
                            <th className="text-left px-2 py-2 text-[11px] font-bold text-[#374151] border-r border-[#d1d5db] whitespace-nowrap" style={{ width: "110px", minWidth: "110px" }}>부서명</th>
                            <th className="text-left px-2 py-2 text-[11px] font-bold text-[#374151] border-r border-[#d1d5db] whitespace-nowrap" style={{ width: "76px", minWidth: "76px" }}>담당자</th>
                            <th className="text-left px-2 py-2 text-[11px] font-bold text-[#374151] border-r border-[#d1d5db] whitespace-nowrap" style={{ width: "110px", minWidth: "110px" }}>연락처</th>
                            <th className="text-left px-2 py-2 text-[11px] font-bold text-[#374151] border-r border-[#d1d5db] whitespace-nowrap" style={{ width: "160px", minWidth: "160px" }}>이메일</th>
                            <th className="text-left px-2 py-2 text-[11px] font-bold text-[#374151] border-r border-[#d1d5db] whitespace-nowrap" style={{ width: "108px", minWidth: "108px" }}>사업자번호</th>
                            <th className="text-left px-2 py-2 text-[11px] font-bold text-[#374151] border-r border-[#d1d5db] whitespace-nowrap" style={{ width: "90px", minWidth: "90px" }}>신청일</th>
                            <th className="text-left px-2 py-2 text-[11px] font-bold text-[#374151] border-r border-[#d1d5db] whitespace-nowrap" style={{ width: "70px", minWidth: "70px" }}>상태</th>
                            <th className="text-left px-2 py-2 text-[11px] font-bold text-[#374151] border-r border-[#d1d5db] whitespace-nowrap" style={{ width: "96px", minWidth: "96px" }}>발급코드</th>
                            <th className="text-center px-2 py-2 text-[11px] font-bold text-[#374151] whitespace-nowrap" style={{ width: "150px", minWidth: "150px" }}>처리</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sheetRows.map((r, idx) => {
                            const globalIdx = (reqPageSafe - 1) * REQ_PAGE_SIZE + idx;
                            const isEditing = reqEditId === r.id;
                            const isEven = globalIdx % 2 === 0;
                            return (
                            <tr
                              key={r.id}
                              style={{ background: isEditing ? "#f0fdf4" : isEven ? "#ffffff" : "#f9fafb", borderBottom: "1px solid #e5e7eb" }}
                            >
                              {/* # */}
                              <td className="px-2 py-0.5 text-center text-[#9ca3af] font-mono text-[11px] border-r border-[#e5e7eb]">{globalIdx + 1}</td>
                              {/* 보건소명 */}
                              <td className="px-2 py-0.5 border-r border-[#e5e7eb]">
                                {isEditing ? (
                                  <input
                                    type="text"
                                    value={reqEditRow?.centerName ?? ""}
                                    onChange={e => setReqEditRow(prev => prev ? { ...prev, centerName: e.target.value } : prev)}
                                    className="w-full px-1.5 py-0.5 border rounded text-[12px] outline-none"
                                    style={{ borderColor: "#00b398" }}
                                  />
                                ) : (
                                  <span className="font-medium text-[#111827] whitespace-nowrap text-[12px]">{r.centerName}</span>
                                )}
                              </td>
                              {/* 코드 */}
                              <td className="px-2 py-0.5 border-r border-[#e5e7eb]" style={{ width: `${Math.max(80, (r.centerCode?.length || 6) * 8 + 24)}px`, minWidth: `${Math.max(80, (r.centerCode?.length || 6) * 8 + 24)}px` }}>
                                <span className="font-mono text-[11px] px-1.5 py-0.5 rounded whitespace-nowrap" style={{ background: "rgba(0,179,152,0.1)", color: "#00b398" }}>{r.centerCode}</span>
                              </td>
                              {/* 부서명 */}
                              <td className="px-2 py-0.5 border-r border-[#e5e7eb]">
                                {isEditing ? (
                                  <input
                                    type="text"
                                    value={reqEditRow?.deptName ?? ""}
                                    onChange={e => setReqEditRow(prev => prev ? { ...prev, deptName: e.target.value } : prev)}
                                    className="w-full px-1.5 py-0.5 border rounded text-[12px] outline-none"
                                    style={{ borderColor: "#00b398" }}
                                  />
                                ) : (
                                  <span className="text-[#111827] whitespace-nowrap text-[12px]">{r.deptName}</span>
                                )}
                              </td>
                              {/* 담당자 */}
                              <td className="px-2 py-0.5 border-r border-[#e5e7eb]">
                                {isEditing ? (
                                  <input
                                    type="text"
                                    value={reqEditRow?.managerName ?? ""}
                                    onChange={e => setReqEditRow(prev => prev ? { ...prev, managerName: e.target.value } : prev)}
                                    className="w-full px-1.5 py-0.5 border rounded text-[12px] outline-none"
                                    style={{ borderColor: "#00b398" }}
                                  />
                                ) : (
                                  <span className="text-[#111827] text-[12px]">{r.managerName}</span>
                                )}
                              </td>
                              {/* 연락처 */}
                              <td className="px-2 py-0.5 border-r border-[#e5e7eb]">
                                {isEditing ? (
                                  <input
                                    type="text"
                                    value={reqEditRow?.phone ?? ""}
                                    onChange={e => setReqEditRow(prev => prev ? { ...prev, phone: e.target.value } : prev)}
                                    className="w-full px-1.5 py-0.5 border rounded text-[12px] font-mono outline-none"
                                    style={{ borderColor: "#00b398" }}
                                  />
                                ) : (
                                  <span className="font-mono text-[12px] text-[#374151] whitespace-nowrap">{r.phone}</span>
                                )}
                              </td>
                              {/* 이메일 */}
                              <td className="px-2 py-0.5 border-r border-[#e5e7eb]" style={{ maxWidth: "160px" }}>
                                {isEditing ? (
                                  <input
                                    type="email"
                                    value={reqEditRow?.email ?? ""}
                                    onChange={e => setReqEditRow(prev => prev ? { ...prev, email: e.target.value } : prev)}
                                    className="w-full px-1.5 py-0.5 border rounded text-[12px] outline-none"
                                    style={{ borderColor: "#00b398" }}
                                  />
                                ) : (
                                  <span className="text-[#374151] text-[12px]" style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.email}</span>
                                )}
                              </td>
                              {/* 사업자번호 */}
                              <td className="px-2 py-0.5 border-r border-[#e5e7eb]">
                                {isEditing ? (
                                  <input
                                    type="text"
                                    value={reqEditRow?.bizNo ?? ""}
                                    onChange={e => setReqEditRow(prev => prev ? { ...prev, bizNo: e.target.value } : prev)}
                                    className="w-full px-1.5 py-0.5 border rounded text-[12px] font-mono outline-none"
                                    style={{ borderColor: "#00b398" }}
                                  />
                                ) : (
                                  <span className="font-mono text-[12px] text-[#374151] whitespace-nowrap">{r.bizNumber}</span>
                                )}
                              </td>
                              {/* 신청일 */}
                              <td className="px-2 py-1.5 text-[12px] text-[#6b7280] whitespace-nowrap border-r border-[#e5e7eb]">{r.submittedAt}</td>
                              {/* 상태 */}
                              <td className="px-2 py-0.5 border-r border-[#e5e7eb]">
                                {isEditing ? (
                                  <select
                                    value={reqEditRow?.status ?? r.status}
                                    onChange={e => setReqEditRow(prev => prev ? { ...prev, status: e.target.value as "pending" | "approved" | "rejected" } : prev)}
                                    className="w-full px-1 py-0.5 border rounded text-[11px] outline-none"
                                    style={{ borderColor: "#00b398" }}
                                  >
                                    <option value="pending">대기</option>
                                    <option value="approved">승인</option>
                                    <option value="rejected">거절</option>
                                  </select>
                                ) : (
                                  <span className={`px-1.5 py-0.5 rounded text-[11px] font-semibold whitespace-nowrap ${
                                    r.status === "approved" ? "bg-green-50 text-green-700" :
                                    r.status === "rejected" ? "bg-red-50 text-red-600" :
                                    r.status === "approving" ? "bg-blue-50 text-blue-600" :
                                    "bg-amber-50 text-amber-700"
                                  }`}>
                                    {r.status === "approved" ? "승인" : r.status === "rejected" ? "거절" : r.status === "approving" ? "발급중" : "대기"}
                                  </span>
                                )}
                              </td>
                              {/* 발급코드 */}
                              <td className="px-2 py-0.5 border-r border-[#e5e7eb]">
                                {isEditing ? (
                                  <div className="flex flex-col gap-0.5">
                                  <input
                                    type="text"
                                    value={reqEditRow?.issuedCode ?? ""}
                                    onChange={e => {
                                      const raw = e.target.value;
                                      // 한글 감지
                                      const hasKorean = /[\uAC00-\uD7A3\u1100-\u11FF\u3130-\u318F]/.test(raw);
                                      // 특수문자 감지 (영문·숫자 외)
                                      const hasSpecial = /[^A-Za-z0-9\uAC00-\uD7A3\u1100-\u11FF\u3130-\u318F]/.test(raw);
                                      if (hasKorean) {
                                        setReqEditCodeWarn("한글은 입력할 수 없습니다. 영문 대문자와 숫자만 사용 가능합니다.");
                                      } else if (hasSpecial) {
                                        setReqEditCodeWarn("특수문자는 입력할 수 없습니다. 영문 대문자와 숫자만 사용 가능합니다.");
                                      } else {
                                        setReqEditCodeWarn("");
                                      }
                                      const cleaned = raw.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8);
                                      setReqEditRow(prev => prev ? { ...prev, issuedCode: cleaned } : prev);
                                      setReqEditDupError("");
                                    }}
                                    placeholder="XXXX00"
                                    maxLength={8}
                                    className="w-full px-1.5 py-0.5 border rounded text-[12px] font-mono font-bold outline-none tracking-widest"
                                    style={{ borderColor: (reqEditDupError || reqEditCodeWarn) ? "#ff3b30" : "#00b398", color: "#00b398" }}
                                  />
                                  {reqEditCodeWarn && (
                                    <p className="text-[10px] text-red-500 leading-tight">{reqEditCodeWarn}</p>
                                  )}
                                  {reqEditDupError && !reqEditCodeWarn && (
                                    <p className="text-[10px] text-red-500 whitespace-nowrap">{reqEditDupError}</p>
                                  )}
                                  {!reqEditCodeWarn && !reqEditDupError && (
                                    <p className="text-[10px] text-[#86868b] leading-tight">
                                      ✔ 영문 대문자(A–Z), 숫자(0–9) · 최대 8자
                                    </p>
                                  )}
                                  </div>
                                ) : r.status === "approving" ? (
                                  <div className="flex items-center gap-1">
                                    <input
                                      type="text"
                                      value={editingCode[r.id] || ""}
                                      onChange={e => {
                                        const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8);
                                        setEditingCode(prev => ({ ...prev, [r.id]: val }));
                                        if (codeError[r.id]) setCodeError(prev => ({ ...prev, [r.id]: "" }));
                                      }}
                                      placeholder="XXXX00"
                                      maxLength={8}
                                      className="w-[70px] px-1.5 py-0.5 rounded border text-[12px] font-mono font-bold outline-none tracking-widest"
                                      style={{ borderColor: codeError[r.id] ? "#ff3b30" : "#00b398", color: "#00b398" }}
                                    />
                                    <button onClick={() => handleRegenCode(r)} className="p-0.5 rounded hover:bg-[#f5f5f7] text-[#86868b] hover:text-[#00b398] transition-colors" title="코드 재생성">
                                      <RefreshCw className="w-3 h-3" />
                                    </button>
                                  </div>
                                ) : r.issuedCode ? (
                                  <span className="font-mono font-bold text-[13px] tracking-widest" style={{ color: "#00b398" }}>{r.issuedCode}</span>
                                ) : (
                                  <span className="text-[#9ca3af] text-[11px]">—</span>
                                )}
                                {codeError[r.id] && <p className="text-[10px] text-red-500 mt-0.5">{codeError[r.id]}</p>}
                              </td>
                              {/* 처리 버튼 */}
                              <td className="px-1.5 py-1">
                                {isEditing ? (
                                  <div className="flex gap-1 justify-center">
                                    <button
                                      onClick={() => {
                                        if (!reqEditRow) return;
                                        const origCode = r.issuedCode;
                                        const newCode = reqEditRow.issuedCode;
                                        // 클라이언트 측 동일 보건소 내 중복 코드 검증 (코드 변경 여부와 무관하게 항상 검사)
                                        if (newCode) {
                                          const duplicate = requests.find(
                                            req => req.id !== r.id &&
                                                   req.centerCode === r.centerCode &&
                                                   req.issuedCode === newCode
                                          );
                                          if (duplicate) {
                                            setReqEditDupError(`이미 사용 중: '${duplicate.deptName}'`);
                                            toast.error(`이미 등록된 코드입니다.`, {
                                              description: `'${duplicate.deptName}' 부서에서 사용 중인 코드입니다.`
                                            });
                                            return;
                                          }
                                        }
                                        setReqEditDupError("");
                                        if (r.status === "approved" && origCode && newCode && origCode !== newCode) {
                                          if (!window.confirm(`⚠️ 발급코드를 "${origCode}" → "${newCode}"로 변경합니다.\n이미 이 코드로 로그인한 사용자에게 영향을 줄 수 있습니다.\n계속하시겠습니까?`)) return;
                                        }
                                        updateRequestMutation.mutate({
                                          id: Number(r.id),
                                          centerName: reqEditRow.centerName || undefined,
                                          deptName: reqEditRow.deptName || undefined,
                                          managerName: reqEditRow.managerName || undefined,
                                          phone: reqEditRow.phone || undefined,
                                          email: reqEditRow.email || undefined,
                                          bizNo: reqEditRow.bizNo || undefined,
                                          issuedCode: reqEditRow.issuedCode || undefined,
                                          status: reqEditRow.status,
                                        }, {
                                          onSuccess: () => {
                                            toast.success("수정되었습니다.", { description: `${reqEditRow.centerName} - ${reqEditRow.deptName}` });
                                            setReqEditId(null); setReqEditRow(null); setReqEditCodeWarn(""); setReqEditDupError("");
                                          },
                                          onError: (e) => {
                                            toast.error("수정 실패", { description: e.message });
                                          }
                                        });
                                      }}
                                      className="px-2 py-0.5 rounded text-[11px] font-semibold text-white whitespace-nowrap"
                                      style={{ background: "#00b398" }}
                                    >저장</button>
                                    <button
                                      onClick={() => { setReqEditId(null); setReqEditRow(null); setReqEditDupError(""); setReqEditCodeWarn(""); }}
                                      className="px-2 py-0.5 rounded text-[11px] font-medium text-[#6b7280] bg-[#f3f4f6] hover:bg-[#e5e7eb] whitespace-nowrap"
                                    >취소</button>
                                  </div>
                                ) : (
                                  <div className="flex flex-row flex-wrap gap-1 items-center">
                                    {/* 승인/거절/발급 처리 버튼 */}
                                    {r.status === "pending" && (
                                      <>
                                        <button onClick={() => handleReject(r.id)} className="px-1.5 py-0.5 rounded text-[10px] font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors whitespace-nowrap">거절</button>
                                        <button onClick={() => handleStartApprove(r)} className="px-1.5 py-0.5 rounded text-[10px] font-medium text-white whitespace-nowrap transition-opacity active:opacity-80" style={{ background: "#00b398" }}>승인</button>
                                      </>
                                    )}
                                    {r.status === "approving" && (
                                      <>
                                        <button onClick={() => handleCancelApprove(r.id)} className="px-1.5 py-0.5 rounded text-[10px] font-medium text-[#6b7280] bg-[#f3f4f6] hover:bg-[#e5e7eb] transition-colors whitespace-nowrap">취소</button>
                                        <button onClick={() => handleConfirmApprove(r.id)} className="px-1.5 py-0.5 rounded text-[10px] font-semibold text-white whitespace-nowrap transition-opacity active:opacity-80" style={{ background: "#00b398" }}>확정</button>
                                      </>
                                    )}
                                    {r.status === "approved" && (
                                      <button
                                        onClick={() => setEmailPreviewId(emailPreviewId === r.id ? null : r.id)}
                                        className="px-1.5 py-0.5 rounded text-[10px] font-medium whitespace-nowrap transition-colors flex items-center gap-0.5"
                                        style={{ background: emailPreviewId === r.id ? "rgba(0,179,152,0.15)" : "rgba(0,179,152,0.08)", color: "#00b398" }}
                                      >
                                        <Mail className="w-2.5 h-2.5" />이메일
                                      </button>
                                    )}
                                    {r.status === "rejected" && <span className="text-[10px] text-[#9ca3af]">완료</span>}
                                    {/* 수정 버튼 */}
                                    <button
                                      onClick={() => {
                                        setReqEditId(r.id);
                                        setReqEditDupError("");
                                        setReqEditCodeWarn("");
                                        setReqEditRow({
                                          centerName: r.centerName,
                                          deptName: r.deptName,
                                          managerName: r.managerName,
                                          phone: r.phone || "",
                                          email: r.email || "",
                                          bizNo: r.bizNumber || "",
                                          issuedCode: r.issuedCode || "",
                                          status: (r.status === "approving" ? "pending" : r.status) as "pending" | "approved" | "rejected",
                                        });
                                      }}
                                      className="px-1.5 py-0.5 rounded text-[10px] font-medium text-[#374151] bg-[#f3f4f6] hover:bg-[#e5e7eb] transition-colors whitespace-nowrap flex items-center gap-0.5"
                                    >
                                      <Pencil className="w-2.5 h-2.5" />수정
                                    </button>
                                    {/* 삭제 버튼 */}
                                    <button
                                      onClick={() => {
                                        const isApproved = r.status === "approved";
                                        const msg = isApproved
                                          ? `⚠️ 승인된 신청건입니다.\n"${r.centerName} - ${r.deptName}" (발급코드: ${r.issuedCode || "없음"})\n\n삭제하면 해당 코드로 로그인한 사용자의 접근이 차단될 수 있습니다.\n정말 삭제하시겠습니까?`
                                          : `"${r.centerName} - ${r.deptName}" 신청건을 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`;
                                        if (window.confirm(msg)) {
                                          deleteRequestMutation.mutate({ id: Number(r.id) }, { onSuccess: () => toast.success("삭제되었습니다.", { description: `${r.centerName} - ${r.deptName}` }) });
                                        }
                                      }}
                                      className="px-1.5 py-0.5 rounded text-[10px] font-medium text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors whitespace-nowrap flex items-center gap-0.5"
                                    >
                                      <Trash2 className="w-2.5 h-2.5" />삭제
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* 페이지네이션 */}
                  {reqTotalPages > 1 && (
                    <div className="flex items-center justify-between px-5 py-3 border-t border-[#f0f0f5]">
                      <span className="text-[12px] text-[#86868b]">{reqPageSafe} / {reqTotalPages} 페이지 ({filteredRequests.length}건)</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setReqPage(1)}
                          disabled={reqPageSafe === 1}
                          className="px-2.5 py-1.5 rounded-lg text-[12px] font-medium text-[#86868b] bg-[#f5f5f7] hover:bg-[#e5e5ea] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >«</button>
                        <button
                          onClick={() => setReqPage(p => Math.max(1, p - 1))}
                          disabled={reqPageSafe === 1}
                          className="px-2.5 py-1.5 rounded-lg text-[12px] font-medium text-[#86868b] bg-[#f5f5f7] hover:bg-[#e5e5ea] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >‹</button>
                        {Array.from({ length: Math.min(5, reqTotalPages) }, (_, i) => {
                          const start = Math.max(1, Math.min(reqPageSafe - 2, reqTotalPages - 4));
                          const page = start + i;
                          return (
                            <button
                              key={page}
                              onClick={() => setReqPage(page)}
                              className={`w-8 h-8 rounded-lg text-[12px] font-medium transition-colors ${
                                page === reqPageSafe ? "text-white" : "text-[#86868b] bg-[#f5f5f7] hover:bg-[#e5e5ea]"
                              }`}
                              style={page === reqPageSafe ? { background: "#00b398" } : {}}
                            >{page}</button>
                          );
                        })}
                        <button
                          onClick={() => setReqPage(p => Math.min(reqTotalPages, p + 1))}
                          disabled={reqPageSafe === reqTotalPages}
                          className="px-2.5 py-1.5 rounded-lg text-[12px] font-medium text-[#86868b] bg-[#f5f5f7] hover:bg-[#e5e5ea] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >›</button>
                        <button
                          onClick={() => setReqPage(reqTotalPages)}
                          disabled={reqPageSafe === reqTotalPages}
                          className="px-2.5 py-1.5 rounded-lg text-[12px] font-medium text-[#86868b] bg-[#f5f5f7] hover:bg-[#e5e5ea] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >»</button>
                      </div>
                    </div>
                  )}

                  {/* 이메일 미리보기 패널 (테이블 아래) */}
                  {emailPreviewId && (() => {
                    const r = requests.find(x => x.id === emailPreviewId);
                    if (!r) return null;
                    return (
                      <div className="border-t border-[#e5e5ea] px-5 py-4 flex flex-col gap-2.5" style={{ background: "rgba(0,179,152,0.03)" }}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2"><Mail className="w-4 h-4" style={{ color: "#00b398" }} /><p className="text-[13px] font-semibold text-[#1d1d1f]">이메일 발송 안내 — {r.centerName} / {r.deptName}</p></div>
                          <button onClick={() => setEmailPreviewId(null)} className="text-[#86868b] hover:text-[#1d1d1f] text-[11px]">닫기</button>
                        </div>
                        <div className="rounded-xl p-3 text-[12px] leading-relaxed border" style={{ background: "rgba(0,0,0,0.02)", borderColor: "rgba(0,179,152,0.2)" }}>
                          <p className="text-[#86868b] mb-1">수신: <span className="text-[#1d1d1f] font-medium">{r.email}</span></p>
                          <p className="text-[#86868b] mb-1">제목: <span className="text-[#1d1d1f]">[보건소플러스] 가입 승인 및 담당자 코드 안내</span></p>
                          <div className="border-t border-[#e5e5ea] mt-2 pt-2 text-[#424245]">
                            <p>안녕하세요, {r.managerName} 담당자님.</p>
                            <p className="mt-1">보건소플러스 가입 신청이 승인되었습니다.</p>
                            <p className="mt-1">• 보건소: <strong>{r.centerName}</strong> ({r.centerCode})</p>
                            <p>• 부서: <strong>{r.deptName}</strong></p>
                            <p>• 담당자 코드: <strong className="font-mono text-[15px] tracking-widest" style={{ color: "#00b398" }}>{r.issuedCode}</strong></p>
                            <p className="mt-1 text-[#86868b]">문의: 고객센터 1522-6401</p>
                          </div>
                        </div>
                        <a href={`mailto:${r.email}?subject=[보건소플러스] 가입 승인 및 담당자 코드 안내&body=안녕하세요, ${r.managerName} 담당자님.%0A%0A보건소플러스 가입 신청이 승인되었습니다.%0A%0A• 보건소: ${r.centerName} (${r.centerCode})%0A• 부서: ${r.deptName}%0A• 담당자 코드: ${r.issuedCode}%0A%0A문의: 고객센터 1522-6401`}
                          className="self-start flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold text-white" style={{ background: "#00b398" }}>
                          <ExternalLink className="w-3.5 h-3.5" /> 이메일 앱으로 발송하기
                        </a>
                      </div>
                    );
                  })()}
                </div>
              );
            })()}
          </div>
        )}

        {/* ── 탭 C: 발급 이력 ────────────────────────────────────────────────────── */}
        {activeTab === "history" && (
          <div className="flex flex-col gap-4">
            {/* 요약 카드 */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "전체 발급", value: issuedHistory.length, color: "#00b398" },
                { label: "이번 달 발급", value: issuedHistory.filter(r => (r.approvedAt || "").startsWith(new Date().toISOString().slice(0, 7))).length, color: "#007aff" },
                { label: "지역 수", value: new Set(issuedHistory.map(r => HEALTH_CENTERS.find(c => c.code === r.centerCode)?.region || "")).size, color: "#ff9500" },
              ].map(stat => (
                <div key={stat.label} className="bg-white rounded-2xl shadow-sm p-4 flex flex-col gap-1">
                  <p className="text-[12px] text-[#86868b]">{stat.label}</p>
                  <p className="text-[28px] font-bold font-mono" style={{ color: stat.color }}>{stat.value}</p>
                </div>
              ))}
            </div>

            {/* 검색 + 필터 + CSV 내보내기 */}
            <div className="flex gap-2">
              <div className="flex-1 flex items-center gap-2.5 rounded-xl px-3.5 py-3 bg-white shadow-sm">
                <Search className="w-4 h-4 text-[#86868b]" />
                <input
                  type="text"
                  value={historySearch}
                  onChange={e => setHistorySearch(e.target.value)}
                  placeholder="보건소명, 담당자, 코드, 부서명, 이메일 검색"
                  className="flex-1 bg-transparent text-[14px] text-[#1d1d1f] placeholder:text-[#c7c7cc] outline-none"
                />
                {historySearch && <button onClick={() => setHistorySearch("")} className="text-[#86868b] hover:text-[#1d1d1f]"><XCircle className="w-4 h-4" /></button>}
              </div>

              {/* 지역 필터 */}
              <div className="relative">
                <select
                  value={historyRegionFilter}
                  onChange={e => setHistoryRegionFilter(e.target.value)}
                  className="appearance-none bg-white shadow-sm rounded-xl px-4 py-3 pr-8 text-[13px] font-medium text-[#1d1d1f] outline-none cursor-pointer"
                >
                  <option value="all">전체 지역</option>
                  {regionOptions.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#86868b] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* 정렬 */}
              <button
                onClick={() => setHistorySortAsc(!historySortAsc)}
                className="flex items-center gap-1.5 bg-white shadow-sm rounded-xl px-4 py-3 text-[13px] font-medium text-[#424245] hover:text-[#1d1d1f] transition-colors"
              >
                {historySortAsc ? "오래된 순" : "최신 순"}
              </button>

              {/* CSV 내보내기 */}
              <button
                onClick={handleExportCsv}
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-[13px] font-semibold text-white transition-opacity active:opacity-80"
                style={{ background: "#00b398" }}
              >
                <Download className="w-4 h-4" /> CSV 내보내기
              </button>
            </div>

            {/* 이력 테이블 */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {filteredHistory.length === 0 ? (
                <div className="py-12 flex flex-col items-center gap-2 text-[#86868b]">
                  <History className="w-8 h-8 opacity-30" />
                  <p className="text-[14px]">발급된 담당자 코드가 없습니다.</p>
                  {(historySearch || historyRegionFilter !== "all") && (
                    <button onClick={() => { setHistorySearch(""); setHistoryRegionFilter("all"); }}
                      className="text-[13px] underline underline-offset-2" style={{ color: "#00b398" }}>필터 초기화</button>
                  )}
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#f5f5f7]">
                      {[
                        { label: "담당자 코드", w: "w-28" },
                        { label: "보건소명", w: "" },
                        { label: "지역", w: "w-28" },
                        { label: "부서", w: "w-28" },
                        { label: "담당자", w: "w-20" },
                        { label: "이메일", w: "" },
                        { label: "승인일", w: "w-24" },
                      ].map(h => (
                        <th key={h.label} className={`text-left text-[11px] font-semibold text-[#86868b] uppercase tracking-wide px-4 py-3 ${h.w}`}>{h.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHistory.map((r, i) => {
                      const hc = HEALTH_CENTERS.find(c => c.code === r.centerCode);
                      return (
                        <tr key={r.id} className={`${i < filteredHistory.length - 1 ? "border-b border-[#f5f5f7]" : ""} hover:bg-[#fafafa] transition-colors`}>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[13px] font-mono font-bold" style={{ background: "rgba(0,179,152,0.1)", color: "#00b398" }}>
                              {r.issuedCode}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-[13px] font-medium text-[#1d1d1f]">{r.centerName}</td>
                          <td className="px-4 py-3 text-[12px] text-[#6e6e73]">{hc?.region || "-"}</td>
                          <td className="px-4 py-3 text-[12px] text-[#424245]">{r.deptName}</td>
                          <td className="px-4 py-3 text-[12px] text-[#424245]">{r.managerName}</td>
                          <td className="px-4 py-3 text-[12px] text-[#86868b]">{r.email}</td>
                          <td className="px-4 py-3 text-[12px] text-[#86868b]">{r.approvedAt || "-"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {filteredHistory.length > 0 && (
              <p className="text-[12px] text-[#86868b] text-right">
                총 <span className="font-semibold text-[#1d1d1f]">{filteredHistory.length}</span>건 표시 중
                {(historySearch || historyRegionFilter !== "all") && ` (전체 ${issuedHistory.length}건 중 필터됨)`}
              </p>
            )}
          </div>
        )}

        {/* ── 탭 D: 설정 ──────────────────────────────────────────────────── */}
        {/* ── 탭 E: 기존 명함 디자인 ──────────────────────────────────────────── */}
        {activeTab === "namecard-designs" && (
          <Suspense fallback={<div className="flex items-center justify-center py-16"><RefreshCw className="w-5 h-5 animate-spin text-[#00A39B]" /></div>}>
            <AdminNamecardDesigns />
          </Suspense>
        )}

        {activeTab === "settings" && (
          <div className="flex flex-col gap-4 max-w-md">
            <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col gap-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(0,179,152,0.12)" }}>
                  <Key className="w-4 h-4" style={{ color: "#00b398" }} />
                </div>
                <div>
                  <p className="text-[15px] font-semibold text-[#1d1d1f]">비밀번호 변경</p>
                  <p className="text-[12px] text-[#86868b]">관리자 로그인 비밀번호를 변경합니다</p>
                </div>
              </div>
              {pwSuccess && (
                <div className="rounded-xl px-4 py-3 flex items-center gap-3 text-[13px] font-semibold border" style={{ background: "rgba(0,179,152,0.10)", color: "#00b398", borderColor: "rgba(0,179,152,0.25)" }}>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(0,179,152,0.15)" }}>
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold">비밀번호가 변경되었습니다.</p>
                    <p className="text-[11px] font-normal" style={{ color: "#00b398", opacity: 0.8 }}>다음 로그인부터 새 비밀번호를 사용하세요.</p>
                  </div>
                </div>
              )}
              <div className="flex flex-col gap-3">
                {[
                  { field: "current", label: "현재 비밀번호", placeholder: "현재 비밀번호 입력" },
                  { field: "next", label: "새 비밀번호", placeholder: "6자 이상 입력" },
                  { field: "confirm", label: "새 비밀번호 확인", placeholder: "새 비밀번호 재입력" },
                ].map(({ field, label, placeholder }) => (
                  <div key={field} className="flex flex-col gap-1">
                    <label className="text-[12px] font-medium text-[#424245]">{label}</label>
                    <div className={`flex items-center gap-2.5 rounded-xl px-3.5 py-3 border transition-all ${pwErrors[field] ? "border-red-400 bg-red-50/30" : "border-[#e5e5ea] focus-within:border-[#00b398] bg-white/60"}`}>
                      <Key className="w-4 h-4 text-[#86868b] flex-shrink-0" />
                      <input
                        type={showPwForm[field] ? "text" : "password"}
                        value={(pwForm as Record<string, string>)[field]}
                        onChange={e => setPwForm(p => ({ ...p, [field]: e.target.value }))}
                        placeholder={placeholder}
                        className="flex-1 bg-transparent text-[14px] text-[#1d1d1f] placeholder:text-[#c7c7cc] outline-none"
                      />
                      <button onClick={() => setShowPwForm(p => ({ ...p, [field]: !p[field] }))} className="text-[#86868b] hover:text-[#1d1d1f]">
                        {showPwForm[field] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {pwErrors[field] && <p className="text-[11px] text-red-500 pl-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{pwErrors[field]}</p>}
                  </div>
                ))}
              </div>
              <button onClick={handleChangePw} className="w-full py-3 rounded-xl text-[14px] font-semibold text-white flex items-center justify-center gap-2 transition-opacity active:opacity-80" style={{ background: "#00b398" }}>
                <Key className="w-4 h-4" /> 비밀번호 변경
              </button>
            </div>

            {/* JSON 데이터 백업 */}
            <div className="bg-white rounded-2xl shadow-sm p-5 flex flex-col gap-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(0,122,255,0.10)" }}>
                  <Download className="w-4 h-4" style={{ color: "#007aff" }} />
                </div>
                <div>
                  <p className="text-[15px] font-semibold text-[#1d1d1f]">데이터 백업 (JSON)</p>
                  <p className="text-[12px] text-[#86868b]">실제 데이터를 JSON 파일로 내보내 비상 시 복원하세요</p>
                </div>
              </div>
              <div className="flex flex-col gap-2.5">
                <button
                  onClick={() => {
                    const data = {
                      exportedAt: new Date().toISOString(),
                      version: "1.0",
                      requests,
                      centers,
                    };
                    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `보건소플러스_백업_${new Date().toISOString().slice(0, 10)}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                    toast.success("데이터 백업이 다운로드되었습니다.", { description: `가입신청 ${requests.length}건 + 등록보건소 ${centers.length}건` });
                  }}
                  className="w-full py-2.5 rounded-xl text-[13px] font-semibold text-white flex items-center justify-center gap-2 transition-opacity active:opacity-80"
                  style={{ background: "#007aff" }}
                >
                  <Download className="w-4 h-4" />
                  전체 데이터 다운로드
                  <span className="text-[11px] font-normal opacity-80">(가입신청 {requests.length}건 + 등록보건소 {centers.length}건)</span>
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), requests }, null, 2)], { type: "application/json" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `가입신청_백업_${new Date().toISOString().slice(0, 10)}.json`;
                      a.click();
                      URL.revokeObjectURL(url);
                      toast.success("가입신청 백업 다운로드 완료", { description: `${requests.length}건` });
                    }}
                    className="flex-1 py-2.5 rounded-xl text-[13px] font-medium flex items-center justify-center gap-1.5 border border-[#e5e5ea] hover:border-blue-300 hover:bg-blue-50/30 transition-all"
                    style={{ color: "#007aff" }}
                  >
                    <Download className="w-3.5 h-3.5" /> 가입신청만
                  </button>
                  <button
                    onClick={() => {
                      const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), centers }, null, 2)], { type: "application/json" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `등록보건소_백업_${new Date().toISOString().slice(0, 10)}.json`;
                      a.click();
                      URL.revokeObjectURL(url);
                      toast.success("등록보건소 백업 다운로드 완료", { description: `${centers.length}건` });
                    }}
                    className="flex-1 py-2.5 rounded-xl text-[13px] font-medium flex items-center justify-center gap-1.5 border border-[#e5e5ea] hover:border-blue-300 hover:bg-blue-50/30 transition-all"
                    style={{ color: "#007aff" }}
                  >
                    <Download className="w-3.5 h-3.5" /> 등록보건소만
                  </button>
                </div>
                <p className="text-[11px] text-[#86868b] pl-1">⚠️ 데이터 초기화 전 반드시 백업하세요. JSON 파일은 비구조화된 형태로 저장됩니다.</p>
              </div>
            </div>

            {/* 데이터 초기화 */}
            <div className="bg-white rounded-2xl shadow-sm p-5 flex flex-col gap-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,59,48,0.10)" }}>
                  <Trash2 className="w-4 h-4" style={{ color: "#ff3b30" }} />
                </div>
                <div>
                  <p className="text-[15px] font-semibold text-[#1d1d1f]">데이터 초기화</p>
                  <p className="text-[12px] text-[#86868b]">가상·테스트 데이터를 삭제하고 실제 데이터만 유지합니다</p>
                </div>
              </div>
              <div className="flex flex-col gap-2.5">
                {/* 가입신청 초기화 */}
                {clearConfirm === "requests" ? (
                  <div className="rounded-xl p-3.5 border flex flex-col gap-2.5" style={{ borderColor: "rgba(255,59,48,0.3)", background: "rgba(255,59,48,0.04)" }}>
                    <div className="flex items-center gap-2 text-[13px] font-semibold" style={{ color: "#ff3b30" }}>
                      <AlertTriangle className="w-4 h-4" />
                      가입신청 데이터 {requests.length}건을 모두 삭제합니다. 복구할 수 없습니다.
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setClearConfirm(null)} className="flex-1 py-2 rounded-lg text-[13px] font-medium text-[#424245] bg-[#f5f5f7] hover:bg-[#e5e5ea] transition-colors">취소</button>
                      <button onClick={() => { deleteRequestMutation.mutate({ deleteAll: true }, { onSuccess: () => { setClearConfirm(null); toast.success("가입신청 데이터가 초기화되었습니다."); } }); }} className="flex-1 py-2 rounded-lg text-[13px] font-semibold text-white transition-opacity active:opacity-80" style={{ background: "#ff3b30" }}>삭제 확인</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setClearConfirm("requests")} className="w-full py-2.5 rounded-xl text-[13px] font-medium text-left px-4 border border-[#e5e5ea] hover:border-red-300 hover:bg-red-50/30 transition-all flex items-center justify-between group">
                    <span className="text-[#1d1d1f]">가입신청 데이터 초기화</span>
                    <span className="text-[12px] font-mono px-2 py-0.5 rounded-full" style={{ background: "rgba(255,59,48,0.08)", color: "#ff3b30" }}>{requests.length}건</span>
                  </button>
                )}
                {/* 등록보건소 초기화 */}
                {clearConfirm === "centers" ? (
                  <div className="rounded-xl p-3.5 border flex flex-col gap-2.5" style={{ borderColor: "rgba(255,59,48,0.3)", background: "rgba(255,59,48,0.04)" }}>
                    <div className="flex items-center gap-2 text-[13px] font-semibold" style={{ color: "#ff3b30" }}>
                      <AlertTriangle className="w-4 h-4" />
                      등록보건소 데이터 {centers.length}건을 모두 삭제합니다. 복구할 수 없습니다.
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setClearConfirm(null)} className="flex-1 py-2 rounded-lg text-[13px] font-medium text-[#424245] bg-[#f5f5f7] hover:bg-[#e5e5ea] transition-colors">취소</button>
                      <button onClick={() => { deleteCenterMutation.mutate({ deleteAll: true }, { onSuccess: () => { setClearConfirm(null); toast.success("등록보건소 데이터가 초기화되었습니다."); } }); }} className="flex-1 py-2 rounded-lg text-[13px] font-semibold text-white transition-opacity active:opacity-80" style={{ background: "#ff3b30" }}>삭제 확인</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setClearConfirm("centers")} className="w-full py-2.5 rounded-xl text-[13px] font-medium text-left px-4 border border-[#e5e5ea] hover:border-red-300 hover:bg-red-50/30 transition-all flex items-center justify-between group">
                    <span className="text-[#1d1d1f]">등록보건소 데이터 초기화</span>
                    <span className="text-[12px] font-mono px-2 py-0.5 rounded-full" style={{ background: "rgba(255,59,48,0.08)", color: "#ff3b30" }}>{centers.length}건</span>
                  </button>
                )}
                {/* 전체 초기화 */}
                {clearConfirm === "all" ? (
                  <div className="rounded-xl p-3.5 border flex flex-col gap-2.5" style={{ borderColor: "rgba(255,59,48,0.3)", background: "rgba(255,59,48,0.04)" }}>
                    <div className="flex items-center gap-2 text-[13px] font-semibold" style={{ color: "#ff3b30" }}>
                      <AlertTriangle className="w-4 h-4" />
                      가입신청 {requests.length}건 + 등록보건소 {centers.length}건을 모두 삭제합니다.
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setClearConfirm(null)} className="flex-1 py-2 rounded-lg text-[13px] font-medium text-[#424245] bg-[#f5f5f7] hover:bg-[#e5e5ea] transition-colors">취소</button>
                      <button onClick={() => { Promise.all([deleteRequestMutation.mutateAsync({ deleteAll: true }), deleteCenterMutation.mutateAsync({ deleteAll: true })]).then(() => { setClearConfirm(null); toast.success("모든 데이터가 초기화되었습니다."); }).catch(e => toast.error("초기화 실패: " + e.message)); }} className="flex-1 py-2 rounded-lg text-[13px] font-semibold text-white transition-opacity active:opacity-80" style={{ background: "#ff3b30" }}>전체 삭제 확인</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setClearConfirm("all")} className="w-full py-2.5 rounded-xl text-[13px] font-semibold text-left px-4 border transition-all flex items-center justify-between" style={{ borderColor: "rgba(255,59,48,0.3)", color: "#ff3b30", background: "rgba(255,59,48,0.04)" }}>
                    <span>전체 데이터 초기화 (가입신청 + 등록보건소)</span>
                    <span className="text-[12px] font-mono px-2 py-0.5 rounded-full" style={{ background: "rgba(255,59,48,0.12)", color: "#ff3b30" }}>{requests.length + centers.length}건</span>
                  </button>
                )}
              </div>
            </div>

            {/* 코드 생성 규칙 안내 */}
            <div className="bg-white rounded-2xl shadow-sm p-5 flex flex-col gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(0,179,152,0.12)" }}>
                  <Sparkles className="w-4 h-4" style={{ color: "#00b398" }} />
                </div>
                <div>
                  <p className="text-[15px] font-semibold text-[#1d1d1f]">담당자 코드 생성 규칙</p>
                  <p className="text-[12px] text-[#86868b]">자동 생성 시 적용되는 규칙</p>
                </div>
              </div>
              <div className="rounded-xl p-3.5 text-[12px] leading-relaxed" style={{ background: "rgba(0,0,0,0.03)" }}>
                <p className="font-semibold text-[#1d1d1f] mb-2">형식: <span className="font-mono" style={{ color: "#00b398" }}>CC + DD + NN</span></p>
                <div className="flex flex-col gap-1.5 text-[#424245]">
                  <p><span className="font-mono font-bold text-[#1d1d1f]">CC</span> — 보건소 코드 앞 2자 (예: SE, GG, IC)</p>
                  <p><span className="font-mono font-bold text-[#1d1d1f]">DD</span> — 부서명 이니셜 2자 (예: HJ=건강증진, GM=감염병)</p>
                  <p><span className="font-mono font-bold text-[#1d1d1f]">NN</span> — 동일 접두사 내 순번 (01, 02, …)</p>
                </div>
                <div className="border-t border-[#e5e5ea] mt-2.5 pt-2.5">
                  <p className="text-[#86868b] mb-1.5">부서 이니셜 매핑</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    {[["건강증진", "HJ"], ["감염병", "GM"], ["금연", "GY"], ["구강", "GG"], ["모자", "MJ"], ["영양", "YY"], ["정신", "JS"], ["재활", "JH"], ["치매", "CM"], ["결핵", "GT"]].map(([k, v]) => (
                      <p key={k}><span className="font-mono font-semibold text-[#1d1d1f]">{v}</span> = {k}</p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>

    {/* 부서 현황 모달 - 아래 위치로 이동 필요 */}
    {deptModalCenter && (() => {
      const modalReqs = requests.filter(r => r.centerCode === deptModalCenter.code);
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.45)" }}
          onClick={e => { if (e.target === e.currentTarget) setDeptModalCenter(null); }}
        >
          <div className="bg-white shadow-2xl flex flex-col overflow-hidden" style={{ width: "min(720px, 95vw)", maxHeight: "80vh", borderRadius: "3px" }}>
            {/* 모달 헤더 */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e5e5ea]">
              <div>
                <p className="text-[17px] font-bold text-[#1d1d1f]">{deptModalCenter.name}</p>
                <p className="text-[12px] text-[#86868b] mt-0.5">부서 현황 — 전체 {modalReqs.length}건</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { setActiveTab("requests"); setReqSearchQuery(deptModalCenter.name); setReqPage(1); setDeptModalCenter(null); }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold text-white transition-opacity active:opacity-80"
                  style={{ background: "#00b398" }}
                >
                  <ExternalLink className="w-3.5 h-3.5" /> 가입신청 탭에서 보기
                </button>
                <button onClick={() => setDeptModalCenter(null)} className="w-8 h-8 rounded-full flex items-center justify-center bg-[#f5f5f7] hover:bg-[#e5e5ea] transition-colors">
                  <X className="w-4 h-4 text-[#86868b]" />
                </button>
              </div>
            </div>
            {/* 모달 본문 */}
            <div className="overflow-y-auto flex-1">
              {modalReqs.length === 0 ? (
                <div className="py-12 flex flex-col items-center gap-2 text-[#86868b]">
                  <Users className="w-8 h-8 opacity-30" />
                  <p className="text-[14px]">등록된 부서가 없습니다.</p>
                </div>
              ) : (
                <table className="w-full text-[13px] border-collapse">
                  <thead>
                    <tr style={{ background: "#f5f5f7", position: "sticky", top: 0 }}>
                      {["#", "부서명", "담당자", "상태", "발급코드", "신청일"].map(h => (
                        <th key={h} className="text-left px-4 py-2.5 text-[11px] font-semibold text-[#86868b] border-b border-[#e5e5ea] whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {modalReqs.map((r, idx) => (
                      <tr key={r.id} className={`hover:bg-[#fafafa] ${idx < modalReqs.length - 1 ? "border-b border-[#f0f0f5]" : ""}`}>
                        <td className="px-4 py-3 text-[11px] text-[#86868b] font-mono">{idx + 1}</td>
                        <td className="px-4 py-3 font-medium text-[#1d1d1f] whitespace-nowrap">{r.deptName}</td>
                        <td className="px-4 py-3 text-[#424245]">{r.managerName}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                            r.status === "approved" ? "bg-green-50 text-green-600" :
                            r.status === "rejected" ? "bg-red-50 text-red-500" :
                            "bg-amber-50 text-amber-600"
                          }`}>
                            {r.status === "approved" ? "승인" : r.status === "rejected" ? "거절" : "대기"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {r.issuedCode ? (
                            <span className="font-mono text-[12px] font-bold tracking-wider" style={{ color: "#007aff" }}>{r.issuedCode}</span>
                          ) : <span className="text-[11px] text-[#c7c7cc]">—</span>}
                        </td>
                        <td className="px-4 py-3 text-[12px] text-[#86868b] whitespace-nowrap">{r.submittedAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      );
    })()}

    {/* ── 탭: 사업자 정보 관리 ─────────────────────────────────────────────── */}
    {activeTab === "business-info" && (
      <div className="w-[95vw] mx-auto px-4 py-8">
        <AdminBusinessInfoTab />
      </div>
    )}
    </>
  );
}

// ── 사업자 정보 관리 탭 컴포넌트 ─────────────────────────────────────────────
function AdminBusinessInfoTab() {
  const { data: allBizInfo = [], refetch } = trpc.businessInfo.listAll.useQuery();
  const createMutation = trpc.businessInfo.create.useMutation({ onSuccess: () => { refetch(); setShowForm(false); setForm(emptyForm); toast.success("사업자 정보가 등록되었습니다."); } });
  const updateMutation = trpc.businessInfo.update.useMutation({ onSuccess: () => { refetch(); setEditId(null); toast.success("사업자 정보가 수정되었습니다."); } });
  const deleteMutation = trpc.businessInfo.delete.useMutation({ onSuccess: () => { refetch(); toast.success("삭제되었습니다."); } });

  const emptyForm = { centerCode: "", centerName: "", bizNo: "", representative: "", bizAddress: "", bizType: "", bizItem: "", taxEmail: "" };
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [searchQ, setSearchQ] = useState("");
  const { toast: _t } = { toast: (m: { title: string }) => {} }; // unused

  const filtered = allBizInfo.filter(b => {
    const q = searchQ.toLowerCase();
    return !q || b.centerName.toLowerCase().includes(q) || b.bizNo.includes(q) || (b.representative || "").toLowerCase().includes(q);
  });

  return (
    <div className="flex flex-col gap-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[16px] font-semibold text-[#1d1d1f]">사업자 정보 관리</h3>
          <p className="text-[12px] text-[#86868b] mt-0.5">보건소별 사업자등록증 정보를 사전 등록합니다. 주문 시 자동으로 연결됩니다.</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setForm(emptyForm); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-opacity active:opacity-80"
          style={{ background: "#00A39B" }}
        >
          <Plus className="w-4 h-4" />
          사업자 정보 등록
        </button>
      </div>

      {/* 검색 */}
      <div className="flex items-center gap-2.5 rounded-xl px-3.5 py-3 bg-white shadow-sm">
        <Search className="w-4 h-4 text-[#86868b]" />
        <input
          type="text"
          value={searchQ}
          onChange={e => setSearchQ(e.target.value)}
          placeholder="보건소명, 사업자번호, 대표자 검색"
          className="flex-1 bg-transparent text-[14px] text-[#1d1d1f] placeholder:text-[#c7c7cc] outline-none"
        />
        {searchQ && <button onClick={() => setSearchQ("")} className="text-[#86868b]"><XCircle className="w-4 h-4" /></button>}
      </div>

      {/* 등록 폼 */}
      {showForm && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#e5e5ea]">
          <h4 className="text-[14px] font-semibold text-[#1d1d1f] mb-4">새 사업자 정보 등록</h4>
          <div className="grid grid-cols-2 gap-3">
            {([
              { key: "centerCode", label: "보건소 코드", placeholder: "예: HC001", required: true },
              { key: "centerName", label: "보건소명", placeholder: "예: 인천광역시 미추홀구보건소", required: true },
              { key: "bizNo", label: "사업자등록번호", placeholder: "000-00-00000", required: true },
              { key: "representative", label: "대표자명", placeholder: "예: 홍길동" },
              { key: "bizAddress", label: "사업장 주소", placeholder: "예: 인천광역시 미추홀구 석정로 17" },
              { key: "bizType", label: "업태", placeholder: "예: 보건업" },
              { key: "bizItem", label: "종목", placeholder: "예: 보건소" },
              { key: "taxEmail", label: "세금계산서 이메일", placeholder: "예: tax@health.go.kr" },
            ] as { key: keyof typeof emptyForm; label: string; placeholder: string; required?: boolean }[]).map(f => (
              <div key={f.key} className="flex flex-col gap-1">
                <label className="text-[12px] font-medium text-[#424245]">{f.label}{f.required && <span className="text-red-400 ml-0.5">*</span>}</label>
                <input
                  type="text"
                  value={form[f.key]}
                  onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  className="px-3 py-2 rounded-xl border border-[#e5e5ea] text-[13px] text-[#1d1d1f] placeholder:text-[#c7c7cc] outline-none focus:border-[#00A39B] transition-colors"
                />
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 rounded-xl text-[13px] font-medium text-[#424245] bg-[#f5f5f7] hover:bg-[#e5e5ea] transition-colors">취소</button>
            <button
              onClick={() => {
                if (!form.centerCode || !form.centerName || !form.bizNo) { toast.error("보건소 코드, 보건소명, 사업자번호는 필수입니다."); return; }
                createMutation.mutate(form);
              }}
              disabled={createMutation.isPending}
              className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-opacity active:opacity-80 disabled:opacity-50"
              style={{ background: "#00A39B" }}
            >
              {createMutation.isPending ? "등록 중..." : "등록"}
            </button>
          </div>
        </div>
      )}

      {/* 목록 */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-3 text-center">
            <FileText className="w-10 h-10 text-[#c7c7cc]" />
            <p className="text-[14px] font-medium text-[#86868b]">등록된 사업자 정보가 없습니다.</p>
            <p className="text-[12px] text-[#c7c7cc]">상단의 '사업자 정보 등록' 버튼으로 추가해 주세요.</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#f0f0f5]">
                {["보건소명", "사업자번호", "대표자", "업태/종목", "세금계산서 이메일", "관리"].map(h => (
                  <th key={h} className="px-4 py-3 text-[11px] font-semibold text-[#86868b] uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((b, idx) => (
                <tr key={b.id} className={`hover:bg-[#fafafa] ${idx < filtered.length - 1 ? "border-b border-[#f0f0f5]" : ""}`}>
                  {editId === b.id ? (
                    <>
                      <td colSpan={5} className="px-4 py-3">
                        <div className="grid grid-cols-3 gap-2">
                          {([
                            { key: "bizNo", label: "사업자번호" },
                            { key: "representative", label: "대표자" },
                            { key: "bizAddress", label: "주소" },
                            { key: "bizType", label: "업태" },
                            { key: "bizItem", label: "종목" },
                            { key: "taxEmail", label: "세금계산서 이메일" },
                          ] as { key: keyof typeof emptyForm; label: string }[]).map(f => (
                            <div key={f.key} className="flex flex-col gap-1">
                              <label className="text-[11px] text-[#86868b]">{f.label}</label>
                              <input
                                type="text"
                                value={editForm[f.key]}
                                onChange={e => setEditForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                                className="px-2.5 py-1.5 rounded-lg border border-[#e5e5ea] text-[12px] outline-none focus:border-[#00A39B]"
                              />
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2 mt-3">
                          <button onClick={() => setEditId(null)} className="px-4 py-1.5 rounded-lg text-[12px] font-medium text-[#424245] bg-[#f5f5f7]">취소</button>
                          <button
                            onClick={() => updateMutation.mutate({ id: b.id, bizNo: editForm.bizNo, representative: editForm.representative, bizAddress: editForm.bizAddress, bizType: editForm.bizType, bizItem: editForm.bizItem, taxEmail: editForm.taxEmail })}
                            className="px-4 py-1.5 rounded-lg text-[12px] font-semibold text-white"
                            style={{ background: "#00A39B" }}
                          >
                            저장
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3"></td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3">
                        <div className="font-medium text-[13px] text-[#1d1d1f]">{b.centerName}</div>
                        <div className="text-[11px] text-[#86868b] font-mono mt-0.5">{b.centerCode}</div>
                      </td>
                      <td className="px-4 py-3 font-mono text-[13px] text-[#1d1d1f]">{b.bizNo}</td>
                      <td className="px-4 py-3 text-[13px] text-[#424245]">{b.representative || <span className="text-[#c7c7cc]">—</span>}</td>
                      <td className="px-4 py-3 text-[12px] text-[#424245]">
                        {b.bizType || b.bizItem ? `${b.bizType || ""}${b.bizType && b.bizItem ? " / " : ""}${b.bizItem || ""}` : <span className="text-[#c7c7cc]">—</span>}
                      </td>
                      <td className="px-4 py-3 text-[12px] text-[#424245]">{b.taxEmail || <span className="text-[#c7c7cc]">—</span>}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => { setEditId(b.id); setEditForm({ centerCode: b.centerCode, centerName: b.centerName, bizNo: b.bizNo, representative: b.representative || "", bizAddress: b.bizAddress || "", bizType: b.bizType || "", bizItem: b.bizItem || "", taxEmail: b.taxEmail || "" }); }}
                            className="p-1.5 rounded-lg hover:bg-[#f0f0f5] text-[#86868b] hover:text-[#1d1d1f] transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => { if (confirm(`"${b.centerName}" 사업자 정보를 삭제하시겠습니까?`)) deleteMutation.mutate({ id: b.id }); }}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-[#86868b] hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
 
