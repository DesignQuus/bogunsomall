/**
 * NamecardOrderForm.tsx
 * Design: "Clean Canvas" — Apple Store Style
 * 6단계 플로우: 디자인 선택 → 정보 입력 → 수량/옵션 → 미리보기 → 결재 요청 → 배송 정보
 */

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation, useSearch } from "wouter";
import { loginState } from "@/pages/intro/constants";
import {
  ArrowRight, ChevronRight, ArrowLeft, RefreshCw, Plus, Clock,
  CheckCircle2, Upload, ZoomIn, ZoomOut, CreditCard, Truck,
  Users, Star, FileText, Bell, Package, MapPin, ChevronDown, X,
  ShieldCheck, BadgeCheck, User, Calendar, Bookmark, BookmarkCheck, Trash2, Share2
} from "lucide-react";
import { toast } from "sonner";
import { useTemplate } from "@/contexts/TemplateContext";
import BackButton from "@/components/BackButton";
import { trpc } from "@/lib/trpc";

type OrderMode = "select" | "new" | "reorder" | "sample";
type Step = 1 | 2 | 3 | 4 | 5 | 6;

interface PreviousOrder {
  id: string;
  orderDate: string;
  name: string;
  department: string;
  quantity: number;
  paperType?: string;
  doubleSided?: boolean;
  specifications?: Record<string, string>;
}

// 100매 단위 단가 기준
// 단면: 200매 12,000원 → 100매당 6,000원
// 양면: 200매 15,000원 → 100매당 7,500원
// 모서리 가공: 200매당 3,000원 → 100매당 1,500원
const UNIT_PRICE_PER_100 = 6000;           // 단면 100매당 단가
const DOUBLE_SIDED_PRICE_PER_100 = 7500;  // 양면 100매당 단가
const CORNER_PRICE_PER_100 = 1500;        // 모서리 가공 100매당 단가

// 하위 호환용 (UI 안내 문구에서 사용)
const DOUBLE_SIDED_SURCHARGE: Record<number, number> = {
  200: (DOUBLE_SIDED_PRICE_PER_100 - UNIT_PRICE_PER_100) * 2,
  400: (DOUBLE_SIDED_PRICE_PER_100 - UNIT_PRICE_PER_100) * 4,
  600: (DOUBLE_SIDED_PRICE_PER_100 - UNIT_PRICE_PER_100) * 6,
};
const CORNER_SURCHARGE: Record<number, number> = {
  200: CORNER_PRICE_PER_100 * 2,
  400: CORNER_PRICE_PER_100 * 4,
  600: CORNER_PRICE_PER_100 * 6,
};

function calcPrice(qty: number, _paper: string, doubleSided: boolean, cornerCut: boolean = false): number {
  // 100매 단위로 반올림
  const units = Math.ceil(qty / 100);
  const basePerUnit = doubleSided ? DOUBLE_SIDED_PRICE_PER_100 : UNIT_PRICE_PER_100;
  const cornerPerUnit = cornerCut ? CORNER_PRICE_PER_100 : 0;
  return units * (basePerUnit + cornerPerUnit);
}

// ─── 샘플 전송 컴포넌트 ──────────────────────────────────────────────
function SampleUploadFlow({ onBack }: { onBack: () => void }) {
  const [, navigate] = useLocation();
  const [sampleStep, setSampleStep] = useState<1 | 2 | 3>(1);
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; size: number; preview: string | null; type: string }[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [sampleData, setSampleData] = useState({
    quantity: 200,
    paperType: "표준용지",
    doubleSided: false,
    deliveryDate: "",
    deliveryAddress: "",
    deliveryContact: "",
    notes: "",
    approverName: "",
    approverPhone: "",
    budgetCode: "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newFiles = files.map((file) => ({
      name: file.name,
      size: file.size,
      type: file.type,
      preview: file.type.startsWith("image/")
        ? URL.createObjectURL(file)
        : null,
    }));
    setUploadedFiles((prev) => [...prev, ...newFiles]);
    if (newFiles.length > 0) toast.success(`${newFiles.length}개 파일이 업로드되었습니다.`);
  };

  const removeFile = (idx: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const samplePrice = calcPrice(sampleData.quantity, sampleData.paperType, sampleData.doubleSided);

  const handleSampleSubmit = () => {
    toast.success("샘플 전송이 접수되었습니다. 담당자가 검토 후 연락드립니다.");
    navigate("/dashboard");
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  const getFileIcon = (type: string, name: string) => {
    if (type.startsWith("image/")) return "🖼️";
    if (type === "application/pdf" || name.endsWith(".pdf")) return "📄";
    if (name.endsWith(".hwp") || name.endsWith(".hwpx")) return "📝";
    if (name.endsWith(".doc") || name.endsWith(".docx")) return "📝";
    if (name.endsWith(".ai") || name.endsWith(".psd")) return "🎨";
    return "📁";
  };

  return (
    <div>
      {/* 브레드크럼브 바 */}
      <div className="bg-[#f5f5f7] border-b border-black/5">
        <div className="w-full px-[15%] py-3">
          <div className="flex items-center">
            <nav className="flex items-center gap-1.5 text-[12px]">
              <Link href="/" className="text-[#86868b] hover:text-[#00A39B] transition-colors">홈</Link>
              <ChevronRight className="w-3 h-3 text-[#86868b]" />
              <Link href="/category/namecard" className="text-[#86868b] hover:text-[#00A39B] transition-colors">명함</Link>
              <ChevronRight className="w-3 h-3 text-[#86868b]" />
              <span className="text-[#1d1d1f] font-medium">샘플 전송</span>
            </nav>
          </div>
        </div>
      </div>

      {/* 직접생산 배지 */}
      <div className="bg-[#EBF3FF] border-b border-[#00A39B]/20">
        <div className="w-full px-[15%] py-3">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 shrink-0">
              <ShieldCheck className="w-4 h-4 text-[#00A39B]" />
              <span className="text-[13px] font-bold text-[#00A39B]">직접생산확인증명서 취득 업체</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#00A39B] text-white text-[11px] font-semibold rounded-full">
                <BadgeCheck className="w-3 h-3" /> 명함 · 인쇄물
              </span>
            </div>
            <span className="text-[11px] text-[#5B9BD5] ml-auto shrink-0">중소기업 직접생산 확인 기준 · 조달청 등록</span>
          </div>
        </div>
      </div>

      {/* 헤더 */}
      <section className="bg-white py-10 md:py-14">
        <div className="w-full px-[15%]">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

            <div className="flex items-center gap-3 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FF9500]/10 text-[#FF9500] text-[12px] font-semibold rounded-full">
                <Upload className="w-3 h-3" /> 샘플 전송
              </span>
            </div>
            <h1 className="text-[clamp(1.5rem,4vw,2.5rem)] font-bold tracking-tight text-[#1d1d1f] mb-4">명함 샘플 전송</h1>
            {/* 단계 표시 */}
            <div className="flex items-center gap-2 mb-8">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold transition-all ${
                    s < sampleStep ? "bg-[#34C759] text-white" :
                    s === sampleStep ? "bg-[#FF9500] text-white" :
                    "bg-[#e8e8ed] text-[#86868b]"
                  }`}>
                    {s < sampleStep ? <CheckCircle2 className="w-4 h-4" /> : s}
                  </div>
                  {s < 3 && <div className={`h-0.5 w-8 transition-all ${s < sampleStep ? "bg-[#34C759]" : "bg-[#e8e8ed]"}`} />}
                </div>
              ))}
              <span className="ml-2 text-[13px] text-[#86868b]">
                {["샘플 업로드", "주문 정보", "전송 확인"][sampleStep - 1]}
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 콘텐츠 */}
      <section className="bg-[#f5f5f7] py-10 md:py-14">
        <div className="w-full px-[15%]">
          <AnimatePresence mode="wait">

            {/* Step 1: 샘플 업로드 */}
            {sampleStep === 1 && (
              <motion.div key="s-step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                <div className="grid lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-6">

                    {/* 모바일 카메라 촬영 */}
                    {isMobile && (
                      <div className="bg-white rounded-2xl p-8 shadow-sm">
                        <div className="flex items-center gap-2 mb-5">
                          <div className="w-8 h-8 rounded-full bg-[#FF9500]/10 flex items-center justify-center">
                            <span className="text-[14px]">📷</span>
                          </div>
                          <h3 className="text-[17px] font-bold text-[#1d1d1f]">모바일 카메라로 촬영</h3>
                        </div>
                        <p className="text-[14px] text-[#86868b] mb-5">기존 명함을 카메라로 촬영하여 전송하세요. 앞면과 뒷면 모두 촬영하면 더 정확한 제작이 가능합니다.</p>
                        <button
                          onClick={() => cameraInputRef.current?.click()}
                          className="w-full py-4 bg-[#FF9500] text-white text-[15px] font-semibold rounded-2xl hover:bg-[#E08800] transition-colors flex items-center justify-center gap-2"
                        >
                          <span className="text-[18px]">📷</span> 카메라로 촬영하기
                        </button>
                        <input
                          ref={cameraInputRef}
                          type="file"
                          accept="image/*"
                          capture="environment"
                          className="hidden"
                          onChange={handleFileChange}
                        />
                      </div>
                    )}

                    {/* 파일 업로드 */}
                    <div className="bg-white rounded-2xl p-8 shadow-sm">
                      <div className="flex items-center gap-2 mb-5">
                        <div className="w-8 h-8 rounded-full bg-[#00A39B]/10 flex items-center justify-center">
                          <Upload className="w-4 h-4 text-[#00A39B]" />
                        </div>
                        <h3 className="text-[17px] font-bold text-[#1d1d1f]">파일 업로드</h3>
                      </div>
                      <p className="text-[14px] text-[#86868b] mb-5">지원 형식: PDF, JPEG, PNG, HWP, HWPX, DOC, DOCX, AI, PSD</p>

                      {/* 드래그 앤 드롭 영역 */}
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-[#d2d2d7] hover:border-[#FF9500] rounded-2xl p-10 text-center cursor-pointer transition-all hover:bg-[#FF9500]/5 group"
                      >
                        <div className="w-14 h-14 rounded-2xl bg-[#f5f5f7] group-hover:bg-[#FF9500]/10 flex items-center justify-center mx-auto mb-4 transition-colors">
                          <Upload className="w-7 h-7 text-[#86868b] group-hover:text-[#FF9500] transition-colors" />
                        </div>
                        <p className="text-[15px] font-semibold text-[#1d1d1f] mb-1">파일을 이곳에 드래그하거나 클릭하세요</p>
                        <p className="text-[13px] text-[#86868b]">PDF · JPEG · PNG · HWP · DOC · AI · PSD 등</p>
                        <p className="text-[12px] text-[#86868b] mt-2">파일당 최대 20MB · 최대 5개</p>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*,.pdf,.hwp,.hwpx,.doc,.docx,.ai,.psd"
                        className="hidden"
                        onChange={handleFileChange}
                      />

                      {/* 업로드된 파일 목록 */}
                      {uploadedFiles.length > 0 && (
                        <div className="mt-5 space-y-3">
                          <p className="text-[13px] font-semibold text-[#1d1d1f]">업로드된 파일 ({uploadedFiles.length}개)</p>
                          {uploadedFiles.map((file, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-3 bg-[#f5f5f7] rounded-xl border border-[#e8e8ed]">
                              {file.preview ? (
                                <img src={file.preview} alt={file.name} className="w-12 h-12 object-cover rounded-lg border border-[#e8e8ed] shrink-0" />
                              ) : (
                                <div className="w-12 h-12 rounded-lg bg-white border border-[#e8e8ed] flex items-center justify-center text-[20px] shrink-0">
                                  {getFileIcon(file.type, file.name)}
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-[13px] font-medium text-[#1d1d1f] truncate">{file.name}</p>
                                <p className="text-[11px] text-[#86868b]">{formatFileSize(file.size)}</p>
                              </div>
                              <button onClick={() => removeFile(idx)} className="w-7 h-7 rounded-full bg-[#e8e8ed] hover:bg-red-100 hover:text-red-500 flex items-center justify-center transition-colors shrink-0">
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* 안내 */}
                    <div className="p-5 bg-[#FF9500]/5 border border-[#FF9500]/20 rounded-2xl">
                      <div className="flex items-start gap-3">
                        <Bell className="w-5 h-5 text-[#FF9500] shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[13px] font-semibold text-[#FF9500] mb-1">샘플 전송 안내</p>
                          <ul className="text-[12px] text-[#86868b] space-y-1 list-disc list-inside">
                            <li>업로드한 샘플을 기반으로 동일하게 제작합니다.</li>
                            <li>이미지가 다소 흘리거나 저해상이라도 담당자가 원본에 맞춰 제작합니다.</li>
                            <li>HWP 파일은 폰트 포함 저장 권장합니다.</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (uploadedFiles.length === 0) { toast.error("샘플 파일을 업로드해주세요."); return; }
                        setSampleStep(2);
                      }}
                      className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#FF9500] text-white text-[15px] font-semibold rounded-full hover:bg-[#E08800] transition-all hover:shadow-lg hover:shadow-[#FF9500]/20"
                    >
                      다음 단계 <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* 사이드 패널 */}
                  <div className="lg:col-span-1">
                    <div className="sticky top-24 bg-white rounded-2xl p-6 shadow-sm">
                      <h4 className="text-[14px] font-bold text-[#1d1d1f] mb-3">샘플 업로드 안내</h4>
                      <div className="space-y-3 text-[13px]">
                        <div className="p-3 bg-[#f5f5f7] rounded-xl">
                          <p className="font-semibold text-[#1d1d1f] mb-1">지원 형식</p>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {["PDF", "JPEG", "PNG", "HWP", "HWPX", "DOC", "AI", "PSD"].map((fmt) => (
                              <span key={fmt} className="px-2 py-0.5 bg-white border border-[#e8e8ed] rounded-full text-[11px] text-[#424245] font-medium">{fmt}</span>
                            ))}
                          </div>
                        </div>
                        <div className="p-3 bg-[#f5f5f7] rounded-xl">
                          <p className="font-semibold text-[#1d1d1f] mb-1">촬영 팁</p>
                          <ul className="text-[12px] text-[#86868b] space-y-1 list-disc list-inside">
                            <li>명함 전체가 프레임에 들어오게 촬영</li>
                            <li>조명이 밝은 곳에서 촬영</li>
                            <li>앞면 + 뒷면 모두 촬영 권장</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: 주문 정보 */}
            {sampleStep === 2 && (
              <motion.div key="s-step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                <div className="grid lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl p-8 shadow-sm">
                      <h3 className="text-[17px] font-bold text-[#1d1d1f] mb-6">수량 · 옵션</h3>
                      <div className="space-y-5">
                        {/* 수량 */}
                        <div>
                          <label className="block text-[13px] font-medium text-[#1d1d1f] mb-2">수량 <span className="text-red-500">*</span></label>
                          <div className="grid grid-cols-3 gap-3 mb-2">
                            {[200, 400, 600].map((q) => (
                              <button key={q} onClick={() => setSampleData((p) => ({ ...p, quantity: q }))}
                                className={`py-3 rounded-xl text-[14px] font-semibold border-2 transition-all ${
                                  sampleData.quantity === q
                                    ? "border-[#FF9500] bg-[#FF9500]/5 text-[#FF9500]"
                                    : "border-[#e8e8ed] text-[#1d1d1f] hover:border-[#FF9500]/50"
                                }`}>
                                {q}장
                              </button>
                            ))}
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min={100}
                              max={2000}
                              step={100}
                              value={sampleData.quantity}
                              onChange={(e) => {
                                const v = Math.max(100, Math.min(2000, Number(e.target.value)));
                                setSampleData(p => ({ ...p, quantity: v }));
                              }}
                              onBlur={(e) => {
                                const v = Math.ceil(Math.max(100, Number(e.target.value)) / 100) * 100;
                                setSampleData(p => ({ ...p, quantity: v }));
                              }}
                              className="w-full px-4 py-2.5 text-[14px] bg-[#f5f5f7] border-0 rounded-xl focus:ring-2 focus:ring-[#FF9500]/30 focus:bg-white transition-all outline-none"
                              placeholder="직접 입력 (100매 단위)"
                            />
                            <span className="text-[13px] text-[#86868b] shrink-0">장</span>
                          </div>
                          <p className="text-[11px] text-[#86868b] mt-1">100매 단위 단가 적용 · 최소 100매 · 최대 2,000매</p>
                        </div>
                        {/* 용지 */}
                        <div>
                          <label className="block text-[13px] font-medium text-[#1d1d1f] mb-2">용지 종류</label>
                          <div className="grid grid-cols-3 gap-3">
                            {["표준용지", "고급 무광", "유광"].map((p) => (
                              <button key={p} onClick={() => setSampleData((prev) => ({ ...prev, paperType: p }))}
                                className={`py-3 rounded-xl text-[14px] font-semibold border-2 transition-all ${
                                  sampleData.paperType === p
                                    ? "border-[#FF9500] bg-[#FF9500]/5 text-[#FF9500]"
                                    : "border-[#e8e8ed] text-[#1d1d1f] hover:border-[#FF9500]/50"
                                }`}>
                                {p}
                              </button>
                            ))}
                          </div>
                        </div>
                        {/* 양면 */}
                        <div>
                          <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-[#e8e8ed] hover:border-[#FF9500]/30 cursor-pointer transition-all">
                            <input type="checkbox" checked={sampleData.doubleSided} onChange={(e) => setSampleData((p) => ({ ...p, doubleSided: e.target.checked }))} className="w-4 h-4 accent-[#FF9500]" />
                            <div>
                              <p className="text-[14px] font-medium text-[#1d1d1f]">양면 인쇄</p>
                              <p className="text-[12px] text-[#86868b]">단면 대비 +{DOUBLE_SIDED_SURCHARGE[sampleData.quantity]?.toLocaleString()}원</p>
                            </div>
                          </label>
                        </div>
                        {/* 예산 코드 */}
                        <div>
                          <label className="block text-[13px] font-medium text-[#1d1d1f] mb-2">예산 코드</label>
                          <input type="text" value={sampleData.budgetCode} onChange={(e) => setSampleData((p) => ({ ...p, budgetCode: e.target.value }))} placeholder="예산 코드 입력 (선택사항)"
                            className="w-full px-4 py-3 text-[15px] bg-[#f5f5f7] border-0 rounded-xl focus:ring-2 focus:ring-[#FF9500]/30 focus:bg-white transition-all outline-none" />
                        </div>
                        {/* 납기일 */}
                        <div>
                          <label className="block text-[13px] font-medium text-[#1d1d1f] mb-2">납기일 <span className="text-red-500">*</span></label>
                          <input type="date" value={sampleData.deliveryDate} onChange={(e) => setSampleData((p) => ({ ...p, deliveryDate: e.target.value }))}
                            className="w-full px-4 py-3 text-[15px] bg-[#f5f5f7] border-0 rounded-xl focus:ring-2 focus:ring-[#FF9500]/30 focus:bg-white transition-all outline-none" />
                        </div>
                        {/* 배송 주소 */}
                        <div>
                          <label className="block text-[13px] font-medium text-[#1d1d1f] mb-2">배송 주소</label>
                          <input type="text" value={sampleData.deliveryAddress} onChange={(e) => setSampleData((p) => ({ ...p, deliveryAddress: e.target.value }))} placeholder="배송 받을 주소"
                            className="w-full px-4 py-3 text-[15px] bg-[#f5f5f7] border-0 rounded-xl focus:ring-2 focus:ring-[#FF9500]/30 focus:bg-white transition-all outline-none" />
                        </div>
                        {/* 결재자 */}
                        <div className="grid md:grid-cols-2 gap-5">
                          <div>
                            <label className="block text-[13px] font-medium text-[#1d1d1f] mb-2">결재자 이름 <span className="text-red-500">*</span></label>
                            <input type="text" value={sampleData.approverName} onChange={(e) => setSampleData((p) => ({ ...p, approverName: e.target.value }))} placeholder="부서장 이름"
                              className="w-full px-4 py-3 text-[15px] bg-[#f5f5f7] border-0 rounded-xl focus:ring-2 focus:ring-[#FF9500]/30 focus:bg-white transition-all outline-none" />
                          </div>
                          <div>
                            <label className="block text-[13px] font-medium text-[#1d1d1f] mb-2">결재자 연락처</label>
                            <input type="tel" value={sampleData.approverPhone} onChange={(e) => setSampleData((p) => ({ ...p, approverPhone: e.target.value }))} placeholder="010-0000-0000"
                              className="w-full px-4 py-3 text-[15px] bg-[#f5f5f7] border-0 rounded-xl focus:ring-2 focus:ring-[#FF9500]/30 focus:bg-white transition-all outline-none" />
                          </div>
                        </div>
                        {/* 특이사항 */}
                        <div>
                          <label className="block text-[13px] font-medium text-[#1d1d1f] mb-2">특이사항 · 수정 요청</label>
                          <textarea value={sampleData.notes} onChange={(e) => setSampleData((p) => ({ ...p, notes: e.target.value }))} rows={3} placeholder="샘플과 다르게 수정할 사항이 있으면 입력해주세요."
                            className="w-full px-4 py-3 text-[15px] bg-[#f5f5f7] border-0 rounded-xl focus:ring-2 focus:ring-[#FF9500]/30 focus:bg-white transition-all outline-none resize-none" />
                        </div>
                      </div>
                    </div>
                    <button onClick={() => {
                      if (!sampleData.deliveryDate) { toast.error("납기일을 선택해주세요."); return; }
                      if (!sampleData.approverName) { toast.error("결재자 이름을 입력해주세요."); return; }
                      setSampleStep(3);
                    }}
                      className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#FF9500] text-white text-[15px] font-semibold rounded-full hover:bg-[#E08800] transition-all hover:shadow-lg hover:shadow-[#FF9500]/20">
                      다음 단계 <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* 사이드 패널 */}
                  <div className="lg:col-span-1">
                    <div className="sticky top-24 bg-white rounded-2xl p-6 shadow-sm">
                      <h4 className="text-[14px] font-bold text-[#1d1d1f] mb-3">주문 요약</h4>
                      <div className="space-y-2 text-[13px]">
                        <div className="flex justify-between"><span className="text-[#86868b]">업로드 파일</span><span className="font-medium">{uploadedFiles.length}개</span></div>
                        <div className="flex justify-between"><span className="text-[#86868b]">수량</span><span className="font-medium">{sampleData.quantity}장</span></div>
                        <div className="flex justify-between"><span className="text-[#86868b]">용지</span><span className="font-medium">{sampleData.paperType}</span></div>
                        <div className="flex justify-between"><span className="text-[#86868b]">양면</span><span className="font-medium">{sampleData.doubleSided ? "양면" : "단면"}</span></div>
                        <div className="border-t border-[#e8e8ed] pt-2 flex justify-between">
                          <span className="font-bold">예상 금액</span>
                          <span className="text-[18px] font-bold text-[#FF9500]">{samplePrice.toLocaleString()}원</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: 전송 확인 */}
            {sampleStep === 3 && (
              <motion.div key="s-step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                <div className="grid lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl p-8 shadow-sm">
                      <h3 className="text-[17px] font-bold text-[#1d1d1f] mb-6">전송 내용 확인</h3>
                      <div className="space-y-4">
                        {/* 업로드 파일 */}
                        <div className="p-4 bg-[#f5f5f7] rounded-xl">
                          <p className="text-[12px] font-semibold text-[#86868b] mb-3 uppercase tracking-wide">업로드된 샘플 ({uploadedFiles.length}개)</p>
                          <div className="flex flex-wrap gap-2">
                            {uploadedFiles.map((file, idx) => (
                              <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-[#e8e8ed]">
                                <span className="text-[14px]">{getFileIcon(file.type, file.name)}</span>
                                <span className="text-[12px] text-[#1d1d1f] font-medium truncate max-w-[120px]">{file.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        {/* 주문 정보 */}
                        <div className="p-4 bg-[#f5f5f7] rounded-xl">
                          <p className="text-[12px] font-semibold text-[#86868b] mb-3 uppercase tracking-wide">주문 정보</p>
                          <div className="grid grid-cols-2 gap-2 text-[13px]">
                            <div className="flex justify-between"><span className="text-[#86868b]">수량</span><span className="font-medium">{sampleData.quantity}장</span></div>
                            <div className="flex justify-between"><span className="text-[#86868b]">용지</span><span className="font-medium">{sampleData.paperType}</span></div>
                            <div className="flex justify-between"><span className="text-[#86868b]">인쇄</span><span className="font-medium">{sampleData.doubleSided ? "양면" : "단면"}</span></div>
                            <div className="flex justify-between"><span className="text-[#86868b]">납기일</span><span className="font-medium">{sampleData.deliveryDate || "-"}</span></div>
                          </div>
                        </div>
                        {/* 결재 정보 */}
                        <div className="p-4 bg-[#f5f5f7] rounded-xl">
                          <p className="text-[12px] font-semibold text-[#86868b] mb-3 uppercase tracking-wide">결재 정보</p>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-[#e8e8ed]">
                              <div className="w-6 h-6 rounded-full bg-[#FF9500]/10 flex items-center justify-center">
                                <span className="text-[10px] font-bold text-[#FF9500]">1</span>
                              </div>
                              <span className="text-[13px] font-medium text-[#1d1d1f]">신청자 (본인)</span>
                            </div>
                            <ArrowRight className="w-4 h-4 text-[#86868b]" />
                            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-[#e8e8ed]">
                              <div className="w-6 h-6 rounded-full bg-[#FF9500]/10 flex items-center justify-center">
                                <span className="text-[10px] font-bold text-[#FF9500]">2</span>
                              </div>
                              <span className="text-[13px] font-medium text-[#1d1d1f]">{sampleData.approverName || "부서장"}</span>
                            </div>
                            <ArrowRight className="w-4 h-4 text-[#86868b]" />
                            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-[#e8e8ed]">
                              <div className="w-6 h-6 rounded-full bg-[#34C759]/10 flex items-center justify-center">
                                <span className="text-[10px] font-bold text-[#34C759]">3</span>
                              </div>
                              <span className="text-[13px] font-medium text-[#1d1d1f]">자동 발주</span>
                            </div>
                          </div>
                        </div>
                        {/* 예상 금액 */}
                        <div className="p-4 bg-[#FF9500]/5 border border-[#FF9500]/20 rounded-xl">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[#1d1d1f]">예상 금액</span>
                            <span className="text-[22px] font-bold text-[#FF9500]">{samplePrice.toLocaleString()}원</span>
                          </div>
                          <p className="text-[12px] text-[#86868b] mt-1">샘플 검토 후 최종 견적이 확정됩니다.</p>
                        </div>
                      </div>
                    </div>

                    {/* 승인 로그 */}
                    <div className="bg-white rounded-2xl p-8 shadow-sm">
                      <div className="flex items-center gap-2 mb-5">
                        <FileText className="w-5 h-5 text-[#FF9500]" />
                        <h3 className="text-[17px] font-bold text-[#1d1d1f]">승인 로그 타임라인</h3>
                      </div>
                      <div className="space-y-3">
                        {[
                          { time: new Date().toLocaleString("ko-KR"), actor: "신청자 (본인)", action: "샘플 전송 요청", status: "완료", color: "#34C759" },
                          { time: "대기 중", actor: sampleData.approverName || "부서장", action: "결재 승인", status: "대기", color: "#FF9500" },
                          { time: "대기 중", actor: "보건소플러스", action: "샘플 검토 및 제작", status: "대기", color: "#86868b" },
                        ].map((log, idx) => (
                          <div key={idx} className="flex items-start gap-4">
                            <div className="flex flex-col items-center">
                              <div className="w-3 h-3 rounded-full mt-1" style={{ backgroundColor: log.color }} />
                              {idx < 2 && <div className="w-0.5 h-8 bg-[#e8e8ed] mt-1" />}
                            </div>
                            <div className="flex-1 pb-3">
                              <div className="flex items-center justify-between">
                                <p className="text-[13px] font-semibold text-[#1d1d1f]">{log.actor} — {log.action}</p>
                                <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ backgroundColor: `${log.color}20`, color: log.color }}>{log.status}</span>
                              </div>
                              <p className="text-[11px] text-[#86868b] mt-0.5">{log.time}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button onClick={handleSampleSubmit}
                      className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#FF9500] text-white text-[15px] font-semibold rounded-full hover:bg-[#E08800] transition-all hover:shadow-lg hover:shadow-[#FF9500]/20">
                      샘플 전송 완료 <CheckCircle2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* 사이드 패널 */}
                  <div className="lg:col-span-1">
                    <div className="sticky top-24 bg-white rounded-2xl p-6 shadow-sm">
                      <h4 className="text-[14px] font-bold text-[#1d1d1f] mb-3">샘플 전송 요약</h4>
                      <div className="space-y-2 text-[13px]">
                        <div className="flex justify-between"><span className="text-[#86868b]">파일</span><span className="font-medium">{uploadedFiles.length}개</span></div>
                        <div className="flex justify-between"><span className="text-[#86868b]">수량</span><span className="font-medium">{sampleData.quantity}장</span></div>
                        <div className="flex justify-between"><span className="text-[#86868b]">납기일</span><span className="font-medium">{sampleData.deliveryDate || "-"}</span></div>
                        <div className="border-t border-[#e8e8ed] pt-2 flex justify-between">
                          <span className="font-bold">예상 금액</span>
                          <span className="text-[18px] font-bold text-[#FF9500]">{samplePrice.toLocaleString()}원</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}

export default function NamecardOrderForm() {
  const [, navigate] = useLocation();
  const searchString = useSearch();
  const { orderHistory, addOrderHistory } = useTemplate();
  const [mode, setMode] = useState<OrderMode>("select");
  const [step, setStep] = useState<Step>(1);
  const [hoveredDesign, setHoveredDesign] = useState<string | null>(null);
  const [selectedDesign, setSelectedDesign] = useState<string | null>(null);
  const [designSide, setDesignSide] = useState<"front" | "back">("front");
  const [selectedBackDesign, setSelectedBackDesign] = useState<string | null>(null);
  const [selectedPrevOrder, setSelectedPrevOrder] = useState<PreviousOrder | null>(null);
  const [previewZoom, setPreviewZoom] = useState(false);
  const backDesignSectionRef = useRef<HTMLDivElement>(null);
  const [showSaveComboModal, setShowSaveComboModal] = useState(false);
  const [saveComboLabel, setSaveComboLabel] = useState("");
  const [showSavedCombos, setShowSavedCombos] = useState(false);

  // 로그인 상태에서 deptCode, centerCode 가져오기
  const currentDeptCode = loginState.deptCode ?? "";
  const currentCenterCode = loginState.center?.centerCode ?? "";

  // 디자인 조합 목록 조회
  const { data: savedCombos = [], refetch: refetchCombos } = trpc.designCombos.list.useQuery(
    { centerCode: currentCenterCode, deptCode: currentDeptCode },
    { enabled: !!currentDeptCode && !!currentCenterCode }
  );

  // 디자인 조합 저장 mutation
  const saveComboMutation = trpc.designCombos.save.useMutation({
    onSuccess: () => {
      toast.success("디자인 조합이 저장되었습니다.");
      setShowSaveComboModal(false);
      setSaveComboLabel("");
      refetchCombos();
    },
    onError: () => toast.error("저장에 실패했습니다."),
  });

  // 디자인 조합 삭제 mutation
  const deleteComboMutation = trpc.designCombos.delete.useMutation({
    onSuccess: () => {
      toast.success("삭제되었습니다.");
      refetchCombos();
    },
  });

  // 공유된 조합 목록 조회 (같은 보건소)
  const [showSharedCombos, setShowSharedCombos] = useState(false);
  const { data: sharedCombos = [], refetch: refetchShared } = trpc.designCombos.sharedList.useQuery(
    { centerCode: currentCenterCode },
    { enabled: !!currentCenterCode }
  );

  // 공유 상태 토글 mutation
  const toggleShareMutation = trpc.designCombos.toggleShare.useMutation({
    onSuccess: () => {
      refetchCombos();
      refetchShared();
    },
    onError: () => toast.error("공유 설정 변경에 실패했습니다."),
  });

  // 신규 주문 폼 상태
  const [formData, setFormData] = useState({
    centerName: "",
    name: "",
    position: "",
    department: "",
    phone: "",
    directPhone: "",
    mobile: "",
    email: "",
    address: "",
    quantity: 200,
    paperType: "표준용지",
    doubleSided: false,
    roundedCorner: false,
    templateId: "",
    budgetCode: "",
    deliveryDate: "",
    deliveryAddress: "",
    deliveryContact: "",
    notes: "",
    approverName: "",
    approverPhone: "",
    notifyKakao: true,
    notifyEmail: false,
  });

  // 재주문 폼 상태
  const [reorderData, setReorderData] = useState({
    quantity: 200,
    paperType: "표준용지",
    doubleSided: false,
    budgetCode: "",
    deliveryDate: "",
    deliveryAddress: "",
    deliveryContact: "",
    notes: "",
    approverName: "",
    approverPhone: "",
  });

  // 보건소명 및 주소 자동 입력 (수정 가능)
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      centerName: prev.centerName || loginState.center?.name || "",
      address: prev.address || loginState.center?.address || "",
    }));
  }, []);

  // URL 파라미터로 이전 주문 자동 로드
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get("orderId");
    if (orderId) {
      const previousOrder = orderHistory.find((o) => o.id === orderId);
      if (previousOrder && previousOrder.productType === "namecard") {
        const specs = previousOrder.specifications;
        setFormData((prev) => ({
          ...prev,
          name: specs?.name || "",
          position: specs?.position || "",
          department: specs?.department || "",
          phone: specs?.phone || "",
          mobile: specs?.mobile || "",
          email: specs?.email || "",
          quantity: previousOrder.quantity || 200,
          paperType: specs?.paperType || "표준용지",
          doubleSided: specs?.doubleSided === "true",
          notes: previousOrder.modifications || "",
        }));
        setMode("new");
        toast.success("이전 주문 정보가 자동으로 로드되었습니다.");
      }
    }
  }, [orderHistory]);

  // 명함 이전 주문 목록
  const prevNamecardOrders: PreviousOrder[] = orderHistory
    .filter((o) => o.productType === "namecard")
    .map((o) => ({
      id: o.id,
      orderDate: o.orderDate || "",
      name: o.specifications?.name || "담당자",
      department: o.specifications?.department || "",
      quantity: o.quantity || 200,
      paperType: o.specifications?.paperType || "표준용지",
      doubleSided: o.specifications?.doubleSided === "true",
      specifications: o.specifications,
    }));

  // 부서 공유 이력 (같은 부서 동료 주문)
  const deptSharedOrders = prevNamecardOrders.filter(
    (o) => o.department === formData.department && o.name !== formData.name
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };


  const handleNewSubmit = () => {
    const orderId = `NC-${Date.now().toString().slice(-6)}`;
    addOrderHistory({
      id: orderId,
      userId: "current-user",
      templateId: "",
      productType: "namecard",
      productName: "표준명함",
      quantity: formData.quantity,
      orderDate: new Date().toISOString(),
      status: "pending",
      specifications: {
        centerName: formData.centerName,
        name: formData.name,
        position: formData.position,
        department: formData.department,
        phone: formData.phone,
        directPhone: formData.directPhone,
        mobile: formData.mobile,
        email: formData.email,
        paperType: formData.paperType,
        doubleSided: String(formData.doubleSided),
        roundedCorner: String(formData.roundedCorner),
        budgetCode: formData.budgetCode,
        deliveryDate: formData.deliveryDate,
        deliveryAddress: formData.deliveryAddress,
        deliveryContact: formData.deliveryContact,
        approverName: formData.approverName,
      },
      modifications: formData.notes || "",
      deliveryDate: formData.deliveryDate,
      notes: formData.notes || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    toast.success("명함 주문이 접수되었습니다. 결재 요청이 발송됩니다.");
    navigate("/dashboard");
  };

  const handleReorderSubmit = () => {
    if (!selectedPrevOrder) return;
    const orderId = `NC-RE-${Date.now().toString().slice(-6)}`;
    addOrderHistory({
      id: orderId,
      userId: "current-user",
      templateId: "",
      productType: "namecard",
      productName: "표준명함 (재주문)",
      quantity: reorderData.quantity,
      orderDate: new Date().toISOString(),
      status: "pending",
      specifications: {
        ...selectedPrevOrder.specifications,
        name: selectedPrevOrder.name,
        department: selectedPrevOrder.department,
        paperType: reorderData.paperType,
        doubleSided: String(reorderData.doubleSided),
        budgetCode: reorderData.budgetCode,
        deliveryDate: reorderData.deliveryDate,
        deliveryAddress: reorderData.deliveryAddress,
        deliveryContact: reorderData.deliveryContact,
        approverName: reorderData.approverName,
      },
      modifications: reorderData.notes || "",
      deliveryDate: reorderData.deliveryDate,
      notes: reorderData.notes || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    toast.success("재주문이 접수되었습니다. 결재 요청이 발송됩니다.");
    navigate("/dashboard");
  };

  // ─── 공통 레이아웃 래퍼 ───────────────────────────────────────────
  const PageWrapper = ({ children }: { children: React.ReactNode }) => (
    <div>
      {/* ── 필수 공지: 직접생산업체 자격 취득 업체 표시 ── */}
      <div className="bg-[#EBF3FF] border-b border-[#00A39B]/20">
        <div className="w-full px-[15%] py-3" style={{height: '43px', marginBottom: '-5px'}}>
          <div className="flex items-center gap-3 flex-wrap" style={{marginTop: '-9px'}}>
            <div className="flex items-center gap-2 shrink-0" style={{marginTop: '5px'}}>
              <ShieldCheck className="w-4 h-4 text-[#00A39B]" />
              <span className="text-[13px] font-bold text-[#00A39B]">직접생산확인증명서 취득 업체</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap" style={{marginTop: '4px'}}>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#00A39B] text-white text-[11px] font-semibold rounded-full">
                <BadgeCheck className="w-3 h-3" /> 명함 · 인쇄물
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#00A39B] text-white text-[11px] font-semibold rounded-full">
                <BadgeCheck className="w-3 h-3" /> 캘린더 · 다이어리
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#00A39B] text-white text-[11px] font-semibold rounded-full">
                <BadgeCheck className="w-3 h-3" /> 홍보물 · 부착물
              </span>
            </div>
            <span className="text-[11px] text-[#5B9BD5] ml-auto shrink-0" style={{fontSize: '15px', fontWeight: '700', marginTop: '6px'}}>중소기업 직접생산 확인 기준 · 조달청 등록</span>
          </div>
        </div>
      </div>

      {/* ── breadcrumb + 뒤로 버튼 (직접생산 배지 아래) ── */}
      <div className="bg-transparent">
        <div className="w-full px-[15%] py-3">
          <div className="flex items-center">
            <nav className="flex items-center gap-1.5 text-[12px]">
              <Link href="/" className="text-[#86868b] hover:text-[#00A39B] transition-colors">홈</Link>
              <ChevronRight className="w-3 h-3 text-[#86868b]" />
              <Link href="/category/namecard" className="text-[#86868b] hover:text-[#00A39B] transition-colors">명함</Link>
              <ChevronRight className="w-3 h-3 text-[#86868b]" />
              <span className="text-[#1d1d1f] font-medium">
                {mode === "select" ? "주문 유형 선택" : mode === "new" ? "신규 제작" : mode === "sample" ? "샘플 전송" : "재주문"}
              </span>
            </nav>
          </div>
        </div>
      </div>

      {children}
    </div>
  );

  // 단계 표시 바
  const StepBar = ({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) => (
    <div className="flex items-center gap-2 mb-8">
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
        <div key={s} className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold transition-all ${
            s < currentStep ? "bg-[#34C759] text-white" :
            s === currentStep ? "bg-[#00A39B] text-white" :
            "bg-[#e8e8ed] text-[#86868b]"
          }`}>
            {s < currentStep ? <CheckCircle2 className="w-4 h-4" /> : s}
          </div>
          {s < totalSteps && <div className={`h-0.5 w-8 transition-all ${s < currentStep ? "bg-[#34C759]" : "bg-[#e8e8ed]"}`} />}
        </div>
      ))}
      <span className="ml-2 text-[13px] text-[#86868b]">
        {["디자인 선택", "정보 입력", "수량·옵션", "미리보기", "결재 요청", "배송 정보"][currentStep - 1]}
      </span>
    </div>
  );

  // ─── Step 0: printbank 스타일 주문 페이지 ────────────────────────────
  if (mode === "select") {
    // 가격 계산
    const selectPrice = calcPrice(formData.quantity, formData.paperType, formData.doubleSided, formData.roundedCorner);
    const vat = Math.round(selectPrice * 0.1);
    const totalPrice = selectPrice + vat;

    // URL 파라미터에서 앞면 타입 읽기 (useSearch로 안정적으로 읽기)
    const urlParams = new URLSearchParams(searchString);
    const frontTypeFromUrl = urlParams.get("front") || "H형";

    // 앞면 8종 이미지 (CategoryPage productImages["10"]과 동일한 이미지 사용)
    const FRONT_IMAGES: Record<string, string> = {
      "A형": "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/표준명함-A형_6c9613ad_547857c6.webp",
      "B형": "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/표준명함-B형_503c21d0_523aa825.webp",
      "C형": "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/표준명함-C형_ab63ca48_45d43c24.webp",
      "D형": "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/표준명함-D형_2091e758_5ce12241.webp",
      "E형": "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/표준명함-E형_58183f4a_81e8e8ee.webp",
      "F형": "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/표준명함-F형_d3102d40_af657f8f.webp",
      "G형": "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/표준명함-G형_fad0bc70_31e8005a.webp",
      "H형": "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/표준명함-H형_aa45c00a_86d18f79.webp",
    };
    const frontImage = FRONT_IMAGES[frontTypeFromUrl] || FRONT_IMAGES["A형"];

    // 뒷면 4종 디자인 이미지 (선택 선택사항)
    const BACK_IMAGES = [
      { label: "A형", img: "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/표준명함_뒷면A_61cb33a1.png" },
      { label: "B형", img: "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/표준명함_뒷면B_3eab0c34.png" },
      { label: "C형", img: "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/표준명함_뒷면C_c1c46aaa.png" },
      { label: "D형", img: "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/표준명함_뒷면D_3e70b6ac.png" },
    ];
    const currentSelected = selectedBackDesign;

    return (
      <PageWrapper>
        <section className="bg-white py-6">
          <div className="w-full px-[15%]">
            <div className="flex items-center gap-3 mb-6">
              <h1 className="text-[22px] font-bold text-[#1d1d1f]">표준명함 <span className="text-[18px] font-semibold text-[#00A39B]">{frontTypeFromUrl}</span></h1>

            </div>

            <div className="flex flex-col lg:flex-row gap-8 items-stretch">
              {/* ── 좌측: 디자인 선택 ── */}
              <div className="flex-1 min-w-0 flex flex-col">
                {/* 섹션 타이틀 - 앞면 */}
                <p className="text-[13px] font-bold text-[#1d1d1f] mb-2">
                  표준명함 앞면 {frontTypeFromUrl}
                </p>

                {/* 대표 이미지 — 선택된 앞면 이미지 표시 */}
                <div className="bg-[#f5f5f7] overflow-hidden mb-4 flex items-center justify-center" style={{width: '100%', height: '580px'}}>
                  <img
                    src={frontImage}
                    alt={`표준명함 앞면 ${frontTypeFromUrl}`}
                    className="w-full h-full object-cover object-center"
                    style={{transform: 'scale(1.2) translateY(-20px)', transformOrigin: '50% 50%'}}
                  />
                </div>

                {/* 양면 선택 시 뒷면 영역 */}
                {formData.doubleSided && (
                  currentSelected ? (() => {
                    const selectedBack = BACK_IMAGES.find(b => b.label === currentSelected)!;
                    return (
                      <div className="mb-4">
                        <p className="text-[13px] font-bold text-[#1d1d1f] mb-2">
                          표준명함 뒷면 {selectedBack.label}
                        </p>
                        <div className="bg-[#f5f5f7] overflow-hidden flex items-center justify-center" style={{width: '100%', height: '580px'}}>
                          <img
                            src={selectedBack.img}
                            alt={`표준명함 뒷면 ${selectedBack.label}`}
                            className="w-full h-full object-cover object-center"
                            style={{transform: 'scale(1.2) translateY(-20px)', transformOrigin: '50% 50%'}}
                          />
                        </div>
                      </div>
                    );
                  })() : (
                    <div className="mb-4 flex items-start gap-3 px-4 py-3.5 bg-[#FFF8EC] border border-[#FFCC00]/60 rounded-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
                      <div>
                        <p className="text-[13px] font-semibold text-[#92400E] mb-0.5">뒷면 디자인을 선택해 주세요</p>
                        <p className="text-[12px] text-[#B45309]">양면 인쇄를 선택하셨습니다. 아래 A~D형 중 원하시는 뒷면 디자인을 선택하시면 미리보기가 표시됩니다.</p>
                      </div>
                    </div>
                  )
                )}

                {/* 뒷면 선택 섹션 (선택 선택사항) */}
                <div className="mb-6" ref={backDesignSectionRef}>
                  <div className="flex items-center gap-2 mb-3">
                    <p className="text-[13px] font-bold text-[#1d1d1f]">표준명함 뒷면 선택</p>
                    <span className="text-[11px] text-[#86868b] bg-[#f5f5f7] px-2 py-0.5 rounded-full">선택사항</span>
                    {currentSelected && (
                      <button
                        onClick={() => setSelectedBackDesign(null)}
                        className="ml-auto text-[11px] text-[#86868b] hover:text-[#1d1d1f] underline"
                      >
                        선택 해제
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {BACK_IMAGES.map(({ label, img }) => {
                      const isSelected = currentSelected === label;
                      return (
                        <button
                          key={label}
                          onClick={() => {
                            setSelectedBackDesign(isSelected ? null : label);
                          }}
                          onMouseEnter={() => setHoveredDesign(label)}
                          onMouseLeave={() => setHoveredDesign(null)}
                          className={`border-2 overflow-hidden transition-all rounded ${
                            isSelected
                              ? "border-[#00A39B] shadow-md ring-2 ring-[#00A39B]/20"
                              : hoveredDesign === label
                              ? "border-[#00A39B]/60 shadow-sm"
                              : "border-[#e5e5e7]"
                          }`}
                        >
                          {/* 5:4.2 비율 썸네일 */}
                          <div style={{aspectRatio: '5 / 4.2', overflow: 'hidden'}}>
                            <img
                              src={img}
                              alt={label}
                              className="w-full h-full object-cover block transition-transform duration-300"
                              style={{
                                transform: hoveredDesign === label ? 'scale(1.44)' : 'scale(1.2)',
                                transformOrigin: 'center center'
                              }}
                            />
                          </div>
                          <div className={`text-center py-1 text-[11px] font-semibold ${
                            isSelected ? "text-[#00A39B] bg-[#00A39B]/5" : "text-[#86868b]"
                          }`}>{label}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 디자인 조합 저장 버튼 */}
                {currentDeptCode && (
                  <div className="mb-5">
                    <div className="flex items-center gap-2 mb-3">
                      <button
                        onClick={() => {
                          const front = selectedDesign || frontTypeFromUrl || "H형";
                          const back = currentSelected;
                          const label = formData.doubleSided
                            ? `앞면 ${front} + 뒷면 ${back ?? "선택안함"}`
                            : `앞면 ${front} (단면)`;
                          setSaveComboLabel(label);
                          setShowSaveComboModal(true);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f5f5f7] hover:bg-[#e5e5e7] rounded-full text-[12px] font-medium text-[#1d1d1f] transition-all"
                      >
                        <Bookmark className="w-3.5 h-3.5" />
                        디자인 조합 저장
                      </button>
                      {savedCombos.length > 0 && (
                        <button
                          onClick={() => setShowSavedCombos(v => !v)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00A39B]/8 hover:bg-[#00A39B]/15 rounded-full text-[12px] font-medium text-[#00A39B] transition-all"
                        >
                          <BookmarkCheck className="w-3.5 h-3.5" />
                          저장된 조합 ({savedCombos.length})
                        </button>
                      )}
                      {sharedCombos.length > 0 && (
                        <button
                          onClick={() => setShowSharedCombos(v => !v)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 rounded-full text-[12px] font-medium text-blue-600 transition-all"
                        >
                          <Users className="w-3.5 h-3.5" />
                          보건소 공유 조합 ({sharedCombos.length})
                        </button>
                      )}
                    </div>

                    {/* 저장된 조합 목록 */}
                    {showSavedCombos && savedCombos.length > 0 && (
                      <div className="border border-[#e5e5e7] rounded-lg overflow-hidden">
                        <div className="px-4 py-2.5 bg-[#f5f5f7] border-b border-[#e5e5e7]">
                          <p className="text-[12px] font-semibold text-[#1d1d1f]">저장된 디자인 조합</p>
                        </div>
                        <div className="divide-y divide-[#f5f5f7]">
                          {savedCombos.map((combo) => (
                            <div key={combo.id} className="flex items-center justify-between px-4 py-3 hover:bg-[#fafafa] transition-colors">
                              <div>
                                <p className="text-[13px] font-medium text-[#1d1d1f]">{combo.label}</p>
                                <p className="text-[11px] text-[#86868b] mt-0.5">
                                  앞면: {combo.frontType}{combo.doubleSided ? ` · 뒷면: ${combo.backType ?? "-"}` : " (단면)"}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => {
                                    setSelectedDesign(combo.frontType);
                                    if (combo.doubleSided && combo.backType) {
                                      setFormData(f => ({ ...f, doubleSided: true }));
                                      setSelectedBackDesign(combo.backType);
                                    } else {
                                      setFormData(f => ({ ...f, doubleSided: false }));
                                      setSelectedBackDesign(null);
                                    }
                                    setShowSavedCombos(false);
                                    toast.success("디자인 조합이 적용되었습니다.");
                                  }}
                                  className="text-[11px] px-2.5 py-1 bg-[#00A39B] text-white rounded-full hover:bg-[#008f88] transition-colors"
                                >
                                  적용
                                </button>
                                <button
                                  title={combo.isShared ? "공유 중 (클릭 시 비공개)" : "보건소 내 공유"}
                                  onClick={() => toggleShareMutation.mutate({ id: combo.id, isShared: !combo.isShared })}
                                  className={`p-1 transition-colors ${combo.isShared ? 'text-blue-500 hover:text-blue-700' : 'text-[#86868b] hover:text-blue-500'}`}
                                >
                                  <Share2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => deleteComboMutation.mutate({ id: combo.id })}
                                  className="p-1 text-[#86868b] hover:text-red-500 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                    {/* 보건소 공유 조합 목록 */}
                    {showSharedCombos && sharedCombos.length > 0 && (
                      <div className="border border-blue-100 rounded-lg overflow-hidden mt-2">
                        <div className="px-4 py-2.5 bg-blue-50 border-b border-blue-100 flex items-center gap-2">
                          <Users className="w-3.5 h-3.5 text-blue-500" />
                          <p className="text-[12px] font-semibold text-blue-700">보건소 내 공유된 디자인 조합</p>
                        </div>
                        <div className="divide-y divide-blue-50">
                          {sharedCombos.map((combo) => (
                            <div key={combo.id} className="flex items-center justify-between px-4 py-3 hover:bg-blue-50/50 transition-colors">
                              <div>
                                <p className="text-[13px] font-medium text-[#1d1d1f]">{combo.label}</p>
                                <p className="text-[11px] text-[#86868b] mt-0.5">
                                  앞면: {combo.frontType}{combo.doubleSided ? ` · 뒷면: ${combo.backType ?? "-"}` : " (단면)"}
                                  {combo.deptCode && <span className="ml-1.5 text-blue-400">· {combo.deptCode}</span>}
                                </p>
                              </div>
                              <button
                                onClick={() => {
                                  setSelectedDesign(combo.frontType);
                                  if (combo.doubleSided && combo.backType) {
                                    setFormData(f => ({ ...f, doubleSided: true }));
                                    setSelectedBackDesign(combo.backType);
                                  } else {
                                    setFormData(f => ({ ...f, doubleSided: false }));
                                    setSelectedBackDesign(null);
                                  }
                                  setShowSharedCombos(false);
                                  toast.success("공유 디자인 조합이 적용되었습니다.");
                                }}
                                className="text-[11px] px-2.5 py-1 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                              >
                                적용
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 디자인 조합 저장 모달 */}
                {showSaveComboModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white rounded-2xl p-6 w-[320px] shadow-2xl">
                      <h3 className="text-[15px] font-bold text-[#1d1d1f] mb-1">디자인 조합 저장</h3>
                      <p className="text-[12px] text-[#86868b] mb-4">이 조합을 나중에 다시 사용할 수 있도록 저장합니다.</p>
                      <input
                        type="text"
                        value={saveComboLabel}
                        onChange={e => setSaveComboLabel(e.target.value)}
                        placeholder="조합 이름 (예: 연수구보건소 H형+A형)"
                        className="w-full border border-[#d2d2d7] rounded-lg px-3 py-2.5 text-[13px] mb-4 focus:outline-none focus:border-[#00A39B]"
                        maxLength={128}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowSaveComboModal(false)}
                          className="flex-1 py-2.5 border border-[#d2d2d7] rounded-lg text-[13px] text-[#86868b] hover:bg-[#f5f5f7] transition-colors"
                        >
                          취소
                        </button>
                        <button
                          onClick={() => {
                            if (!saveComboLabel.trim()) { toast.error("조합 이름을 입력해 주세요."); return; }
                            saveComboMutation.mutate({
                              centerCode: currentCenterCode,
                              deptCode: currentDeptCode,
                              label: saveComboLabel.trim(),
                              frontType: selectedDesign || frontTypeFromUrl || "H형",
                              backType: currentSelected ?? undefined,
                              doubleSided: formData.doubleSided,
                            });
                          }}
                          disabled={saveComboMutation.isPending}
                          className="flex-1 py-2.5 bg-[#00A39B] text-white rounded-lg text-[13px] font-semibold hover:bg-[#008f88] disabled:opacity-50 transition-colors"
                        >
                          {saveComboMutation.isPending ? "저장 중..." : "저장"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 제품 안내 탭 */}
                <div className="border border-[#e5e5e7] overflow-hidden">
                  <div className="flex border-b border-[#e5e5e7]">
                    <div className="px-5 py-3 text-[13px] font-semibold text-white bg-[#1d1d1f] border-b-2 border-[#1d1d1f]">제품안내</div>
                    <div className="px-5 py-3 text-[13px] text-[#86868b]">주의사항</div>
                    <div className="px-5 py-3 text-[13px] text-[#86868b]">배송안내</div>
                  </div>
                  <div className="p-5 text-[13px] text-[#3d3d3f] leading-relaxed space-y-2">
                    <p>· 보건소 전용 표준명함으로 기관 내 명함 규격을 통일합니다.</p>
                    <p>· 재단 시 1~2mm 오차가 발생할 수 있습니다.</p>
                    <p>· 인쇄 색상은 모니터 환경에 따라 실제와 차이가 있을 수 있습니다.</p>
                    <p>· 접수 후 영업일 기준 2~3일 내 출고됩니다.</p>
                    <p>· 대량 주문(10건 이상) 시 별도 문의 바랍니다.</p>
                  </div>
                </div>
              </div>

              {/* ── 우측: 주문 옵션 + 가격 요약 ── */}
              <div className="w-full lg:w-[340px] shrink-0">
                {/* 제목 */}
                <div className="mb-5">
                  <h2 className="text-[20px] font-bold text-[#1d1d1f] mb-1">표준명함</h2>
                  <p className="text-[13px] text-[#86868b]">90×50mm · 보건소 전용 표준 규격</p>
                </div>

                {/* 옵션 폼 */}
                <div className="space-y-4 mb-5">
                  {/* 수량 */}
                  <div>
                    <label className="block text-[13px] font-semibold text-[#1d1d1f] mb-1.5">수량</label>
                    <div className="flex gap-2 mb-2">
                      {[200, 400, 600].map((q) => (
                        <button key={q} onClick={() => setFormData(f => ({ ...f, quantity: q }))}
                          className={`flex-1 py-2 rounded border text-[13px] font-medium transition-all ${
                            formData.quantity === q ? "border-[#00A39B] bg-[#00A39B]/5 text-[#00A39B]" : "border-[#d2d2d7] text-[#86868b] hover:border-[#00A39B]/50"
                          }`}>{q}매</button>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={100}
                        max={2000}
                        step={100}
                        value={formData.quantity}
                        onChange={(e) => {
                          const v = Math.max(100, Math.min(2000, Number(e.target.value)));
                          setFormData(f => ({ ...f, quantity: v }));
                        }}
                        onBlur={(e) => {
                          const v = Math.ceil(Math.max(100, Number(e.target.value)) / 100) * 100;
                          setFormData(f => ({ ...f, quantity: v }));
                        }}
                        className="w-full border border-[#d2d2d7] rounded px-3 py-2.5 text-[14px] text-[#1d1d1f] focus:outline-none focus:border-[#00A39B] bg-white"
                        placeholder="직접 입력 (100매 단위)"
                      />
                      <span className="text-[13px] text-[#86868b] shrink-0">매</span>
                    </div>
                    <p className="text-[11px] text-[#86868b] mt-1">100매 단위 입력 · 최소 100매 · 최대 2,000매</p>
                  </div>

                  {/* 용지 */}
                  <div>
                    <label className="block text-[13px] font-semibold text-[#1d1d1f] mb-1.5">용지</label>
                    <select
                      value={formData.paperType}
                      onChange={(e) => setFormData(f => ({ ...f, paperType: e.target.value }))}
                      className="w-full border border-[#d2d2d7] rounded px-3 py-2.5 text-[14px] text-[#1d1d1f] focus:outline-none focus:border-[#00A39B] bg-white"
                    >
                      <option value="표준용지">표준용지</option>
                      <option value="고급 무광">고급 무광</option>
                      <option value="유광">유광</option>
                    </select>
                  </div>

                  {/* 인쇄 */}
                  <div>
                    <label className="block text-[13px] font-semibold text-[#1d1d1f] mb-1.5">인쇄</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setFormData(f => ({ ...f, doubleSided: false }))}
                        className={`flex-1 py-2.5 rounded border text-[13px] font-medium transition-all ${
                          !formData.doubleSided ? "border-[#00A39B] bg-[#00A39B]/5 text-[#00A39B]" : "border-[#d2d2d7] text-[#86868b] hover:border-[#00A39B]/50"
                        }`}
                      >단면</button>
                      <button
                        onClick={() => {
                          setFormData(f => ({ ...f, doubleSided: true }));
                          setTimeout(() => {
                            backDesignSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          }, 100);
                        }}
                        className={`flex-1 py-2.5 rounded border text-[13px] font-medium transition-all ${
                          formData.doubleSided ? "border-[#00A39B] bg-[#00A39B]/5 text-[#00A39B]" : "border-[#d2d2d7] text-[#86868b] hover:border-[#00A39B]/50"
                        }`}
                      >양면</button>
                    </div>
                  </div>

                  {/* 둥근모서리 */}
                  <div>
                    <label className="block text-[13px] font-semibold text-[#1d1d1f] mb-1.5">모서리</label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setFormData(f => ({ ...f, roundedCorner: false }))}
                        className={`flex-1 py-2.5 rounded border text-[13px] font-medium transition-all ${
                          !formData.roundedCorner ? "border-[#00A39B] bg-[#00A39B]/5 text-[#00A39B]" : "border-[#d2d2d7] text-[#86868b] hover:border-[#00A39B]/50"
                        }`}
                      >없음</button>
                      <button
                        onClick={() => setFormData(f => ({ ...f, roundedCorner: true }))}
                        className={`flex-1 py-2.5 rounded border text-[13px] font-medium transition-all ${
                          formData.roundedCorner ? "border-[#00A39B] bg-[#00A39B]/5 text-[#00A39B]" : "border-[#d2d2d7] text-[#86868b] hover:border-[#00A39B]/50"
                        }`}
                      >둥근모서리</button>
                    </div>
                  </div>
                </div>

                {/* 가격 요약 박스 */}
                <div className="border border-[#e5e5e7] p-4 mb-5 bg-[#fafafa]">
                  <div className="text-[13px] font-bold text-[#1d1d1f] mb-3">표준명함</div>
                  <div className="space-y-2 text-[13px]">
                    <div className="flex justify-between">
                      <span className="text-[#86868b]">규격</span>
                      <span className="text-[#1d1d1f]">90×50mm</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#86868b]">디자인</span>
                      <span className="text-[#1d1d1f]">{selectedDesign || frontTypeFromUrl}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#86868b]">용지</span>
                      <span className="text-[#1d1d1f]">{formData.paperType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#86868b]">수량</span>
                      <span className="text-[#1d1d1f]">{formData.quantity}매</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#86868b]">모서리</span>
                      <span className="text-[#1d1d1f]">{formData.roundedCorner ? "둥근모서리" : "없음"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#86868b]">예상출고일</span>
                      <span className="text-[#00A39B] font-semibold">영업일 2~3일</span>
                    </div>
                  </div>
                  <div className="border-t border-[#e5e5e7] mt-3 pt-3 space-y-1.5 text-[13px]">
                    <div className="flex justify-between">
                      <span className="text-[#86868b]">인쇄비</span>
                      <span className="text-[#1d1d1f]">{selectPrice.toLocaleString()}원</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#86868b]">부가세 (10%)</span>
                      <span className="text-[#1d1d1f]">{vat.toLocaleString()}원</span>
                    </div>
                    <div className="flex justify-between font-bold text-[15px] pt-1">
                      <span className="text-[#1d1d1f]">총 결제금액</span>
                      <span className="text-[#00A39B]">{totalPrice.toLocaleString()}원</span>
                    </div>
                    <p className="text-[11px] text-[#86868b] mt-1">※ 배송비 별도</p>
                  </div>
                </div>

                {/* 주문 버튼 */}
                <div className="space-y-2.5">
                  <button
                    onClick={() => {
                      setFormData(f => ({ ...f, templateId: selectedDesign || frontTypeFromUrl }));
                      setMode("new"); setStep(1);
                    }}
                    className="w-full py-3.5 bg-[#00A39B] text-white text-[15px] font-bold rounded hover:bg-[#008f88] transition-colors" style={{fontSize: '16px'}}
                  >
                    신규 제작 주문하기
                  </button>
                  <button
                    onClick={() => setLocation("/category/namecard")}
                    className="w-full py-3 border-2 border-[#00A39B] text-[#00A39B] text-[18px] font-semibold rounded hover:bg-[#00A39B]/5 transition-colors" style={{fontSize: '16px'}}
                  >
                    우리 보건소 명함 디자인으로 주문
                  </button>

                </div>
              </div>
            </div>
          </div>
        </section>
      </PageWrapper>
    );
  }

  // ─── 신규 제작 6단계 ──────────────────────────────────────────────
  if (mode === "new") {
    const price = calcPrice(formData.quantity, formData.paperType, formData.doubleSided, formData.roundedCorner);

    return (
      <PageWrapper>
        <section className="bg-white pt-4 pb-5 md:pt-5 md:pb-6">
          <div className="w-full px-[15%]">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <div className="flex items-center justify-end mb-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#00A39B]/10 text-[#00A39B] text-[12px] font-semibold rounded-full">
                  <Plus className="w-3 h-3" /> 신규 제작
                </span>
              </div>
              <h1 className="text-[clamp(1.2rem,3vw,1.8rem)] font-bold tracking-tight text-[#1d1d1f] mb-3">표준명함 신규 제작</h1>
              <StepBar currentStep={step} totalSteps={6} />
            </motion.div>
          </div>
        </section>

        <section className="bg-[#f5f5f7] py-10 md:py-14">
          <div className="w-full px-[15%]">
            <AnimatePresence mode="wait">

              {/* Step 1: 디자인 선택 */}
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                  <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                      {/* 표준 템플릿 선택 */}
                      <div className="bg-white rounded-2xl p-8 shadow-sm">
                        <h3 className="text-[17px] font-bold text-[#1d1d1f] mb-5">표준 명함 디자인 선택</h3>
                        <div className="grid grid-cols-2 gap-4">
                          {[
                            { label: "A형", img: "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/표준명함_AType_2842e2fe.png" },
                            { label: "B형", img: "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/표준명함_BType_c001cd9d.png" },
                            { label: "C형", img: "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/표준명함_CType_443dc32f.png" },
                            { label: "D형", img: "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/표준명함_DType_8a14a407.png" },
                          ].map(({ label, img }, idx) => (
                            <div key={idx} className="cursor-pointer" onClick={() => { setFormData(f => ({ ...f, templateId: label })); toast.success(`${label} 디자인을 선택했습니다.`); }}>
                              <div className={`overflow-hidden border transition-colors ${
                                formData.templateId === label ? "border-[#00A39B] outline outline-2 outline-[#00A39B]/20" : "border-[#d2d2d7] hover:border-[#00A39B]"
                              }`}>
                                <img src={img} alt={`표준 명함 ${label}`} className="w-full object-cover block" />
                              </div>
                              <div className="flex items-center justify-between mt-1.5 px-0.5">
                                <span className={`text-[12px] font-semibold ${
                                  formData.templateId === label ? "text-[#00A39B]" : "text-[#1d1d1f]"
                                }`}>
                                  {label}{formData.templateId === label && " ✔"}
                                </span>
                                <span className="text-[11px] text-[#86868b]">90×50mm</span>
                              </div>
                            </div>
                          ))}
                        </div>
                        <p className="text-[12px] text-[#86868b] mt-3">※ 클릭하여 디자인을 선택하세요.</p>
                      </div>

                      {/* 부서 공유 이력 */}
                      <div className="bg-white rounded-2xl p-8 shadow-sm">
                        <div className="flex items-center gap-2 mb-5">
                          <Users className="w-5 h-5 text-[#00A39B]" />
                          <h3 className="text-[17px] font-bold text-[#1d1d1f]">부서 공유 이력</h3>
                          <span className="text-[12px] text-[#86868b] ml-auto">같은 부서 동료의 이전 명함을 참고하세요</span>
                        </div>
                        {deptSharedOrders.length > 0 ? (
                          <div className="space-y-3">
                            {deptSharedOrders.map((order) => (
                              <button key={order.id} onClick={() => { setSelectedPrevOrder(order); toast.success(`${order.name}님의 디자인을 참고합니다.`); }}
                                className="w-full text-left p-4 rounded-xl border-2 border-[#e8e8ed] hover:border-[#00A39B]/50 bg-[#f5f5f7] hover:bg-[#00A39B]/5 transition-all">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="text-[14px] font-semibold text-[#1d1d1f]">{order.name} <span className="text-[#86868b] font-normal">· {order.department}</span></p>
                                    <p className="text-[12px] text-[#86868b] mt-0.5">{order.paperType} · {order.quantity}장 · {order.orderDate?.slice(0, 10)}</p>
                                  </div>
                                  <span className="text-[12px] text-[#00A39B] font-semibold">참고하기</span>
                                </div>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 text-[#86868b]">
                            <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                            <p className="text-[14px]">같은 부서의 이전 주문 이력이 없습니다.</p>
                            <p className="text-[12px] mt-1">정보 입력 후 부서명을 입력하면 이력이 표시됩니다.</p>
                          </div>
                        )}
                      </div>

                    </div>

                    {/* 사이드 안내 + 예상금액 */}
                    <div className="lg:col-span-1">
                      <div className="sticky top-24 space-y-4">
                        {/* 예상 금액 미리보기 */}
                        <div className="bg-[#EBF3FF] border border-[#00A39B]/20 rounded-2xl p-5">
                          <div className="flex items-center gap-2 mb-3">
                            <FileText className="w-4 h-4 text-[#00A39B]" />
                            <h4 className="text-[13px] font-bold text-[#00A39B]">건별 예상 금액</h4>
                          </div>
                          <div className="space-y-1.5 text-[12px] mb-3">
                            <div className="flex justify-between"><span className="text-[#5B9BD5]">수량</span><span className="font-medium text-[#1d1d1f]">{formData.quantity}장</span></div>
                            <div className="flex justify-between"><span className="text-[#5B9BD5]">용지</span><span className="font-medium text-[#1d1d1f]">{formData.paperType}</span></div>
                            <div className="flex justify-between"><span className="text-[#5B9BD5]">인쇄</span><span className="font-medium text-[#1d1d1f]">{formData.doubleSided ? "양면" : "단면"}</span></div>
                            <div className="flex justify-between"><span className="text-[#5B9BD5]">모서리</span><span className="font-medium text-[#1d1d1f]">{formData.roundedCorner ? "둥근모서리" : "없음"}</span></div>
                          </div>
                          <div className="border-t border-[#00A39B]/20 pt-3 flex justify-between items-center">
                            <span className="text-[13px] font-bold text-[#1d1d1f]">예상 금액</span>
                            <span className="text-[22px] font-extrabold text-[#00A39B]">{calcPrice(formData.quantity, formData.paperType, formData.doubleSided, formData.roundedCorner).toLocaleString()}원</span>
                          </div>
                          <p className="text-[10px] text-[#86868b] mt-1.5">※ 수량·옵션 선택 시 자동 갱신</p>
                        </div>
                        <div className="bg-white rounded-2xl p-6 shadow-sm">
                          <h4 className="text-[14px] font-bold text-[#1d1d1f] mb-4">주문 안내</h4>
                          <div className="space-y-3 text-[13px]">
                            <div className="flex items-start gap-3">
                              <div className="w-6 h-6 rounded-full bg-[#00A39B]/10 flex items-center justify-center shrink-0 mt-0.5"><span className="text-[10px] font-bold text-[#00A39B]">1</span></div>
                              <p className="text-[#424245]">디자인 선택 후 담당자 정보를 입력합니다.</p>
                            </div>
                            <div className="flex items-start gap-3">
                              <div className="w-6 h-6 rounded-full bg-[#00A39B]/10 flex items-center justify-center shrink-0 mt-0.5"><span className="text-[10px] font-bold text-[#00A39B]">2</span></div>
                              <p className="text-[#424245]">수량·용지·양면 여부를 선택하면 단가가 자동 계산됩니다.</p>
                            </div>
                            <div className="flex items-start gap-3">
                              <div className="w-6 h-6 rounded-full bg-[#00A39B]/10 flex items-center justify-center shrink-0 mt-0.5"><span className="text-[10px] font-bold text-[#00A39B]">3</span></div>
                              <p className="text-[#424245]">결재 요청 후 승인되면 자동 발주됩니다.</p>
                            </div>
                          </div>
                        </div>
                        <button onClick={() => setStep(2)}
                          className="w-full py-3.5 bg-[#00A39B] text-white text-[15px] font-semibold rounded-full hover:bg-[#0055AA] transition-all hover:shadow-lg hover:shadow-[#00A39B]/20 flex items-center justify-center gap-2">
                          다음 단계 <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

                  {/* Step 2: 정보 입력 */}
              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                  <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                      <div className="bg-white rounded-2xl p-8 shadow-sm">
                        <h3 className="text-[17px] font-bold text-[#1d1d1f] mb-6">명함 기재 사항 입력</h3>
                        <div className="space-y-5">
                          {/* 보건소명 */}
                          <div>
                            <label className="block text-[13px] font-medium text-[#1d1d1f] mb-2">
                              보건소명 <span className="text-red-500">*</span>
                              {loginState.center?.name && (
                                <span className="ml-2 text-[11px] text-[#00A39B] font-normal">✓ 로그인 보건소 자동 입력 (수정 가능)</span>
                              )}
                            </label>
                            <div className="relative">
                              <input type="text" name="centerName" value={formData.centerName} onChange={handleChange}
                                placeholder="예: 인천광역시 연수구보건소"
                                className="w-full px-4 py-3 text-[15px] bg-[#f5f5f7] border-0 rounded-xl focus:ring-2 focus:ring-[#00A39B]/30 focus:bg-white transition-all outline-none" />
                              {loginState.center?.name && formData.centerName !== loginState.center.name && (
                                <button type="button" onClick={() => setFormData(prev => ({ ...prev, centerName: loginState.center!.name }))}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-[#00A39B] hover:underline whitespace-nowrap">
                                  ↺ 되돌리기
                                </button>
                              )}
                            </div>
                          </div>
                          {/* 부서명 + 직책 */}
                          <div className="grid md:grid-cols-2 gap-5">
                            <div>
                              <label className="block text-[13px] font-medium text-[#1d1d1f] mb-2">부서명 <span className="text-red-500">*</span></label>
                              <input type="text" name="department" value={formData.department} onChange={handleChange} placeholder="예: 감염병관리과"
                                className="w-full px-4 py-3 text-[15px] bg-[#f5f5f7] border-0 rounded-xl focus:ring-2 focus:ring-[#00A39B]/30 focus:bg-white transition-all outline-none" />
                            </div>
                            <div>
                              <label className="block text-[13px] font-medium text-[#1d1d1f] mb-2">직책/직급</label>
                              <input type="text" name="position" value={formData.position} onChange={handleChange} placeholder="예: 보건행정과장"
                                className="w-full px-4 py-3 text-[15px] bg-[#f5f5f7] border-0 rounded-xl focus:ring-2 focus:ring-[#00A39B]/30 focus:bg-white transition-all outline-none" />
                            </div>
                          </div>
                          {/* 이름 */}
                          <div>
                            <label className="block text-[13px] font-medium text-[#1d1d1f] mb-2">이름 <span className="text-red-500">*</span></label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="예: 홍길동"
                              className="w-full px-4 py-3 text-[15px] bg-[#f5f5f7] border-0 rounded-xl focus:ring-2 focus:ring-[#00A39B]/30 focus:bg-white transition-all outline-none" />
                          </div>
                          {/* 부서전화 + 직통전화 */}
                          <div className="grid md:grid-cols-2 gap-5">
                            <div>
                              <label className="block text-[13px] font-medium text-[#1d1d1f] mb-2">부서 전화번호</label>
                              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="032-000-0000"
                                className="w-full px-4 py-3 text-[15px] bg-[#f5f5f7] border-0 rounded-xl focus:ring-2 focus:ring-[#00A39B]/30 focus:bg-white transition-all outline-none" />
                            </div>
                            <div>
                              <label className="block text-[13px] font-medium text-[#1d1d1f] mb-2">직통 전화번호</label>
                              <input type="tel" name="directPhone" value={formData.directPhone} onChange={handleChange} placeholder="032-000-0000"
                                className="w-full px-4 py-3 text-[15px] bg-[#f5f5f7] border-0 rounded-xl focus:ring-2 focus:ring-[#00A39B]/30 focus:bg-white transition-all outline-none" />
                            </div>
                          </div>
                          {/* 핸드폰 + 이메일 */}
                          <div className="grid md:grid-cols-2 gap-5">
                            <div>
                              <label className="block text-[13px] font-medium text-[#1d1d1f] mb-2">핸드폰 번호</label>
                              <input type="tel" name="mobile" value={formData.mobile} onChange={handleChange} placeholder="010-0000-0000"
                                className="w-full px-4 py-3 text-[15px] bg-[#f5f5f7] border-0 rounded-xl focus:ring-2 focus:ring-[#00A39B]/30 focus:bg-white transition-all outline-none" />
                            </div>
                            <div>
                              <label className="block text-[13px] font-medium text-[#1d1d1f] mb-2">이메일</label>
                              <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="example@health.go.kr"
                                className="w-full px-4 py-3 text-[15px] bg-[#f5f5f7] border-0 rounded-xl focus:ring-2 focus:ring-[#00A39B]/30 focus:bg-white transition-all outline-none" />
                            </div>
                          </div>
                          <div>
                            <label className="block text-[13px] font-medium text-[#1d1d1f] mb-2">
                              주소 (명함 인쇄용)
                              {loginState.center?.address && (
                                <span className="ml-2 text-[11px] text-[#00A39B] font-normal">
                                  ✓ {loginState.center.name} 주소 자동 입력 (수정 가능)
                                </span>
                              )}
                            </label>
                            <input type="text" name="address" value={formData.address} onChange={handleChange}
                              placeholder={loginState.center?.address || "예: 서울특별시 종로구 ○○로 000"}
                              className="w-full px-4 py-3 text-[15px] bg-[#f5f5f7] border-0 rounded-xl focus:ring-2 focus:ring-[#00A39B]/30 focus:bg-white transition-all outline-none" />
                            {loginState.center?.address && formData.address !== loginState.center.address && (
                              <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, address: loginState.center!.address }))}
                                className="mt-1.5 text-[12px] text-[#00A39B] hover:underline"
                              >
                                ↺ {loginState.center.name} 주소로 되돌리기
                              </button>
                            )}
                          </div>
                    </div>
                    <button onClick={() => {
                          if (!formData.centerName || !formData.name || !formData.department) { toast.error("보건소명, 이름, 부서명은 필수 입력 항목입니다."); return; }
                          setStep(3);
                        }} className="mt-8 w-full md:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#00A39B] text-white text-[15px] font-semibold rounded-full hover:bg-[#0055AA] transition-all hover:shadow-lg hover:shadow-[#00A39B]/20">
                          다음 단계 <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* 실시간 미리보기 + 예상금액 */}
                    <div className="lg:col-span-1">
                      <div className="sticky top-24 space-y-4">
                        {/* 건별 예상 금액 */}
                        <div className="bg-[#EBF3FF] border border-[#00A39B]/20 rounded-2xl p-5">
                          <div className="flex items-center gap-2 mb-3">
                            <FileText className="w-4 h-4 text-[#00A39B]" />
                            <h4 className="text-[13px] font-bold text-[#00A39B]">건별 예상 금액</h4>
                          </div>
                          <div className="space-y-1.5 text-[12px] mb-3">
                            <div className="flex justify-between"><span className="text-[#5B9BD5]">수량</span><span className="font-medium text-[#1d1d1f]">{formData.quantity}장</span></div>
                            <div className="flex justify-between"><span className="text-[#5B9BD5]">용지</span><span className="font-medium text-[#1d1d1f]">{formData.paperType}</span></div>
                            <div className="flex justify-between"><span className="text-[#5B9BD5]">인쇄</span><span className="font-medium text-[#1d1d1f]">{formData.doubleSided ? "양면" : "단면"}</span></div>
                            <div className="flex justify-between"><span className="text-[#5B9BD5]">모서리</span><span className="font-medium text-[#1d1d1f]">{formData.roundedCorner ? "둥근모서리" : "없음"}</span></div>
                          </div>
                          <div className="border-t border-[#00A39B]/20 pt-3 flex justify-between items-center">
                            <span className="text-[13px] font-bold text-[#1d1d1f]">예상 금액</span>
                            <span className="text-[22px] font-extrabold text-[#00A39B]">{calcPrice(formData.quantity, formData.paperType, formData.doubleSided, formData.roundedCorner).toLocaleString()}원</span>
                          </div>
                          <p className="text-[10px] text-[#86868b] mt-1.5">※ 수량·옵션 선택 시 자동 갱신</p>
                        </div>
                        <div>
                        <h4 className="text-[14px] font-bold text-[#1d1d1f] mb-3">실시간 미리보기</h4>
                        <div className="bg-white rounded-2xl p-5 shadow-sm">
                          <div className="w-full aspect-[9/5] rounded-lg border border-[#e8e8ed] bg-gradient-to-br from-[#00A39B]/5 to-[#00A39B]/10 flex flex-col items-start justify-center p-4 gap-0.5">
                            <p className="text-[10px] text-[#86868b] font-medium">{formData.centerName || "보건소명"}</p>
                            <p className="text-[16px] font-bold text-[#1d1d1f]">{formData.name || "이름"}</p>
                            <p className="text-[11px] text-[#00A39B] font-medium">{[formData.department, formData.position].filter(Boolean).join(" | ") || "부서 | 직책"}</p>
                            <div className="mt-1.5 space-y-0.5">
                              {formData.phone && <p className="text-[10px] text-[#424245]">Tel. {formData.phone}</p>}
                              {formData.directPhone && <p className="text-[10px] text-[#424245]">직통. {formData.directPhone}</p>}
                              {formData.mobile && <p className="text-[10px] text-[#424245]">Mobile. {formData.mobile}</p>}
                              {formData.email && <p className="text-[10px] text-[#424245]">{formData.email}</p>}
                            </div>
                          </div>
                          <p className="text-[11px] text-[#86868b] mt-2 text-center">90mm × 50mm 실물 비율</p>
                        </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: 수량·옵션 */}
              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                  <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                      {/* 수량 선택 */}
                      <div className="bg-white rounded-2xl p-8 shadow-sm">
                        <h3 className="text-[17px] font-bold text-[#1d1d1f] mb-5">수량 선택</h3>
                        <div className="grid grid-cols-3 gap-4 mb-4">
                          {[200, 400, 600].map((qty) => (
                            <button key={qty} onClick={() => setFormData((p) => ({ ...p, quantity: qty }))}
                              className={`py-4 rounded-xl border-2 text-center transition-all ${formData.quantity === qty ? "border-[#00A39B] bg-[#00A39B]/5" : "border-[#e8e8ed] hover:border-[#00A39B]/50"}`}>
                              <p className="text-[20px] font-bold text-[#1d1d1f]">{qty}</p>
                              <p className="text-[12px] text-[#86868b] mt-0.5">장</p>
                            </button>
                          ))}
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <label className="block text-[13px] font-medium text-[#86868b] mb-1.5">직접 입력 (100매 단위)</label>
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min={100}
                                max={2000}
                                step={100}
                                value={formData.quantity}
                                onChange={(e) => {
                                  const v = Math.max(100, Math.min(2000, Number(e.target.value)));
                                  setFormData(p => ({ ...p, quantity: v }));
                                }}
                                onBlur={(e) => {
                                  const v = Math.ceil(Math.max(100, Number(e.target.value)) / 100) * 100;
                                  setFormData(p => ({ ...p, quantity: v }));
                                }}
                                className="w-full px-4 py-3 text-[15px] bg-[#f5f5f7] border-0 rounded-xl focus:ring-2 focus:ring-[#00A39B]/30 focus:bg-white transition-all outline-none"
                              />
                              <span className="text-[14px] text-[#86868b] shrink-0">매</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-[12px] text-[#86868b]">예상 단가</p>
                            <p className="text-[18px] font-bold text-[#00A39B]">{calcPrice(formData.quantity, formData.paperType, formData.doubleSided, formData.roundedCorner).toLocaleString()}원</p>
                          </div>
                        </div>
                        <p className="text-[11px] text-[#86868b] mt-2">100매 단위 단가 적용 · 최소 100매 · 최대 2,000매</p>
                      </div>

                      {/* 용지 선택 */}
                      <div className="bg-white rounded-2xl p-8 shadow-sm">
                        <h3 className="text-[17px] font-bold text-[#1d1d1f] mb-5">용지 종류</h3>
                        <div className="space-y-3">
                          {[
                            { value: "표준용지", label: "표준용지", desc: "일반 코팅지, 경제적인 선택" },
                            { value: "고급 무광", label: "고급 무광", desc: "무광 코팅, 고급스러운 질감" },
                            { value: "유광", label: "유광", desc: "유광 코팅, 선명한 색상 표현" },
                          ].map((paper) => (
                            <button key={paper.value} onClick={() => setFormData((p) => ({ ...p, paperType: paper.value }))}
                              className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all ${formData.paperType === paper.value ? "border-[#00A39B] bg-[#00A39B]/5" : "border-[#e8e8ed] hover:border-[#00A39B]/50"}`}>
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-[15px] font-semibold text-[#1d1d1f]">{paper.label}</p>
                                  <p className="text-[13px] text-[#86868b] mt-0.5">{paper.desc}</p>
                                </div>
                                {formData.paperType === paper.value && <CheckCircle2 className="w-5 h-5 text-[#00A39B] shrink-0" />}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* 양면 여부 */}
                      <div className="bg-white rounded-2xl p-8 shadow-sm">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-[17px] font-bold text-[#1d1d1f]">양면 인쇄</h3>
                            <p className="text-[13px] text-[#86868b] mt-1">뒷면에 보건소 주요 사업 안내 또는 지도 QR코드를 추가할 수 있습니다.</p>
                          </div>
                          <button onClick={() => setFormData((p) => ({ ...p, doubleSided: !p.doubleSided }))}
                            className={`relative w-12 h-6 rounded-full transition-colors ${formData.doubleSided ? "bg-[#00A39B]" : "bg-[#d2d2d7]"}`}>
                            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${formData.doubleSided ? "translate-x-6" : "translate-x-0.5"}`} />
                          </button>
                        </div>
                        {formData.doubleSided && (
                          <div className="mt-4 p-3 bg-[#00A39B]/5 rounded-xl border border-[#00A39B]/20">
                            <p className="text-[13px] text-[#00A39B] font-medium">양면 인쇄 선택됨 (+{DOUBLE_SIDED_SURCHARGE[formData.quantity]?.toLocaleString()}원)</p>
                          </div>
                        )}
                        {formData.roundedCorner && (
                          <div className="mt-2 p-3 bg-[#FF9500]/5 rounded-xl border border-[#FF9500]/20">
                            <p className="text-[13px] text-[#FF9500] font-medium">모서리 가공 선택됨 (+{CORNER_SURCHARGE[formData.quantity]?.toLocaleString()}원)</p>
                          </div>
                        )}
                      </div>

                      {/* 예산 코드 */}
                      <div className="bg-white rounded-2xl p-8 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                          <FileText className="w-5 h-5 text-[#86868b]" />
                          <h3 className="text-[17px] font-bold text-[#1d1d1f]">예산 코드</h3>
                          <span className="text-[12px] text-[#86868b] ml-auto">지출 결의서 자동 생성에 사용됩니다</span>
                        </div>
                        <input type="text" name="budgetCode" value={formData.budgetCode} onChange={handleChange}
                          placeholder="예: 2027-총무-001"
                          className="w-full px-4 py-3 text-[15px] bg-[#f5f5f7] border-0 rounded-xl focus:ring-2 focus:ring-[#00A39B]/30 focus:bg-white transition-all outline-none" />
                        <p className="text-[12px] text-[#86868b] mt-2">예산 코드 입력 시 지출 결의서 초안이 자동 생성됩니다.</p>
                      </div>

                      <button onClick={() => setStep(4)}
                        className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#00A39B] text-white text-[15px] font-semibold rounded-full hover:bg-[#0055AA] transition-all hover:shadow-lg hover:shadow-[#00A39B]/20">
                        다음 단계 <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>

                    {/* 단가 자동 계산 */}
                    <div className="lg:col-span-1">
                      <div className="sticky top-24 space-y-4">
                        <div className="bg-white rounded-2xl p-6 shadow-sm">
                          <h4 className="text-[14px] font-bold text-[#1d1d1f] mb-4">단가 자동 계산</h4>
                          <div className="space-y-3 text-[13px]">
                            <div className="flex justify-between"><span className="text-[#86868b]">수량</span><span className="font-medium text-[#1d1d1f]">{formData.quantity}장</span></div>
                            <div className="flex justify-between"><span className="text-[#86868b]">용지</span><span className="font-medium text-[#1d1d1f]">{formData.paperType}</span></div>
                            <div className="flex justify-between"><span className="text-[#86868b]">인쇄</span><span className="font-medium text-[#1d1d1f]">{formData.doubleSided ? "양면" : "단면"}</span></div>
                            <div className="flex justify-between"><span className="text-[#86868b]">모서리</span><span className="font-medium text-[#1d1d1f]">{formData.roundedCorner ? "둥근모서리" : "없음"}</span></div>
                            <div className="border-t border-[#e8e8ed] pt-3 flex justify-between items-center">
                              <span className="text-[#1d1d1f] font-bold">예상 금액</span>
                              <span className="text-[20px] font-bold text-[#00A39B]">{price.toLocaleString()}원</span>
                            </div>
                          </div>
                          <p className="text-[11px] text-[#86868b] mt-3">※ 부가세 포함 / 실제 금액은 견적서 기준</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 4: 미리보기 */}
              {step === 4 && (
                <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                  <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                      <div className="bg-white rounded-2xl p-8 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-[17px] font-bold text-[#1d1d1f]">명함 미리보기</h3>
                          <div className="flex items-center gap-2">
                            <button onClick={() => setPreviewZoom(false)}
                              className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all ${!previewZoom ? "bg-[#00A39B] text-white" : "bg-[#f5f5f7] text-[#86868b] hover:bg-[#e8e8ed]"}`}>
                              <ZoomOut className="w-4 h-4 inline mr-1" />실물 크기
                            </button>
                            <button onClick={() => setPreviewZoom(true)}
                              className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all ${previewZoom ? "bg-[#00A39B] text-white" : "bg-[#f5f5f7] text-[#86868b] hover:bg-[#e8e8ed]"}`}>
                              <ZoomIn className="w-4 h-4 inline mr-1" />1.5배 확대
                            </button>
                          </div>
                        </div>

                        {/* 앞면 미리보기 */}
                        <div className="mb-6">
                          <p className="text-[13px] font-semibold text-[#86868b] mb-3">앞면</p>
                          <div className={`transition-all duration-300 ${previewZoom ? "scale-150 origin-top-left ml-0" : ""}`}
                            style={{ width: previewZoom ? "calc(100% / 1.5)" : "100%" }}>
                            <div className="w-full aspect-[9/5] rounded-xl border-2 border-[#e8e8ed] bg-gradient-to-br from-[#00A39B]/5 to-[#00A39B]/15 flex flex-col items-start justify-center p-6 gap-1.5 shadow-sm">
                              {formData.centerName && <p className="text-[10px] text-[#86868b] font-medium">{formData.centerName}</p>}
                              <p className="text-[20px] font-bold text-[#1d1d1f]">{formData.name || "이름"}</p>
                              <p className="text-[13px] text-[#00A39B] font-semibold">{formData.position || "직급"}</p>
                              <p className="text-[13px] text-[#86868b]">{formData.department || "부서명"}</p>
                              <div className="mt-3 space-y-1">
                                {formData.phone && <p className="text-[12px] text-[#424245]">T. {formData.phone}</p>}
                                {formData.directPhone && <p className="text-[12px] text-[#424245]">직통. {formData.directPhone}</p>}
                                {formData.mobile && <p className="text-[12px] text-[#424245]">M. {formData.mobile}</p>}
                                {formData.email && <p className="text-[12px] text-[#424245]">{formData.email}</p>}
                                {formData.address && <p className="text-[11px] text-[#86868b]">{formData.address}</p>}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* 뒷면 미리보기 */}
                        {formData.doubleSided && (
                          <div>
                            <p className="text-[13px] font-semibold text-[#86868b] mb-3">뒷면 (양면 인쇄)</p>
                            <div className="w-full aspect-[9/5] rounded-xl border-2 border-dashed border-[#d2d2d7] bg-[#f5f5f7] flex items-center justify-center">
                              <div className="text-center">
                                <p className="text-[14px] font-semibold text-[#86868b]">뒷면 디자인</p>
                                <p className="text-[12px] text-[#86868b] mt-1">보건소 주요 사업 안내 또는 QR코드</p>
                              </div>
                            </div>
                          </div>
                        )}

                      </div>

                      <button onClick={() => setStep(5)}
                        className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#00A39B] text-white text-[15px] font-semibold rounded-full hover:bg-[#0055AA] transition-all hover:shadow-lg hover:shadow-[#00A39B]/20">
                        미리보기 확인 완료 <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>

                    {/* 주문 요약 */}
                    <div className="lg:col-span-1">
                      <div className="sticky top-24">
                        <div className="bg-white rounded-2xl p-6 shadow-sm">
                          <h4 className="text-[14px] font-bold text-[#1d1d1f] mb-4">주문 요약</h4>
                          <div className="space-y-2 text-[13px]">
                            {formData.centerName && <div className="flex justify-between"><span className="text-[#86868b]">보건소명</span><span className="font-medium">{formData.centerName}</span></div>}
                            <div className="flex justify-between"><span className="text-[#86868b]">이름</span><span className="font-medium">{formData.name || "-"}</span></div>
                            <div className="flex justify-between"><span className="text-[#86868b]">부서</span><span className="font-medium">{formData.department || "-"}</span></div>
                            <div className="flex justify-between"><span className="text-[#86868b]">수량</span><span className="font-medium">{formData.quantity}장</span></div>
                            <div className="flex justify-between"><span className="text-[#86868b]">용지</span><span className="font-medium">{formData.paperType}</span></div>
                            <div className="flex justify-between"><span className="text-[#86868b]">인쇄</span><span className="font-medium">{formData.doubleSided ? "양면" : "단면"}</span></div>
                            <div className="border-t border-[#e8e8ed] pt-2 flex justify-between items-center">
                              <span className="font-bold text-[#1d1d1f]">예상 금액</span>
                              <span className="text-[18px] font-bold text-[#00A39B]">{price.toLocaleString()}원</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 5: 결재 요청 */}
              {step === 5 && (
                <motion.div key="step5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                  <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                      <div className="bg-white rounded-2xl p-8 shadow-sm">
                        <div className="flex items-center gap-2 mb-6">
                          <Bell className="w-5 h-5 text-[#00A39B]" />
                          <h3 className="text-[17px] font-bold text-[#1d1d1f]">결재 라인 설정</h3>
                        </div>

                        {/* 결재자 정보 */}
                        <div className="space-y-4 mb-6">
                          <div className="p-4 bg-[#f5f5f7] rounded-xl border border-[#e8e8ed]">
                            <p className="text-[12px] font-semibold text-[#86868b] mb-3 uppercase tracking-wide">결재 라인</p>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-[#e8e8ed]">
                                <div className="w-6 h-6 rounded-full bg-[#00A39B]/10 flex items-center justify-center">
                                  <span className="text-[10px] font-bold text-[#00A39B]">1</span>
                                </div>
                                <span className="text-[13px] font-medium text-[#1d1d1f]">신청자 (본인)</span>
                              </div>
                              <ArrowRight className="w-4 h-4 text-[#86868b]" />
                              <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-[#e8e8ed]">
                                <div className="w-6 h-6 rounded-full bg-[#FF9500]/10 flex items-center justify-center">
                                  <span className="text-[10px] font-bold text-[#FF9500]">2</span>
                                </div>
                                <span className="text-[13px] font-medium text-[#1d1d1f]">부서장</span>
                              </div>
                              <ArrowRight className="w-4 h-4 text-[#86868b]" />
                              <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-[#e8e8ed]">
                                <div className="w-6 h-6 rounded-full bg-[#34C759]/10 flex items-center justify-center">
                                  <span className="text-[10px] font-bold text-[#34C759]">3</span>
                                </div>
                                <span className="text-[13px] font-medium text-[#1d1d1f]">자동 발주</span>
                              </div>
                            </div>
                          </div>

                          <div className="grid md:grid-cols-2 gap-5">
                            <div>
                              <label className="block text-[13px] font-medium text-[#1d1d1f] mb-2">결재자 이름 <span className="text-red-500">*</span></label>
                              <input type="text" name="approverName" value={formData.approverName} onChange={handleChange} placeholder="부서장 이름"
                                className="w-full px-4 py-3 text-[15px] bg-[#f5f5f7] border-0 rounded-xl focus:ring-2 focus:ring-[#00A39B]/30 focus:bg-white transition-all outline-none" />
                            </div>
                            <div>
                              <label className="block text-[13px] font-medium text-[#1d1d1f] mb-2">결재자 연락처</label>
                              <input type="tel" name="approverPhone" value={formData.approverPhone} onChange={handleChange} placeholder="010-0000-0000"
                                className="w-full px-4 py-3 text-[15px] bg-[#f5f5f7] border-0 rounded-xl focus:ring-2 focus:ring-[#00A39B]/30 focus:bg-white transition-all outline-none" />
                            </div>
                          </div>
                        </div>

                        {/* 알림 방식 */}
                        <div className="border-t border-[#e8e8ed] pt-6">
                          <h4 className="text-[15px] font-semibold text-[#1d1d1f] mb-4">결재 알림 방식</h4>
                          <div className="space-y-3">
                            <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-[#e8e8ed] hover:border-[#00A39B]/30 cursor-pointer transition-all">
                              <input type="checkbox" name="notifyKakao" checked={formData.notifyKakao} onChange={handleChange} className="w-4 h-4 accent-[#00A39B]" />
                              <div>
                                <p className="text-[14px] font-semibold text-[#1d1d1f]">카카오톡 알림</p>
                                <p className="text-[12px] text-[#86868b]">결재 요청·승인·반려 시 카카오톡으로 알림 발송</p>
                              </div>
                            </label>
                            <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-[#e8e8ed] hover:border-[#00A39B]/30 cursor-pointer transition-all">
                              <input type="checkbox" name="notifyEmail" checked={formData.notifyEmail} onChange={handleChange} className="w-4 h-4 accent-[#00A39B]" />
                              <div>
                                <p className="text-[14px] font-semibold text-[#1d1d1f]">이메일 알림</p>
                                <p className="text-[12px] text-[#86868b]">결재 요청·승인·반려 시 이메일로 알림 발송</p>
                              </div>
                            </label>
                          </div>
                        </div>

                        {/* 대리 주문 시 본인 확인 */}
                        <div className="mt-6 p-4 bg-[#FF9500]/5 border border-[#FF9500]/20 rounded-xl">
                          <div className="flex items-start gap-3">
                            <Bell className="w-5 h-5 text-[#FF9500] shrink-0 mt-0.5" />
                            <div>
                              <p className="text-[14px] font-semibold text-[#FF9500]">대리 주문 본인 확인</p>
                              <p className="text-[13px] text-[#86868b] mt-1">다른 사람이 대신 주문할 경우, 명함 당사자에게 카카오톡으로 확인 메시지가 발송됩니다. 당사자가 확인 후 결재가 진행됩니다.</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <button onClick={() => {
                        if (!formData.approverName) { toast.error("결재자 이름을 입력해주세요."); return; }
                        setStep(6);
                      }} className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#00A39B] text-white text-[15px] font-semibold rounded-full hover:bg-[#0055AA] transition-all hover:shadow-lg hover:shadow-[#00A39B]/20">
                        다음 단계 <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="lg:col-span-1">
                      <div className="sticky top-24 bg-white rounded-2xl p-6 shadow-sm">
                        <h4 className="text-[14px] font-bold text-[#1d1d1f] mb-4">결재 안내</h4>
                        <div className="space-y-3 text-[13px] text-[#424245]">
                          <p>• 결재 요청 후 부서장에게 알림이 발송됩니다.</p>
                          <p>• 승인 시 자동으로 인쇄업체에 발주됩니다.</p>
                          <p>• 반려 시 수정 후 재상신할 수 있습니다.</p>
                          <p>• 결재 이력은 주문 내역에서 확인할 수 있습니다.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 6: 배송 정보 */}
              {step === 6 && (
                <motion.div key="step6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                  <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                      <div className="bg-white rounded-2xl p-8 shadow-sm">
                        <div className="flex items-center gap-2 mb-6">
                          <Truck className="w-5 h-5 text-[#00A39B]" />
                          <h3 className="text-[17px] font-bold text-[#1d1d1f]">배송 정보</h3>
                        </div>
                        <div className="space-y-5">
                          <div>
                            <label className="block text-[13px] font-medium text-[#1d1d1f] mb-2">납기일 <span className="text-red-500">*</span></label>
                            <input type="date" name="deliveryDate" value={formData.deliveryDate} onChange={handleChange}
                              className="w-full px-4 py-3 text-[15px] bg-[#f5f5f7] border-0 rounded-xl focus:ring-2 focus:ring-[#00A39B]/30 focus:bg-white transition-all outline-none" />
                          </div>
                          <div>
                            <label className="block text-[13px] font-medium text-[#1d1d1f] mb-2">배송 주소</label>
                            <div className="flex items-center gap-2 mb-2">
                              <input type="text" name="deliveryAddress" value={formData.deliveryAddress} onChange={handleChange}
                                placeholder="배송 받을 주소를 입력하세요"
                                className="flex-1 px-4 py-3 text-[15px] bg-[#f5f5f7] border-0 rounded-xl focus:ring-2 focus:ring-[#00A39B]/30 focus:bg-white transition-all outline-none" />
                              <button onClick={() => {
                                setFormData((p) => ({ ...p, deliveryAddress: "기관 주소 자동 입력" }));
                                toast.success("기관 주소가 자동 입력되었습니다.");
                              }} className="px-4 py-3 bg-[#00A39B]/10 text-[#00A39B] text-[13px] font-semibold rounded-xl hover:bg-[#00A39B]/20 transition-colors whitespace-nowrap">
                                <MapPin className="w-4 h-4 inline mr-1" />기관 주소
                              </button>
                            </div>
                          </div>
                          <div>
                            <label className="block text-[13px] font-medium text-[#1d1d1f] mb-2">수령 담당자</label>
                            <input type="text" name="deliveryContact" value={formData.deliveryContact} onChange={handleChange}
                              placeholder="수령 담당자 이름 및 연락처"
                              className="w-full px-4 py-3 text-[15px] bg-[#f5f5f7] border-0 rounded-xl focus:ring-2 focus:ring-[#00A39B]/30 focus:bg-white transition-all outline-none" />
                          </div>
                          <div>
                            <label className="block text-[13px] font-medium text-[#1d1d1f] mb-2">특수 요청사항</label>
                            <textarea name="notes" value={formData.notes} onChange={handleChange} rows={3}
                              placeholder="로고 추가, 특수 인쇄 등 추가 요청사항을 입력하세요."
                              className="w-full px-4 py-3 text-[15px] bg-[#f5f5f7] border-0 rounded-xl focus:ring-2 focus:ring-[#00A39B]/30 focus:bg-white transition-all outline-none resize-none" />
                          </div>
                        </div>
                      </div>

                      {/* 배송 현황 타임라인 */}
                      <div className="bg-white rounded-2xl p-8 shadow-sm">
                        <div className="flex items-center gap-2 mb-6">
                          <Package className="w-5 h-5 text-[#86868b]" />
                          <h3 className="text-[17px] font-bold text-[#1d1d1f]">배송 현황 안내</h3>
                        </div>
                        <div className="relative">
                          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-[#e8e8ed]" />
                          {[
                            { icon: FileText, label: "주문 접수", desc: "결재 요청 발송", color: "#00A39B" },
                            { icon: CheckCircle2, label: "결재 완료", desc: "부서장 승인 후 자동 발주", color: "#34C759" },
                            { icon: Package, label: "제작 중", desc: "인쇄 및 제작 진행", color: "#FF9500" },
                            { icon: Truck, label: "배송 중", desc: "운송장 번호 카카오톡 발송", color: "#00A39B" },
                            { icon: CheckCircle2, label: "수령 완료", desc: "배송 완료 확인", color: "#34C759" },
                          ].map((item, idx) => (
                            <div key={idx} className="relative flex items-start gap-4 mb-5 pl-10">
                              <div className="absolute left-0 w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: item.color + "15" }}>
                                <item.icon className="w-4 h-4" style={{ color: item.color }} />
                              </div>
                              <div>
                                <p className="text-[14px] font-semibold text-[#1d1d1f]">{item.label}</p>
                                <p className="text-[12px] text-[#86868b] mt-0.5">{item.desc}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 최종 주문 버튼 */}
                      <button onClick={() => {
                        if (!formData.deliveryDate) { toast.error("납기일을 선택해주세요."); return; }
                        handleNewSubmit();
                      }} className="w-full inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#00A39B] text-white text-[17px] font-bold rounded-full hover:bg-[#0055AA] transition-all hover:shadow-xl hover:shadow-[#00A39B]/25">
                        <CheckCircle2 className="w-5 h-5" />
                        명함 주문 접수하기
                      </button>
                    </div>

                    {/* 최종 주문 요약 */}
                    <div className="lg:col-span-1">
                      <div className="sticky top-24 space-y-4">
                        <div className="bg-white rounded-2xl p-6 shadow-sm">
                          <h4 className="text-[14px] font-bold text-[#1d1d1f] mb-4">최종 주문 요약</h4>
                          <div className="space-y-2 text-[13px]">
                            {formData.centerName && <div className="flex justify-between"><span className="text-[#86868b]">보건소명</span><span className="font-medium">{formData.centerName}</span></div>}
                            <div className="flex justify-between"><span className="text-[#86868b]">이름</span><span className="font-medium">{formData.name || "-"}</span></div>
                            <div className="flex justify-between"><span className="text-[#86868b]">부서</span><span className="font-medium">{formData.department || "-"}</span></div>
                            <div className="flex justify-between"><span className="text-[#86868b]">수량</span><span className="font-medium">{formData.quantity}장</span></div>
                            <div className="flex justify-between"><span className="text-[#86868b]">용지</span><span className="font-medium">{formData.paperType}</span></div>
                            <div className="flex justify-between"><span className="text-[#86868b]">인쇄</span><span className="font-medium">{formData.doubleSided ? "양면" : "단면"}</span></div>
                            <div className="flex justify-between"><span className="text-[#86868b]">결재자</span><span className="font-medium">{formData.approverName || "-"}</span></div>
                            {formData.budgetCode && <div className="flex justify-between"><span className="text-[#86868b]">예산 코드</span><span className="font-medium">{formData.budgetCode}</span></div>}
                            <div className="border-t border-[#e8e8ed] pt-2 flex justify-between items-center">
                              <span className="font-bold text-[#1d1d1f]">예상 금액</span>
                              <span className="text-[20px] font-bold text-[#00A39B]">{price.toLocaleString()}원</span>
                            </div>
                          </div>
                        </div>
                        <div className="bg-[#34C759]/5 border border-[#34C759]/20 rounded-2xl p-4">
                          <p className="text-[13px] text-[#34C759] font-semibold mb-1">주문 후 진행 순서</p>
                          <p className="text-[12px] text-[#424245]">결재 요청 → 부서장 승인 → 자동 발주 → 제작 → 배송 → 수령</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>
      </PageWrapper>
    );
  }

  // ─── 샘플 전송 플로우 ─────────────────────────────────────────────
  if (mode === "sample") {
    return <SampleUploadFlow onBack={() => setMode("select")} />;
  }

  // ─── 재주문 플로우 ────────────────────────────────────────────────
  const reorderPrice = calcPrice(reorderData.quantity, reorderData.paperType, reorderData.doubleSided);

  return (
    <PageWrapper>
      <section className="bg-white py-10 md:py-14">
        <div className="w-full px-[15%]">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

            <div className="flex items-center gap-3 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#34C759]/10 text-[#34C759] text-[12px] font-semibold rounded-full">
                <RefreshCw className="w-3 h-3" /> 재주문
              </span>
            </div>
            <h1 className="text-[clamp(1.5rem,4vw,2.5rem)] font-bold tracking-tight text-[#1d1d1f] mb-4">표준명함 재주문</h1>
            <StepBar currentStep={step} totalSteps={4} />
          </motion.div>
        </div>
      </section>

      <section className="bg-[#f5f5f7] py-10 md:py-14">
        <div className="w-full px-[15%]">
          <AnimatePresence mode="wait">

            {/* 재주문 Step 1: 이전 주문 선택 */}
            {step === 1 && (
              <motion.div key="r-step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                <div className="grid lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-6">
                    {/* 내 이전 주문 */}
                    <div className="bg-white rounded-2xl p-8 shadow-sm">
                      <h3 className="text-[17px] font-bold text-[#1d1d1f] mb-5">내 이전 주문 선택</h3>
                      {prevNamecardOrders.length > 0 ? (
                        <div className="space-y-3">
                          {prevNamecardOrders.map((order) => (
                            <button key={order.id} onClick={() => { setSelectedPrevOrder(order); setReorderData((p) => ({ ...p, quantity: order.quantity, paperType: order.paperType || "표준용지", doubleSided: order.doubleSided || false })); }}
                              className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${selectedPrevOrder?.id === order.id ? "border-[#34C759] bg-[#34C759]/5" : "border-[#e8e8ed] hover:border-[#34C759]/50 bg-[#f5f5f7]"}`}>
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-[15px] font-semibold text-[#1d1d1f]">{order.name}</p>
                                  <p className="text-[13px] text-[#86868b] mt-0.5">{order.department} · {order.quantity}장 · {order.paperType}</p>
                                  {order.orderDate && <p className="text-[12px] text-[#86868b] mt-0.5">주문일: {order.orderDate.slice(0, 10)}</p>}
                                </div>
                                {selectedPrevOrder?.id === order.id && <CheckCircle2 className="w-5 h-5 text-[#34C759] shrink-0" />}
                              </div>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-10 text-[#86868b]">
                          <Clock className="w-10 h-10 mx-auto mb-3 opacity-40" />
                          <p className="text-[15px]">이전 명함 주문 이력이 없습니다.</p>
                          <button onClick={() => setMode("new")} className="mt-4 text-[#00A39B] text-[14px] font-semibold hover:underline">신규 제작으로 이동하기 →</button>
                        </div>
                      )}
                    </div>

                    {/* 부서 공유 이력 */}
                    <div className="bg-white rounded-2xl p-8 shadow-sm">
                      <div className="flex items-center gap-2 mb-5">
                        <Users className="w-5 h-5 text-[#00A39B]" />
                        <h3 className="text-[17px] font-bold text-[#1d1d1f]">부서 동료 이전 주문</h3>
                      </div>
                      {deptSharedOrders.length > 0 ? (
                        <div className="space-y-3">
                          {deptSharedOrders.map((order) => (
                            <button key={order.id} onClick={() => { setSelectedPrevOrder(order); setReorderData((p) => ({ ...p, quantity: order.quantity, paperType: order.paperType || "표준용지" })); toast.success(`${order.name}님의 디자인을 참고합니다.`); }}
                              className={`w-full text-left p-4 rounded-xl border-2 transition-all ${selectedPrevOrder?.id === order.id ? "border-[#00A39B] bg-[#00A39B]/5" : "border-[#e8e8ed] hover:border-[#00A39B]/50 bg-[#f5f5f7]"}`}>
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-[14px] font-semibold text-[#1d1d1f]">{order.name} <span className="text-[#86868b] font-normal">· {order.department}</span></p>
                                  <p className="text-[12px] text-[#86868b] mt-0.5">{order.paperType} · {order.quantity}장</p>
                                </div>
                                <span className="text-[12px] text-[#00A39B] font-semibold">동일 템플릿</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[14px] text-[#86868b] text-center py-4">같은 부서의 이전 주문 이력이 없습니다.</p>
                      )}
                    </div>

                    <button onClick={() => { if (!selectedPrevOrder) { toast.error("재주문할 이전 주문을 선택해주세요."); return; } setStep(2); }}
                      className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#34C759] text-white text-[15px] font-semibold rounded-full hover:bg-[#2DB34A] transition-all hover:shadow-lg hover:shadow-[#34C759]/20">
                      다음 단계 <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="lg:col-span-1">
                    <div className="sticky top-24 bg-white rounded-2xl p-6 shadow-sm">
                      <h4 className="text-[14px] font-bold text-[#1d1d1f] mb-4">재주문 안내</h4>
                      <div className="space-y-3 text-[13px] text-[#424245]">
                        <p>• 이전 주문을 선택하면 정보가 자동으로 불러와집니다.</p>
                        <p>• 수량·용지·양면 여부를 변경할 수 있습니다.</p>
                        <p>• 수정 요청사항을 추가할 수 있습니다.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 재주문 Step 2: 수량·옵션 */}
            {step === 2 && (
              <motion.div key="r-step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                <div className="grid lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-6">
                    {selectedPrevOrder && (
                      <div className="bg-white rounded-2xl p-6 shadow-sm border-l-4 border-[#34C759]">
                        <p className="text-[13px] font-semibold text-[#34C759] mb-2">선택된 이전 주문</p>
                        <div className="grid grid-cols-2 gap-2 text-[13px]">
                          <div><span className="text-[#86868b]">이름:</span><span className="text-[#1d1d1f] font-medium ml-2">{selectedPrevOrder.name}</span></div>
                          <div><span className="text-[#86868b]">부서:</span><span className="text-[#1d1d1f] font-medium ml-2">{selectedPrevOrder.department}</span></div>
                        </div>
                      </div>
                    )}

                    {/* 수량 */}
                    <div className="bg-white rounded-2xl p-8 shadow-sm">
                      <h3 className="text-[17px] font-bold text-[#1d1d1f] mb-5">수량 선택</h3>
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        {[200, 400, 600].map((qty) => (
                          <button key={qty} onClick={() => setReorderData((p) => ({ ...p, quantity: qty }))}
                            className={`py-4 rounded-xl border-2 text-center transition-all ${reorderData.quantity === qty ? "border-[#34C759] bg-[#34C759]/5" : "border-[#e8e8ed] hover:border-[#34C759]/50"}`}>
                            <p className="text-[20px] font-bold text-[#1d1d1f]">{qty}</p>
                            <p className="text-[12px] text-[#86868b] mt-0.5">장</p>
                          </button>
                        ))}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <label className="block text-[13px] font-medium text-[#86868b] mb-1.5">직접 입력 (100매 단위)</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min={100}
                              max={2000}
                              step={100}
                              value={reorderData.quantity}
                              onChange={(e) => {
                                const v = Math.max(100, Math.min(2000, Number(e.target.value)));
                                setReorderData(p => ({ ...p, quantity: v }));
                              }}
                              onBlur={(e) => {
                                const v = Math.ceil(Math.max(100, Number(e.target.value)) / 100) * 100;
                                setReorderData(p => ({ ...p, quantity: v }));
                              }}
                              className="w-full px-4 py-3 text-[15px] bg-[#f5f5f7] border-0 rounded-xl focus:ring-2 focus:ring-[#34C759]/30 focus:bg-white transition-all outline-none"
                            />
                            <span className="text-[14px] text-[#86868b] shrink-0">매</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[12px] text-[#86868b]">예상 단가</p>
                          <p className="text-[18px] font-bold text-[#34C759]">{calcPrice(reorderData.quantity, reorderData.paperType, reorderData.doubleSided).toLocaleString()}원</p>
                        </div>
                      </div>
                      <p className="text-[11px] text-[#86868b] mt-2">100매 단위 단가 적용 · 최소 100매 · 최대 2,000매</p>
                    </div>

                    {/* 용지 */}
                    <div className="bg-white rounded-2xl p-8 shadow-sm">
                      <h3 className="text-[17px] font-bold text-[#1d1d1f] mb-5">용지 종류</h3>
                      <div className="space-y-3">
                        {["표준용지", "고급 무광", "유광"].map((paper) => (
                          <button key={paper} onClick={() => setReorderData((p) => ({ ...p, paperType: paper }))}
                            className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all ${reorderData.paperType === paper ? "border-[#34C759] bg-[#34C759]/5" : "border-[#e8e8ed] hover:border-[#34C759]/50"}`}>
                            <div className="flex items-center justify-between">
                              <span className="text-[15px] font-semibold text-[#1d1d1f]">{paper}</span>
                              {reorderData.paperType === paper && <CheckCircle2 className="w-5 h-5 text-[#34C759]" />}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 양면 */}
                    <div className="bg-white rounded-2xl p-8 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-[17px] font-bold text-[#1d1d1f]">양면 인쇄</h3>
                          <p className="text-[13px] text-[#86868b] mt-1">뒷면 추가 인쇄 여부를 선택하세요.</p>
                        </div>
                        <button onClick={() => setReorderData((p) => ({ ...p, doubleSided: !p.doubleSided }))}
                          className={`relative w-12 h-6 rounded-full transition-colors ${reorderData.doubleSided ? "bg-[#34C759]" : "bg-[#d2d2d7]"}`}>
                          <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${reorderData.doubleSided ? "translate-x-6" : "translate-x-0.5"}`} />
                        </button>
                      </div>
                    </div>

                    {/* 예산 코드 */}
                    <div className="bg-white rounded-2xl p-8 shadow-sm">
                      <div className="flex items-center gap-2 mb-4">
                        <FileText className="w-5 h-5 text-[#86868b]" />
                        <h3 className="text-[17px] font-bold text-[#1d1d1f]">예산 코드</h3>
                      </div>
                      <input type="text" value={reorderData.budgetCode} onChange={(e) => setReorderData((p) => ({ ...p, budgetCode: e.target.value }))}
                        placeholder="예: 2027-총무-001"
                        className="w-full px-4 py-3 text-[15px] bg-[#f5f5f7] border-0 rounded-xl focus:ring-2 focus:ring-[#34C759]/30 focus:bg-white transition-all outline-none" />
                    </div>

                    {/* 수정 요청사항 */}
                    <div className="bg-white rounded-2xl p-8 shadow-sm">
                      <h3 className="text-[17px] font-bold text-[#1d1d1f] mb-4">수정 요청사항</h3>
                      <textarea value={reorderData.notes} onChange={(e) => setReorderData((p) => ({ ...p, notes: e.target.value }))} rows={3}
                        placeholder="이전 주문과 다른 점이 있으면 입력하세요. (예: 전화번호 변경)"
                        className="w-full px-4 py-3 text-[15px] bg-[#f5f5f7] border-0 rounded-xl focus:ring-2 focus:ring-[#34C759]/30 focus:bg-white transition-all outline-none resize-none" />
                    </div>

                    <button onClick={() => setStep(3)}
                      className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#34C759] text-white text-[15px] font-semibold rounded-full hover:bg-[#2DB34A] transition-all hover:shadow-lg hover:shadow-[#34C759]/20">
                      다음 단계 <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="lg:col-span-1">
                    <div className="sticky top-24 bg-white rounded-2xl p-6 shadow-sm">
                      <h4 className="text-[14px] font-bold text-[#1d1d1f] mb-4">단가 계산</h4>
                      <div className="space-y-2 text-[13px]">
                        <div className="flex justify-between"><span className="text-[#86868b]">수량</span><span className="font-medium">{reorderData.quantity}장</span></div>
                        <div className="flex justify-between"><span className="text-[#86868b]">용지</span><span className="font-medium">{reorderData.paperType}</span></div>
                        <div className="flex justify-between"><span className="text-[#86868b]">인쇄</span><span className="font-medium">{reorderData.doubleSided ? "양면" : "단면"}</span></div>
                        <div className="border-t border-[#e8e8ed] pt-2 flex justify-between items-center">
                          <span className="font-bold">예상 금액</span>
                          <span className="text-[20px] font-bold text-[#34C759]">{reorderPrice.toLocaleString()}원</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 재주문 Step 3: 결재 요청 */}
            {step === 3 && (
              <motion.div key="r-step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                <div className="grid lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl p-8 shadow-sm">
                      <div className="flex items-center gap-2 mb-6">
                        <Bell className="w-5 h-5 text-[#34C759]" />
                        <h3 className="text-[17px] font-bold text-[#1d1d1f]">결재 라인 설정</h3>
                      </div>
                      <div className="grid md:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-[13px] font-medium text-[#1d1d1f] mb-2">결재자 이름 <span className="text-red-500">*</span></label>
                          <input type="text" value={reorderData.approverName} onChange={(e) => setReorderData((p) => ({ ...p, approverName: e.target.value }))} placeholder="부서장 이름"
                            className="w-full px-4 py-3 text-[15px] bg-[#f5f5f7] border-0 rounded-xl focus:ring-2 focus:ring-[#34C759]/30 focus:bg-white transition-all outline-none" />
                        </div>
                        <div>
                          <label className="block text-[13px] font-medium text-[#1d1d1f] mb-2">결재자 연락처</label>
                          <input type="tel" value={reorderData.approverPhone} onChange={(e) => setReorderData((p) => ({ ...p, approverPhone: e.target.value }))} placeholder="010-0000-0000"
                            className="w-full px-4 py-3 text-[15px] bg-[#f5f5f7] border-0 rounded-xl focus:ring-2 focus:ring-[#34C759]/30 focus:bg-white transition-all outline-none" />
                        </div>
                      </div>
                      <div className="mt-4 p-4 bg-[#FF9500]/5 border border-[#FF9500]/20 rounded-xl">
                        <div className="flex items-start gap-3">
                          <Bell className="w-5 h-5 text-[#FF9500] shrink-0 mt-0.5" />
                          <p className="text-[13px] text-[#86868b]">다른 사람이 대신 주문할 경우, 명함 당사자에게 카카오톡으로 확인 메시지가 발송됩니다.</p>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => { if (!reorderData.approverName) { toast.error("결재자 이름을 입력해주세요."); return; } setStep(4); }}
                      className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#34C759] text-white text-[15px] font-semibold rounded-full hover:bg-[#2DB34A] transition-all hover:shadow-lg hover:shadow-[#34C759]/20">
                      다음 단계 <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="lg:col-span-1">
                    <div className="sticky top-24 bg-white rounded-2xl p-6 shadow-sm">
                      <h4 className="text-[14px] font-bold text-[#1d1d1f] mb-3">재주문 요약</h4>
                      <div className="space-y-2 text-[13px]">
                        <div className="flex justify-between"><span className="text-[#86868b]">이름</span><span className="font-medium">{selectedPrevOrder?.name || "-"}</span></div>
                        <div className="flex justify-between"><span className="text-[#86868b]">수량</span><span className="font-medium">{reorderData.quantity}장</span></div>
                        <div className="border-t border-[#e8e8ed] pt-2 flex justify-between">
                          <span className="font-bold">예상 금액</span>
                          <span className="text-[18px] font-bold text-[#34C759]">{reorderPrice.toLocaleString()}원</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 재주문 Step 4: 배송 정보 */}
            {step === 4 && (
              <motion.div key="r-step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                <div className="grid lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl p-8 shadow-sm">
                      <div className="flex items-center gap-2 mb-6">
                        <Truck className="w-5 h-5 text-[#34C759]" />
                        <h3 className="text-[17px] font-bold text-[#1d1d1f]">배송 정보</h3>
                      </div>
                      <div className="space-y-5">
                        <div>
                          <label className="block text-[13px] font-medium text-[#1d1d1f] mb-2">납기일 <span className="text-red-500">*</span></label>
                          <input type="date" value={reorderData.deliveryDate} onChange={(e) => setReorderData((p) => ({ ...p, deliveryDate: e.target.value }))}
                            className="w-full px-4 py-3 text-[15px] bg-[#f5f5f7] border-0 rounded-xl focus:ring-2 focus:ring-[#34C759]/30 focus:bg-white transition-all outline-none" />
                        </div>
                        <div>
                          <label className="block text-[13px] font-medium text-[#1d1d1f] mb-2">배송 주소</label>
                          <div className="flex items-center gap-2">
                            <input type="text" value={reorderData.deliveryAddress} onChange={(e) => setReorderData((p) => ({ ...p, deliveryAddress: e.target.value }))}
                              placeholder="배송 받을 주소를 입력하세요"
                              className="flex-1 px-4 py-3 text-[15px] bg-[#f5f5f7] border-0 rounded-xl focus:ring-2 focus:ring-[#34C759]/30 focus:bg-white transition-all outline-none" />
                            <button onClick={() => { setReorderData((p) => ({ ...p, deliveryAddress: "기관 주소 자동 입력" })); toast.success("기관 주소가 자동 입력되었습니다."); }}
                              className="px-4 py-3 bg-[#34C759]/10 text-[#34C759] text-[13px] font-semibold rounded-xl hover:bg-[#34C759]/20 transition-colors whitespace-nowrap">
                              <MapPin className="w-4 h-4 inline mr-1" />기관 주소
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-[13px] font-medium text-[#1d1d1f] mb-2">수령 담당자</label>
                          <input type="text" value={reorderData.deliveryContact} onChange={(e) => setReorderData((p) => ({ ...p, deliveryContact: e.target.value }))}
                            placeholder="수령 담당자 이름 및 연락처"
                            className="w-full px-4 py-3 text-[15px] bg-[#f5f5f7] border-0 rounded-xl focus:ring-2 focus:ring-[#34C759]/30 focus:bg-white transition-all outline-none" />
                        </div>
                      </div>
                    </div>

                    <button onClick={() => {
                      if (!reorderData.deliveryDate) { toast.error("납기일을 선택해주세요."); return; }
                      handleReorderSubmit();
                    }} className="w-full inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#34C759] text-white text-[17px] font-bold rounded-full hover:bg-[#2DB34A] transition-all hover:shadow-xl hover:shadow-[#34C759]/25">
                      <CheckCircle2 className="w-5 h-5" />
                      재주문 접수하기
                    </button>
                  </div>

                  <div className="lg:col-span-1">
                    <div className="sticky top-24 space-y-4">
                      <div className="bg-white rounded-2xl p-6 shadow-sm">
                        <h4 className="text-[14px] font-bold text-[#1d1d1f] mb-4">최종 재주문 요약</h4>
                        <div className="space-y-2 text-[13px]">
                          <div className="flex justify-between"><span className="text-[#86868b]">이름</span><span className="font-medium">{selectedPrevOrder?.name || "-"}</span></div>
                          <div className="flex justify-between"><span className="text-[#86868b]">부서</span><span className="font-medium">{selectedPrevOrder?.department || "-"}</span></div>
                          <div className="flex justify-between"><span className="text-[#86868b]">수량</span><span className="font-medium">{reorderData.quantity}장</span></div>
                          <div className="flex justify-between"><span className="text-[#86868b]">용지</span><span className="font-medium">{reorderData.paperType}</span></div>
                          <div className="flex justify-between"><span className="text-[#86868b]">인쇄</span><span className="font-medium">{reorderData.doubleSided ? "양면" : "단면"}</span></div>
                          <div className="flex justify-between"><span className="text-[#86868b]">결재자</span><span className="font-medium">{reorderData.approverName || "-"}</span></div>
                          <div className="border-t border-[#e8e8ed] pt-2 flex justify-between items-center">
                            <span className="font-bold text-[#1d1d1f]">예상 금액</span>
                            <span className="text-[20px] font-bold text-[#34C759]">{reorderPrice.toLocaleString()}원</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </PageWrapper>
  );
}

// ─── 이 줄 아래는 sample 모드 렌더링을 위해 위 return 이후 도달하지 않음 ───
// (sample 모드는 NamecardOrderForm 함수 내에서 조건부 렌더링으로 처리됨)
