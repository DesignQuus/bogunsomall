/**
 * 1명 입력 폼 페이지
 * - 단순 폼으로 1명의 정보 입력
 */

import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { StandardTemplate, PersonalInfoRow, TemplateField } from "@/types/order";
import { toast } from "sonner";

interface SinglePersonFormProps {
  template: StandardTemplate;
  onNext: (data: PersonalInfoRow) => void;
  onBack: () => void;
}

export default function SinglePersonForm({
  template,
  onNext,
  onBack,
}: SinglePersonFormProps) {
  const [formData, setFormData] = useState<PersonalInfoRow>(
    template.fields.reduce((acc, field) => {
      acc[field.key] = "";
      return acc;
    }, {} as PersonalInfoRow)
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    key: string,
    value: string
  ) => {
    setFormData((prev) => ({
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

    template.fields.forEach((field) => {
      const value = formData[field.key];

      if (field.required && !value) {
        newErrors[field.key] = `${field.label}은(는) 필수 입력 항목입니다.`;
      }

      if (value && field.type === "email") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          newErrors[field.key] = "유효한 이메일 주소를 입력해주세요.";
        }
      }

      if (value && field.type === "phone") {
        const phoneRegex = /^[0-9\-]{10,}$/;
        if (!phoneRegex.test(value)) {
          newErrors[field.key] = "유효한 전화번호를 입력해주세요.";
        }
      }

      if (field.maxLength && value && value.length > field.maxLength) {
        newErrors[field.key] = `${field.label}은(는) ${field.maxLength}자 이내여야 합니다.`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      onNext(formData);
    } else {
      toast.error("입력 내용을 확인해주세요.");
    }
  };

  const renderField = (field: TemplateField) => {
    const value = formData[field.key] || "";
    const error = errors[field.key];

    const baseInputClass =
      "w-full px-4 py-3 border rounded-lg text-[15px] font-normal transition-colors focus:outline-none focus:ring-2 focus:ring-[#00A39B] focus:border-transparent";
    const errorInputClass = "border-[#FF3B30]";
    const normalInputClass = "border-[#e5e5e7] hover:border-[#d5d5d7]";

    switch (field.type) {
      case "textarea":
        return (
          <textarea
            key={field.key}
            value={value}
            onChange={(e) => handleChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            maxLength={field.maxLength}
            className={`${baseInputClass} ${error ? errorInputClass : normalInputClass} resize-none h-24`}
          />
        );

      case "select":
        return (
          <select
            key={field.key}
            value={value}
            onChange={(e) => handleChange(field.key, e.target.value)}
            className={`${baseInputClass} ${error ? errorInputClass : normalInputClass}`}
          >
            <option value="">선택해주세요</option>
            {field.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );

      default:
        return (
          <input
            key={field.key}
            type={field.type}
            value={value}
            onChange={(e) => handleChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            maxLength={field.maxLength}
            className={`${baseInputClass} ${error ? errorInputClass : normalInputClass}`}
          />
        );
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
          <h1 className="text-[18px] font-bold text-[#1d1d1f]">정보 입력</h1>
          <div className="w-16" />
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="max-w-[800px] mx-auto px-5 md:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-[24px] font-bold text-[#1d1d1f] mb-2">
            {template.name}
          </h2>
          <p className="text-[15px] text-[#86868b]">
            1명의 정보를 입력해주세요
          </p>
        </div>

        {/* 폼 */}
        <div className="space-y-6 mb-12">
          {template.fields.map((field) => (
            <div key={field.key}>
              <label className="block text-[15px] font-semibold text-[#1d1d1f] mb-2">
                {field.label}
                {field.required && <span className="text-[#FF3B30]"> *</span>}
              </label>
              {renderField(field)}
              {errors[field.key] && (
                <p className="text-[13px] text-[#FF3B30] mt-2">
                  {errors[field.key]}
                </p>
              )}
            </div>
          ))}
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
