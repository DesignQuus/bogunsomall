/**
 * 디자인 옵션 선택 페이지
 * - 표준 vs 기존 명함 동일 디자인 선택
 * - 기존 디자인 이미지 업로드
 */

import { useState } from "react";
import { useLocation } from "wouter";
import { ChevronLeft, Upload, X } from "lucide-react";
import { StandardTemplate, DesignOptionType } from "@/types/order";

interface DesignOptionStepProps {
  template: StandardTemplate;
  onNext: (designOption: DesignOptionType, customImageUrl?: string) => void;
  onBack: () => void;
}

export default function DesignOptionStep({
  template,
  onNext,
  onBack,
}: DesignOptionStepProps) {
  const [selectedOption, setSelectedOption] = useState<DesignOptionType>("standard");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setUploadedImage(result);
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleNext = () => {
    if (selectedOption === "custom" && !uploadedImage) {
      alert("기존 명함 이미지를 업로드해주세요.");
      return;
    }
    onNext(selectedOption, uploadedImage || undefined);
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
          <h1 className="text-[18px] font-bold text-[#1d1d1f]">디자인 선택</h1>
          <div className="w-16" />
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="max-w-[1200px] mx-auto px-5 md:px-8 py-12">
        {/* 선택한 템플릿 정보 */}
        <div className="mb-12">
          <h2 className="text-[24px] font-bold text-[#1d1d1f] mb-4">
            {template.name}
          </h2>
          <p className="text-[15px] text-[#86868b] mb-6">
            {template.description}
          </p>
          <div className="rounded-2xl overflow-hidden bg-[#f5f5f7] h-[300px]">
            <img
              src={template.preview}
              alt={template.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* 디자인 옵션 선택 */}
        <div className="mb-12">
          <h3 className="text-[20px] font-bold text-[#1d1d1f] mb-6">
            디자인 옵션을 선택하세요
          </h3>

          <div className="grid md:grid-cols-2 gap-6">
            {template.designOptions.map((option) => (
              <div
                key={option.id}
                onClick={() => {
                  setSelectedOption(option.type);
                  if (option.type === "standard") {
                    setUploadedImage(null);
                  }
                }}
                className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                  selectedOption === option.type
                    ? "border-[#00A39B] bg-[#EBF4FF]"
                    : "border-[#e5e5e7] bg-white hover:border-[#00A39B]/50"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 ${
                      selectedOption === option.type
                        ? "border-[#00A39B] bg-[#00A39B]"
                        : "border-[#d5d5d7]"
                    }`}
                  >
                    {selectedOption === option.type && (
                      <div className="w-2 h-2 bg-white rounded-full" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-[16px] font-semibold text-[#1d1d1f] mb-2">
                      {option.label}
                    </h4>
                    <p className="text-[14px] text-[#86868b]">
                      {option.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 기존 디자인 업로드 (custom 선택 시) */}
        {selectedOption === "custom" && (
          <div className="mb-12 p-6 bg-[#f5f5f7] rounded-2xl">
            <h4 className="text-[18px] font-bold text-[#1d1d1f] mb-4">
              기존 명함 이미지 업로드
            </h4>

            {!uploadedImage ? (
              <label className="block">
                <div className="border-2 border-dashed border-[#00A39B] rounded-xl p-8 text-center cursor-pointer hover:bg-[#EBF4FF] transition-colors">
                  <Upload className="w-8 h-8 text-[#00A39B] mx-auto mb-3" />
                  <p className="text-[15px] font-semibold text-[#1d1d1f] mb-2">
                    이미지를 드래그하거나 클릭하여 업로드
                  </p>
                  <p className="text-[13px] text-[#86868b]">
                    JPG, PNG 형식 (최대 10MB)
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="relative">
                <div className="rounded-xl overflow-hidden bg-white h-[300px] mb-4">
                  <img
                    src={uploadedImage}
                    alt="업로드된 이미지"
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={() => setUploadedImage(null)}
                  className="flex items-center gap-2 text-[#00A39B] hover:text-[#0055AA] transition-colors text-[14px] font-semibold"
                >
                  <X className="w-4 h-4" />
                  다른 이미지 업로드
                </button>
              </div>
            )}
          </div>
        )}

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
            disabled={selectedOption === "custom" && !uploadedImage}
            className="flex-1 py-3 px-6 bg-[#00A39B] text-white text-[15px] font-semibold rounded-full hover:bg-[#0055AA] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            다음
          </button>
        </div>
      </div>
    </div>
  );
}
