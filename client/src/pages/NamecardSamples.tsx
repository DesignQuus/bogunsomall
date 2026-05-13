"use client";

/**
 * NamecardSamples.tsx
 * 명함 샘플 갤러리 페이지
 * 표준명함, 고급명함, 양면명함, 코팅명함 4종 샘플 표시
 */

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, ArrowLeft, ExternalLink } from "lucide-react";
import BackButton from "@/components/BackButton";

const NAMECARD_SAMPLES = [
  {
    id: "standard",
    name: "표준명함 (90×50mm)",
    price: "25,000원~",
    desc: "고민없이 선택하는 기본 중의 기본! 보건소 표준 규격 명함. 깔끔하고 신뢰감 있는 디자인으로 기관 내 명함 규격을 통일합니다.",
    tags: ["#표준규격", "#90x50mm", "#인기상품"],
    images: [
      "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/신-표준명함-A_f8050a20.png",
      "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/신-표준명함-B_70e7eba5.png",
      "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/신-표준명함-C_0cdc3da5.png",
      "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/신-표준명함-D_981a5db8.png",
    ],
    designLabels: ["A형", "B형", "C형", "D형"],
    href: "/order/namecard",
    badge: "인기",
    badgeColor: "bg-[#FF3B30] text-white",
    spec: "90×50mm · 단면/양면 선택 · 일반지/고급지",
  },
  {
    id: "premium",
    name: "고급명함 (90×50mm)",
    price: "35,000원~",
    desc: "와이드한 명함을 원한다면? 90×50mm 황금비율 명함. 고급스러운 소재와 정교한 인쇄로 품격 있는 첫인상을 만들어 드립니다.",
    tags: ["#고급형", "#90x50mm", "#황금비율"],
    images: [
      "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/신-표준명함-B_70e7eba5.png",
      "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/신-표준명함-C_0cdc3da5.png",
    ],
    designLabels: ["A형", "B형"],
    href: "/order/namecard",
    badge: "고급",
    badgeColor: "bg-[#FF9500] text-white",
    spec: "90×50mm · 무광/유광 코팅 · 고급지",
  },
  {
    id: "doublesided",
    name: "양면명함",
    price: "28,000원~",
    desc: "앞뒤 모두 활용하는 정보력 있는 양면 인쇄 명함. 앞면에는 기본 정보, 뒷면에는 부서 안내나 QR코드를 넣어 활용도를 높입니다.",
    tags: ["#양면인쇄", "#정보력", "#실용적"],
    images: [
      "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/신-표준명함-C_0cdc3da5.png",
      "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/신-표준명함-A_f8050a20.png",
    ],
    designLabels: ["앞면", "뒷면"],
    href: "/order/namecard",
    badge: "실용",
    badgeColor: "bg-[#34C759] text-white",
    spec: "90×50mm · 양면 인쇄 · 일반지/고급지",
  },
  {
    id: "coating",
    name: "코팅명함 (무광)",
    price: "30,000원~",
    desc: "무광 코팅으로 고급스러운 느낌의 명함. 지문이 잘 묻지 않고 내구성이 뛰어나 오래 사용할 수 있습니다.",
    tags: ["#무광코팅", "#고급스러운", "#매트"],
    images: [
      "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/신-표준명함-D_981a5db8.png",
      "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/신-표준명함-B_70e7eba5.png",
    ],
    designLabels: ["A형", "B형"],
    href: "/order/namecard",
    badge: "무광",
    badgeColor: "bg-[#636366] text-white",
    spec: "90×50mm · 무광 코팅 · 고급지",
  },
];

export default function NamecardSamples() {
  const [selectedSample, setSelectedSample] = useState<string | null>(null);
  const [selectedImageIdx, setSelectedImageIdx] = useState<Record<string, number>>({});

  const getImageIdx = (id: string) => selectedImageIdx[id] ?? 0;

  return (
    <div className="min-h-screen bg-white">
      {/* 브레드크럼브 */}
      <div className="bg-[#f5f5f7] border-b border-black/5">
        <div className="max-w-[1200px] mx-auto px-5 md:px-8 py-3">
          <nav className="flex items-center gap-1.5 text-[12px]">
            <Link href="/" className="text-[#86868b] hover:text-[#00A39B] transition-colors">홈</Link>
            <ChevronRight className="w-3 h-3 text-[#86868b]" />
            <Link href="/category/namecard" className="text-[#86868b] hover:text-[#00A39B] transition-colors">명함</Link>
            <ChevronRight className="w-3 h-3 text-[#86868b]" />
            <span className="text-[#1d1d1f] font-medium">명함 샘플보기</span>
          </nav>
        </div>
      </div>

      {/* 히어로 배너 */}
      <section className="bg-[#1d1d1f] py-12 md:py-16">
        <div className="max-w-[1200px] mx-auto px-5 md:px-8">
          <div className="flex items-center gap-3 mb-2">
            <BackButton className="text-white/60 hover:text-white" />
          </div>
          <h1 className="text-[clamp(1.8rem,4vw,3rem)] font-bold text-white tracking-tight mb-3">
            명함
            <span className="text-[#00A39B] ml-2">LUXE</span>
          </h1>
          <p className="text-[15px] text-white/60 max-w-xl">
            보건소 담당자를 위한 표준명함. 기관 내 명함 규격을 통일하여 신뢰있는 첫인상을 만듭니다.
          </p>
          <div className="flex items-center gap-2 mt-4 text-[12px] text-white/40">
            <span>홈</span>
            <ChevronRight className="w-3 h-3" />
            <span>명함</span>
          </div>
        </div>
      </section>

      {/* 갤러리 그리드 */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-[1200px] mx-auto px-5 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {NAMECARD_SAMPLES.map((sample) => {
              const imgIdx = getImageIdx(sample.id);
              const isSelected = selectedSample === sample.id;
              return (
                <div
                  key={sample.id}
                  className={`group border rounded-2xl overflow-hidden transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? "border-[#00A39B] shadow-lg shadow-[#00A39B]/10"
                      : "border-black/8 hover:border-[#00A39B]/40 hover:shadow-md"
                  }`}
                  onClick={() => setSelectedSample(isSelected ? null : sample.id)}
                >
                  {/* 이미지 영역 */}
                  <div className="bg-[#f5f5f7] relative overflow-hidden" style={{ height: "240px", width: "100%" }}>
                    <img
                      src={sample.images[imgIdx]}
                      alt={`${sample.name} ${sample.designLabels[imgIdx]}`}
                      className="w-full h-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
                    />
                    {/* 배지 */}
                    <span className={`absolute top-3 left-3 px-2.5 py-0.5 text-[11px] font-bold rounded-full ${sample.badgeColor}`}>
                      {sample.badge}
                    </span>
                  </div>

                  {/* 썸네일 선택 */}
                  {sample.images.length > 1 && (
                    <div className="flex gap-2 px-4 pt-3 pb-0">
                      {sample.images.map((img, i) => (
                        <button
                          key={i}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedImageIdx((prev) => ({ ...prev, [sample.id]: i }));
                          }}
                          className={`w-12 h-10 rounded-lg overflow-hidden border-2 transition-all ${
                            imgIdx === i ? "border-[#00A39B]" : "border-transparent hover:border-[#00A39B]/40"
                          }`}
                        >
                          <img src={img} alt={sample.designLabels[i]} className="w-full h-full object-contain bg-[#f5f5f7]" />
                        </button>
                      ))}
                      <span className="ml-1 self-center text-[12px] text-[#86868b]">{sample.designLabels[imgIdx]}</span>
                    </div>
                  )}

                  {/* 텍스트 정보 */}
                  <div className="p-4 pt-3">
                    <div className="flex items-start justify-between mb-1">
                      <h2 className="text-[16px] font-bold text-[#00A39B]">{sample.name}</h2>
                      <span className="text-[14px] font-semibold text-[#1d1d1f] shrink-0 ml-2">{sample.price}</span>
                    </div>
                    <p className="text-[13px] text-[#424245] mb-2 leading-relaxed">{sample.desc}</p>
                    <p className="text-[11px] text-[#86868b] mb-3">{sample.spec}</p>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {sample.tags.map((tag) => (
                        <span key={tag} className="px-2 py-0.5 bg-[#f5f5f7] text-[#86868b] text-[11px] rounded-full">{tag}</span>
                      ))}
                    </div>
                    <Link
                      href={sample.href}
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#00A39B] text-white text-[13px] font-semibold rounded-xl hover:bg-[#008F88] transition-colors"
                    >
                      주문하기 <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 하단 안내 */}
          <div className="mt-12 p-6 bg-[#f5f5f7] rounded-2xl text-center">
            <p className="text-[14px] text-[#424245] mb-2">
              원하시는 샘플이 없거나 맞춤 제작이 필요하신가요?
            </p>
            <p className="text-[13px] text-[#86868b]">
              고객센터 <span className="font-bold text-[#1d1d1f]">1522-6401</span>로 연락 주시면 상담해 드립니다.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
