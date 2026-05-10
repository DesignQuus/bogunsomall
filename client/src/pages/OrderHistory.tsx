/**
 * OrderHistory.tsx
 * Design: "Clean Canvas" — Apple Store Style
 * - Order history management with filtering and re-order functionality
 * - Table view with status badges and action buttons
 */

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import {
  ChevronRight,
  Search,
  Filter,
  RotateCcw,
  Eye,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { useTemplate } from "@/contexts/TemplateContext";

// Mock data - Replace with actual API call
// mockOrderHistory 제거 — TemplateContext.tsx의 mockOrderHistory를 사용함

const productTypeLabels: Record<string, string> = {
  namecard: "명함",
  sticker: "스티커",
  envelope: "봉투",
  shopping_bag: "쇼핑백",
  calendar: "캘린더",
  digital: "디지털소량인쇄",
  flyer: "전단지",
  poster: "포스터",
  leaflet: "리플렛",
};

const statusLabels: Record<string, string> = {
  completed: "완료",
  in_progress: "진행중",
  cancelled: "취소",
  pending: "대기",
};

const statusColors: Record<string, string> = {
  completed: "bg-green-100 text-green-700",
  in_progress: "bg-blue-100 text-blue-700",
  cancelled: "bg-red-100 text-red-700",
  pending: "bg-yellow-100 text-yellow-700",
};

export default function OrderHistory() {
  const [, navigate] = useLocation();
  const { orderHistory } = useTemplate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  // Filter logic
  const filteredOrders = useMemo(() => {
    return orderHistory.filter((order) => {
      const matchesSearch =
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.productName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesProduct = !selectedProduct || order.productType === selectedProduct;
      const matchesStatus = !selectedStatus || order.status === selectedStatus;
      return matchesSearch && matchesProduct && matchesStatus;
    });
    }, [searchQuery, selectedProduct, selectedStatus, orderHistory]);

  const handleReorder = (orderId: string) => {
    const order = orderHistory.find((o) => o.id === orderId);
    if (order) {
      if (order.productType === "namecard") {
        navigate(`/order/namecard?orderId=${orderId}`, { replace: false });
      } else {
        navigate(`/order/reorder/${order.productType}?orderId=${orderId}`, { replace: false });
      }
      toast.success("재주문 폼으로 이동합니다.");
    }
  };

  const handleNewOrder = () => {
    navigate("/order/namecard", { replace: false });
  };

  return (
    <div>
      {/* Breadcrumb */}
      <div className="bg-[#f5f5f7] border-b border-black/5">
        <div className="max-w-[1200px] mx-auto px-5 md:px-8 py-3">
          <nav className="flex items-center gap-1.5 text-[12px]">
            <Link href="/" className="text-[#86868b] hover:text-[#00A39B] transition-colors">
              홈
            </Link>
            <ChevronRight className="w-3 h-3 text-[#86868b]" />
            <span className="text-[#1d1d1f] font-medium">주문 이력</span>
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
            className="flex flex-col md:flex-row md:items-center md:justify-between gap-6"
          >
            <div>
              <h1 className="text-[clamp(1.75rem,4vw,3rem)] font-bold tracking-tight text-[#1d1d1f] mb-2">
                주문 이력
              </h1>
              <p className="text-[17px] text-[#86868b]">
                이전 주문 내역을 확인하고 빠르게 재주문하세요.
              </p>
            </div>
            <button
                onClick={handleNewOrder}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#00A39B] text-white text-[15px] font-semibold rounded-full hover:bg-[#0055AA] transition-all hover:shadow-lg hover:shadow-[#00A39B]/20 whitespace-nowrap cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                새 주문하기
              </button>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <section className="bg-[#f5f5f7] border-b border-black/5">
        <div className="max-w-[1200px] mx-auto px-5 md:px-8 py-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="space-y-4"
          >
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868b]" />
              <input
                type="text"
                placeholder="주문번호 또는 제품명으로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 text-[15px] bg-white border-0 rounded-xl focus:ring-2 focus:ring-[#00A39B]/30 focus:bg-white transition-all outline-none"
              />
            </div>

            {/* Filter Chips */}
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#86868b]" />
                <span className="text-[13px] font-medium text-[#86868b]">제품:</span>
              </div>

              {["namecard", "sticker", "envelope", "shopping_bag", "calendar", "digital", "flyer", "poster", "leaflet"].map((product) => (
                <button
                  key={product}
                  onClick={() => setSelectedProduct(selectedProduct === product ? null : product)}
                  className={`px-3 py-1.5 text-[13px] font-medium rounded-full transition-all ${
                    selectedProduct === product
                      ? "bg-[#00A39B] text-white"
                      : "bg-white text-[#424245] hover:bg-[#e8e8ed]"
                  }`}
                >
                  {productTypeLabels[product]}
                </button>
              ))}

              <div className="w-px bg-[#d2d2d7] mx-1"></div>

              <span className="text-[13px] font-medium text-[#86868b]">상태:</span>
              {["completed", "in_progress", "pending"].map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(selectedStatus === status ? null : status)}
                  className={`px-3 py-1.5 text-[13px] font-medium rounded-full transition-all ${
                    selectedStatus === status
                      ? "bg-[#00A39B] text-white"
                      : "bg-white text-[#424245] hover:bg-[#e8e8ed]"
                  }`}
                >
                  {statusLabels[status]}
                </button>
              ))}

              {(searchQuery || selectedProduct || selectedStatus) && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedProduct(null);
                    setSelectedStatus(null);
                  }}
                  className="px-3 py-1.5 text-[13px] font-medium text-[#00A39B] hover:bg-[#f5f5f7] rounded-full transition-all"
                >
                  초기화
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Order List */}
      <section className="bg-white py-12 md:py-16">
        <div className="max-w-[1200px] mx-auto px-5 md:px-8">
          {filteredOrders.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="text-center py-12"
            >
              <div className="text-[#86868b] text-[15px] mb-4">
                주문 이력이 없습니다.
              </div>
              <button
                onClick={handleNewOrder}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#00A39B] text-white text-[15px] font-semibold rounded-full hover:bg-[#0055AA] transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                첫 주문하기
              </button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="space-y-3"
            >
              {filteredOrders.map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  className="flex flex-col md:flex-row md:items-center gap-4 p-4 bg-[#f5f5f7] rounded-xl hover:bg-[#e8e8ed] transition-all"
                >
                  {/* Order Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-2">
                      <span className="text-[15px] font-semibold text-[#1d1d1f]">
                        {order.id}
                      </span>
                      <span className={`inline-flex px-2.5 py-1 text-[12px] font-medium rounded-full w-fit ${statusColors[order.status]}`}>
                        {statusLabels[order.status]}
                      </span>
                    </div>
                    <div className="grid md:grid-cols-3 gap-2 md:gap-6 text-[13px] text-[#86868b]">
                      <div>
                        <span className="font-medium">제품:</span> {order.productName}
                      </div>
                      <div>
                        <span className="font-medium">수량:</span> {order.quantity}부
                      </div>
                      <div>
                        <span className="font-medium">주문일:</span> {order.orderDate}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleReorder(order.id)}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#00A39B] text-white text-[13px] font-medium rounded-lg hover:bg-[#0055AA] transition-all whitespace-nowrap"
                    >
                      <RotateCcw className="w-4 h-4" />
                      재주문
                    </button>
                    <button
                      onClick={() => toast.info("상세 보기 기능은 준비 중입니다.")}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-[#00A39B] text-[13px] font-medium rounded-lg border border-[#d2d2d7] hover:bg-[#f5f5f7] transition-all"
                    >
                      <Eye className="w-4 h-4" />
                      상세보기
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}
