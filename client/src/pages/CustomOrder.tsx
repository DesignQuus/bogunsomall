/*
 * Design: "Clean Canvas" — Apple Store Style
 * - 6개 상품 카테고리 버튼 그리드 (3열 2행)
 * - 각 버튼: 1:1 정사각형 이미지 + 오버레이 텍스트 + 하단 설명
 * - Icon + Text Overlay 디자인 방식
 */

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  ChevronRight,
  Phone,
  Mail,
  FileText,
  Palette,
  Printer,
  Truck,
  CheckCircle2,
  Paperclip,
  Upload,
} from "lucide-react";
import { toast } from "sonner";

const steps = [
  {
    icon: FileText,
    title: "1. 상담 및 견적",
    desc: "전화 또는 이메일로 원하시는 인쇄물의 사양을 알려주세요",
  },
  {
    icon: Palette,
    title: "2. 디자인 작업",
    desc: "전문 디자이너가 보건소에 최적화된 디자인을 제안합니다",
  },
  {
    icon: Printer,
    title: "3. 인쇄 제작",
    desc: "최신 장비로 고품질 인쇄물을 제작합니다",
  },
  {
    icon: Truck,
    title: "4. 배송 완료",
    desc: "전국 무료배송으로 안전하게 전달해 드립니다",
  },
];

// 상품 카테고리 데이터
const productCategories = [
  {
    id: "business-card",
    title: "명함",
    subtitle: "비즈니스 카드",
    description: "500~5,000매 주문 가능",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/product-business-card-HSjJ6jBjSTdo7ysNBbvTTo.webp",
    bgGradient: "from-blue-400 to-blue-600",
  },
  {
    id: "sticker",
    title: "스티커",
    subtitle: "컬러풀한 디자인",
    description: "다양한 사이즈와 형태",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/product-sticker-EpWQUJSvQeZNdxMPyYBH9r.webp",
    bgGradient: "from-green-400 to-green-600",
  },
  {
    id: "label",
    title: "부착물",
    subtitle: "프리미엄 라벨",
    description: "접착식 스티커 및 라벨",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/product-label-26ijfkESNzbDGcHabgcutQ.webp",
    bgGradient: "from-purple-400 to-purple-600",
  },
  {
    id: "digital-print",
    title: "디지털 소량 인쇄",
    subtitle: "소량 주문 최적화",
    description: "빠른 납기와 합리적 가격",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/product-digital-print-j5b7A32WEBTbDXDoYYTrzn.webp",
    bgGradient: "from-blue-500 to-blue-700",
  },
  {
    id: "merchandise",
    title: "기념품",
    subtitle: "브랜드 상품",
    description: "로고 인쇄 기념품",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/product-merchandise-J6Kq4gizJ3tUey2hqp6jE2.webp",
    bgGradient: "from-orange-400 to-orange-600",
  },
  {
    id: "other",
    title: "기타 제작물",
    subtitle: "맞춤형 솔루션",
    description: "다양한 인쇄물 제작 가능",
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/product-other-BAmPL9NJ3QuzmFsro6kidr.webp",
    bgGradient: "from-gray-400 to-gray-600",
  },
];

interface FormData {
  code: string;
  orgName: string;
  contact: string;
  email: string;
  product: string;
  quantity: string;
  deadline: string;
  details: string;
}

interface FormErrors {
  orgName?: string;
  contact?: string;
  email?: string;
  product?: string;
  quantity?: string;
}

export default function CustomOrder() {
  const [form, setForm] = useState<FormData>({
    code: "",
    orgName: "",
    contact: "",
    email: "",
    product: "select",
    quantity: "",
    deadline: "",
    details: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [files, setFiles] = useState<File[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!form.orgName.trim()) newErrors.orgName = "기관명 및 담당자명을 입력해 주세요.";
    if (!form.contact.trim()) newErrors.contact = "연락처를 입력해 주세요.";
    else if (!/^[\d\-+\s]+$/.test(form.contact)) newErrors.contact = "올바른 연락처 형식으로 입력해 주세요.";
    if (!form.email.trim()) newErrors.email = "이메일을 입력해 주세요.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = "올바른 이메일 형식으로 입력해 주세요.";
    if (form.product === "select") newErrors.product = "제작 상품을 선택해 주세요.";
    if (!form.quantity.trim()) newErrors.quantity = "수량을 입력해 주세요.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleFileAdd = (newFiles: FileList | null) => {
    if (!newFiles) return;
    const arr = Array.from(newFiles);
    const allowed = arr.filter(f => f.size <= 20 * 1024 * 1024);
    const rejected = arr.filter(f => f.size > 20 * 1024 * 1024);
    if (rejected.length > 0) toast.error("20MB 이하 파일만 첨부 가능합니다.");
    setFiles(prev => {
      const combined = [...prev, ...allowed];
      return combined.slice(0, 5);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileAdd(e.dataTransfer.files);
  };

  const removeFile = (idx: number) => {
    setFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("필수 항목을 모두 입력해 주세요.");
      return;
    }
    setSubmitted(true);
    toast.success("문의가 접수되었습니다. 빠른 시일 내에 연락드리겠습니다.");
  };

  const handleProductSelect = (productTitle: string) => {
    handleChange("product", productTitle);
  };

  if (submitted) {
    return (
      <div>
        {/* Breadcrumb */}
        <div className="bg-[#f5f5f7] border-b border-black/5">
          <div className="max-w-[1200px] mx-auto px-5 md:px-8 py-3">
            <nav className="flex items-center gap-1.5 text-[12px]">
              <Link href="/" className="text-[#86868b] hover:text-[#00A39B] transition-colors">홈</Link>
              <ChevronRight className="w-3 h-3 text-[#86868b]" />
              <span className="text-[#1d1d1f] font-medium">주문제작</span>
            </nav>
          </div>
        </div>

        <section className="bg-white py-24 md:py-32">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="max-w-lg mx-auto px-5 text-center"
          >
            <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-[28px] font-bold text-[#1d1d1f] mb-3">문의가 접수되었습니다</h2>
            <p className="text-[17px] text-[#86868b] leading-relaxed mb-8">
              담당자가 확인 후 <strong className="text-[#1d1d1f]">1~2 영업일 내</strong>에 연락드리겠습니다.<br />
              급한 문의는 전화로 연락 주세요.
            </p>
            <div className="bg-[#f5f5f7] rounded-2xl p-5 mb-8 text-left space-y-2">
              <div className="flex justify-between text-[14px]">
                <span className="text-[#86868b]">기관명 / 담당자</span>
                <span className="font-medium text-[#1d1d1f]">{form.orgName}</span>
              </div>
              <div className="flex justify-between text-[14px]">
                <span className="text-[#86868b]">제작 상품</span>
                <span className="font-medium text-[#1d1d1f]">{form.product === "select" ? "-" : form.product}</span>
              </div>
              <div className="flex justify-between text-[14px]">
                <span className="text-[#86868b]">수량</span>
                <span className="font-medium text-[#1d1d1f]">{form.quantity}</span>
              </div>
              {files.length > 0 && (
                <div className="flex justify-between text-[14px]">
                  <span className="text-[#86868b]">첨부 파일</span>
                  <span className="font-medium text-[#1d1d1f]">{files.length}개</span>
                </div>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/">
                <button className="px-8 py-3 bg-[#00A39B] text-white text-[15px] font-semibold rounded-full hover:bg-[#0055AA] transition-all">
                  홈으로 돌아가기
                </button>
              </Link>
              <a href="tel:15226401">
                <button className="px-8 py-3 bg-[#f5f5f7] text-[#1d1d1f] text-[15px] font-semibold rounded-full hover:bg-[#e8e8ed] transition-all">
                  📞 15226401
                </button>
              </a>
            </div>
          </motion.div>
        </section>
      </div>
    );
  }

  return (
    <div>
      {/* Breadcrumb */}
      <div className="bg-[#f5f5f7] border-b border-black/5">
        <div className="max-w-[1200px] mx-auto px-5 md:px-8 py-3">
          <nav className="flex items-center gap-1.5 text-[12px]">
            <Link href="/" className="text-[#86868b] hover:text-[#00A39B] transition-colors">홈</Link>
            <ChevronRight className="w-3 h-3 text-[#86868b]" />
            <span className="text-[#1d1d1f] font-medium">주문제작</span>
          </nav>
        </div>
      </div>

      {/* Header */}
      <section className="bg-white py-12 md:py-16">
        <div className="max-w-[1200px] mx-auto px-5 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-2xl mx-auto"
          >
            <h1 className="text-[clamp(1.75rem,4vw,3rem)] font-bold tracking-tight text-[#1d1d1f] mb-4">
              주문제작
            </h1>
            <p className="text-[17px] text-[#86868b] leading-relaxed">
              보건소에 필요한 맞춤 인쇄물을 제작해 드립니다.<br />
              아래에서 상품을 선택하거나 전화로 문의해 주세요.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Product Category Grid */}
      <section className="bg-[#f5f5f7] py-12 md:py-16">
        <div className="max-w-[1200px] mx-auto px-5 md:px-8">
          <h2 className="text-[24px] font-bold text-[#1d1d1f] mb-8 text-center">상품 선택</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {productCategories.map((product, idx) => (
              <motion.button
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.4 }}
                onClick={() => handleProductSelect(product.title)}
                className="group text-left focus:outline-none focus:ring-2 focus:ring-[#00A39B] rounded-2xl"
              >
                {/* 1:1 Image Container with Overlay */}
                <div className="relative w-full aspect-square rounded-2xl overflow-hidden mb-3 bg-gray-200 shadow-sm group-hover:shadow-md transition-shadow">
                  {/* Background Image */}
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Overlay with Text */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40 group-hover:to-black/50 transition-all flex flex-col items-end justify-end p-4">
                    <div className="text-white text-right">
                      <h3 className="text-[18px] font-bold leading-tight">{product.title}</h3>
                      <p className="text-[13px] font-medium opacity-90 mt-0.5">{product.subtitle}</p>
                    </div>
                  </div>
                </div>

                {/* Description Below */}
                <div className="px-1">
                  <p className="text-[13px] text-[#86868b] leading-relaxed line-clamp-2">
                    {product.description}
                  </p>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Process Steps */}
      <section className="bg-white py-12 md:py-16">
        <div className="max-w-[1200px] mx-auto px-5 md:px-8">
          <h2 className="text-[24px] font-bold text-[#1d1d1f] mb-8 text-center">주문 절차</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="text-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#f5f5f7] shadow-sm flex items-center justify-center mx-auto mb-4">
                  <step.icon className="w-7 h-7 text-[#00A39B]" />
                </div>
                <h3 className="text-[15px] font-semibold text-[#1d1d1f] mb-1.5">{step.title}</h3>
                <p className="text-[13px] text-[#86868b] leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="bg-[#f5f5f7] py-12 md:py-16">
        <div className="max-w-[1200px] mx-auto px-5 md:px-8">
          <div className="grid lg:grid-cols-5 gap-12 lg:gap-16">
            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-3"
            >
              <h2 className="text-[21px] font-bold text-[#1d1d1f] mb-6">주문 문의</h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* 담당자 코드 기능 일시 중단 - 나중에 복구 가능 */}
                {/* 담당자 코드 입력 아래 주석 처리 된 내용 */}

                {/* 기관명 / 담당자명 + 연락처 */}
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[13px] font-medium text-[#1d1d1f] mb-2">
                      기관명 / 담당자명 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="예: OO보건소 홍길동"
                      value={form.orgName}
                      onChange={e => handleChange("orgName", e.target.value)}
                      className={`w-full px-4 py-3 text-[15px] bg-white border-0 rounded-xl focus:ring-2 focus:bg-white transition-all outline-none ${errors.orgName ? "ring-2 ring-red-400 bg-red-50" : "focus:ring-[#00A39B]/30"}`}
                    />
                    {errors.orgName && <p className="text-[12px] text-red-500 mt-1">{errors.orgName}</p>}
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-[#1d1d1f] mb-2">
                      연락처 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="010-0000-0000"
                      value={form.contact}
                      onChange={e => handleChange("contact", e.target.value)}
                      className={`w-full px-4 py-3 text-[15px] bg-white border-0 rounded-xl focus:ring-2 focus:bg-white transition-all outline-none ${errors.contact ? "ring-2 ring-red-400 bg-red-50" : "focus:ring-[#00A39B]/30"}`}
                    />
                    {errors.contact && <p className="text-[12px] text-red-500 mt-1">{errors.contact}</p>}
                  </div>
                </div>

                {/* 이메일 */}
                <div>
                  <label className="block text-[13px] font-medium text-[#1d1d1f] mb-2">
                    이메일 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="example@example.com"
                    value={form.email}
                    onChange={e => handleChange("email", e.target.value)}
                    className={`w-full px-4 py-3 text-[15px] bg-white border-0 rounded-xl focus:ring-2 focus:bg-white transition-all outline-none ${errors.email ? "ring-2 ring-red-400 bg-red-50" : "focus:ring-[#00A39B]/30"}`}
                  />
                  {errors.email && <p className="text-[12px] text-red-500 mt-1">{errors.email}</p>}
                </div>

                {/* 제작 상품 */}
                <div>
                  <label className="block text-[13px] font-medium text-[#1d1d1f] mb-2">
                    제작 상품 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.product}
                    onChange={e => handleChange("product", e.target.value)}
                    className={`w-full px-4 py-3 text-[15px] bg-white border-0 rounded-xl focus:ring-2 focus:bg-white transition-all outline-none appearance-none ${errors.product ? "ring-2 ring-red-400 bg-red-50" : "focus:ring-[#00A39B]/30"}`}
                  >
                    <option value="select">상품을 선택해주세요</option>
                    {productCategories.map(cat => (
                      <option key={cat.id} value={cat.title}>{cat.title}</option>
                    ))}
                  </select>
                  {errors.product && <p className="text-[12px] text-red-500 mt-1">{errors.product}</p>}
                </div>

                {/* 수량 + 희망 납기일 */}
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[13px] font-medium text-[#1d1d1f] mb-2">
                      수량 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="예: 500부"
                      value={form.quantity}
                      onChange={e => handleChange("quantity", e.target.value)}
                      className={`w-full px-4 py-3 text-[15px] bg-white border-0 rounded-xl focus:ring-2 focus:bg-white transition-all outline-none ${errors.quantity ? "ring-2 ring-red-400 bg-red-50" : "focus:ring-[#00A39B]/30"}`}
                    />
                    {errors.quantity && <p className="text-[12px] text-red-500 mt-1">{errors.quantity}</p>}
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-[#1d1d1f] mb-2">희망 납기일</label>
                    <input
                      type="date"
                      value={form.deadline}
                      onChange={e => handleChange("deadline", e.target.value)}
                      className="w-full px-4 py-3 text-[15px] bg-white border-0 rounded-xl focus:ring-2 focus:ring-[#00A39B]/30 focus:bg-white transition-all outline-none"
                    />
                  </div>
                </div>

                {/* 상세 요청사항 */}
                <div>
                  <label className="block text-[13px] font-medium text-[#1d1d1f] mb-2">상세 요청사항</label>
                  <textarea
                    rows={4}
                    placeholder="사이즈, 용지, 후가공 등 상세 요청사항을 적어주세요"
                    value={form.details}
                    onChange={e => handleChange("details", e.target.value)}
                    className="w-full px-4 py-3 text-[15px] bg-white border-0 rounded-xl focus:ring-2 focus:ring-[#00A39B]/30 focus:bg-white transition-all outline-none resize-none"
                  />
                </div>

                {/* 파일 첨부 */}
                <div>
                  <label className="block text-[13px] font-medium text-[#1d1d1f] mb-2">
                    디자인 파일 첨부 <span className="text-[#86868b] font-normal">(선택, 최대 5개 · 각 20MB 이하)</span>
                  </label>
                  <div
                    onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative border-2 border-dashed rounded-xl px-6 py-8 text-center cursor-pointer transition-all ${
                      isDragging
                        ? "border-[#00A39B] bg-[#EBF4FF]"
                        : "border-[#d2d2d7] hover:border-[#00A39B]/50 hover:bg-white"
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept=".pdf,.ai,.psd,.png,.jpg,.jpeg,.zip"
                      className="hidden"
                      onChange={e => handleFileAdd(e.target.files)}
                    />
                    <Upload className="w-8 h-8 text-[#86868b] mx-auto mb-2" />
                    <p className="text-[14px] text-[#424245] font-medium">파일을 드래그하거나 클릭하여 첨부</p>
                    <p className="text-[12px] text-[#86868b] mt-1">PDF, AI, PSD, PNG, JPG, ZIP 지원</p>
                  </div>

                  {/* 첨부된 파일 목록 */}
                  {files.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {files.map((file, idx) => (
                        <div key={idx} className="flex items-center gap-3 px-4 py-2.5 bg-white rounded-xl">
                          <Paperclip className="w-4 h-4 text-[#00A39B] shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-medium text-[#1d1d1f] truncate">{file.name}</p>
                            <p className="text-[11px] text-[#86868b]">{formatFileSize(file.size)}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(idx)}
                            className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full py-3 bg-[#00A39B] text-white text-[15px] font-semibold rounded-xl hover:bg-[#0055AA] transition-all"
                >
                  문의 접수
                </button>
              </form>
            </motion.div>

            {/* Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-2"
            >
              <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-20">
                <h3 className="text-[17px] font-bold text-[#1d1d1f] mb-4">빠른 문의</h3>
                <div className="space-y-3">
                  <a href="tel:15226401" className="flex items-center gap-3 p-3 bg-[#f5f5f7] rounded-xl hover:bg-[#e8e8ed] transition-all">
                    <Phone className="w-5 h-5 text-[#00A39B] shrink-0" />
                    <div>
                      <p className="text-[12px] text-[#86868b]">전화 문의</p>
                      <p className="text-[15px] font-semibold text-[#1d1d1f]">15226401</p>
                    </div>
                  </a>
                  <a href="mailto:support@example.com" className="flex items-center gap-3 p-3 bg-[#f5f5f7] rounded-xl hover:bg-[#e8e8ed] transition-all">
                    <Mail className="w-5 h-5 text-[#00A39B] shrink-0" />
                    <div>
                      <p className="text-[12px] text-[#86868b]">이메일 문의</p>
                      <p className="text-[15px] font-semibold text-[#1d1d1f]">support@bogeonsoplus.kr</p>
                    </div>
                  </a>
                </div>
                <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <p className="text-[13px] text-[#424245] leading-relaxed">
                    <strong>평일 09:00~18:00</strong>에 상담 가능합니다.<br />
                    빠른 응답을 위해 전화 문의를 권장합니다.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
