/**
 * Register.tsx — 기관 등록 신청 페이지 (5단계 스텝 방식)
 * Step 1: 이용약관 동의
 * Step 2: 기관 정보 입력
 * Step 3: 담당자 정보 입력
 * Step 4: 최종 확인
 * Step 5: 신청 완료
 */

import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useRegistrations } from "@/contexts/RegistrationContext";
import {
  Building2, User, Phone, Mail, MapPin, FileText,
  CheckCircle2, ChevronRight, ArrowLeft, Info, Loader2,
  ShieldCheck, ClipboardList, X
} from "lucide-react";
import { toast } from "sonner";

const REGIONS = [
  "서울특별시", "부산광역시", "대구광역시", "인천광역시", "광주광역시",
  "대전광역시", "울산광역시", "세종특별자치시", "경기도", "강원도",
  "충청북도", "충청남도", "전라북도", "전라남도", "경상북도", "경상남도", "제주특별자치도",
];

const DEPTS = [
  "건강증진팀", "만성질환팀", "감염병관리팀", "모자보건팀", "정신건강팀",
  "치매안심센터", "금연클리닉", "영양관리팀", "구강보건팀", "지역보건팀",
  "예방접종팀", "방문건강관리팀", "기타",
];

type StepId = 1 | 2 | 3 | 4 | 5;

interface FormData {
  name: string;
  region: string;
  district: string;
  address: string;
  phone: string;
  businessNumber: string;
  contactName: string;
  contactDept: string;
  contactPhone: string;
  contactEmail: string;
  agree: boolean;
}

const EMPTY_FORM: FormData = {
  name: "", region: "서울특별시", district: "", address: "",
  phone: "", businessNumber: "", contactName: "", contactDept: "건강증진팀",
  contactPhone: "", contactEmail: "", agree: false,
};

const formatBizNum = (v: string) => {
  const n = v.replace(/\D/g, "").slice(0, 10);
  if (n.length <= 3) return n;
  if (n.length <= 5) return `${n.slice(0, 3)}-${n.slice(3)}`;
  return `${n.slice(0, 3)}-${n.slice(3, 5)}-${n.slice(5)}`;
};

const formatPhone = (v: string) => {
  const n = v.replace(/\D/g, "").slice(0, 11);
  if (n.length <= 3) return n;
  if (n.startsWith("02")) {
    if (n.length <= 6) return `${n.slice(0, 2)}-${n.slice(2)}`;
    if (n.length <= 9) return `${n.slice(0, 2)}-${n.slice(2, 6)}-${n.slice(6)}`;
    return `${n.slice(0, 2)}-${n.slice(2, 6)}-${n.slice(6)}`;
  }
  if (n.length <= 6) return `${n.slice(0, 3)}-${n.slice(3)}`;
  if (n.length <= 10) return `${n.slice(0, 3)}-${n.slice(3, 6)}-${n.slice(6)}`;
  return `${n.slice(0, 3)}-${n.slice(3, 7)}-${n.slice(7)}`;
};

const STEPS = [
  { id: 1, label: "약관 동의", icon: ShieldCheck },
  { id: 2, label: "기관 정보", icon: Building2 },
  { id: 3, label: "담당자 정보", icon: User },
  { id: 4, label: "최종 확인", icon: ClipboardList },
];

export default function Register() {
  const [, navigate] = useLocation();
  const { addRegistration } = useRegistrations();
  const [step, setStep] = useState<StepId>(1);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState("");
  const [termsExpanded, setTermsExpanded] = useState(false);

  const set = (key: keyof FormData, value: string | boolean) =>
    setForm((p) => ({ ...p, [key]: value }));

  const validateStep2 = (): boolean => {
    const e: Partial<Record<keyof FormData, string>> = {};
    if (!form.name.trim()) e.name = "기관명을 입력해 주세요";
    if (!form.district.trim()) e.district = "시/군/구를 입력해 주세요";
    if (!form.address.trim()) e.address = "주소를 입력해 주세요";
    if (!form.phone.trim()) e.phone = "대표 전화번호를 입력해 주세요";
    if (form.businessNumber.replace(/\D/g, "").length !== 10)
      e.businessNumber = "사업자등록번호 10자리를 입력해 주세요";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep3 = (): boolean => {
    const e: Partial<Record<keyof FormData, string>> = {};
    if (!form.contactName.trim()) e.contactName = "담당자 이름을 입력해 주세요";
    if (!form.contactPhone.trim()) e.contactPhone = "담당자 연락처를 입력해 주세요";
    if (!form.contactEmail.trim() || !form.contactEmail.includes("@"))
      e.contactEmail = "올바른 이메일을 입력해 주세요";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1200));
    const id = addRegistration({
      name: form.name,
      region: form.region,
      district: form.district,
      address: form.address,
      phone: form.phone,
      contactName: form.contactName,
      contactDept: form.contactDept,
      contactPhone: form.contactPhone,
      contactEmail: form.contactEmail,
      businessNumber: form.businessNumber,
    });
    setSubmittedId(id);
    setSubmitting(false);
    setStep(5);
  };

  const FieldError = ({ msg }: { msg?: string }) =>
    msg ? <p className="text-[12px] text-red-500 mt-1">{msg}</p> : null;

  const inputCls = (err?: string) =>
    `w-full px-4 py-3 rounded-xl border text-[14px] text-[#1D1D1F] placeholder-[#AEAEB2] focus:outline-none focus:ring-2 transition-all ${
      err
        ? "border-red-300 focus:ring-red-200 bg-red-50/30"
        : "border-black/10 focus:ring-[#1A2B3C] bg-white"
    }`;

  // ── 스텝 인디케이터 ──────────────────────────────────────
  const StepIndicator = () => (
    <div className="flex items-center justify-center gap-0 mb-10">
      {STEPS.map((s, i) => {
        const isDone = step > s.id;
        const isActive = step === s.id;
        const Icon = s.icon;
        return (
          <div key={s.id} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                isDone
                  ? "bg-green-500 text-white"
                  : isActive
                  ? "bg-[#1A2B3C] text-white ring-4 ring-[#1A2B3C]/20"
                  : "bg-[#E8E8ED] text-[#AEAEB2]"
              }`}>
                {isDone ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <Icon className="w-4.5 h-4.5" />
                )}
              </div>
              <span className={`text-[11px] font-semibold whitespace-nowrap ${
                isActive ? "text-[#1D1D1F]" : isDone ? "text-green-600" : "text-[#AEAEB2]"
              }`}>{s.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-12 sm:w-20 h-0.5 mx-1 mb-5 transition-all ${
                step > s.id ? "bg-green-400" : "bg-[#E8E8ED]"
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );

  // ── Step 5: 완료 ──────────────────────────────────────────
  if (step === 5) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] px-4 py-16">
        <div className="w-full max-w-[520px] mx-auto text-center">
          <div className="w-20 h-20 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-[28px] font-bold text-[#1D1D1F] tracking-tight mb-3">신청이 완료되었습니다</h1>
          <p className="text-[15px] text-[#6E6E73] leading-relaxed mb-2">
            <strong className="text-[#1D1D1F]">{form.name}</strong>의 기관 등록 신청이 접수되었습니다.
          </p>
          <p className="text-[14px] text-[#6E6E73] mb-8">
            담당 관리자 검토 후 <strong className="text-[#1D1D1F]">{form.contactEmail}</strong>으로 결과를 안내드립니다.
          </p>

          <div className="bg-white rounded-2xl border border-black/5 p-6 text-left mb-8 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[13px] font-semibold text-[#6E6E73] uppercase tracking-wide">접수 정보</p>
              <span className="px-2.5 py-1 bg-amber-50 text-amber-600 text-[11px] font-semibold rounded-full border border-amber-200">
                검토 대기 중
              </span>
            </div>
            <div className="space-y-2.5">
              {[
                { label: "접수 번호", value: submittedId, mono: true },
                { label: "기관명", value: form.name },
                { label: "담당자", value: `${form.contactName} (${form.contactDept})` },
                { label: "처리 예상 시간", value: "영업일 기준 1~2일" },
              ].map((row) => (
                <div key={row.label} className="flex justify-between">
                  <span className="text-[13px] text-[#6E6E73]">{row.label}</span>
                  <span className={`text-[13px] font-semibold text-[#1D1D1F] ${row.mono ? "font-mono" : ""}`}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <Link href="/register" className="flex-1 py-3.5 rounded-xl border border-black/10 text-[14px] font-semibold text-[#424245] hover:bg-[#F5F5F7] transition-colors text-center">
              새 등록 신청하기
            </Link>
            <Link href="/intro" className="flex-1 py-3.5 rounded-xl bg-[#1A2B3C] text-[14px] font-semibold text-white hover:bg-[#243547] transition-colors text-center">
              보건소 로그인
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      {/* 상단 헤더 */}
      <div className="bg-white border-b border-black/5 sticky top-0 z-10">
        <div className="max-w-[680px] mx-auto px-5 py-4 flex items-center gap-4">
          <button
            onClick={() => window.history.length > 1 ? window.history.back() : navigate("/")}
            className="flex items-center gap-2 text-[13px] text-[#6E6E73] hover:text-[#1D1D1F] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-semibold text-[#1D1D1F]">보건소플러스</span>
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-[#AEAEB2]" />
          <span className="text-[13px] text-[#6E6E73]">기관 등록 신청</span>
          {/* X 닫기 버튼 - 클릭 시 등록 페이지 처음으로 이동(폼 초기화) */}
          <button
            onClick={() => { setForm(EMPTY_FORM); setStep(1); setErrors({}); navigate("/register"); }}
            className="ml-auto w-8 h-8 flex items-center justify-center rounded-full bg-[#F5F5F7] hover:bg-[#E8E8ED] transition-colors"
            title="기관 등록 신청 처음으로"
          >
            <X className="w-4 h-4 text-[#6E6E73]" />
          </button>
        </div>
      </div>

      <div className="max-w-[680px] mx-auto px-5 py-10">
        {/* 페이지 타이틀 */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#EBF4FF] rounded-full mb-4">
            <Building2 className="w-3.5 h-3.5 text-[#00A39B]" />
            <span className="text-[12px] font-semibold text-[#00A39B]">폐쇄몰 가입 신청</span>
          </div>
          <h1 className="text-[30px] font-bold text-[#1D1D1F] tracking-tight leading-tight mb-2">
            기관 등록 신청
          </h1>
          <p className="text-[14px] text-[#6E6E73]">
            신청 후 영업일 기준 1~2일 내 승인 결과를 이메일로 안내드립니다.
          </p>
        </div>

        {/* 스텝 인디케이터 */}
        <StepIndicator />

        {/* ── Step 1: 이용약관 동의 ── */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300 flex flex-col h-[calc(100vh-200px)] max-h-[90vh]">
            <section className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden flex-1 flex flex-col">
              <div className="px-6 py-5 border-b border-black/5 flex items-center gap-3 flex-shrink-0">
                <div className="w-9 h-9 rounded-xl bg-[#EBF4FF] flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-[#00A39B]" />
                </div>
                <div>
                  <h2 className="text-[16px] font-bold text-[#1D1D1F]">이용약관 동의</h2>
                  <p className="text-[12px] text-[#6E6E73]">서비스 이용을 위해 약관을 확인해 주세요</p>
                </div>
              </div>
              <div className="px-6 py-4 overflow-y-auto flex-1 space-y-4">
                <button
                  onClick={() => setTermsExpanded(!termsExpanded)}
                  className="w-full p-4 bg-[#F5F5F7] rounded-xl text-[13px] text-[#1D1D1F] font-semibold hover:bg-[#E8E8ED] transition-all flex items-center justify-between border border-black/5"
                >
                  <span>보건소플러스 이용약관 (요약)</span>
                  <svg className={`w-5 h-5 text-[#6E6E73] transition-transform ${termsExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                </button>

                {termsExpanded && (
                  <div className="p-4 bg-[#F5F5F7] rounded-xl text-[13px] text-[#6E6E73] leading-relaxed space-y-3 border border-black/5">
                    <p className="font-bold text-[#1D1D1F] text-[14px]">보건소플러스 이용약관 (요약)</p>
                    <p>본 서비스는 보건소 및 공공보건기관 전용 인쇄물 주문 플랫폼입니다. 기관 등록 신청 시 제출된 정보는 서비스 운영 목적으로만 사용되며, 제3자에게 제공되지 않습니다.</p>
                    <p>허위 정보 기재 시 등록이 거부될 수 있으며, 등록 후에도 이용 자격이 취소될 수 있습니다. 기관 코드는 해당 기관 담당자만 사용할 수 있으며, 외부 유출 시 책임은 해당 기관에 있습니다.</p>
                    <p>개인정보는 「개인정보 보호법」에 따라 안전하게 관리됩니다. 자세한 내용은 개인정보처리방침을 참조해 주세요.</p>
                    <p className="font-semibold text-[#424245]">개인정보 수집·이용 동의</p>
                    <p>수집 항목: 기관명, 주소, 사업자등록번호, 담당자 이름·연락처·이메일</p>
                    <p>수집 목적: 기관 등록 심사 및 서비스 이용 자격 부여</p>
                    <p>보유 기간: 서비스 탈퇴 시까지 (단, 관련 법령에 따라 일정 기간 보관)</p>
                  </div>
                )}

                <label className="flex items-center gap-3 cursor-pointer p-4 rounded-xl border-2 transition-all select-none" style={{ borderColor: form.agree ? "#1A2B3C" : "rgba(0,0,0,0.08)", background: form.agree ? "#F0F4F8" : "white" }} onClick={() => set("agree", !form.agree)}>
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${form.agree ? "bg-[#1A2B3C] border-[#1A2B3C]" : "border-black/20 bg-white"}`}>
                    {form.agree && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                  </div>
                  <span className="text-[14px] font-semibold text-[#1D1D1F]">이용약관 및 개인정보처리방침에 동의합니다 <span className="text-red-500">*</span></span>
                </label>
                <button onClick={() => { if (!form.agree) { toast.error("이용약관에 동의해 주세요."); return; } setStep(2); }} className="w-full py-3 rounded-xl bg-[#00A39B] text-white text-[14px] font-semibold hover:bg-[#0055AA] active:scale-[0.99] transition-all disabled:opacity-50" disabled={!form.agree}>
                  확인
                </button>
              </div>
            </section>
            {/* 소셜 로그인 스타일 빠른 접근 UI */}
            <div className="mt-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-black/8" />
                <span className="text-[12px] text-[#AEAEB2] font-medium whitespace-nowrap">이미 등록된 기관이시라면</span>
                <div className="flex-1 h-px bg-black/8" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/intro"
                  className="flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl border border-black/10 bg-white hover:bg-[#F5F5F7] transition-all text-[13px] font-semibold text-[#1D1D1F] shadow-sm"
                >
                  <svg className="w-4 h-4 text-[#00A39B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  코드로 로그인
                </Link>
                <Link
                  href="/customer-service"
                  className="flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl border border-black/10 bg-white hover:bg-[#F5F5F7] transition-all text-[13px] font-semibold text-[#1D1D1F] shadow-sm"
                >
                  <svg className="w-4 h-4 text-[#6E6E73]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  코드 분실 문의
                </Link>
              </div>
              <p className="text-center text-[11px] text-[#AEAEB2] mt-3">
                보건소 전용 폐쇄몰 — 승인된 기관만 접속 가능합니다
              </p>
            </div>
          </div>
        )}

        {/* ── Step 2: 기관 정보 ── */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300 flex flex-col h-[calc(100vh-200px)] max-h-[90vh]">
            <section className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden flex-1 flex flex-col">
              <div className="px-6 py-5 border-b border-black/5 flex items-center gap-3 flex-shrink-0">
                <div className="w-9 h-9 rounded-xl bg-[#EBF4FF] flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-[#00A39B]" />
                </div>
                <div>
                  <h2 className="text-[16px] font-bold text-[#1D1D1F]">기관 정보</h2>
                  <p className="text-[12px] text-[#6E6E73]">보건소 공식 정보를 입력해 주세요</p>
                </div>
              </div>
              <div className="px-6 py-4 space-y-2.5 overflow-y-auto flex-1">
                <div>
                  <label className="block text-[13px] font-semibold text-[#1D1D1F] mb-2">
                    기관명 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder="예: 서울 강남구보건소"
                    className={inputCls(errors.name)}
                  />
                  <FieldError msg={errors.name} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[13px] font-semibold text-[#1D1D1F] mb-2">
                      시/도 <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={form.region}
                      onChange={(e) => set("region", e.target.value)}
                      className={`${inputCls()} appearance-none`}
                    >
                      {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[13px] font-semibold text-[#1D1D1F] mb-2">
                      시/군/구 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.district}
                      onChange={(e) => set("district", e.target.value)}
                      placeholder="예: 강남구"
                      className={inputCls(errors.district)}
                    />
                    <FieldError msg={errors.district} />
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-[#1D1D1F] mb-2">
                    기관 주소 <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#AEAEB2]" />
                    <input
                      type="text"
                      value={form.address}
                      onChange={(e) => set("address", e.target.value)}
                      placeholder="예: 서울 강남구 일원로 81"
                      className={`${inputCls(errors.address)} pl-11`}
                    />
                  </div>
                  <FieldError msg={errors.address} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[13px] font-semibold text-[#1D1D1F] mb-2">
                      대표 전화번호 <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#AEAEB2]" />
                      <input
                        type="text"
                        value={form.phone}
                        onChange={(e) => set("phone", formatPhone(e.target.value))}
                        placeholder="02-0000-0000"
                        className={`${inputCls(errors.phone)} pl-11`}
                      />
                    </div>
                    <FieldError msg={errors.phone} />
                  </div>
                  <div>
                    <label className="block text-[13px] font-semibold text-[#1D1D1F] mb-2">
                      사업자등록번호 <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#AEAEB2]" />
                      <input
                        type="text"
                        value={form.businessNumber}
                        onChange={(e) => set("businessNumber", formatBizNum(e.target.value))}
                        placeholder="000-00-00000"
                        className={`${inputCls(errors.businessNumber)} pl-11`}
                      />
                    </div>
                    <FieldError msg={errors.businessNumber} />
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-black/5 flex gap-2 flex-shrink-0 bg-white">
                <button
                  onClick={() => { setErrors({}); setStep(1); }}
                  className="flex-1 py-3 rounded-xl border border-black/10 text-[13px] font-semibold text-[#424245] hover:bg-[#F5F5F7] transition-all flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" /> 이전
                </button>
                <button
                  onClick={() => {
                    if (validateStep2()) setStep(3);
                    else toast.error("필수 항목을 모두 입력해 주세요.");
                  }}
                  className="flex-[2] py-3 rounded-xl bg-[#1A2B3C] text-white text-[14px] font-semibold hover:bg-[#243547] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                >
                  다음 단계
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </section>
          </div>
        )}

        {/* ── Step 3: 담당자 정보 ── */}
        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300 flex flex-col h-[calc(100vh-200px)] max-h-[90vh]">
            <section className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden flex-1 flex flex-col">
              <div className="px-6 py-5 border-b border-black/5 flex items-center gap-3 flex-shrink-0">
                <div className="w-9 h-9 rounded-xl bg-[#F0EEFF] flex items-center justify-center">
                  <User className="w-4 h-4 text-[#7B61FF]" />
                </div>
                <div>
                  <h2 className="text-[16px] font-bold text-[#1D1D1F]">담당자 정보</h2>
                  <p className="text-[12px] text-[#6E6E73]">승인 결과를 받을 담당자 정보를 입력해 주세요</p>
                </div>
              </div>
              <div className="px-6 py-4 space-y-4 overflow-y-auto flex-1">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[13px] font-semibold text-[#1D1D1F] mb-2">
                      담당자 이름 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.contactName}
                      onChange={(e) => set("contactName", e.target.value)}
                      placeholder="홍길동"
                      className={inputCls(errors.contactName)}
                    />
                    <FieldError msg={errors.contactName} />
                  </div>
                  <div>
                    <label className="block text-[13px] font-semibold text-[#1D1D1F] mb-2">
                      소속 부서 <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={form.contactDept}
                      onChange={(e) => set("contactDept", e.target.value)}
                      className={`${inputCls()} appearance-none`}
                    >
                      {DEPTS.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-[#1D1D1F] mb-2">
                    담당자 연락처 <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#AEAEB2]" />
                    <input
                      type="text"
                      value={form.contactPhone}
                      onChange={(e) => set("contactPhone", formatPhone(e.target.value))}
                      placeholder="010-0000-0000"
                      className={`${inputCls(errors.contactPhone)} pl-11`}
                    />
                  </div>
                  <FieldError msg={errors.contactPhone} />
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-[#1D1D1F] mb-2">
                    이메일 주소 <span className="text-red-500">*</span>
                    <span className="ml-2 text-[11px] font-normal text-[#6E6E73]">승인 결과 통보에 사용됩니다</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#AEAEB2]" />
                    <input
                      type="email"
                      value={form.contactEmail}
                      onChange={(e) => set("contactEmail", e.target.value)}
                      placeholder="example@health.go.kr"
                      className={`${inputCls(errors.contactEmail)} pl-11`}
                    />
                  </div>
                  <FieldError msg={errors.contactEmail} />
                </div>
              </div>
              <div className="px-6 py-4 border-t border-black/5 flex gap-3 flex-shrink-0 bg-white">
                <button
                  onClick={() => { setErrors({}); setStep(2); }}
                  className="flex-1 py-3 rounded-xl border border-black/10 text-[13px] font-semibold text-[#424245] hover:bg-[#F5F5F7] transition-all flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" /> 이전
                </button>
                <button
                  onClick={() => {
                    if (validateStep3()) setStep(4);
                    else toast.error("필수 항목을 모두 입력해 주세요.");
                  }}
                  className="flex-[2] py-3 rounded-xl bg-[#1A2B3C] text-white text-[14px] font-semibold hover:bg-[#243547] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                >
                  다음 단계
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </section>
          </div>
        )}

        {/* ── Step 4: 최종 확인 ── */}
        {step === 4 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300 flex flex-col h-[calc(100vh-200px)] max-h-[90vh]">
            <div className="overflow-y-auto flex-1 space-y-4 px-6 pt-4">
            <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-[#F5F5F7] border-b border-black/5 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#6E6E73]" />
                <span className="text-[13px] font-semibold text-[#424245]">기관 정보</span>
                <button
                  onClick={() => setStep(2)}
                  className="ml-auto text-[12px] text-[#00A39B] hover:underline"
                >
                  수정
                </button>
              </div>
              <div className="px-6 py-5 space-y-3">
                {[
                  { label: "기관명", value: form.name },
                  { label: "지역", value: `${form.region} ${form.district}` },
                  { label: "주소", value: form.address },
                  { label: "대표 전화", value: form.phone },
                  { label: "사업자등록번호", value: form.businessNumber },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between items-start gap-4">
                    <span className="text-[13px] text-[#6E6E73] flex-shrink-0 w-28">{row.label}</span>
                    <span className="text-[13px] font-medium text-[#1D1D1F] text-right">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-[#F5F5F7] border-b border-black/5 flex items-center gap-2">
                <User className="w-4 h-4 text-[#6E6E73]" />
                <span className="text-[13px] font-semibold text-[#424245]">담당자 정보</span>
                <button
                  onClick={() => setStep(3)}
                  className="ml-auto text-[12px] text-[#00A39B] hover:underline"
                >
                  수정
                </button>
              </div>
              <div className="px-6 py-5 space-y-3">
                {[
                  { label: "담당자 이름", value: form.contactName },
                  { label: "소속 부서", value: form.contactDept },
                  { label: "연락처", value: form.contactPhone },
                  { label: "이메일", value: form.contactEmail },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between items-start gap-4">
                    <span className="text-[13px] text-[#6E6E73] flex-shrink-0 w-28">{row.label}</span>
                    <span className="text-[13px] font-medium text-[#1D1D1F] text-right">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-start gap-3">
              <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-[13px] text-blue-700 leading-relaxed">
                승인 완료 시 보건소 로그인 코드가 발급됩니다. 입력하신 이메일로 코드가 전송됩니다.
              </p>
            </div>
            </div>

            <div className="px-6 py-4 border-t border-black/5 flex gap-3 flex-shrink-0 bg-white">
              <button
                onClick={() => setStep(3)}
                className="flex-1 py-3 rounded-xl border border-black/10 text-[13px] font-semibold text-[#424245] hover:bg-[#F5F5F7] transition-all flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> 이전
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-[2] py-3 rounded-xl bg-[#1A2B3C] text-white text-[14px] font-semibold hover:bg-[#243547] active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    제출 중...
                  </>
                ) : (
                  <>
                    신청 제출
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
