"use client";

/**
 * CustomerService.tsx
 * - 고객센터 페이지
 * - FAQ, 문의하기, 운영 안내
 */
import { useState } from "react";
import Link from "next/link";
import { ChevronRight, ChevronDown, Phone, Mail, Clock, MessageSquare, FileText, Package } from "lucide-react";
import { toast } from "sonner";

const FAQ_ITEMS = [
  {
    id: 1,
    category: "주문",
    q: "주문 후 제작 기간은 얼마나 걸리나요?",
    a: "제품 종류에 따라 다르지만, 일반적으로 주문 접수 후 영업일 기준 3~5일 내 제작 완료 후 배송됩니다. 명함의 경우 2~3일, 대형 현수막은 1~2일이 소요됩니다. 긴급 제작이 필요한 경우 고객센터로 문의해 주세요.",
  },
  {
    id: 2,
    category: "주문",
    q: "디자인 파일 없이도 주문할 수 있나요?",
    a: "네, 가능합니다. 보건소플러스는 자체 디자인 템플릿을 제공하고 있어 디자인 파일 없이도 주문하실 수 있습니다. 기관 정보와 원하시는 내용을 입력하시면 전문 디자이너가 시안을 제작해 드립니다.",
  },
  {
    id: 3,
    category: "주문",
    q: "최소 주문 수량이 있나요?",
    a: "제품별로 최소 주문 수량이 다릅니다. 명함은 100매부터, 스티커는 50매부터, 전단지/리플렛은 100매부터 주문 가능합니다. 소량 주문이 필요한 경우 디지털소량인쇄 서비스를 이용하시면 10매부터 주문 가능합니다.",
  },
  {
    id: 4,
    category: "등록",
    q: "기관 등록 승인은 얼마나 걸리나요?",
    a: "기관 등록 신청 후 영업일 기준 1~2일 내 심사 후 승인 결과를 입력하신 이메일로 안내드립니다. 승인 완료 시 보건소 로그인 코드가 발급됩니다.",
  },
  {
    id: 5,
    category: "등록",
    q: "로그인 코드를 분실했어요. 어떻게 하나요?",
    a: "고객센터 이메일(help@bogunsoplus.kr) 또는 전화(02-1234-5678)로 문의해 주시면 본인 확인 후 코드를 재발급해 드립니다. 기관명, 담당자 이름, 등록 이메일을 함께 알려주세요.",
  },
  {
    id: 6,
    category: "결제",
    q: "결제 방법은 어떻게 되나요?",
    a: "현재 공공기관 특성상 세금계산서 발행 후 계좌이체 방식으로 결제가 이루어집니다. 주문 접수 후 담당자가 견적서와 함께 결제 안내를 드립니다.",
  },
  {
    id: 7,
    category: "결제",
    q: "세금계산서 발행이 가능한가요?",
    a: "네, 가능합니다. 주문 완료 후 사업자등록번호와 이메일을 알려주시면 전자세금계산서를 발행해 드립니다. 지출결의서, 견적서 등 공공기관 필요 서류도 제공 가능합니다.",
  },
  {
    id: 8,
    category: "배송",
    q: "배송 지역과 비용은 어떻게 되나요?",
    a: "전국 배송 가능합니다. 기본 배송비는 3,000원이며, 50,000원 이상 주문 시 무료 배송입니다. 제주도 및 도서산간 지역은 추가 배송비가 발생할 수 있습니다.",
  },
  {
    id: 9,
    category: "배송",
    q: "주문 후 배송 현황을 확인할 수 있나요?",
    a: "주문 접수 후 제작 완료 시 등록된 이메일로 운송장 번호를 안내드립니다. 대시보드의 주문 이력에서도 배송 현황을 확인하실 수 있습니다.",
  },
  {
    id: 10,
    category: "취소/교환",
    q: "주문 취소 및 교환이 가능한가요?",
    a: "주문 접수 후 제작 시작 전(영업일 기준 당일)에는 취소가 가능합니다. 제작 시작 후에는 취소가 어렵습니다. 인쇄물 특성상 단순 변심에 의한 교환/반품은 불가하나, 제작 오류의 경우 100% 재제작 또는 환불해 드립니다.",
  },
];

const CATEGORIES_FAQ = ["전체", "주문", "등록", "결제", "배송", "취소/교환"];

const CONTACT_METHODS = [
  {
    icon: Phone,
    title: "전화 문의",
    value: "02-1234-5678",
    desc: "평일 09:00 ~ 18:00",
    color: "#34C759",
    bg: "#EDFBF1",
    action: () => window.open("tel:02-1234-5678"),
  },
  {
    icon: Mail,
    title: "이메일 문의",
    value: "help@bogunsoplus.kr",
    desc: "24시간 접수, 영업일 내 답변",
    color: "#00A39B",
    bg: "#EBF3FF",
    action: () => window.open("mailto:help@bogunsoplus.kr"),
  },
  {
    icon: MessageSquare,
    title: "온라인 문의",
    value: "문의 양식 작성",
    desc: "아래 양식으로 문의해 주세요",
    color: "#5856D6",
    bg: "#F0EFFE",
    action: () => document.getElementById("contact-form")?.scrollIntoView({ behavior: "smooth" }),
  },
];

export default function CustomerService() {
  const [activeCategory, setActiveCategory] = useState("전체");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", category: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  const filteredFaq =
    activeCategory === "전체"
      ? FAQ_ITEMS
      : FAQ_ITEMS.filter((f) => f.category === activeCategory);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("이름, 이메일, 문의 내용은 필수입니다.");
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setForm({ name: "", email: "", phone: "", category: "", message: "" });
      toast.success("문의가 접수되었습니다. 영업일 기준 1~2일 내 답변드리겠습니다.");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#fbfbfd]">
      {/* 히어로 */}
      <section className="bg-white border-b border-black/5 pt-10 pb-12">
        <div className="max-w-4xl mx-auto px-5">
          <div className="flex items-center gap-1.5 text-[13px] text-[#86868b] mb-6">
            <Link href="/" className="hover:text-[#00A39B] transition-colors">홈</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[#1d1d1f]">고객센터</span>
          </div>
          <p className="text-[13px] font-medium text-[#00A39B] tracking-widest uppercase mb-2">Customer Service</p>
          <h1 className="text-[36px] font-bold text-[#1d1d1f] tracking-tight mb-3">고객센터</h1>
          <p className="text-[16px] text-[#86868b]">
            궁금한 점이 있으시면 언제든지 문의해 주세요.
          </p>

          {/* 운영 시간 */}
          <div className="flex items-center gap-2 mt-5 text-[13px] text-[#86868b]">
            <Clock className="w-4 h-4" />
            <span>운영 시간: 평일 09:00 ~ 18:00 (점심 12:00 ~ 13:00, 주말 및 공휴일 휴무)</span>
          </div>
        </div>
      </section>

      {/* 연락 방법 */}
      <section className="max-w-4xl mx-auto px-5 py-10">
        <h2 className="text-[20px] font-bold text-[#1d1d1f] mb-5">문의 방법</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {CONTACT_METHODS.map((method) => (
            <button
              key={method.title}
              onClick={method.action}
              className="text-left p-5 bg-white rounded-2xl border border-black/5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ backgroundColor: method.bg }}
              >
                <method.icon className="w-5 h-5" style={{ color: method.color }} />
              </div>
              <p className="text-[13px] text-[#86868b] mb-0.5">{method.title}</p>
              <p className="text-[15px] font-semibold text-[#1d1d1f] mb-1">{method.value}</p>
              <p className="text-[12px] text-[#86868b]">{method.desc}</p>
            </button>
          ))}
        </div>
      </section>

      {/* 바로가기 */}
      <section className="max-w-4xl mx-auto px-5 pb-10">
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/order-history"
            className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-black/5 hover:border-[#00A39B]/30 transition-colors"
          >
            <div className="w-9 h-9 bg-[#EBF3FF] rounded-xl flex items-center justify-center">
              <Package className="w-4.5 h-4.5 text-[#00A39B]" />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-[#1d1d1f]">주문 이력 확인</p>
              <p className="text-[11px] text-[#86868b]">주문 현황 조회</p>
            </div>
          </Link>
          <Link
            href="/custom-order"
            className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-black/5 hover:border-[#00A39B]/30 transition-colors"
          >
            <div className="w-9 h-9 bg-[#F0EFFE] rounded-xl flex items-center justify-center">
              <FileText className="w-4.5 h-4.5 text-[#5856D6]" />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-[#1d1d1f]">맞춤 제작 문의</p>
              <p className="text-[11px] text-[#86868b]">특수 제작 요청</p>
            </div>
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-4xl mx-auto px-5 pb-12">
        <h2 className="text-[20px] font-bold text-[#1d1d1f] mb-5">자주 묻는 질문</h2>

        {/* 카테고리 필터 */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-5 scrollbar-hide">
          {CATEGORIES_FAQ.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-[13px] font-medium transition-all ${
                activeCategory === cat
                  ? "bg-[#1d1d1f] text-white"
                  : "bg-white text-[#86868b] border border-black/10 hover:border-black/20"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* FAQ 아코디언 */}
        <div className="space-y-2">
          {filteredFaq.map((faq) => (
            <div
              key={faq.id}
              className="bg-white rounded-2xl border border-black/5 overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <div className="flex items-start gap-3 pr-4">
                  <span className="flex-shrink-0 text-[11px] font-semibold text-[#00A39B] bg-[#EBF3FF] px-2 py-0.5 rounded-full mt-0.5">
                    {faq.category}
                  </span>
                  <span className="text-[15px] font-medium text-[#1d1d1f]">{faq.q}</span>
                </div>
                <ChevronDown
                  className={`flex-shrink-0 w-4 h-4 text-[#86868b] transition-transform ${
                    openFaq === faq.id ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openFaq === faq.id && (
                <div className="px-5 pb-5">
                  <div className="pt-3 border-t border-black/5">
                    <p className="text-[14px] text-[#86868b] leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 온라인 문의 양식 */}
      <section id="contact-form" className="bg-white border-t border-black/5 py-12">
        <div className="max-w-4xl mx-auto px-5">
          <h2 className="text-[20px] font-bold text-[#1d1d1f] mb-2">온라인 문의</h2>
          <p className="text-[14px] text-[#86868b] mb-7">
            영업일 기준 1~2일 내 이메일로 답변드립니다.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-medium text-[#1d1d1f] mb-1.5">
                  이름 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="홍길동"
                  className="w-full px-4 py-3 rounded-xl border border-black/10 text-[14px] focus:outline-none focus:border-[#00A39B] transition-colors"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#1d1d1f] mb-1.5">
                  이메일 <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="example@health.go.kr"
                  className="w-full px-4 py-3 rounded-xl border border-black/10 text-[14px] focus:outline-none focus:border-[#00A39B] transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-medium text-[#1d1d1f] mb-1.5">
                  연락처
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="010-0000-0000"
                  className="w-full px-4 py-3 rounded-xl border border-black/10 text-[14px] focus:outline-none focus:border-[#00A39B] transition-colors"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-[#1d1d1f] mb-1.5">
                  문의 유형
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-black/10 text-[14px] focus:outline-none focus:border-[#00A39B] transition-colors bg-white"
                >
                  <option value="">선택해 주세요</option>
                  <option value="주문">주문 관련</option>
                  <option value="등록">기관 등록 관련</option>
                  <option value="결제">결제 관련</option>
                  <option value="배송">배송 관련</option>
                  <option value="취소/교환">취소/교환 관련</option>
                  <option value="기타">기타</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[#1d1d1f] mb-1.5">
                문의 내용 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="문의하실 내용을 자세히 작성해 주세요."
                rows={5}
                className="w-full px-4 py-3 rounded-xl border border-black/10 text-[14px] focus:outline-none focus:border-[#00A39B] transition-colors resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-[#00A39B] text-white rounded-xl text-[15px] font-semibold hover:bg-[#0055AA] active:scale-[0.99] transition-all disabled:opacity-50"
            >
              {submitting ? "접수 중..." : "문의 접수하기"}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
