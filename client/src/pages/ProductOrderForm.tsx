/**
 * ProductOrderForm.tsx
 * - 스티커, 봉투, 쇼핑백, 캘린더, 디지털소량인쇄, 캠페인 부착물, 금연성공 기념품 주문 폼
 * - URL: /order/product/:productType
 */
import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { ChevronLeft, ChevronRight, CheckCircle2, Package } from "lucide-react";
import { toast } from "sonner";
import { useTemplate } from "@/contexts/TemplateContext";
import BackButton from "@/components/BackButton";
import type { ProductType, OrderStatus } from "@/../../shared/types";

// 제품 타입별 설정
const PRODUCT_CONFIG: Record<string, {
  name: string;
  icon: string;
  color: string;
  bg: string;
  sizes: string[];
  materials: string[];
  quantities: number[];
  extraFields: string[];
  description: string;
}> = {
  sticker: {
    name: "스티커",
    icon: "🏷️",
    color: "#FF9500",
    bg: "#FFF4E5",
    sizes: ["원형 30mm", "원형 50mm", "원형 70mm", "사각 50×50mm", "사각 70×70mm", "사각 100×100mm", "맞춤 사이즈"],
    materials: ["일반지 (광택)", "일반지 (무광)", "특수지 (방수)", "투명 PET"],
    quantities: [50, 100, 200, 300, 500, 1000],
    extraFields: ["shape"],
    description: "보건 캠페인, 예방접종, 안내 등 다양한 용도의 스티커를 제작합니다.",
  },
  envelope: {
    name: "봉투",
    icon: "✉️",
    color: "#5856D6",
    bg: "#F0EFFE",
    sizes: ["소봉투 (B5)", "중봉투 (A4)", "대봉투 (A3)", "맞춤 사이즈"],
    materials: ["백색 모조지 80g", "백색 모조지 120g", "크라프트지", "특수지"],
    quantities: [100, 200, 300, 500, 1000, 2000],
    extraFields: ["printSide"],
    description: "공문서 발송, 기관 홍보물 배포 등에 사용하는 봉투를 제작합니다.",
  },
  shopping: {
    name: "쇼핑백",
    icon: "🛍️",
    color: "#30B0C7",
    bg: "#E5F7FA",
    sizes: ["소 (150×200×80mm)", "중 (200×250×100mm)", "대 (250×300×120mm)", "특대 (300×350×150mm)"],
    materials: ["아트지 (유광)", "아트지 (무광)", "크라프트지", "부직포"],
    quantities: [50, 100, 200, 300, 500],
    extraFields: ["handleType"],
    description: "건강 캠페인, 기념품 증정 등에 활용하는 쇼핑백을 제작합니다.",
  },
  calendar: {
    name: "캘린더",
    icon: "📅",
    color: "#007AFF",
    bg: "#E5F2FF",
    sizes: ["탁상용 (148×210mm)", "벽걸이용 (297×420mm)", "소형 벽걸이 (210×297mm)"],
    materials: ["아트지 250g (표지)", "아트지 150g (내지)", "스노우지"],
    quantities: [50, 100, 200, 300, 500],
    extraFields: ["calendarType", "startMonth"],
    description: "연간 보건 사업 일정, 건강 정보를 담은 캘린더를 제작합니다.",
  },
  digital: {
    name: "디지털소량인쇄",
    icon: "🖨️",
    color: "#FF2D55",
    bg: "#FFF0F3",
    sizes: ["A6 (105×148mm)", "A5 (148×210mm)", "A4 (210×297mm)", "A3 (297×420mm)"],
    materials: ["아트지 (유광)", "아트지 (무광)", "스노우지"],
    quantities: [10, 20, 30, 50, 100, 200],
    extraFields: ["printType"],
    description: "소량 주문이 필요한 전단지, 포스터, 리플렛, 카탈로그를 빠르게 제작합니다.",
  },
  campaign: {
    name: "캠페인 부착물",
    icon: "📢",
    color: "#34C759",
    bg: "#EDFBF1",
    sizes: ["A4 포스터", "A3 포스터", "A2 포스터", "현수막 900×2700mm", "현수막 600×1800mm", "맞춤 사이즈"],
    materials: ["아트지 (무광)", "아트지 (유광)", "방수 현수막 천", "실내용 PVC"],
    quantities: [10, 20, 30, 50, 100, 200, 300],
    extraFields: ["campaignType"],
    description: "금연, 암 예방, 예방접종 등 보건 캠페인용 포스터, 현수막, 배너를 제작합니다.",
  },
  gift: {
    name: "금연성공 기념품",
    icon: "🎁",
    color: "#FF6B35",
    bg: "#FFF2EE",
    sizes: ["소형 (기념품 세트)", "중형 (기념품 세트)", "대형 (기념품 세트)"],
    materials: ["기본 구성", "프리미엄 구성", "맞춤 구성"],
    quantities: [10, 20, 30, 50, 100],
    extraFields: ["giftType"],
    description: "금연 성공자를 위한 기념품 세트를 맞춤 제작합니다.",
  },
  signage: {
    name: "공원용 목재 금연표지판",
    icon: "🌳",
    color: "#2D6A4F",
    bg: "#E8F5EE",
    sizes: ["소형 (300×400mm)", "중형 (400×500mm)", "대형 (500×700mm)", "특대형 (600×900mm)", "맞춤 규격"],
    materials: ["로스우드 (일반)", "로스우드 (방부처리)", "삼나무 (프리미엄)", "철제 로스우드 (고급형)"],
    quantities: [1, 3, 5, 10, 20, 30],
    extraFields: [],
    description: "전국 공원 어디든 설치 가능한 목재 금연공원 표지판을 제작합니다. 행정 서식 및 주문 세부 절차는 소비자 센터로 문의해 주세요.",
  },
  largeformat: {
    name: "실사출력",
    icon: "🖼️",
    color: "#F59E0B",
    bg: "#FFFBEB",
    sizes: ["A1 (594×841mm)", "A0 (841×1189mm)", "B1 (707×1000mm)", "포스터 대형 (900×1200mm)", "맞춤 규격"],
    materials: ["방수 실내용", "방수 실외용", "여배지 (실내용)", "라미네이트 (실외용)"],
    quantities: [1, 3, 5, 10, 20, 50],
    extraFields: [],
    description: "대형 실사 출력으로 전시용, 행사용 및 실내외 풍부한 비주얼을 제작합니다.",
  },
};

interface FormData {
  size: string;
  material: string;
  quantity: number | string;
  printSide: string;
  shape: string;
  handleType: string;
  calendarType: string;
  startMonth: string;
  printType: string;
  campaignType: string;
  giftType: string;
  designRequest: string;
  deliveryAddress: string;
  contactName: string;
  contactPhone: string;
  memo: string;
  hasFile: boolean;
}

const INITIAL_FORM: FormData = {
  size: "",
  material: "",
  quantity: "",
  printSide: "단면",
  shape: "원형",
  handleType: "끈 손잡이",
  calendarType: "탁상용",
  startMonth: "1월",
  printType: "전단지",
  campaignType: "금연 사업",
  giftType: "기본 구성",
  designRequest: "",
  deliveryAddress: "",
  contactName: "",
  contactPhone: "",
  memo: "",
  hasFile: false,
};

const VALID_PRODUCT_TYPES: ProductType[] = ['namecard', 'flyer', 'poster', 'leaflet', 'shopping_bag', 'calendar', 'sticker', 'envelope', 'digital'];

// productType별 대표 이미지 매핑
const PRODUCT_IMAGES: Record<string, string> = {
  sticker: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=800&h=1000&fit=crop&q=80",
  envelope: "https://images.unsplash.com/photo-1579751626657-72bc17010498?w=800&h=1000&fit=crop&q=80",
  shopping: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=1000&fit=crop&q=80",
  calendar: "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/캘린더_488afa48.png",
  digital: "https://images.unsplash.com/photo-1562654501-a0ccc0fc3fb1?w=800&h=1000&fit=crop&q=80",
  campaign: "https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=800&h=1000&fit=crop&q=80",
  gift: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=800&h=1000&fit=crop&q=80",
  signage: "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/금연표지판002_262bf758.png",
};

export default function ProductOrderForm(props: { params?: { productType?: string } }) {
  const rawProductType = props.params?.productType || "sticker";
  const productType = (VALID_PRODUCT_TYPES.includes(rawProductType as ProductType) ? rawProductType : 'sticker') as ProductType;
  const config = PRODUCT_CONFIG[rawProductType] || PRODUCT_CONFIG.sticker;
  const [, setLocation] = useLocation();
  const navigate = (path: string | number) => {
    if (typeof path === 'number') { window.history.go(path); } else { setLocation(path); }
  };
  const { addOrderHistory } = useTemplate();
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [step, setStep] = useState<"select" | "detail" | "confirm" | "done">("select");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setForm(INITIAL_FORM);
    setStep("select");
  }, [productType]);

  const handleNext = () => {
    if (step === "select") {
      if (!form.size || !form.material || !form.quantity) {
        toast.error("사이즈, 재질, 수량을 선택해 주세요.");
        return;
      }
      setStep("detail");
    } else if (step === "detail") {
      if (!form.contactName || !form.contactPhone || !form.deliveryAddress) {
        toast.error("담당자 정보와 배송지를 입력해 주세요.");
        return;
      }
      setStep("confirm");
    }
  };

  const handleSubmit = () => {
    setSubmitting(true);
    setTimeout(() => {
      const orderId = `ORD-${Date.now().toString().slice(-6)}`;
      addOrderHistory({
        id: orderId,
        userId: 'current-user',
        templateId: '',
        productType,
        productName: config.name,
        quantity: Number(form.quantity),
        orderDate: new Date().toISOString(),
        status: 'pending' as OrderStatus,
        specifications: {
          size: String(form.size),
          material: String(form.material),
          contactName: form.contactName,
          contactPhone: form.contactPhone,
          deliveryAddress: form.deliveryAddress,
          designRequest: form.designRequest,
        },
        modifications: form.memo || '',
        deliveryDate: '',
        notes: form.memo || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      setSubmitting(false);
      setStep("done");
    }, 1200);
  };

  // 완료 화면
  if (step === "done") {
    return (
      <div className="min-h-screen bg-[#fbfbfd] flex items-center justify-center px-5">
        <div className="max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-[#EDFBF1] rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-8 h-8 text-[#34C759]" />
          </div>
          <h2 className="text-[24px] font-bold text-[#1d1d1f] mb-2">주문이 접수되었습니다</h2>
          <p className="text-[14px] text-[#86868b] mb-8">
            영업일 기준 1~2일 내 담당자가 연락드립니다.<br />
            주문 현황은 대시보드에서 확인하실 수 있습니다.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="w-full py-3 bg-[#00A39B] text-white rounded-xl text-[15px] font-semibold hover:bg-[#0055AA] transition-colors"
            >
              대시보드로 이동
            </button>
            <button
              onClick={() => { setForm(INITIAL_FORM); setStep("select"); }}
              className="w-full py-3 bg-[#f5f5f7] text-[#1d1d1f] rounded-xl text-[15px] font-semibold hover:bg-[#e8e8ed] transition-colors"
            >
              추가 주문하기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbfbfd]">
      {/* 헤더 */}
      <div className="bg-white border-b border-black/5 px-5 py-4 flex items-center gap-3">
        {step === "select" ? (
          <BackButton variant="header" />
        ) : (
          <button
            onClick={() => setStep(step === "detail" ? "select" : "detail")}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f5f5f7] transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-[#1d1d1f]" />
          </button>
        )}
        <Link href="/category/namecard" className="flex items-center gap-2 hover:opacity-70 transition-opacity">
          <span className="text-xl">{config.icon}</span>
          <div>
            <h1 className="text-[16px] font-semibold text-[#1d1d1f]">{config.name} 주문</h1>
            <p className="text-[12px] text-[#86868b]">
              {step === "select" ? "사양 선택" : step === "detail" ? "상세 정보" : "최종 확인"}
            </p>
          </div>
        </Link>
        {/* 진행 단계 */}
        <div className="ml-auto flex items-center gap-1.5">
          {["select", "detail", "confirm"].map((s, i) => (
            <div
              key={s}
              className={`w-2 h-2 rounded-full transition-all ${
                step === s ? "bg-[#00A39B] w-4" : i < ["select","detail","confirm"].indexOf(step) ? "bg-[#34C759]" : "bg-[#d2d2d7]"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-5 py-6">

        {/* Step 1: 사양 선택 */}
        {step === "select" && (
          <div className="grid lg:grid-cols-2 gap-8 items-start">
            {/* 왼쪽: 상품 이미지 */}
            <div className="hidden lg:block sticky top-24">
              <div className="rounded-2xl overflow-hidden bg-[#f5f5f7] aspect-[4/5]">
                {PRODUCT_IMAGES[rawProductType] ? (
                  <img
                    src={PRODUCT_IMAGES[rawProductType]}
                    alt={config.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-6xl">{config.icon}</span>
                  </div>
                )}
              </div>
              <div className="mt-4 p-4 bg-white rounded-2xl border border-black/5">
                <h2 className="text-[18px] font-bold text-[#1d1d1f] mb-1">{config.name}</h2>
                <p className="text-[13px] text-[#86868b] leading-relaxed">{config.description}</p>
              </div>
            </div>
            {/* 오른쪽: 폼 */}
            <div className="space-y-5">
            {rawProductType === "signage" && (
              <div className="p-4 rounded-2xl border-2 border-[#2D6A4F] bg-[#E8F5EE]">
                <div className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0">📢</span>
                  <p className="text-[14px] font-semibold text-[#2D6A4F] leading-relaxed">
                    공원용 목재 표지판 주문은 소비자 센터에 연락 주시면 행정 서식 및 주문 세부 절차를 안내 드립니다.
                    <span className="block mt-1 text-[13px] font-normal text-[#2D6A4F]/80">📞 고객센터: 1522-6401 (평일 09:00~18:00)</span>
                  </p>
                </div>
              </div>
            )}
            <div className="p-4 rounded-2xl text-[13px] text-[#86868b] leading-relaxed" style={{ backgroundColor: config.bg }}>
              <span className="text-xl mr-2">{config.icon}</span>
              {config.description}
            </div>

            {/* 사이즈 */}
            <div>
              <label className="block text-[14px] font-semibold text-[#1d1d1f] mb-3">
                사이즈 선택 <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {config.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setForm({ ...form, size })}
                    className={`py-3 px-4 rounded-xl text-[13px] font-medium border transition-all text-left ${
                      form.size === size
                        ? "border-[#00A39B] bg-[#EBF3FF] text-[#00A39B]"
                        : "border-black/10 bg-white text-[#1d1d1f] hover:border-black/20"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* 재질 */}
            <div>
              <label className="block text-[14px] font-semibold text-[#1d1d1f] mb-3">
                재질 선택 <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {config.materials.map((material) => (
                  <button
                    key={material}
                    onClick={() => setForm({ ...form, material })}
                    className={`py-3 px-4 rounded-xl text-[13px] font-medium border transition-all text-left ${
                      form.material === material
                        ? "border-[#00A39B] bg-[#EBF3FF] text-[#00A39B]"
                        : "border-black/10 bg-white text-[#1d1d1f] hover:border-black/20"
                    }`}
                  >
                    {material}
                  </button>
                ))}
              </div>
            </div>

            {/* 수량 */}
            <div>
              <label className="block text-[14px] font-semibold text-[#1d1d1f] mb-3">
                수량 선택 <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {config.quantities.map((qty) => (
                  <button
                    key={qty}
                    onClick={() => setForm({ ...form, quantity: qty })}
                    className={`py-3 rounded-xl text-[13px] font-medium border transition-all ${
                      form.quantity === qty
                        ? "border-[#00A39B] bg-[#EBF3FF] text-[#00A39B]"
                        : "border-black/10 bg-white text-[#1d1d1f] hover:border-black/20"
                    }`}
                  >
                    {qty.toLocaleString()}{rawProductType === "signage" || rawProductType === "largeformat" ? "개" : "매"}
                  </button>
                ))}
              </div>
              <div className="mt-2">
                <input
                  type="number"
                  placeholder={`직접 입력 (${rawProductType === "signage" || rawProductType === "largeformat" ? "개" : "매"})`}
                  value={typeof form.quantity === "string" ? form.quantity : ""}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-black/10 text-[14px] focus:outline-none focus:border-[#00A39B] transition-colors"
                />
              </div>
            </div>


            <button
              onClick={handleNext}
              className="w-full py-3.5 bg-[#00A39B] text-white rounded-xl text-[15px] font-semibold hover:bg-[#0055AA] active:scale-[0.99] transition-all"
            >
              다음 단계 <ChevronRight className="inline w-4 h-4 ml-1" />
            </button>
            </div>
          </div>
        )}
        {/* Step 2: 상세 정보 */}
        {step === "detail" && (
          <div className="space-y-5">
            <div className="p-4 bg-white rounded-2xl border border-black/5">
              <p className="text-[12px] text-[#86868b] mb-1">선택한 사양</p>
              <p className="text-[14px] font-semibold text-[#1d1d1f]">
                {config.name} · {form.size} · {form.material} · {Number(form.quantity).toLocaleString()}매
              </p>
            </div>

            <div>
              <label className="block text-[14px] font-semibold text-[#1d1d1f] mb-1.5">
                담당자 이름 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.contactName}
                onChange={(e) => setForm({ ...form, contactName: e.target.value })}
                placeholder="홍길동"
                className="w-full px-4 py-3 rounded-xl border border-black/10 text-[14px] focus:outline-none focus:border-[#00A39B] transition-colors"
              />
            </div>

            <div>
              <label className="block text-[14px] font-semibold text-[#1d1d1f] mb-1.5">
                연락처 <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={form.contactPhone}
                onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                placeholder="010-0000-0000"
                className="w-full px-4 py-3 rounded-xl border border-black/10 text-[14px] focus:outline-none focus:border-[#00A39B] transition-colors"
              />
            </div>

            <div>
              <label className="block text-[14px] font-semibold text-[#1d1d1f] mb-1.5">
                배송지 주소 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.deliveryAddress}
                onChange={(e) => setForm({ ...form, deliveryAddress: e.target.value })}
                placeholder="서울시 강남구 보건소 123호"
                className="w-full px-4 py-3 rounded-xl border border-black/10 text-[14px] focus:outline-none focus:border-[#00A39B] transition-colors"
              />
            </div>

            <div>
              <label className="block text-[14px] font-semibold text-[#1d1d1f] mb-1.5">
                디자인 요청 사항
              </label>
              <textarea
                value={form.designRequest}
                onChange={(e) => setForm({ ...form, designRequest: e.target.value })}
                placeholder="원하시는 디자인, 색상, 문구 등을 자유롭게 작성해 주세요."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-black/10 text-[14px] focus:outline-none focus:border-[#00A39B] transition-colors resize-none"
              />
            </div>

            <div>
              <label className="block text-[14px] font-semibold text-[#1d1d1f] mb-1.5">
                기타 메모
              </label>
              <textarea
                value={form.memo}
                onChange={(e) => setForm({ ...form, memo: e.target.value })}
                placeholder="납기일 요청, 특이사항 등을 작성해 주세요."
                rows={2}
                className="w-full px-4 py-3 rounded-xl border border-black/10 text-[14px] focus:outline-none focus:border-[#00A39B] transition-colors resize-none"
              />
            </div>

            <button
              onClick={handleNext}
              className="w-full py-3.5 bg-[#00A39B] text-white rounded-xl text-[15px] font-semibold hover:bg-[#0055AA] active:scale-[0.99] transition-all"
            >
              주문 내용 확인 <ChevronRight className="inline w-4 h-4 ml-1" />
            </button>
          </div>
        )}

        {/* Step 3: 최종 확인 */}
        {step === "confirm" && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-black/5 overflow-hidden">
              <div className="px-5 py-4 border-b border-black/5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: config.bg }}>
                  {config.icon}
                </div>
                <div>
                  <p className="text-[15px] font-semibold text-[#1d1d1f]">{config.name} 주문</p>
                  <p className="text-[12px] text-[#86868b]">주문 내용을 최종 확인해 주세요</p>
                </div>
              </div>

              {[
                { label: "사이즈", value: form.size },
                { label: "재질", value: form.material },
                { label: "수량", value: `${Number(form.quantity).toLocaleString()}매` },
                { label: "담당자", value: form.contactName },
                { label: "연락처", value: form.contactPhone },
                { label: "배송지", value: form.deliveryAddress },
                ...(form.designRequest ? [{ label: "디자인 요청", value: form.designRequest }] : []),
                ...(form.memo ? [{ label: "메모", value: form.memo }] : []),
              ].map((item) => (
                <div key={item.label} className="px-5 py-3 flex items-start gap-3 border-b border-black/5 last:border-0">
                  <span className="text-[13px] text-[#86868b] w-20 flex-shrink-0">{item.label}</span>
                  <span className="text-[13px] text-[#1d1d1f] font-medium flex-1">{item.value}</span>
                </div>
              ))}
            </div>

            <div className="p-4 bg-[#FFF4E5] rounded-2xl">
              <p className="text-[13px] text-[#86868b] leading-relaxed">
                <span className="font-semibold text-[#FF9500]">안내:</span> 주문 접수 후 영업일 기준 1~2일 내 담당자가 견적서와 함께 연락드립니다. 최종 금액은 담당자 확인 후 안내드립니다.
              </p>
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full py-3.5 bg-[#00A39B] text-white rounded-xl text-[15px] font-semibold hover:bg-[#0055AA] active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  접수 중...
                </>
              ) : (
                <>
                  <Package className="w-4 h-4" />
                  주문 접수하기
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
