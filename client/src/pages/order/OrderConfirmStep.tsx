/**
 * 최종 확인 및 제출 페이지
 * - 입력 내용 최종 확인
 * - 사업자 정보 확인/입력 팝업
 * - 제작의뢰 접수
 */

import { useState, useEffect } from "react";
import { ChevronLeft, CheckCircle2, Building2, X, Pencil, AlertCircle } from "lucide-react";
import { StandardTemplate, PersonalInfoRow } from "@/types/order";
import { OrderInfo } from "./OrderInfoStep";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { getSavedCenter } from "@/lib/centerStorage";

interface OrderConfirmStepProps {
  template: StandardTemplate;
  designOption: string;
  personalData: PersonalInfoRow | PersonalInfoRow[];
  orderInfo: OrderInfo;
  onBack: () => void;
  onSubmit: () => void;
}

interface BizInfoForm {
  bizNo: string;
  representative: string;
  bizAddress: string;
  bizType: string;
  bizItem: string;
  taxEmail: string;
}

export default function OrderConfirmStep({
  template,
  designOption,
  personalData,
  orderInfo,
  onBack,
  onSubmit,
}: OrderConfirmStepProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showBizModal, setShowBizModal] = useState(false);
  const [bizFormMode, setBizFormMode] = useState<"confirm" | "input">("confirm");
  const [bizForm, setBizForm] = useState<BizInfoForm>({
    bizNo: "",
    representative: "",
    bizAddress: "",
    bizType: "",
    bizItem: "",
    taxEmail: "",
  });
  const [bizFormErrors, setBizFormErrors] = useState<Partial<BizInfoForm>>({});
  const [selectedBizId, setSelectedBizId] = useState<number | null>(null);

  const isArray = Array.isArray(personalData);
  const personCount = isArray ? personalData.length : 1;

  // localStorage에서 centerCode 읽기
  const savedCenter = getSavedCenter();
  const centerCode = savedCenter?.centerCode ?? "";
  const centerName = savedCenter?.centerName ?? "";

  // 해당 보건소의 사업자 정보 목록 조회
  const { data: bizInfoList, refetch: refetchBizInfo } = trpc.businessInfo.listByCenterCode.useQuery(
    { centerCode },
    { enabled: !!centerCode }
  );

  // 사업자 정보 등록 뮤테이션
  const createBizInfo = trpc.businessInfo.create.useMutation({
    onSuccess: () => {
      toast.success("사업자 정보가 저장되었습니다.");
      refetchBizInfo();
    },
    onError: (err) => {
      toast.error("사업자 정보 저장에 실패했습니다: " + err.message);
    },
  });

  // 기본 사업자 정보 자동 선택
  useEffect(() => {
    if (bizInfoList && bizInfoList.length > 0) {
      const defaultBiz = bizInfoList.find((b) => b.isDefault === 1) ?? bizInfoList[0];
      setSelectedBizId(defaultBiz.id);
    }
  }, [bizInfoList]);

  // 사업자 정보 폼 유효성 검사
  const validateBizForm = () => {
    const errors: Partial<BizInfoForm> = {};
    if (!bizForm.bizNo.trim()) errors.bizNo = "사업자등록번호는 필수입니다.";
    else if (!/^\d{3}-\d{2}-\d{5}$/.test(bizForm.bizNo.trim())) errors.bizNo = "형식: 000-00-00000";
    if (!bizForm.representative.trim()) errors.representative = "대표자명은 필수입니다.";
    if (!bizForm.bizAddress.trim()) errors.bizAddress = "사업장 주소는 필수입니다.";
    setBizFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // 사업자번호 자동 하이픈 포맷
  const formatBizNo = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 10);
    if (digits.length <= 3) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
  };

  // 제작의뢰 접수 버튼 클릭 → 사업자 정보 팝업 표시
  const handleSubmitClick = () => {
    if (!centerCode) {
      // centerCode 없으면 바로 제출
      doSubmit();
      return;
    }
    if (bizInfoList && bizInfoList.length > 0) {
      setBizFormMode("confirm");
    } else {
      setBizFormMode("input");
    }
    setShowBizModal(true);
  };

  // 실제 제출
  const doSubmit = async () => {
    setIsSubmitting(true);
    setShowBizModal(false);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("제작의뢰가 접수되었습니다!");
      onSubmit();
    } catch {
      toast.error("제작의뢰 접수에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 사업자 정보 확인 후 제출
  const handleBizConfirm = async () => {
    if (bizFormMode === "input") {
      if (!validateBizForm()) return;
      await createBizInfo.mutateAsync({
        centerCode,
        centerName,
        bizNo: bizForm.bizNo,
        representative: bizForm.representative,
        bizAddress: bizForm.bizAddress,
        bizType: bizForm.bizType,
        bizItem: bizForm.bizItem,
        taxEmail: bizForm.taxEmail,
        isDefault: 1,
      });
    }
    await doSubmit();
  };

  const selectedBiz = bizInfoList?.find((b) => b.id === selectedBizId) ?? bizInfoList?.[0];

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
          <h1 className="text-[18px] font-bold text-[#1d1d1f]">최종 확인</h1>
          <div className="w-16" />
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="max-w-[800px] mx-auto px-5 md:px-8 py-12">
        <div className="mb-12">
          <h2 className="text-[24px] font-bold text-[#1d1d1f] mb-2">
            제작의뢰 최종 확인
          </h2>
          <p className="text-[15px] text-[#86868b]">
            입력하신 내용을 확인 후 제작의뢰를 접수해주세요
          </p>
        </div>

        {/* 제품 정보 */}
        <div className="mb-8 p-6 bg-[#f5f5f7] rounded-2xl">
          <h3 className="text-[17px] font-bold text-[#1d1d1f] mb-4">
            제품 정보
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-[15px] text-[#86868b]">제품명</span>
              <span className="text-[15px] font-semibold text-[#1d1d1f]">
                {template.name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[15px] text-[#86868b]">디자인</span>
              <span className="text-[15px] font-semibold text-[#1d1d1f]">
                {designOption === "standard" ? "표준 디자인" : "기존 명함 동일"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[15px] text-[#86868b]">인원</span>
              <span className="text-[15px] font-semibold text-[#1d1d1f]">
                {personCount}명
              </span>
            </div>
          </div>
        </div>

        {/* 개인 정보 미리보기 */}
        <div className="mb-8 p-6 bg-white border border-[#e5e5e7] rounded-2xl">
          <h3 className="text-[17px] font-bold text-[#1d1d1f] mb-4">
            개인 정보
          </h3>
          <div className="space-y-4">
            {isArray ? (
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {personalData.map((person, index) => (
                  <div
                    key={person.id || index}
                    className="p-3 bg-[#f5f5f7] rounded-lg text-[13px]"
                  >
                    <div className="font-semibold text-[#1d1d1f] mb-2">
                      {index + 1}. {person.name || "-"}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[#86868b]">
                      {template.fields
                        .filter((f) => f.key !== "name")
                        .map((field) => (
                          <div key={field.key}>
                            <span className="text-[#1d1d1f]">{field.label}:</span>{" "}
                            {person[field.key] || "-"}
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 bg-[#f5f5f7] rounded-lg text-[13px]">
                <div className="space-y-2">
                  {template.fields.map((field) => (
                    <div key={field.key} className="flex justify-between">
                      <span className="text-[#86868b]">{field.label}:</span>
                      <span className="text-[#1d1d1f] font-semibold">
                        {personalData[field.key] || "-"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 주문 정보 */}
        <div className="mb-8 p-6 bg-[#f5f5f7] rounded-2xl">
          <h3 className="text-[17px] font-bold text-[#1d1d1f] mb-4">
            주문 정보
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-[15px] text-[#86868b]">수량</span>
              <span className="text-[15px] font-semibold text-[#1d1d1f]">
                {orderInfo.quantity}
                {template.productType === "namecard" ? "장" : "개"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[15px] text-[#86868b]">배송 방법</span>
              <span className="text-[15px] font-semibold text-[#1d1d1f]">
                {orderInfo.shippingMethod === "delivery"
                  ? "택배 배송"
                  : "직접 수령"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[15px] text-[#86868b]">수령인</span>
              <span className="text-[15px] font-semibold text-[#1d1d1f]">
                {orderInfo.recipientName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[15px] text-[#86868b]">연락처</span>
              <span className="text-[15px] font-semibold text-[#1d1d1f]">
                {orderInfo.recipientPhone}
              </span>
            </div>
            <div className="pt-3 border-t border-[#e5e5e7]">
              <p className="text-[13px] text-[#86868b] mb-2">발송지</p>
              <p className="text-[14px] text-[#1d1d1f] whitespace-pre-wrap">
                {orderInfo.shippingAddress}
              </p>
            </div>
            {orderInfo.deadline && (
              <div className="pt-3 border-t border-[#e5e5e7]">
                <span className="text-[15px] text-[#86868b]">납기일: </span>
                <span className="text-[15px] font-semibold text-[#1d1d1f]">
                  {new Date(orderInfo.deadline).toLocaleDateString("ko-KR")}
                </span>
              </div>
            )}
            {orderInfo.specialRequests && (
              <div className="pt-3 border-t border-[#e5e5e7]">
                <p className="text-[13px] text-[#86868b] mb-2">특수 요청사항</p>
                <p className="text-[14px] text-[#1d1d1f] whitespace-pre-wrap">
                  {orderInfo.specialRequests}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 안내 메시지 */}
        <div className="mb-12 p-4 bg-[#EBF4FF] border border-[#00A39B]/20 rounded-lg flex gap-3">
          <CheckCircle2 className="w-5 h-5 text-[#00A39B] flex-shrink-0 mt-0.5" />
          <div className="text-[13px] text-[#1d1d1f]">
            <p className="font-semibold mb-1">제작의뢰 접수 후 안내</p>
            <p className="text-[#86868b]">
              접수 후 영업일 기준 1~2일 내 담당자가 견적서와 함께 연락드립니다.
              최종 금액은 담당자 확인 후 안내드립니다.
            </p>
          </div>
        </div>

        {/* 버튼 */}
        <div className="flex gap-3 sticky bottom-0 bg-white pt-4 border-t border-[#e5e5e7]">
          <button
            onClick={onBack}
            disabled={isSubmitting}
            className="flex-1 py-3 px-6 bg-white border border-[#1d1d1f]/15 text-[#1d1d1f] text-[15px] font-semibold rounded-full hover:bg-[#f5f5f7] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            수정
          </button>
          <button
            onClick={handleSubmitClick}
            disabled={isSubmitting}
            className="flex-1 py-3 px-6 bg-[#00A39B] text-white text-[15px] font-semibold rounded-full hover:bg-[#0055AA] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "접수 중..." : "제작의뢰 접수"}
          </button>
        </div>
      </div>

      {/* 사업자 정보 확인/입력 모달 */}
      {showBizModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[480px] max-h-[90vh] overflow-y-auto">
            {/* 모달 헤더 */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#f0f0f0]">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#00A39B]" />
                <h2 className="text-[17px] font-bold text-[#1d1d1f]">사업자 정보 확인</h2>
              </div>
              <button
                onClick={() => setShowBizModal(false)}
                className="p-1.5 rounded-full hover:bg-[#f5f5f7] transition-colors"
              >
                <X className="w-4 h-4 text-[#86868b]" />
              </button>
            </div>

            <div className="px-6 py-5">
              {bizFormMode === "confirm" && bizInfoList && bizInfoList.length > 0 ? (
                <>
                  <p className="text-[14px] text-[#515154] mb-4">
                    등록된 사업자 정보를 확인하고 제작의뢰를 접수하세요.
                  </p>

                  {/* 사업자 정보 목록 */}
                  <div className="space-y-3 mb-5">
                    {bizInfoList.map((biz) => (
                      <button
                        key={biz.id}
                        onClick={() => setSelectedBizId(biz.id)}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                          selectedBizId === biz.id
                            ? "border-[#00A39B] bg-[#f0faf9]"
                            : "border-[#e5e5e7] hover:border-[#00A39B]/40"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[14px] font-bold text-[#1d1d1f]">
                            {biz.bizNo}
                          </span>
                          {biz.isDefault === 1 && (
                            <span className="text-[11px] font-semibold text-[#00A39B] bg-[#00A39B]/10 px-2 py-0.5 rounded-full">
                              기본
                            </span>
                          )}
                        </div>
                        <div className="space-y-1">
                          {biz.representative && (
                            <p className="text-[13px] text-[#515154]">대표자: {biz.representative}</p>
                          )}
                          {biz.bizAddress && (
                            <p className="text-[13px] text-[#515154] truncate">{biz.bizAddress}</p>
                          )}
                          {biz.taxEmail && (
                            <p className="text-[13px] text-[#86868b]">세금계산서: {biz.taxEmail}</p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* 새 사업자 정보 입력 링크 */}
                  <button
                    onClick={() => setBizFormMode("input")}
                    className="flex items-center gap-1.5 text-[13px] text-[#00A39B] hover:text-[#0055AA] mb-5"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    다른 사업자 정보 입력
                  </button>
                </>
              ) : (
                <>
                  <p className="text-[14px] text-[#515154] mb-1">
                    등록된 사업자 정보가 없습니다.
                  </p>
                  <p className="text-[13px] text-[#86868b] mb-5">
                    사업자등록증 정보를 입력하시면 다음 주문부터는 자동으로 불러옵니다.
                  </p>

                  {/* 사업자 정보 입력 폼 */}
                  <div className="space-y-4">
                    {/* 사업자등록번호 */}
                    <div>
                      <label className="block text-[13px] font-semibold text-[#1d1d1f] mb-1.5">
                        사업자등록번호 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="000-00-00000"
                        value={bizForm.bizNo}
                        onChange={(e) =>
                          setBizForm((f) => ({ ...f, bizNo: formatBizNo(e.target.value) }))
                        }
                        className={`w-full px-4 py-2.5 rounded-xl border text-[14px] outline-none transition-colors ${
                          bizFormErrors.bizNo
                            ? "border-red-400 bg-red-50"
                            : "border-[#d2d2d7] focus:border-[#00A39B]"
                        }`}
                      />
                      {bizFormErrors.bizNo && (
                        <p className="mt-1 text-[12px] text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          {bizFormErrors.bizNo}
                        </p>
                      )}
                    </div>

                    {/* 대표자명 */}
                    <div>
                      <label className="block text-[13px] font-semibold text-[#1d1d1f] mb-1.5">
                        대표자명 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="대표자명 입력"
                        value={bizForm.representative}
                        onChange={(e) =>
                          setBizForm((f) => ({ ...f, representative: e.target.value }))
                        }
                        className={`w-full px-4 py-2.5 rounded-xl border text-[14px] outline-none transition-colors ${
                          bizFormErrors.representative
                            ? "border-red-400 bg-red-50"
                            : "border-[#d2d2d7] focus:border-[#00A39B]"
                        }`}
                      />
                      {bizFormErrors.representative && (
                        <p className="mt-1 text-[12px] text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          {bizFormErrors.representative}
                        </p>
                      )}
                    </div>

                    {/* 사업장 주소 */}
                    <div>
                      <label className="block text-[13px] font-semibold text-[#1d1d1f] mb-1.5">
                        사업장 주소 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="사업장 주소 입력"
                        value={bizForm.bizAddress}
                        onChange={(e) =>
                          setBizForm((f) => ({ ...f, bizAddress: e.target.value }))
                        }
                        className={`w-full px-4 py-2.5 rounded-xl border text-[14px] outline-none transition-colors ${
                          bizFormErrors.bizAddress
                            ? "border-red-400 bg-red-50"
                            : "border-[#d2d2d7] focus:border-[#00A39B]"
                        }`}
                      />
                      {bizFormErrors.bizAddress && (
                        <p className="mt-1 text-[12px] text-red-500 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          {bizFormErrors.bizAddress}
                        </p>
                      )}
                    </div>

                    {/* 업태 / 종목 */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[13px] font-semibold text-[#1d1d1f] mb-1.5">
                          업태
                        </label>
                        <input
                          type="text"
                          placeholder="예: 보건업"
                          value={bizForm.bizType}
                          onChange={(e) =>
                            setBizForm((f) => ({ ...f, bizType: e.target.value }))
                          }
                          className="w-full px-4 py-2.5 rounded-xl border border-[#d2d2d7] text-[14px] outline-none focus:border-[#00A39B] transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-[13px] font-semibold text-[#1d1d1f] mb-1.5">
                          종목
                        </label>
                        <input
                          type="text"
                          placeholder="예: 보건소"
                          value={bizForm.bizItem}
                          onChange={(e) =>
                            setBizForm((f) => ({ ...f, bizItem: e.target.value }))
                          }
                          className="w-full px-4 py-2.5 rounded-xl border border-[#d2d2d7] text-[14px] outline-none focus:border-[#00A39B] transition-colors"
                        />
                      </div>
                    </div>

                    {/* 세금계산서 수신 이메일 */}
                    <div>
                      <label className="block text-[13px] font-semibold text-[#1d1d1f] mb-1.5">
                        세금계산서 수신 이메일
                      </label>
                      <input
                        type="email"
                        placeholder="세금계산서 수신 이메일 (선택)"
                        value={bizForm.taxEmail}
                        onChange={(e) =>
                          setBizForm((f) => ({ ...f, taxEmail: e.target.value }))
                        }
                        className="w-full px-4 py-2.5 rounded-xl border border-[#d2d2d7] text-[14px] outline-none focus:border-[#00A39B] transition-colors"
                      />
                    </div>
                  </div>

                  {/* 기존 정보로 돌아가기 (목록이 있을 때만) */}
                  {bizInfoList && bizInfoList.length > 0 && (
                    <button
                      onClick={() => setBizFormMode("confirm")}
                      className="flex items-center gap-1.5 text-[13px] text-[#00A39B] hover:text-[#0055AA] mt-4"
                    >
                      ← 등록된 사업자 정보로 돌아가기
                    </button>
                  )}
                </>
              )}

              {/* 모달 버튼 */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowBizModal(false)}
                  className="flex-1 py-3 px-4 bg-white border border-[#1d1d1f]/15 text-[#1d1d1f] text-[14px] font-semibold rounded-full hover:bg-[#f5f5f7] transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleBizConfirm}
                  disabled={createBizInfo.isPending || isSubmitting}
                  className="flex-1 py-3 px-4 bg-[#00A39B] text-white text-[14px] font-semibold rounded-full hover:bg-[#0055AA] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createBizInfo.isPending ? "저장 중..." : "확인 후 접수"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
