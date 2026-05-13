"use client";

/**
 * 통합 주문 페이지
 * - 모든 단계를 하나의 페이지에서 관리
 * - 상태 관리 및 네비게이션
 */

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { getTemplateById, getTemplatesByProduct } from "@/data/templates";
import { StandardTemplate, PersonalInfoRow } from "@/types/order";
import { OrderInfo } from "./OrderInfoStep";
import DesignOptionStep from "./DesignOptionStep";
import SinglePersonForm from "./SinglePersonForm";
import BulkPersonForm from "./BulkPersonForm";
import OrderInfoStep from "./OrderInfoStep";
import OrderConfirmStep from "./OrderConfirmStep";

type OrderStep =
  | "template-select"
  | "design-option"
  | "person-count"
  | "person-form"
  | "order-info"
  | "confirm"
  | "complete";

export default function OrderPage({ params: propsParams }: any) {
  const router = useRouter();
  const params = useParams();
  const productType = (propsParams?.productType || params?.productType || "namecard") as string;
  const [step, setStep] = useState<OrderStep>("template-select");
  const [selectedTemplate, setSelectedTemplate] = useState<StandardTemplate | null>(null);
  const [designOption, setDesignOption] = useState<string>("standard");
  const [customImageUrl, setCustomImageUrl] = useState<string>();
  const [personCount, setPersonCount] = useState<"single" | "bulk">("single");
  const [personalData, setPersonalData] = useState<PersonalInfoRow | PersonalInfoRow[] | null>(null);
  const [orderInfo, setOrderInfo] = useState<OrderInfo | null>(null);

  const templates = getTemplatesByProduct(productType);

  // 템플릿 선택
  const handleSelectTemplate = (template: StandardTemplate) => {
    setSelectedTemplate(template);
    setStep("design-option");
  };

  // 디자인 옵션 선택
  const handleDesignOption = (option: string, customImage?: string) => {
    setDesignOption(option);
    setCustomImageUrl(customImage);
    setStep("person-count");
  };

  // 인원 수 선택
  const handlePersonCount = (count: "single" | "bulk") => {
    setPersonCount(count);
    setStep("person-form");
  };

  // 개인 정보 입력 완료
  const handlePersonalData = (data: PersonalInfoRow | PersonalInfoRow[]) => {
    setPersonalData(data);
    setStep("order-info");
  };

  // 주문 정보 입력 완료
  const handleOrderInfo = (info: OrderInfo) => {
    setOrderInfo(info);
    setStep("confirm");
  };

  // 제작의뢰 접수 완료
  const handleSubmit = () => {
    setStep("complete");
  };

  // 뒤로가기
  const handleBack = () => {
    const stepSequence: OrderStep[] = [
      "template-select",
      "design-option",
      "person-count",
      "person-form",
      "order-info",
      "confirm",
    ];
    const currentIndex = stepSequence.indexOf(step);
    if (currentIndex > 0) {
      setStep(stepSequence[currentIndex - 1]);
    }
  };

  // 완료 페이지
  if (step === "complete") {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-5">
        <div className="max-w-[600px] text-center">
          <div className="w-20 h-20 bg-[#34C759] rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-[32px] font-bold text-[#1d1d1f] mb-3">
            제작의뢰가 접수되었습니다
          </h1>
          <p className="text-[17px] text-[#86868b] mb-8">
            영업일 기준 1~2일 내 담당자가 연락드립니다.
            <br />
            감사합니다!
          </p>
          <button
            onClick={() => router.push("/")}
            className="px-8 py-3 bg-[#00A39B] text-white text-[15px] font-semibold rounded-full hover:bg-[#0055AA] transition-colors"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  // 템플릿 선택 페이지
  if (step === "template-select") {
    return (
      <div className="min-h-screen bg-white">
        {/* 헤더 */}
        <div className="sticky top-0 bg-white border-b border-[#e5e5e7] z-10">
          <div className="max-w-[1200px] mx-auto px-5 md:px-8 py-4 flex items-center justify-between">
            <button
              onClick={() => router.push("/")}
              className="text-[#00A39B] hover:text-[#0055AA] transition-colors text-[14px] font-semibold"
            >
              ← 뒤로
            </button>
            <h1 className="text-[18px] font-bold text-[#1d1d1f]">
              템플릿 선택
            </h1>
            <div className="w-16" />
          </div>
        </div>

        {/* 메인 콘텐츠 */}
        <div className="max-w-[1200px] mx-auto px-5 md:px-8 py-12">
          <div className="mb-12">
            <h2 className="text-[24px] font-bold text-[#1d1d1f] mb-2">
              표준 템플릿을 선택하세요
            </h2>
            <p className="text-[15px] text-[#86868b]">
              제공되는 표준 템플릿 중 원하는 디자인을 선택해주세요
            </p>
          </div>

          {/* 템플릿 그리드 */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => handleSelectTemplate(template)}
                className="text-left group"
              >
                <div className="rounded-2xl overflow-hidden bg-[#f5f5f7] h-[250px] mb-4 group-hover:shadow-lg transition-shadow">
                  <img
                    src={template.preview}
                    alt={template.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h3 className="text-[17px] font-bold text-[#1d1d1f] mb-2 group-hover:text-[#00A39B] transition-colors">
                  {template.name}
                </h3>
                <p className="text-[13px] text-[#86868b]">
                  {template.description}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 디자인 옵션 선택
  if (step === "design-option" && selectedTemplate) {
    return (
      <DesignOptionStep
        template={selectedTemplate}
        onNext={handleDesignOption}
        onBack={handleBack}
      />
    );
  }

  // 인원 수 선택
  if (step === "person-count") {
    return (
      <div className="min-h-screen bg-white">
        {/* 헤더 */}
        <div className="sticky top-0 bg-white border-b border-[#e5e5e7] z-10">
          <div className="max-w-[1200px] mx-auto px-5 md:px-8 py-4 flex items-center justify-between">
            <button
              onClick={handleBack}
              className="text-[#00A39B] hover:text-[#0055AA] transition-colors text-[14px] font-semibold"
            >
              ← 뒤로
            </button>
            <h1 className="text-[18px] font-bold text-[#1d1d1f]">
              입력 방식 선택
            </h1>
            <div className="w-16" />
          </div>
        </div>

        {/* 메인 콘텐츠 */}
        <div className="max-w-[1200px] mx-auto px-5 md:px-8 py-12">
          <div className="mb-12">
            <h2 className="text-[24px] font-bold text-[#1d1d1f] mb-2">
              입력 방식을 선택하세요
            </h2>
            <p className="text-[15px] text-[#86868b]">
              {selectedTemplate?.name}에 대해 몇 명의 정보를 입력하시겠어요?
            </p>
          </div>

          {/* 선택 버튼 */}
          <div className="grid md:grid-cols-2 gap-6 max-w-[800px]">
            <button
              onClick={() => handlePersonCount("single")}
              className="p-8 border-2 border-[#e5e5e7] rounded-2xl hover:border-[#00A39B] hover:bg-[#EBF4FF] transition-all text-left"
            >
              <div className="text-[32px] font-bold text-[#00A39B] mb-3">1명</div>
              <h3 className="text-[17px] font-bold text-[#1d1d1f] mb-2">
                단순 입력
              </h3>
              <p className="text-[13px] text-[#86868b]">
                1명의 정보를 간단한 폼으로 입력합니다
              </p>
            </button>

            <button
              onClick={() => handlePersonCount("bulk")}
              className="p-8 border-2 border-[#e5e5e7] rounded-2xl hover:border-[#00A39B] hover:bg-[#EBF4FF] transition-all text-left"
            >
              <div className="text-[32px] font-bold text-[#00A39B] mb-3">2명+</div>
              <h3 className="text-[17px] font-bold text-[#1d1d1f] mb-2">
                대량 입력
              </h3>
              <p className="text-[13px] text-[#86868b]">
                엑셀 업로드 또는 테이블로 여러 명의 정보를 입력합니다
              </p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 개인 정보 입력
  if (step === "person-form" && selectedTemplate) {
    if (personCount === "single") {
      return (
        <SinglePersonForm
          template={selectedTemplate}
          onNext={handlePersonalData}
          onBack={handleBack}
        />
      );
    } else {
      return (
        <BulkPersonForm
          template={selectedTemplate}
          onNext={handlePersonalData}
          onBack={handleBack}
        />
      );
    }
  }

  // 주문 정보 입력
  if (step === "order-info" && selectedTemplate && personalData) {
    return (
      <OrderInfoStep
        template={selectedTemplate}
        personalData={personalData}
        onNext={handleOrderInfo}
        onBack={handleBack}
      />
    );
  }

  // 최종 확인
  if (
    step === "confirm" &&
    selectedTemplate &&
    personalData &&
    orderInfo
  ) {
    return (
      <OrderConfirmStep
        template={selectedTemplate}
        designOption={designOption}
        personalData={personalData}
        orderInfo={orderInfo}
        onBack={handleBack}
        onSubmit={handleSubmit}
      />
    );
  }

  return null;
}
