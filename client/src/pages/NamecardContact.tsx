"use client";

/**
 * NamecardContact.tsx
 * Design: "Clean Canvas" — Apple Store Style
 * 전국 담당자 찾기 — 명함 섬네일 갤러리
 * - 명함 이미지 섬네일 표시
 * - 카드 하단: 보건소명, 이름, 일반전화, 핸드폰
 * - 검색: 담당자 이름 또는 지역명
 */

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, X, ChevronRight, Phone, Smartphone } from "lucide-react";

const CDN = "https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp";

// 명함 데이터 — 이미지 + 보건소명 + 이름 + 일반전화 + 핸드폰
const NAMECARD_DATA = [
  {
    id: 1,
    image: `${CDN}/namecard_01_f6cfb044.png`,
    center: "인천 연수구보건소",
    name: "정연수",
    tel: "032-749-8000",
    mobile: "010-1234-5678",
  },
  {
    id: 2,
    image: `${CDN}/namecard_02_97c04dff.png`,
    center: "서울 종로구보건소",
    name: "김건강",
    tel: "02-2148-3500",
    mobile: "010-2345-6789",
  },
  {
    id: 3,
    image: `${CDN}/namecard_03_4c8dea51.png`,
    center: "서울 강남구보건소",
    name: "박예방",
    tel: "02-3423-7000",
    mobile: "010-3456-7890",
  },
  {
    id: 4,
    image: `${CDN}/namecard_04_02cd5f24.png`,
    center: "경기 수원시 장안구보건소",
    name: "윤수원",
    tel: "031-228-2700",
    mobile: "010-4567-8901",
  },
  {
    id: 5,
    image: `${CDN}/namecard_05_adc94a24.png`,
    center: "부산 해운대구보건소",
    name: "문해운",
    tel: "051-749-7600",
    mobile: "010-5678-9012",
  },
  {
    id: 6,
    image: `${CDN}/namecard_06_a4e6be93.png`,
    center: "인천 남동구보건소",
    name: "오남동",
    tel: "032-453-5000",
    mobile: "010-6789-0123",
  },
  {
    id: 7,
    image: `${CDN}/namecard_07_60a223bf.png`,
    center: "서울 마포구보건소",
    name: "최지역",
    tel: "02-3153-9000",
    mobile: "010-7890-1234",
  },
  {
    id: 8,
    image: `${CDN}/namecard_08_cf7a4545.png`,
    center: "경기 성남시 분당구보건소",
    name: "강분당",
    tel: "031-729-3700",
    mobile: "010-8901-2345",
  },
  {
    id: 9,
    image: `${CDN}/namecard_09_8350d02f.png`,
    center: "대구 수성구보건소",
    name: "조수성",
    tel: "053-666-3000",
    mobile: "010-9012-3456",
  },
  {
    id: 10,
    image: `${CDN}/namecard_10_914bd569.png`,
    center: "광주 서구보건소",
    name: "배광주",
    tel: "062-360-7500",
    mobile: "010-0123-4567",
  },
  {
    id: 11,
    image: `${CDN}/namecard_11_1e9c74a6.png`,
    center: "대전 유성구보건소",
    name: "서유성",
    tel: "042-611-5000",
    mobile: "010-1122-3344",
  },
  {
    id: 12,
    image: `${CDN}/namecard_12_9d0dddf5.png`,
    center: "인천 부평구보건소",
    name: "한부평",
    tel: "032-509-8000",
    mobile: "010-2233-4455",
  },
  {
    id: 13,
    image: `${CDN}/namecard_13_8d48fac1.png`,
    center: "경기 고양시 덕양구보건소",
    name: "신덕양",
    tel: "031-8075-4000",
    mobile: "010-3344-5566",
  },
  {
    id: 14,
    image: `${CDN}/namecard_14_62bf7bea.png`,
    center: "부산 수영구보건소",
    name: "류수영",
    tel: "051-610-5400",
    mobile: "010-4455-6677",
  },
  {
    id: 15,
    image: `${CDN}/namecard_15_dc12f310.png`,
    center: "서울 중구보건소",
    name: "이보건",
    tel: "02-3396-6300",
    mobile: "010-5566-7788",
  },
  {
    id: 16,
    image: `${CDN}/namecard_16_fba35b0d.png`,
    center: "경기 수원시 권선구보건소",
    name: "임권선",
    tel: "031-228-6700",
    mobile: "010-6677-8899",
  },
  {
    id: 17,
    image: `${CDN}/namecard_17_5ed3364d.png`,
    center: "인천 연수구보건소",
    name: "정연수",
    tel: "032-749-8100",
    mobile: "010-7788-9900",
  },
];

export default function NamecardContact() {
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return NAMECARD_DATA;
    return NAMECARD_DATA.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.center.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-[#FBFBFD]">
      {/* 페이지 헤더 */}
      <div className="bg-white border-b border-black/5">
        <div className="max-w-[1200px] mx-auto px-5 md:px-8 py-4">
          <nav className="flex items-center gap-1.5 text-[12px] mb-4">
            <Link href="/" className="text-[#86868b] hover:text-[#00A39B] transition-colors">홈</Link>
            <ChevronRight className="w-3 h-3 text-[#d2d2d7]" />
            <Link href="/category/namecard" className="text-[#86868b] hover:text-[#00A39B] transition-colors">명함</Link>
            <ChevronRight className="w-3 h-3 text-[#d2d2d7]" />
            <span className="text-[#1d1d1f] font-medium">지역별 담당자 찾기</span>
          </nav>
          <h1 className="text-[24px] font-bold text-[#1d1d1f] tracking-tight">지역별 담당자 찾기</h1>
          <p className="text-[14px] text-[#86868b] mt-1">전국 보건소 명함 발주 담당자를 검색하세요</p>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-5 md:px-8 py-8">
        {/* 검색창 */}
        <div className="relative max-w-lg mb-2">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#86868b]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="담당자 이름 또는 지역명으로 검색하세요"
            className="w-full pl-11 pr-10 py-3.5 bg-white border border-black/10 rounded-2xl text-[14px] text-[#1d1d1f] placeholder-[#86868b] focus:outline-none focus:ring-2 focus:ring-[#00A39B]/30 focus:border-[#00A39B] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#86868b] hover:text-[#1d1d1f] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* 결과 건수 */}
        <p className="text-[12px] text-[#86868b] mb-6">
          {searchQuery ? (
            <>
              <span className="text-[#00A39B] font-semibold">"{searchQuery}"</span> 검색 결과{" "}
              <span className="font-semibold text-[#1d1d1f]">{filtered.length}명</span>
            </>
          ) : (
            <>전체 <span className="font-semibold text-[#1d1d1f]">{NAMECARD_DATA.length}명</span></>
          )}
        </p>

        {/* 명함 갤러리 그리드 */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <Search className="w-12 h-12 text-[#d2d2d7] mx-auto mb-3" />
            <p className="text-[15px] font-medium text-[#86868b]">검색 결과가 없습니다</p>
            <p className="text-[13px] text-[#86868b] mt-1">다른 이름이나 지역명을 입력해보세요</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filtered.map((card, idx) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03, duration: 0.35 }}
                className="bg-white rounded-2xl overflow-hidden border border-black/5 hover:shadow-md transition-shadow"
              >
                {/* 명함 섬네일 */}
                <div className="aspect-[16/9] bg-[#f5f5f7] overflow-hidden">
                  <img
                    src={card.image}
                    alt={`${card.center} ${card.name} 명함`}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* 카드 정보 */}
                <div className="p-3">
                  <p className="text-[11px] text-[#86868b] leading-tight mb-0.5 line-clamp-1">{card.center}</p>
                  <p className="text-[14px] font-bold text-[#1d1d1f] mb-2">{card.name}</p>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3 h-3 text-[#86868b] shrink-0" />
                      <a href={`tel:${card.tel}`} className="text-[11px] text-[#424245] hover:text-[#00A39B] transition-colors">
                        {card.tel}
                      </a>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Smartphone className="w-3 h-3 text-[#86868b] shrink-0" />
                      <a href={`tel:${card.mobile}`} className="text-[11px] text-[#424245] hover:text-[#00A39B] transition-colors">
                        {card.mobile}
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
