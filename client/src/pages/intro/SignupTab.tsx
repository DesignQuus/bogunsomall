/*
 * SignupTab — 회원가입 탭
 * 1) 보건소명: 시·도 → 시·군·구 → 보건소 3단계 드릴다운 선택 (전국 249개 데이터)
 * 2) 선택 완료 시 보건소명·코드·지역 자동 입력
 * 3) 보건소 선택 시 DB 등록 데이터(주소/전화번호/사업자번호) 우선 표시
 * 4) 가입 신청 즉시 간편 로그인 번호 자동 발급 후 이메일 안내
 */

import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import {
  Building2, User, Phone, Mail,
  ChevronRight, CheckCircle2, AlertCircle,
  Search, MapPin, ChevronDown, X, Sparkles, Loader2
} from "lucide-react";
import { HEALTH_CENTERS } from "@/data/healthCenters";
import SharedDrilldownPicker, { type SelectedCenterInfo as SharedCenterInfo } from "@/components/DrilldownPicker";
import { trpc } from "@/lib/trpc";
import { loginState } from "@/pages/intro/constants";
import { addAccessLog } from "@/lib/centerStorage";
import { saveLoginInfo } from "@/lib/quickLoginStorage";

// ── 타입 ─────────────────────────────────────────────────────────────────────
interface FormData {
  centerName: string;
  centerCode: string;
  deptName: string;
  deptCode: string;
  managerName: string;
  phone: string;       // 부서 전화번호 (필수)
  mobilePhone: string;  // 핸드폰 번호 (선택)
  email: string;
}

interface FormErrors {
  centerName?: string;
  centerCode?: string;
  deptName?: string;
  deptCode?: string;
  managerName?: string;
  phone?: string;
  mobilePhone?: string;
  email?: string;
}

// ── 간편 로그인 번호 유틸 ───────────────────────────────────────────────────────────
// 4자리 숫자+영문 자유조합 (숫자만, 영문만, 혼합 모두 허용)
function isValidDeptCode(code: string): boolean {
  return /^[A-Z0-9]{4}$/.test(code);
}

// ── 드릴다운 유틸 ─────────────────────────────────────────────────────────────
const SIDO_LIST = Array.from(
  new Set(HEALTH_CENTERS.filter(c => c.region !== "테스트").map(c => c.region))
).sort();

function getDistrictList(sido: string): string[] {
  return Array.from(
    new Set(HEALTH_CENTERS.filter(c => c.region === sido).map(c => c.district))
  ).sort();
}

function getCentersByDistrict(sido: string, district: string) {
  return HEALTH_CENTERS.filter(c => c.region === sido && c.district === district);
}

// ── 포맷 유틸 ─────────────────────────────────────────────────────────────────
const formatPhone = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length === 0) return "";
  if (digits.startsWith("02")) {
    if (digits.length <= 2) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
    if (digits.length <= 9) return `${digits.slice(0, 2)}-${digits.slice(2, 5)}-${digits.slice(5)}`;
    return `${digits.slice(0, 2)}-${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  if (digits.length <= 10) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
};

// ── 필드 래퍼 ─────────────────────────────────────────────────────────────────
interface FieldProps {
  icon: React.ReactNode;
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  noBorder?: boolean;
}

function Field({ icon, label, required, error, hint, children, noBorder }: FieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[12px] font-medium text-[#424245] flex items-center gap-1.5">
        {label}
        {required && (
          <span
            className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
            style={{ background: "rgba(0,179,152,0.12)", color: "#00b398" }}
          >
            필수
          </span>
        )}
      </label>
      {!noBorder ? (
        <div
          className={`flex items-center gap-2.5 rounded-xl px-3.5 py-3 transition-all border ${
            error
              ? "border-red-400 bg-red-50/30"
              : "border-[#e5e5ea] focus-within:border-[#00b398] bg-white/60"
          }`}
        >
          <span className={`flex-shrink-0 ${error ? "text-red-400" : "text-[#86868b]"}`}>{icon}</span>
          {children}
        </div>
      ) : (
        <div className={`flex flex-col rounded-xl overflow-hidden transition-all border ${error ? "border-red-400" : "border-[#e5e5ea] focus-within:border-[#00b398]"}`}>
          {children}
        </div>
      )}
      {error && (
        <p className="text-[11px] text-red-500 pl-1 flex items-center gap-1">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />
          {error}
        </p>
      )}
      {hint && !error && (
        <p className="text-[11px] text-[#86868b] pl-1">{hint}</p>
      )}
    </div>
  );
}

// ── 섹션 헤더 ─────────────────────────────────────────────────────────────────
function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mt-1">
      <p className="text-[11px] font-bold text-[#86868b] uppercase tracking-wider">{children}</p>
      <div className="flex-1 h-px bg-[#e5e5ea]" />
    </div>
  );
}

// ── 드릴다운 보건소 선택 컴포넌트 ────────────────────────────────────────────
interface DrilldownPickerProps {
  onSelect: (center: { name: string; code: string; region: string; address: string; phone: string }) => void;
}

function DrilldownPicker({ onSelect }: DrilldownPickerProps) {
  const [step, setStep] = useState<"sido" | "district" | "center">("sido");
  const [selectedSido, setSelectedSido] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [search, setSearch] = useState("");

  const districtList = selectedSido ? getDistrictList(selectedSido) : [];
  const centerList = selectedSido && selectedDistrict ? getCentersByDistrict(selectedSido, selectedDistrict) : [];

  const filteredSido = SIDO_LIST.filter(s => s.includes(search));
  const filteredDistrict = districtList.filter(d => d.includes(search));
  const filteredCenters = centerList.filter(c => c.name.includes(search));

  const handleSidoSelect = (sido: string) => {
    setSelectedSido(sido);
    setStep("district");
    setSearch("");
  };

  const handleDistrictSelect = (district: string) => {
    setSelectedDistrict(district);
    setStep("center");
    setSearch("");
  };

  return (
    <div className="bg-white/60 flex flex-col">
      {/* 단계 브레드크럼 */}
      <div className="flex items-center gap-1 px-3.5 pt-3 pb-2 border-b border-[#f0f0f5]">
        <button
          onClick={() => { setStep("sido"); setSelectedSido(""); setSelectedDistrict(""); setSearch(""); }}
          className={`text-[12px] font-medium px-2 py-0.5 rounded-full transition-colors ${step === "sido" ? "text-white" : "text-[#86868b] hover:text-[#00b398]"}`}
          style={step === "sido" ? { background: "#00b398" } : {}}
        >
          시·도
        </button>
        <ChevronRight className="w-3 h-3 text-[#c7c7cc]" />
        <button
          onClick={() => { if (selectedSido) { setStep("district"); setSelectedDistrict(""); setSearch(""); } }}
          className={`text-[12px] font-medium px-2 py-0.5 rounded-full transition-colors ${step === "district" ? "text-white" : selectedSido ? "text-[#86868b] hover:text-[#00b398]" : "text-[#c7c7cc] cursor-default"}`}
          style={step === "district" ? { background: "#00b398" } : {}}
        >
          {selectedSido || "시·군·구"}
        </button>
        <ChevronRight className="w-3 h-3 text-[#c7c7cc]" />
        <span className={`text-[12px] font-medium px-2 py-0.5 rounded-full ${step === "center" ? "text-white" : "text-[#c7c7cc]"}`}
          style={step === "center" ? { background: "#00b398" } : {}}>
          {selectedDistrict || "보건소"}
        </span>
      </div>

      {/* 검색 */}
      <div className="flex items-center gap-2 px-3.5 py-2 border-b border-[#f0f0f5]">
        <Search className="w-3.5 h-3.5 text-[#c7c7cc] flex-shrink-0" />
        <input
          autoFocus
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={
            step === "sido" ? "시·도 검색 (예: 서울, 경기)" :
            step === "district" ? "시·군·구 검색" :
            "보건소명 검색"
          }
          className="flex-1 bg-transparent text-[13px] text-[#1d1d1f] placeholder:text-[#c7c7cc] outline-none"
        />
        {search && (
          <button onClick={() => setSearch("")} className="text-[#c7c7cc] hover:text-[#86868b]">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* 목록 */}
      <div className="max-h-44 overflow-y-auto">
        {step === "sido" && (
          <div className="grid grid-cols-3 gap-0">
            {filteredSido.map((sido, i) => (
              <button
                key={sido}
                onClick={() => handleSidoSelect(sido)}
                className={`px-3 py-2.5 text-[13px] font-medium text-left transition-colors hover:text-white ${i % 3 !== 2 ? "border-r border-[#f0f0f5]" : ""}`}
                style={{ borderBottom: "1px solid #f0f0f5" }}
                onMouseEnter={e => (e.currentTarget.style.background = "#00b398")}
                onMouseLeave={e => (e.currentTarget.style.background = "")}
              >
                {sido}
              </button>
            ))}
            {filteredSido.length === 0 && (
              <p className="col-span-3 text-center text-[13px] text-[#86868b] py-6">검색 결과 없음</p>
            )}
          </div>
        )}

        {step === "district" && (
          <div className="grid grid-cols-3 gap-0">
            {filteredDistrict.map((district, i) => (
              <button
                key={district}
                onClick={() => handleDistrictSelect(district)}
                className={`px-3 py-2.5 text-[13px] font-medium text-left transition-colors hover:text-white ${i % 3 !== 2 ? "border-r border-[#f0f0f5]" : ""}`}
                style={{ borderBottom: "1px solid #f0f0f5" }}
                onMouseEnter={e => (e.currentTarget.style.background = "#00b398")}
                onMouseLeave={e => (e.currentTarget.style.background = "")}
              >
                {district}
              </button>
            ))}
            {filteredDistrict.length === 0 && (
              <p className="col-span-3 text-center text-[13px] text-[#86868b] py-6">검색 결과 없음</p>
            )}
          </div>
        )}

        {step === "center" && (
          <div className="flex flex-col">
            {filteredCenters.map((center) => (
              <button
                key={center.code}
                onClick={() => onSelect({ name: center.name, code: center.code, region: center.region, address: center.address || "", phone: center.phone || "" })}
                className="flex items-center justify-between px-3.5 py-2.5 text-left transition-colors hover:text-white group"
                style={{ borderBottom: "1px solid #f0f0f5" }}
                onMouseEnter={e => (e.currentTarget.style.background = "#00b398")}
                onMouseLeave={e => (e.currentTarget.style.background = "")}
              >
                <span className="text-[13px] font-medium">{center.name}</span>
                <span className="text-[11px] font-mono opacity-50 group-hover:opacity-80">{center.code}</span>
              </button>
            ))}
            {filteredCenters.length === 0 && (
              <p className="text-center text-[13px] text-[#86868b] py-6">검색 결과 없음</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── 메인 컴포넌트 ─────────────────────────────────────────────────────────────
export default function SignupTab({ isActive }: { isActive: boolean }) {
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();
  const [form, setForm] = useState<FormData>({
    centerName: "",
    centerCode: "",
    deptName: "",
    deptCode: "",
    managerName: "",
    phone: "",
    mobilePhone: "",
    email: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [deptCodeStatus, setDeptCodeStatus] = useState<"idle" | "valid" | "duplicate" | "checking">("idle");
  const [managerNameStatus, setManagerNameStatus] = useState<"idle" | "available" | "duplicate" | "checking">("idle");
  const [submitted, setSubmitted] = useState(false);
  const [issuedCode, setIssuedCode] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const deptCodeCheckRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const managerNameCheckRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 드릴다운 상태
  const [showDrilldown, setShowDrilldown] = useState(false);
  const [centerSelected, setCenterSelected] = useState(false);
  const [selectedCenterInfo, setSelectedCenterInfo] = useState<{ address: string; phone: string } | null>(null);
  // 보건소 선택 중 로딩 상태
  const [isCenterLoading, setIsCenterLoading] = useState(false);

  // isActive prop 사용 (미래 확장용)
  void isActive;

  // centerCode를 ref로 유지 → handleChange stale closure 방지
  const centerCodeRef = useRef<string>("");
  useEffect(() => { centerCodeRef.current = form.centerCode; }, [form.centerCode]);

  // tRPC: 가입신청 mutation
  const createRequestMutation = trpc.requests.create.useMutation({
    onSuccess: () => {
      utils.requests.list.invalidate();
    },
  });

  // 부서 전화번호 blur 시: 지역번호 없이 숫자만 입력하면 보건소 전화번호 기준 지역번호 자동 보완
  const handlePhoneBlur = () => {
    const val = form.phone.trim();
    if (!val) return;
    // 이미 지역번호 포함된 경우 (02-, 0XX- 형태) 그대로 유지
    if (/^\d{2,3}-/.test(val)) return;
    // 숫자만 입력된 경우 지역번호 자동 보완
    const digits = val.replace(/\D/g, '');
    if (digits.length === 0) return;
    // 보건소 전화번호에서 지역번호 추출
    const centerPhone = selectedCenterInfo?.phone || '';
    const areaMatch = centerPhone.match(/^(\d{2,3})-/);
    const areaCode = areaMatch ? areaMatch[1] : '032'; // 기본값 032
    const combined = areaCode + digits;
    setForm(prev => ({ ...prev, phone: formatPhone(combined) }));
  };

  // 핸드폰 번호 blur 시: 010 없이 숫자만 입력하면 010- 자동 보완
  const handleMobilePhoneBlur = () => {
    const val = form.mobilePhone.trim();
    if (!val) return;
    // 이미 0XX- 형태인 경우 그대로 유지
    if (/^0\d{1,2}-/.test(val)) return;
    // 숫자만 입력된 경우 010 자동 보완
    const digits = val.replace(/\D/g, '');
    if (digits.length === 0) return;
    // 010으로 시작하지 않는 경우 앞에 010 붙이기
    const combined = '010' + digits;
    setForm(prev => ({ ...prev, mobilePhone: formatPhone(combined) }));
  };

  const handleChange = (field: keyof FormData, value: string) => {
    let newVal = value;
    if (field === "phone") newVal = formatPhone(value);
    if (field === "mobilePhone") newVal = formatPhone(value);
    else if (field === "centerCode") newVal = value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 7);
    else if (field === "deptCode") {
      newVal = value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4);
      // 디바운스 중복 검증 (500ms)
      if (deptCodeCheckRef.current) clearTimeout(deptCodeCheckRef.current);
      if (newVal.length === 4) {
        setDeptCodeStatus("checking");
        deptCodeCheckRef.current = setTimeout(async () => {
          try {
            const result = await utils.requests.checkCode.fetch({ code: newVal });
            setDeptCodeStatus(result.isDuplicate ? "duplicate" : "valid");
          } catch {
            setDeptCodeStatus("idle");
          }
        }, 500);
      } else {
        setDeptCodeStatus("idle");
      }
    } else if (field === "managerName") {
      newVal = value;
      if (managerNameCheckRef.current) clearTimeout(managerNameCheckRef.current);
      if (newVal.trim().length > 0 && form.centerCode) {
        setManagerNameStatus("checking");
        managerNameCheckRef.current = setTimeout(async () => {
          try {
            const result = await utils.requests.checkManagerName.fetch({
              centerCode: form.centerCode,
              managerName: newVal.trim(),
            });
            setManagerNameStatus(result.isDuplicate ? "duplicate" : "available");
          } catch {
            setManagerNameStatus("idle");
          }
        }, 500);
      } else {
        setManagerNameStatus("idle");
      }
    }

    setForm(prev => ({ ...prev, [field]: newVal }));
    if (errors[field as keyof FormErrors]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const handleCenterSelect = async (center: { name: string; code: string; region: string; address: string; phone: string }) => {
    setIsCenterLoading(true);
    try {
      // DB에서 등록된 보건소 데이터 조회 (주소/전화번호/사업자번호 우선 반영)
      const dbResult = await utils.centers.verify.fetch({ centerCode: center.code });
      const dbCenter = dbResult?.center;

      // DB 데이터 우선, 없으면 정적 데이터 사용
      const displayAddress = dbCenter?.address || center.address;
      const displayPhone = dbCenter?.phone || center.phone;

      // ref 즉시 동기화
      centerCodeRef.current = center.code;

      // 보건소 전화번호에서 지역번호 추출 (예: 032-123-4567 → 032-)
      const extractAreaCode = (phoneNum: string): string => {
        const match = phoneNum.match(/^(\d{2,3})-/);
        return match ? match[1] + "-" : "";
      };
      const areaCode = extractAreaCode(displayPhone);

      setForm(prev => ({
        ...prev,
        centerName: center.name,
        centerCode: center.code,
        // 담당자 연락처가 비어 있을 때만 지역번호 자동 채움
        phone: prev.phone || areaCode,
        // 핸드폰 번호는 사용자가 직접 입력 (자동 채움 없음)
        mobilePhone: prev.mobilePhone,
      }));

      setSelectedCenterInfo({ address: displayAddress, phone: displayPhone });
      setCenterSelected(true);
      setShowDrilldown(false);
      setErrors(prev => ({ ...prev, centerName: undefined, centerCode: undefined }));
    } catch (err) {
      // DB 조회 실패 시 정적 데이터 사용
      console.error("보건소 DB 조회 실패:", err);
      centerCodeRef.current = center.code;
      const extractAreaCode2 = (phoneNum: string): string => {
        const match = phoneNum.match(/^(\d{2,3})-/);
        return match ? match[1] + "-" : "";
      };
      const areaCode2 = extractAreaCode2(center.phone);
      setForm(prev => ({
        ...prev,
        centerName: center.name,
        centerCode: center.code,
        phone: prev.phone || areaCode2,
        mobilePhone: prev.mobilePhone,
      }));
      setSelectedCenterInfo({ address: center.address, phone: center.phone });
      setCenterSelected(true);
      setShowDrilldown(false);
      setErrors(prev => ({ ...prev, centerName: undefined, centerCode: undefined }));
    } finally {
      setIsCenterLoading(false);
    }
  };

  const handleClearCenter = () => {
    setForm(prev => ({ ...prev, centerName: "", centerCode: "", phone: "", mobilePhone: "" }));
    setErrors(prev => ({ ...prev, centerName: undefined, centerCode: undefined }));
    setSelectedCenterInfo(null);
    setCenterSelected(false);
    setShowDrilldown(true);
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!form.centerName.trim()) newErrors.centerName = "보건소를 선택해 주세요.";

    // 부서명은 선택 입력 (삭제됨)
    if (!form.deptCode.trim()) {
      newErrors.deptCode = "간편 로그인 번호를 입력해 주세요.";
    } else if (!isValidDeptCode(form.deptCode)) {
      newErrors.deptCode = "영문과 숫자만 사용하여 4자리로 입력해 주세요. (예: 1234, ABCD, A1B2)";
    } else if (deptCodeStatus === "duplicate") {
      newErrors.deptCode = "이미 등록된 코드입니다. 다른 4자리를 입력해 주세요.";
    } else if (deptCodeStatus === "checking") {
      newErrors.deptCode = "코드 중복 확인 중입니다. 잠시 후 다시 시도해 주세요.";
    }
    if (!form.managerName.trim()) newErrors.managerName = "담당자 이름을 입력해 주세요.";
    else if (managerNameStatus === "duplicate") newErrors.managerName = "이미 등록된 담당자입니다.";
    else if (managerNameStatus === "checking") newErrors.managerName = "담당자 중복 확인 중입니다. 잠시 후 다시 시도해 주세요.";
    if (!form.phone.trim()) {
      newErrors.phone = "부서 전화번호를 입력해 주세요.";
    } else if (!/^\d{2,3}-\d{3,4}-\d{4}$/.test(form.phone)) {
      newErrors.phone = "올바른 전화번호 형식으로 입력해 주세요.";
    }
    // 핸드폰 번호는 선택이지만 입력 시 형식 검증
    if (form.mobilePhone.trim() && !/^010-\d{4}-\d{4}$/.test(form.mobilePhone)) {
      newErrors.mobilePhone = "올바른 핸드폰 번호 형식으로 입력해 주세요. (예: 010-1234-5678)";
    }
    if (!form.email.trim()) {
      newErrors.email = "이메일을 입력해 주세요.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "올바른 이메일 형식으로 입력해 주세요.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);

    try {
      // 사용자가 입력한 4자리 코드 사용
      const userCode = form.deptCode;

      // 제출 직전 다시 한번 중복 검증
      const checkResult = await utils.requests.checkCode.fetch({ code: userCode });
      if (checkResult.isDuplicate) {
        setErrors(prev => ({ ...prev, deptCode: "이미 등록된 코드입니다. 다른 4자리를 입력해 주세요." }));
        setDeptCodeStatus("duplicate");
        setIsSubmitting(false);
        return;
      }

      // tRPC mutation으로 DB에 가입신청 저장
      await createRequestMutation.mutateAsync({
        centerCode: form.centerCode,
        centerName: form.centerName,
        deptName: form.deptName,
        managerName: form.managerName,
        issuedCode: userCode,
        phone: form.phone,
        mobilePhone: form.mobilePhone,
        email: form.email,
        status: "approved",
      });

      setIssuedCode(userCode);
      setSubmitted(true);
    } catch (err) {
      console.error("가입신청 저장 실패:", err);
      alert("가입 신청 중 오류가 발생했습니다. 다시 시도해 주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setForm({ centerName: "", centerCode: "", deptName: "", deptCode: "", managerName: "", phone: "", mobilePhone: "", email: "" });
    setErrors({});
    setDeptCodeStatus("idle");
    setSubmitted(false);
    setIssuedCode("");
    setCenterSelected(false);
    setSelectedCenterInfo(null);
    setShowDrilldown(false);
  };

  // ── 완료 화면 ────────────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="px-6 py-8 flex flex-col items-center text-center gap-4">
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center"
          style={{ background: "rgba(0,179,152,0.12)" }}
        >
          <CheckCircle2 className="w-7 h-7" style={{ color: "#00b398" }} />
        </div>
        <div>
          <p className="text-[17px] font-semibold text-[#1d1d1f] leading-snug">
            가입이 완료되었습니다
          </p>
          <p className="text-[13px] text-[#6e6e73] mt-1.5 leading-relaxed">
            간편 로그인 번호가 발급되었습니다.<br />
            <span className="font-medium text-[#1d1d1f]">{form.email}</span>으로 안내드립니다.
          </p>
        </div>

        {/* 발급된 코드 강조 표시 */}
        <div
          className="w-full rounded-2xl px-5 py-4 flex flex-col items-center gap-1"
          style={{ background: "rgba(0,179,152,0.08)", border: "1.5px solid rgba(0,179,152,0.25)" }}
        >
          <div className="flex items-center gap-1.5 mb-1">
            <Sparkles className="w-3.5 h-3.5" style={{ color: "#00b398" }} />
            <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#00b398" }}>발급된 간편 로그인 번호</span>
          </div>
          <span
            className="text-[28px] font-bold font-mono tracking-[0.15em]"
            style={{ color: "#00b398" }}
          >
            {issuedCode}
          </span>
          <p className="text-[11px] text-[#86868b] mt-0.5">이 코드로 보건소플러스에 로그인하세요</p>
        </div>

        <div
          className="w-full rounded-xl px-4 py-3 text-left border border-[#e5e5ea]"
          style={{ background: "rgba(0,0,0,0.02)" }}
        >
          <div className="grid grid-cols-2 gap-y-2 text-[12px]">
            <span className="text-[#86868b]">보건소</span>
            <span className="text-[#1d1d1f] font-medium text-right">{form.centerName}</span>
            <span className="text-[#86868b]">보건소 코드</span>
            <span className="text-[#1d1d1f] font-mono font-semibold text-right" style={{ color: "#00b398" }}>{form.centerCode}</span>
            <span className="text-[#86868b]">담당자</span>
            <span className="text-[#1d1d1f] font-medium text-right">{form.managerName}</span>
            <span className="text-[#86868b]">이메일</span>
            <span className="text-[#1d1d1f] font-medium text-right text-[11px]">{form.email}</span>
          </div>
        </div>

        <div
          className="w-full rounded-xl px-3.5 py-2.5 flex items-start gap-2.5 text-[11px]"
          style={{ background: "rgba(0,0,0,0.03)", border: "1px solid #e5e5ea" }}
        >
          <Mail className="w-3.5 h-3.5 text-[#86868b] flex-shrink-0 mt-0.5" />
          <span className="text-[#6e6e73] leading-relaxed">
            간편 로그인 번호 안내 이메일이 <strong className="text-[#424245]">{form.email}</strong>로 발송되었습니다.
            이메일이 오지 않으면 고객센터{" "}
            <a href="tel:15226401" className="font-semibold underline underline-offset-2" style={{ color: "#00b398" }}>
              1522-6401
            </a>
            로 문의해 주세요.
          </span>
        </div>

        {/* 즉시 입장 버튼 */}
        <button
          onClick={async () => {
            try {
              const result = await utils.centers.verify.fetch({ centerCode: form.centerCode });
              loginState.isLoggedIn = true;
              loginState.center = {
                id: form.centerCode,
                code: form.centerCode,
                name: form.centerName,
                region: "",
                status: "active" as const,
                codeStatus: "active" as const,
                address: result.center?.address || "",
                contactName: "",
                contactPhone: result.center?.phone || "",
                contactEmail: "",
                departments: [],
                usageCount: 0,
                createdAt: new Date().toISOString(),
                codeExpiresAt: "",
              };
              loginState.department = { id: issuedCode, name: form.deptName, status: "active", createdAt: new Date().toISOString() };
              loginState.user = { name: form.managerName };
              addAccessLog({ centerCode: form.centerCode, centerName: form.centerName, region: "", district: "" });
              saveLoginInfo({ centerCode: form.centerCode, centerName: form.centerName, region: "", deptId: issuedCode, deptName: form.deptName, userName: form.managerName });
              setLocation("/dashboard");
            } catch {
              // 서버 오류 시에도 로그인 처리
              loginState.isLoggedIn = true;
              loginState.center = {
                id: form.centerCode,
                code: form.centerCode,
                name: form.centerName,
                region: "",
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
              };
              loginState.department = { id: issuedCode, name: form.deptName, status: "active", createdAt: new Date().toISOString() };
              loginState.user = { name: form.managerName };
              setLocation("/dashboard");
            }
          }}
          className="w-full py-3.5 rounded-2xl text-[15px] font-semibold text-white transition-all"
          style={{ background: "linear-gradient(135deg, #00A39B 0%, #007a73 100%)", boxShadow: "0 4px 16px rgba(0,163,155,0.3)" }}
        >
          지금 바로 입장하기
        </button>

        <button
          onClick={handleReset}
          className="text-[13px] text-[#86868b] underline underline-offset-2 mt-1"
        >
          다시 신청하기
        </button>
      </div>
    );
  }

  // ── 입력 폼 ──────────────────────────────────────────────────────────────────
  return (
    <div className="px-5 py-2 flex flex-col gap-3">
      <div>
        <p className="text-[18px] font-semibold text-[#1d1d1f] leading-snug">회원가입</p>
        <p className="text-[13px] text-[#86868b] mt-0.5">
          신청 즉시 간편 로그인 번호를 발급해 드립니다
        </p>
      </div>

      {/* ── 보건소 정보 ── */}
      <div className="flex flex-col gap-2.5">

        {/* 보건소 선택 */}
        <div className="flex flex-col gap-1">
          <label className="text-[12px] font-medium text-[#424245] flex items-center gap-1.5">
            보건소명
            <span
              className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
              style={{ background: "rgba(0,179,152,0.12)", color: "#00b398" }}
            >
              필수
            </span>
          </label>

          {/* 선택 완료 카드 */}
          {centerSelected && (
            <div
              className="rounded-xl border border-[#e5e5ea] bg-white/60 overflow-hidden"
            >
              <div className="flex items-center gap-2.5 px-3.5 py-3">
                <Building2 className="w-4 h-4 text-[#86868b] flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-[#1d1d1f] truncate">{form.centerName}</p>
                  <p className="text-[11px] font-mono text-[#86868b]">{form.centerCode}</p>
                </div>
                <button onClick={handleClearCenter} className="flex-shrink-0 text-[#86868b] hover:text-red-400 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              {selectedCenterInfo && (
                <div className="px-3.5 pb-3 flex flex-col gap-1 border-t border-[#f5f5f7]" style={{ paddingTop: "8px" }}>
                  <div className="flex items-center gap-1.5 text-[12px] text-[#6e6e73]">
                    <MapPin className="w-3 h-3 flex-shrink-0 text-[#86868b]" />
                    <span>{selectedCenterInfo.address}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[12px] text-[#6e6e73]">
                    <Phone className="w-3 h-3 flex-shrink-0 text-[#86868b]" />
                    <span>{selectedCenterInfo.phone}</span>
                    <span className="text-[11px] text-[#c7c7cc]">(대표번호 자동 입력됨)</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 보건소 선택 중 로딩 */}
          {isCenterLoading && (
            <div className="flex items-center gap-2 px-3.5 py-3 rounded-xl border border-[#e5e5ea] bg-white/60">
              <Loader2 className="w-4 h-4 text-[#00b398] animate-spin" />
              <span className="text-[13px] text-[#86868b]">보건소 정보를 불러오는 중...</span>
            </div>
          )}

          {/* 드릴다운 열기 버튼 */}
          {!centerSelected && !showDrilldown && !isCenterLoading && (
            <button
              onClick={() => setShowDrilldown(true)}
              className={`flex items-center gap-2.5 rounded-xl px-3.5 py-3 text-left transition-all border ${
                errors.centerName ? "border-red-400 bg-red-50/30" : "border-[#e5e5ea] bg-white/60 hover:border-[#00b398]"
              }`}
            >
              <MapPin className={`w-4 h-4 flex-shrink-0 ${errors.centerName ? "text-red-400" : "text-[#86868b]"}`} />
              <span className="flex-1 text-[14px] text-[#c7c7cc]">시·도와 시·군·구를 선택하면 보건소 목록이 표시됩니다</span>
              <ChevronDown className={`w-4 h-4 flex-shrink-0 text-[#86868b] transition-transform ${showDrilldown ? "rotate-180" : ""}`} />
            </button>
          )}

          {/* 드릴다운 패널 */}
          {showDrilldown && !centerSelected && (
            <div className="rounded-xl overflow-hidden border border-[#e5e5ea] shadow-sm">
              <SharedDrilldownPicker onSelect={(c: SharedCenterInfo) => handleCenterSelect({ name: c.name, code: c.code, region: c.region, address: c.address, phone: c.phone })} />
            </div>
          )}

          {errors.centerName && (
            <p className="text-[11px] text-red-500 pl-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3 flex-shrink-0" />
              {errors.centerName}
            </p>
          )}
        </div>
      </div>

      {/* ── 부서 및 담당자 정보 ── */}
      <div className="flex flex-col gap-2.5">
        {/* 담당자 이름 + 부서 전화번호 한 줄 */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="flex flex-col gap-1">
            <Field
              icon={<User className="w-4 h-4" />}
              label="담당자 이름"
              required
              error={errors.managerName || (managerNameStatus === "duplicate" ? "이미 등록된 담당자입니다." : undefined)}
            >
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="text"
                  value={form.managerName}
                  onChange={e => handleChange("managerName", e.target.value)}
                  placeholder="예: 홍길동"
                  className="flex-1 bg-transparent text-[14px] text-[#1d1d1f] placeholder:text-[#c7c7cc] outline-none"
                  disabled={!centerSelected}
                />
                {managerNameStatus === "checking" && <Loader2 className="w-4 h-4 text-[#00b398] animate-spin flex-shrink-0" />}
                {managerNameStatus === "available" && <CheckCircle2 className="w-4 h-4 text-[#00b398] flex-shrink-0" />}
                {managerNameStatus === "duplicate" && <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />}
              </div>
            </Field>
          </div>

          <Field
            icon={<Phone className="w-4 h-4" />}
            label="부서 전화번호"
            required
            error={errors.phone}
          >
            <input
              type="tel"
              value={form.phone}
              onChange={e => handleChange("phone", e.target.value)}
              onBlur={handlePhoneBlur}
              placeholder="예: 032-000-0000"
              className="flex-1 bg-transparent text-[14px] text-[#1d1d1f] placeholder:text-[#c7c7cc] outline-none"
            />
          </Field>
        </div>

        {/* 핸드폰 번호 (선택) */}
        <div className="flex flex-col gap-1">
          <Field
            icon={<Phone className="w-4 h-4" />}
            label="핸드폰 번호 (선택)"
            error={errors.mobilePhone}
          >
            <input
              type="tel"
              value={form.mobilePhone}
              onChange={e => handleChange("mobilePhone", e.target.value)}
              onBlur={handleMobilePhoneBlur}
              placeholder="예: 010-1234-5678"
              className="flex-1 bg-transparent text-[14px] text-[#1d1d1f] placeholder:text-[#c7c7cc] outline-none"
            />
          </Field>
          <p className="text-[11px] text-[#86868b] pl-1">주문 내용 SNS 확인 및 발주 사항 전달용 입니다.</p>
        </div>

        {/* 간편 로그인 번호 직접 입력 */}
        <Field
          icon={<Sparkles className="w-4 h-4" />}
          label="간편 로그인 번호"
          required
          error={errors.deptCode}
        >
          <input
            type="text"
            value={form.deptCode}
            onChange={e => {
              const raw = e.target.value;
              // 한글 감지 시 오류 메시지 표시
              const hasKorean = /[\uAC00-\uD7A3\u1100-\u11FF\u3130-\u318F]/.test(raw);
              if (hasKorean) {
                setErrors(prev => ({ ...prev, deptCode: "한글은 입력할 수 없습니다. 영문 대문자와 숫자만 사용 가능합니다." }));
                return;
              }
              handleChange("deptCode", raw);
            }}
            onCompositionEnd={e => {
              // IME 조합 완료 후 한글 제거, 영문/숫자만 남김
              const cleaned = e.currentTarget.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4);
              handleChange("deptCode", cleaned);
            }}
            placeholder="4자리 입력 (예: 1234, ABCD, A1B2)"
            maxLength={8}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="characters"
            spellCheck={false}
            className="flex-1 bg-transparent text-[14px] text-[#1d1d1f] placeholder:text-[#c7c7cc] outline-none font-mono tracking-widest uppercase"
          />
          {deptCodeStatus === "checking" && (
            <Loader2 className="w-4 h-4 flex-shrink-0 text-[#86868b] animate-spin" />
          )}
          {deptCodeStatus === "valid" && (
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: "#00b398" }} />
          )}
          {deptCodeStatus === "duplicate" && (
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
          )}
        </Field>
        {/* 간편 로그인 번호 안내 메시지 */}
        {deptCodeStatus === "duplicate" && (
          <div className="flex items-start gap-2 mt-1 p-3 bg-red-50 rounded-xl border border-red-100">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-[12px] text-red-600 leading-relaxed">이미 등록된 코드입니다. 다른 4자리를 입력해 주세요.</p>
          </div>
        )}
        {deptCodeStatus === "valid" && form.deptCode.length === 4 && (
          <div
            className="rounded-xl px-3.5 py-2.5 flex items-center gap-2.5 text-[12px]"
            style={{ background: "rgba(0,179,152,0.06)", border: "1px solid rgba(0,179,152,0.2)" }}
          >
            <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#00b398" }} />
            <span style={{ color: "#00b398" }} className="font-medium">사용 가능한 코드입니다.</span>
          </div>
        )}
        {form.deptCode.length === 0 && (
          <p className="text-[11px] text-[#86868b] pl-1">
            원하는 4자리를 직접 입력하세요. 숫자만, 영문만, 혼합 모두 가능합니다.
          </p>
        )}

        <Field
          icon={<Mail className="w-4 h-4" />}
          label="이메일"
          required
          error={errors.email}
        >
          <input
            type="email"
            value={form.email}
            onChange={e => handleChange("email", e.target.value)}
            placeholder="예: hong@health.go.kr"
            className="flex-1 bg-transparent text-[14px] text-[#1d1d1f] placeholder:text-[#c7c7cc] outline-none"
          />
        </Field>
      </div>

      {/* ── 제출 버튼 ── */}
      <button
        onClick={handleSubmit}
        disabled={isSubmitting || isCenterLoading}
        className="w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-[15px] font-semibold text-white transition-opacity active:opacity-80 mt-1 disabled:opacity-60"
        style={{ background: "#00b398" }}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            신청 중...
          </>
        ) : (
          <>
            가입 신청하기
            <ChevronRight className="w-4 h-4" />
          </>
        )}
      </button>

      <p className="text-[11px] text-[#86868b] text-center leading-relaxed">
        입력하신 4자리 코드로 보건소플러스에 로그인하실 수 있습니다.<br />
        문의: <span className="font-medium text-[#424245]">1522-6401</span> (평일 09:00~18:00)
      </p>
    </div>
  );
}
