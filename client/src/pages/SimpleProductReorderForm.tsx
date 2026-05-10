/**
 * SimpleProductReorderForm.tsx
 * Design: "Clean Canvas" — Apple Store Style
 * - Simple reorder form for flyers, posters, leaflets
 * - Two options: "Same Spec" or "Designer Consultation"
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowRight, ChevronRight, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useTemplate } from "@/contexts/TemplateContext";
import BackButton from "@/components/BackButton";

interface ProductOption {
  id: string;
  name: string;
  icon: string;
}

const productOptions: Record<string, ProductOption> = {
  flyer: { id: "flyer", name: "전단지", icon: "📄" },
  poster: { id: "poster", name: "포스터", icon: "📋" },
  leaflet: { id: "leaflet", name: "리플렛", icon: "📑" },
};

interface SimpleProductReorderFormProps {
  params?: { productType?: string };
}

export default function SimpleProductReorderForm(props: SimpleProductReorderFormProps) {
  const productType = props.params?.productType || "flyer";
  const product = productOptions[productType] || productOptions.flyer;
  const { orderHistory } = useTemplate();
  const [reorderOption, setReorderOption] = useState<"same" | "designer">("same");
  const [formData, setFormData] = useState({
    quantity: 1000,
    deliveryDate: "",
    notes: "",
    designerNotes: "",
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get("orderId");
    
    if (orderId) {
      const previousOrder = orderHistory.find((o) => o.id === orderId);
      if (previousOrder && previousOrder.productType === productType) {
        setFormData({
          quantity: previousOrder.quantity || 1000,
          deliveryDate: "",
          notes: previousOrder.modifications || "",
          designerNotes: "",
        });
        toast.success("이전 주문 정보가 자동으로 로드되었습니다.");
      }
    }
  }, [orderHistory, productType]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.deliveryDate) {
      toast.error("납기일을 선택해주세요.");
      return;
    }
    toast.success(`${product.name} 재주문이 접수되었습니다.`);
    console.log("Reorder submitted:", { product: productType, ...formData });
  };

  return (
    <div>
      {/* Breadcrumb */}
      <div className="bg-[#f5f5f7] border-b border-black/5">
        <div className="max-w-[1200px] mx-auto px-5 md:px-8 py-3">
          <div className="flex items-center justify-between">
            <nav className="flex items-center gap-1.5 text-[12px]">
              <Link href="/" className="text-[#86868b] hover:text-[#00A39B] transition-colors">
                홈
              </Link>
              <ChevronRight className="w-3 h-3 text-[#86868b]" />
              <Link href="/order-history" className="text-[#86868b] hover:text-[#00A39B] transition-colors">
                주문 이력
              </Link>
              <ChevronRight className="w-3 h-3 text-[#86868b]" />
              <span className="text-[#1d1d1f] font-medium">{product.name} 재주문</span>
            </nav>
            <BackButton variant="header" />
          </div>
        </div>
      </div>

      {/* Header */}
      <section className="bg-white py-12 md:py-16">
        <div className="max-w-[1200px] mx-auto px-5 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <BackButton variant="inline" className="mb-6" />
            <h1 className="text-[clamp(1.75rem,4vw,3rem)] font-bold tracking-tight text-[#1d1d1f] mb-3">
              {product.name} 재주문
            </h1>
            <p className="text-[17px] text-[#86868b] max-w-lg">
              이전 주문과 동일한 사양으로 빠르게 재주문하거나, 디자인 수정이 필요하면 디자이너와 상담하세요.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Form Section */}
      <section className="bg-[#f5f5f7] py-12 md:py-16">
        <div className="max-w-[1200px] mx-auto px-5 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="bg-white rounded-2xl p-8 shadow-sm"
          >
            {/* Reorder Option Selection */}
            <div className="mb-8">
              <h2 className="text-[17px] font-semibold text-[#1d1d1f] mb-4">재주문 방식 선택</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {/* Same Spec Option */}
                <button
                  onClick={() => setReorderOption("same")}
                  className={`p-6 rounded-xl border-2 transition-all text-left ${
                    reorderOption === "same"
                      ? "border-[#00A39B] bg-[#00A39B]/5"
                      : "border-[#e8e8ed] bg-white hover:border-[#d2d2d7]"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`flex items-center justify-center w-6 h-6 rounded-full border-2 transition-all ${
                      reorderOption === "same"
                        ? "border-[#00A39B] bg-[#00A39B]"
                        : "border-[#d2d2d7]"
                    }`}>
                      {reorderOption === "same" && (
                        <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <h3 className="text-[15px] font-semibold text-[#1d1d1f] mb-1">동일 사양 재주문</h3>
                      <p className="text-[13px] text-[#86868b]">
                        이전 주문과 동일한 디자인과 사양으로 빠르게 재주문합니다.
                      </p>
                    </div>
                  </div>
                </button>

                {/* Designer Consultation Option */}
                <button
                  onClick={() => setReorderOption("designer")}
                  className={`p-6 rounded-xl border-2 transition-all text-left ${
                    reorderOption === "designer"
                      ? "border-[#00A39B] bg-[#00A39B]/5"
                      : "border-[#e8e8ed] bg-white hover:border-[#d2d2d7]"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`flex items-center justify-center w-6 h-6 rounded-full border-2 transition-all ${
                      reorderOption === "designer"
                        ? "border-[#00A39B] bg-[#00A39B]"
                        : "border-[#d2d2d7]"
                    }`}>
                      {reorderOption === "designer" && (
                        <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <h3 className="text-[15px] font-semibold text-[#1d1d1f] mb-1">디자이너 상담</h3>
                      <p className="text-[13px] text-[#86868b]">
                        디자인 수정이 필요하면 디자이너와 상담하여 맞춤 제작합니다.
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Form Fields */}
            <form onSubmit={handleSubmit} className="space-y-6 border-t border-[#e8e8ed] pt-8">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[13px] font-medium text-[#1d1d1f] mb-2">
                    수량 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    min="100"
                    step="100"
                    className="w-full px-4 py-3 text-[15px] bg-[#f5f5f7] border-0 rounded-xl focus:ring-2 focus:ring-[#00A39B]/30 focus:bg-white transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-[#1d1d1f] mb-2">
                    납기일 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="deliveryDate"
                    value={formData.deliveryDate}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-[15px] bg-[#f5f5f7] border-0 rounded-xl focus:ring-2 focus:ring-[#00A39B]/30 focus:bg-white transition-all outline-none"
                  />
                </div>
              </div>

              {reorderOption === "same" && (
                <div>
                  <label className="block text-[13px] font-medium text-[#1d1d1f] mb-2">
                    특수 요청사항
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={3}
                    placeholder="배송 방법, 특수 처리 등 추가 요청사항을 입력하세요."
                    className="w-full px-4 py-3 text-[15px] bg-[#f5f5f7] border-0 rounded-xl focus:ring-2 focus:ring-[#00A39B]/30 focus:bg-white transition-all outline-none resize-none"
                  />
                </div>
              )}

              {reorderOption === "designer" && (
                <div>
                  <label className="block text-[13px] font-medium text-[#1d1d1f] mb-2">
                    디자인 수정 사항 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="designerNotes"
                    value={formData.designerNotes}
                    onChange={handleChange}
                    rows={4}
                    placeholder="변경하고 싶은 디자인 요소를 자세히 설명해주세요. 예: 색상 변경, 텍스트 수정, 로고 추가 등"
                    className="w-full px-4 py-3 text-[15px] bg-[#f5f5f7] border-0 rounded-xl focus:ring-2 focus:ring-[#00A39B]/30 focus:bg-white transition-all outline-none resize-none"
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#00A39B] text-white text-[15px] font-semibold rounded-full hover:bg-[#0055AA] transition-all hover:shadow-lg hover:shadow-[#00A39B]/20"
              >
                {product.name} 재주문하기
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        </div>
      </section>

      {/* Info Section */}
      <section className="bg-white py-12 md:py-16">
        <div className="max-w-[1200px] mx-auto px-5 md:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="text-4xl mb-3">⚡</div>
              <h3 className="text-[15px] font-semibold text-[#1d1d1f] mb-2">빠른 처리</h3>
              <p className="text-[13px] text-[#86868b]">
                동일 사양 재주문은 24시간 내 처리됩니다.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="text-4xl mb-3">✏️</div>
              <h3 className="text-[15px] font-semibold text-[#1d1d1f] mb-2">디자인 수정</h3>
              <p className="text-[13px] text-[#86868b]">
                디자이너와 상담하여 맞춤 수정이 가능합니다.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="text-4xl mb-3">💬</div>
              <h3 className="text-[15px] font-semibold text-[#1d1d1f] mb-2">상담 지원</h3>
              <p className="text-[13px] text-[#86868b]">
                전문가 상담으로 최적의 결과를 보장합니다.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
