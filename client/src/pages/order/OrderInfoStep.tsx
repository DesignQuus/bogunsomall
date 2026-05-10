/**
 * 주문 정보 입력 페이지
 * - 수량, 발송지, 수령인, 납기일, 배송 방법 등
 */

import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { StandardTemplate, PersonalInfoRow } from "@/types/order";
import { toast } from "sonner";

interface OrderInfoStepProps {
  template: StandardTemplate;
  personalData: PersonalInfoRow | PersonalInfoRow[];
  onNext: (orderInfo: OrderInfo) => void;
  onBack: () => void;
}

export interface OrderInfo {
  quantity: number;
  shippingAddress: string;
  recipientName: string;
  recipientPhone: string;
  deadline?: string;
  specialRequests?: string;
  shippingMethod: "pickup" | "delivery";
}

export default function OrderInfoStep({
  template,
  personalData,
  onNext,
  onBack,
}: OrderInfoStepProps) {
  const isArray = Array.isArray(personalData);
  const personCount = isArray ? personalData.length : 1;

  const [orderInfo, setOrderInfo] = useState<OrderInfo>({
    quantity: template.defaultQuantity || 500,
    shippingAddress: "",
    recipientName: "",
    recipientPhone: "",
    deadline: "",
    specialRequests: "",
    shippingMethod: "delivery",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (key: string, value: string | number) => {
    setOrderInfo((prev) => ({
      ...prev,
      [key]: value,
    }));

    // 에러 제거
    if (errors[key]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!orderInfo.quantity || orderInfo.quantity < 1) {
      newErrors.quantity = "수량은 1개 이상이어야 합니다.";
    }

    if (!orderInfo.shippingAddress.trim()) {
      newErrors.shippingAddress = "발송지 주소는 필수 입력 항목입니다.";
    }

    if (!orderInfo.recipientName.trim()) {
      newErrors.recipientName = "수령인은 필수 입력 항목입니다.";
    }

    if (!orderInfo.recipientPhone.trim()) {
      newErrors.recipientPhone = "수령인 연락처는 필수 입력 항목입니다.";
    }

    const phoneRegex = /^[0-9\-]{10,}$/;
    if (orderInfo.recipientPhone && !phoneRegex.test(orderInfo.recipientPhone)) {
      newErrors.recipientPhone = "유효한 전화번호를 입력해주세요.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      onNext(orderInfo);
    } else {
      toast.error("입력 내용을 확인해주세요.");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 */}
      <div className="sticky top-0 bg-white border-b border-[#e5e5e7] z-10">
        <div className="max-w-[1200px] mx-auto px-5 md:px-8 py-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-[#00A39B] hover:text-[#0055AA] transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="text-[14px] font-semibold">뒤로</span>
          </button>
          <h1 className="text-[18px] font-bold text-[#1d1d1f]">주문 정보</h1>
          <div className="w-16" />
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="max-w-[800px] mx-auto px-5 md:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-[24px] font-bold text-[#1d1d1f] mb-2">
            주문 정보 입력
          </h2>
          <p className="text-[15px] text-[#86868b]">
            {template.name} · {personCount}명
          </p>
        </div>

        {/* 폼 */}
        <div className="space-y-6 mb-12">
          {/* 수량 */}
          <div>
            <label className="block text-[15px] font-semibold text-[#1d1d1f] mb-2">
              수량 <span className="text-[#FF3B30]">*</span>
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={orderInfo.quantity}
                onChange={(e) =>
                  handleChange("quantity", parseInt(e.target.value) || 0)
                }
                min="1"
                className={`flex-1 px-4 py-3 border rounded-lg text-[15px] font-normal transition-colors focus:outline-none focus:ring-2 focus:ring-[#00A39B] focus:border-transparent ${
                  errors.quantity
                    ? "border-[#FF3B30]"
                    : "border-[#e5e5e7] hover:border-[#d5d5d7]"
                }`}
              />
              <span className="text-[15px] font-semibold text-[#1d1d1f]">
                {template.productType === "namecard" ? "장" : "개"}
              </span>
            </div>
            {errors.quantity && (
              <p className="text-[13px] text-[#FF3B30] mt-2">{errors.quantity}</p>
            )}
          </div>

          {/* 발송지 주소 */}
          <div>
            <label className="block text-[15px] font-semibold text-[#1d1d1f] mb-2">
              발송지 주소 <span className="text-[#FF3B30]">*</span>
            </label>
            <textarea
              value={orderInfo.shippingAddress}
              onChange={(e) => handleChange("shippingAddress", e.target.value)}
              placeholder="예: 서울시 강남구 테헤란로 123"
              className={`w-full px-4 py-3 border rounded-lg text-[15px] font-normal transition-colors focus:outline-none focus:ring-2 focus:ring-[#00A39B] focus:border-transparent resize-none h-20 ${
                errors.shippingAddress
                  ? "border-[#FF3B30]"
                  : "border-[#e5e5e7] hover:border-[#d5d5d7]"
              }`}
            />
            {errors.shippingAddress && (
              <p className="text-[13px] text-[#FF3B30] mt-2">
                {errors.shippingAddress}
              </p>
            )}
          </div>

          {/* 수령인 */}
          <div>
            <label className="block text-[15px] font-semibold text-[#1d1d1f] mb-2">
              수령인 <span className="text-[#FF3B30]">*</span>
            </label>
            <input
              type="text"
              value={orderInfo.recipientName}
              onChange={(e) => handleChange("recipientName", e.target.value)}
              placeholder="홍길동"
              maxLength={30}
              className={`w-full px-4 py-3 border rounded-lg text-[15px] font-normal transition-colors focus:outline-none focus:ring-2 focus:ring-[#00A39B] focus:border-transparent ${
                errors.recipientName
                  ? "border-[#FF3B30]"
                  : "border-[#e5e5e7] hover:border-[#d5d5d7]"
              }`}
            />
            {errors.recipientName && (
              <p className="text-[13px] text-[#FF3B30] mt-2">
                {errors.recipientName}
              </p>
            )}
          </div>

          {/* 수령인 연락처 */}
          <div>
            <label className="block text-[15px] font-semibold text-[#1d1d1f] mb-2">
              수령인 연락처 <span className="text-[#FF3B30]">*</span>
            </label>
            <input
              type="tel"
              value={orderInfo.recipientPhone}
              onChange={(e) => handleChange("recipientPhone", e.target.value)}
              placeholder="010-1234-5678"
              className={`w-full px-4 py-3 border rounded-lg text-[15px] font-normal transition-colors focus:outline-none focus:ring-2 focus:ring-[#00A39B] focus:border-transparent ${
                errors.recipientPhone
                  ? "border-[#FF3B30]"
                  : "border-[#e5e5e7] hover:border-[#d5d5d7]"
              }`}
            />
            {errors.recipientPhone && (
              <p className="text-[13px] text-[#FF3B30] mt-2">
                {errors.recipientPhone}
              </p>
            )}
          </div>

          {/* 배송 방법 */}
          <div>
            <label className="block text-[15px] font-semibold text-[#1d1d1f] mb-3">
              배송 방법
            </label>
            <div className="space-y-3">
              {[
                { value: "delivery", label: "택배 배송" },
                { value: "pickup", label: "직접 수령" },
              ].map((option) => (
                <label
                  key={option.value}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="shippingMethod"
                    value={option.value}
                    checked={orderInfo.shippingMethod === option.value}
                    onChange={(e) =>
                      handleChange(
                        "shippingMethod",
                        e.target.value as "delivery" | "pickup"
                      )
                    }
                    className="w-5 h-5 cursor-pointer"
                  />
                  <span className="text-[15px] text-[#1d1d1f]">
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* 납기일 */}
          <div>
            <label className="block text-[15px] font-semibold text-[#1d1d1f] mb-2">
              납기일 (선택)
            </label>
            <input
              type="date"
              value={orderInfo.deadline}
              onChange={(e) => handleChange("deadline", e.target.value)}
              className="w-full px-4 py-3 border border-[#e5e5e7] rounded-lg text-[15px] font-normal transition-colors focus:outline-none focus:ring-2 focus:ring-[#00A39B] focus:border-transparent hover:border-[#d5d5d7]"
            />
            <p className="text-[13px] text-[#86868b] mt-2">
              기본값: 접수 후 5~7일
            </p>
          </div>

          {/* 특수 요청사항 */}
          <div>
            <label className="block text-[15px] font-semibold text-[#1d1d1f] mb-2">
              특수 요청사항 (선택)
            </label>
            <textarea
              value={orderInfo.specialRequests}
              onChange={(e) => handleChange("specialRequests", e.target.value)}
              placeholder="추가 디자인 요청이나 특별한 사항을 입력해주세요"
              maxLength={500}
              className="w-full px-4 py-3 border border-[#e5e5e7] rounded-lg text-[15px] font-normal transition-colors focus:outline-none focus:ring-2 focus:ring-[#00A39B] focus:border-transparent resize-none h-24 hover:border-[#d5d5d7]"
            />
            <p className="text-[13px] text-[#86868b] mt-2">
              {(orderInfo.specialRequests || "").length}/500
            </p>
          </div>
        </div>

        {/* 버튼 */}
        <div className="flex gap-3 sticky bottom-0 bg-white pt-4 border-t border-[#e5e5e7]">
          <button
            onClick={onBack}
            className="flex-1 py-3 px-6 bg-white border border-[#1d1d1f]/15 text-[#1d1d1f] text-[15px] font-semibold rounded-full hover:bg-[#f5f5f7] transition-colors"
          >
            뒤로
          </button>
          <button
            onClick={handleNext}
            className="flex-1 py-3 px-6 bg-[#00A39B] text-white text-[15px] font-semibold rounded-full hover:bg-[#0055AA] transition-colors"
          >
            다음
          </button>
        </div>
      </div>
    </div>
  );
}
