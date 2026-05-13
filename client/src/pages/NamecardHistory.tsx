"use client";

/**
 * NamecardHistory.tsx
 * Design: "Clean Canvas" — Apple Store Style
 * 명함 발주이력 페이지
 * - 현재 보건소의 명함 발주 이력 검색
 * - 이름·부서명·주문번호로 빠른 검색
 * - 수정요청 발주 (기존 명함 정보 불러와서 수정 후 발주)
 * - 즉시 재발주 (수정 없이 동일 사양으로 바로 발주)
 */

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  RefreshCw,
  Edit3,
  ChevronRight,
  User,
  Building2,
  Phone,
  Mail,
  Calendar,
  Package,
  CheckCircle2,
  Clock,
  X,
  Zap,
  FileEdit,
  ArrowLeft,
  Bookmark,
  Share2,
  Users,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import { useTemplate } from "@/contexts/TemplateContext";
import { loginState } from "@/pages/Intro";

const NAMECARD_IMAGE =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/namecard-sample_620687ce.png";

const statusMap: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  completed: {
    label: "완료",
    color: "text-green-600 bg-green-50 border-green-100",
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
  in_progress: {
    label: "진행중",
    color: "text-blue-600 bg-blue-50 border-blue-100",
    icon: <Clock className="w-3.5 h-3.5" />,
  },
  pending: {
    label: "대기",
    color: "text-yellow-600 bg-yellow-50 border-yellow-100",
    icon: <Clock className="w-3.5 h-3.5" />,
  },
  cancelled: {
    label: "취소",
    color: "text-red-600 bg-red-50 border-red-100",
    icon: <X className="w-3.5 h-3.5" />,
  },
};

// 즉시 재발주 확인 모달
function ReorderConfirmModal({
  order,
  onConfirm,
  onClose,
}: {
  order: any;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const spec = order.specifications || {};
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="px-6 pt-6 pb-4 border-b border-black/5">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-[#EBF4FF] flex items-center justify-center">
              <Zap className="w-5 h-5 text-[#00A39B]" />
            </div>
            <div>
              <h2 className="text-[17px] font-bold text-[#1d1d1f]">즉시 재발주</h2>
              <p className="text-[12px] text-[#86868b]">동일 사양으로 바로 발주됩니다</p>
            </div>
          </div>
        </div>

        {/* 명함 미리보기 */}
        <div className="px-6 py-4">
          <div className="flex gap-4">
            <img
              src={NAMECARD_IMAGE}
              alt="명함 미리보기"
              className="w-32 h-20 object-cover rounded-xl border border-black/5 shrink-0"
            />
            <div className="flex-1 space-y-1.5">
              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-[#86868b]" />
                <span className="text-[13px] text-[#1d1d1f] font-medium">
                  {spec.name || "—"}
                </span>
                <span className="text-[12px] text-[#86868b]">{spec.position || ""}</span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5 text-[#86868b]" />
                <span className="text-[12px] text-[#424245]">{spec.department || "—"}</span>
              </div>
              {spec.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#86868b]" />
                  <span className="text-[12px] text-[#424245]">{spec.phone}</span>
                </div>
              )}
              {spec.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#86868b]" />
                  <span className="text-[12px] text-[#424245]">{spec.email}</span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 p-3 bg-[#f5f5f7] rounded-xl flex items-center justify-between">
            <div>
              <p className="text-[11px] text-[#86868b]">주문 수량</p>
              <p className="text-[15px] font-bold text-[#1d1d1f]">{order.quantity}부</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-[#86868b]">이전 주문일</p>
              <p className="text-[13px] text-[#424245]">{order.orderDate}</p>
            </div>
          </div>

          {order.modifications && (
            <div className="mt-3 p-3 bg-amber-50 border border-amber-100 rounded-xl">
              <p className="text-[11px] text-amber-700 font-medium mb-0.5">이전 수정 요청사항</p>
              <p className="text-[12px] text-amber-800">{order.modifications}</p>
            </div>
          )}
        </div>

        {/* 버튼 */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 text-[14px] font-medium text-[#424245] bg-[#f5f5f7] rounded-2xl hover:bg-[#e8e8ed] transition-colors"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 text-[14px] font-bold text-white bg-[#00A39B] rounded-2xl hover:bg-[#0055AA] transition-colors flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4" />
            즉시 재발주
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function NamecardHistory() {
  const router = useRouter();
  const { orderHistory } = useTemplate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [showReorderModal, setShowReorderModal] = useState(false);
  const [reorderTarget, setReorderTarget] = useState<any | null>(null);

  // 저장된 디자인 조합
  const deptCode = loginState.deptCode ?? "";
  const centerCode = loginState.centerCode ?? "";
  const [showMyDesignCombos, setShowMyDesignCombos] = useState(false);
  const [showSharedDesignCombos, setShowSharedDesignCombos] = useState(false);

  const { data: myCombos = [] } = trpc.designCombos.list.useQuery(
    { deptCode },
    { enabled: !!deptCode }
  );
  const { data: sharedCombos = [] } = trpc.designCombos.listShared.useQuery(
    { centerCode },
    { enabled: !!centerCode }
  );

  const handleApplyCombo = (combo: { frontType: string; backType?: string | null; doubleSided: boolean }) => {
    const params = new URLSearchParams();
    params.set("front", combo.frontType);
    if (combo.doubleSided && combo.backType) {
      params.set("back", combo.backType);
      params.set("sided", "double");
    }
    router.push(`/order/namecard?${params.toString()}`);
    toast.success("저장된 디자인 조합으로 주문 페이지를 열었습니다.");
  };

  // 명함 타입만 필터링
  const namecardOrders = useMemo(() => {
    return orderHistory.filter((o) => o.productType === "namecard");
  }, [orderHistory]);

  // 검색 필터
  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return namecardOrders;
    return namecardOrders.filter((o) => {
      const spec = o.specifications || {};
      return (
        o.id.toLowerCase().includes(q) ||
        (spec.name || "").toLowerCase().includes(q) ||
        (spec.department || "").toLowerCase().includes(q) ||
        (spec.position || "").toLowerCase().includes(q) ||
        o.productName.toLowerCase().includes(q)
      );
    });
  }, [searchQuery, namecardOrders]);

  // 수정요청 발주 — 기존 주문 정보를 폼에 채워서 이동
  const handleEditOrder = (order: any) => {
    router.push(`/order/namecard?orderId=${order.id}`);
    toast.success("기존 명함 정보를 불러왔습니다. 수정 후 발주하세요.");
  };

  // 즉시 재발주 확인
  const handleReorderClick = (order: any) => {
    setReorderTarget(order);
    setShowReorderModal(true);
  };

  // 즉시 재발주 실행
  const handleReorderConfirm = () => {
    setShowReorderModal(false);
    toast.success(`${reorderTarget?.specifications?.name || ""} 명함 재발주가 접수되었습니다.`, {
      description: "담당자가 확인 후 제작을 시작합니다.",
    });
    setReorderTarget(null);
  };

  return (
    <div className="min-h-screen bg-[#FBFBFD]">
      {/* 페이지 헤더 */}
      <div className="bg-white border-b border-black/5">
        <div className="max-w-[1200px] mx-auto px-5 md:px-8 py-4">
          {/* 브레드크럼 */}
          <nav className="flex items-center gap-1.5 text-[12px] mb-4">
            <Link href="/" className="text-[#86868b] hover:text-[#00A39B] transition-colors">홈</Link>
            <ChevronRight className="w-3 h-3 text-[#d2d2d7]" />
            <Link href="/category/namecard" className="text-[#86868b] hover:text-[#00A39B] transition-colors">명함</Link>
            <ChevronRight className="w-3 h-3 text-[#d2d2d7]" />
            <span className="text-[#1d1d1f] font-medium">명함 발주이력</span>
          </nav>

          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-[24px] font-bold text-[#1d1d1f] tracking-tight">
                명함 발주이력
              </h1>
              <p className="text-[14px] text-[#86868b] mt-1">
                {loginState.center?.name || "보건소"} · 총 {namecardOrders.length}건의 명함 발주 이력
              </p>
            </div>
            <button
              onClick={() => router.push("/order/namecard")}
              className="shrink-0 flex items-center gap-2 px-4 py-2.5 bg-[#00A39B] text-white text-[13px] font-semibold rounded-2xl hover:bg-[#0055AA] transition-colors"
            >
              <Package className="w-4 h-4" />
              새 명함 발주
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-5 md:px-8 py-8">

        {/* 저장된 디자인 조합 섹션 */}
        {(myCombos.length > 0 || sharedCombos.length > 0) && (
          <div className="mb-6 bg-white border border-[#e5e5e7] rounded-2xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-[#f0f0f0] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-[#00A39B]" />
                <span className="text-[13px] font-semibold text-[#1d1d1f]">저장된 디자인 조합으로 재주문</span>
              </div>
              <div className="flex items-center gap-2">
                {myCombos.length > 0 && (
                  <button
                    onClick={() => { setShowMyDesignCombos(v => !v); setShowSharedDesignCombos(false); }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium transition-all ${
                      showMyDesignCombos ? 'bg-[#00A39B] text-white' : 'bg-[#00A39B]/8 text-[#00A39B] hover:bg-[#00A39B]/15'
                    }`}
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    내 조합 ({myCombos.length})
                  </button>
                )}
                {sharedCombos.length > 0 && (
                  <button
                    onClick={() => { setShowSharedDesignCombos(v => !v); setShowMyDesignCombos(false); }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium transition-all ${
                      showSharedDesignCombos ? 'bg-blue-500 text-white' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    보건소 공유 ({sharedCombos.length})
                  </button>
                )}
              </div>
            </div>

            {/* 내 저장 조합 목록 */}
            {showMyDesignCombos && myCombos.length > 0 && (
              <div className="divide-y divide-[#f5f5f7]">
                {myCombos.map((combo) => (
                  <div key={combo.id} className="flex items-center justify-between px-5 py-3 hover:bg-[#fafafa] transition-colors">
                    <div>
                      <p className="text-[13px] font-medium text-[#1d1d1f]">{combo.label}</p>
                      <p className="text-[11px] text-[#86868b] mt-0.5">
                        앞면: {combo.frontType}{combo.doubleSided ? ` · 뒷면: ${combo.backType ?? "-"}` : " (단면)"}
                        {combo.isShared && <span className="ml-2 text-blue-400 inline-flex items-center gap-0.5"><Share2 className="w-3 h-3" /> 공유중</span>}
                      </p>
                    </div>
                    <button
                      onClick={() => handleApplyCombo(combo)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00A39B] text-white text-[12px] font-medium rounded-full hover:bg-[#008f88] transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      이 조합으로 주문
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* 보건소 공유 조합 목록 */}
            {showSharedDesignCombos && sharedCombos.length > 0 && (
              <div className="divide-y divide-blue-50">
                {sharedCombos.map((combo) => (
                  <div key={combo.id} className="flex items-center justify-between px-5 py-3 hover:bg-blue-50/50 transition-colors">
                    <div>
                      <p className="text-[13px] font-medium text-[#1d1d1f]">{combo.label}</p>
                      <p className="text-[11px] text-[#86868b] mt-0.5">
                        앞면: {combo.frontType}{combo.doubleSided ? ` · 뒷면: ${combo.backType ?? "-"}` : " (단면)"}
                        {combo.deptCode && <span className="ml-1.5 text-blue-400">· {combo.deptCode}</span>}
                      </p>
                    </div>
                    <button
                      onClick={() => handleApplyCombo(combo)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 text-white text-[12px] font-medium rounded-full hover:bg-blue-600 transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      이 조합으로 주문
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 검색 바 */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#86868b]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="이름, 부서명, 주문번호로 검색 (예: 김민준, 건강증진과)"
            className="w-full pl-11 pr-10 py-3.5 bg-white border border-black/10 rounded-2xl text-[14px] text-[#1d1d1f] placeholder-[#86868b] focus:outline-none focus:ring-2 focus:ring-[#00A39B]/30 focus:border-[#00A39B] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#86868b] hover:text-[#1d1d1f]"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* 검색 결과 안내 */}
        {searchQuery && (
          <p className="text-[13px] text-[#86868b] mb-4">
            <span className="text-[#00A39B] font-semibold">"{searchQuery}"</span> 검색 결과{" "}
            <span className="font-semibold text-[#1d1d1f]">{filtered.length}건</span>
          </p>
        )}

        {/* 안내 배너 */}
        <div className="mb-6 p-4 bg-[#EBF4FF] border border-[#00A39B]/10 rounded-2xl flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#00A39B] flex items-center justify-center shrink-0 mt-0.5">
            <FileEdit className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-[#00A39B] mb-0.5">이력에서 빠르게 재발주하세요</p>
            <p className="text-[12px] text-[#5B9BD5] leading-relaxed">
              <strong>수정요청 발주</strong>는 기존 명함 정보를 불러와 이름·부서·연락처 등을 수정한 뒤 발주합니다.<br />
              <strong>즉시 재발주</strong>는 동일 사양으로 수정 없이 바로 발주됩니다.
            </p>
          </div>
        </div>

        {/* 발주이력 목록 */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-12 h-12 text-[#d2d2d7] mx-auto mb-3" />
            <p className="text-[15px] font-medium text-[#86868b]">
              {searchQuery ? "검색 결과가 없습니다" : "명함 발주 이력이 없습니다"}
            </p>
            {searchQuery && (
              <p className="text-[13px] text-[#86868b] mt-1">다른 검색어를 입력해보세요</p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((order) => {
              const spec = order.specifications || {};
              const status = statusMap[order.status] || statusMap.completed;
              const isSelected = selectedOrder?.id === order.id;

              return (
                <motion.div
                  key={order.id}
                  layout
                  className={`bg-white border rounded-2xl overflow-hidden transition-shadow ${
                    isSelected ? "border-[#00A39B]/30 shadow-md" : "border-black/5 hover:shadow-sm"
                  }`}
                >
                  {/* 카드 메인 행 */}
                  <div
                    className="flex items-center gap-4 p-4 cursor-pointer"
                    onClick={() => setSelectedOrder(isSelected ? null : order)}
                  >
                    {/* 명함 썸네일 */}
                    <img
                      src={NAMECARD_IMAGE}
                      alt="명함"
                      className="w-20 h-12 object-cover rounded-xl border border-black/5 shrink-0"
                    />

                    {/* 핵심 정보 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[15px] font-semibold text-[#1d1d1f] truncate">
                          {spec.name || "—"}
                        </span>
                        {spec.position && (
                          <span className="text-[12px] text-[#86868b] shrink-0">{spec.position}</span>
                        )}
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${status.color}`}
                        >
                          {status.icon}
                          {status.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[12px] text-[#86868b]">
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {spec.department || "—"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {order.orderDate}
                        </span>
                        <span className="font-medium text-[#424245]">{order.quantity}부</span>
                      </div>
                    </div>

                    {/* 액션 버튼 */}
                    <div className="flex items-center gap-2 shrink-0">
                      {/* 수정요청 발주 */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditOrder(order);
                        }}
                        className="flex items-center gap-1.5 px-3 py-2 text-[12px] font-medium text-[#424245] bg-[#f5f5f7] rounded-xl hover:bg-[#e8e8ed] transition-colors"
                        title="기존 명함 정보를 불러와 수정 후 발주"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">수정요청</span>
                      </button>

                      {/* 즉시 재발주 */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReorderClick(order);
                        }}
                        className="flex items-center gap-1.5 px-3 py-2 text-[12px] font-bold text-white bg-[#00A39B] rounded-xl hover:bg-[#0055AA] transition-colors"
                        title="동일 사양으로 즉시 재발주"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">즉시재발주</span>
                      </button>

                      <ChevronRight
                        className={`w-4 h-4 text-[#86868b] transition-transform ${isSelected ? "rotate-90" : ""}`}
                      />
                    </div>
                  </div>

                  {/* 상세 펼침 패널 */}
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 border-t border-black/5 pt-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                            <div className="p-3 bg-[#f5f5f7] rounded-xl">
                              <p className="text-[10px] text-[#86868b] mb-0.5">주문번호</p>
                              <p className="text-[12px] font-semibold text-[#1d1d1f]">{order.id}</p>
                            </div>
                            <div className="p-3 bg-[#f5f5f7] rounded-xl">
                              <p className="text-[10px] text-[#86868b] mb-0.5">납기일</p>
                              <p className="text-[12px] font-semibold text-[#1d1d1f]">{order.deliveryDate}</p>
                            </div>
                            {spec.phone && (
                              <div className="p-3 bg-[#f5f5f7] rounded-xl">
                                <p className="text-[10px] text-[#86868b] mb-0.5">전화</p>
                                <p className="text-[12px] font-semibold text-[#1d1d1f]">{spec.phone}</p>
                              </div>
                            )}
                            {spec.email && (
                              <div className="p-3 bg-[#f5f5f7] rounded-xl">
                                <p className="text-[10px] text-[#86868b] mb-0.5">이메일</p>
                                <p className="text-[12px] font-semibold text-[#1d1d1f] truncate">{spec.email}</p>
                              </div>
                            )}
                          </div>

                          {order.modifications && (
                            <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl mb-3">
                              <p className="text-[11px] text-amber-700 font-medium mb-0.5">수정 요청사항</p>
                              <p className="text-[12px] text-amber-800">{order.modifications}</p>
                            </div>
                          )}

                          {order.notes && (
                            <div className="p-3 bg-[#f5f5f7] rounded-xl mb-3">
                              <p className="text-[11px] text-[#86868b] mb-0.5">비고</p>
                              <p className="text-[12px] text-[#424245]">{order.notes}</p>
                            </div>
                          )}

                          {/* 하단 액션 버튼 (상세 패널 내) */}
                          <div className="flex gap-2 pt-1">
                            <button
                              onClick={() => handleEditOrder(order)}
                              className="flex-1 flex items-center justify-center gap-2 py-2.5 text-[13px] font-medium text-[#424245] bg-[#f5f5f7] rounded-xl hover:bg-[#e8e8ed] transition-colors"
                            >
                              <Edit3 className="w-4 h-4" />
                              수정요청 발주
                            </button>
                            <button
                              onClick={() => handleReorderClick(order)}
                              className="flex-1 flex items-center justify-center gap-2 py-2.5 text-[13px] font-bold text-white bg-[#00A39B] rounded-xl hover:bg-[#0055AA] transition-colors"
                            >
                              <Zap className="w-4 h-4" />
                              즉시 재발주
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* 즉시 재발주 확인 모달 */}
      <AnimatePresence>
        {showReorderModal && reorderTarget && (
          <ReorderConfirmModal
            order={reorderTarget}
            onConfirm={handleReorderConfirm}
            onClose={() => {
              setShowReorderModal(false);
              setReorderTarget(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
