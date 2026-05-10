/*
 * Design: "Clean Canvas" — Apple Store Style White Canvas
 * - Glass navigation bar with backdrop-blur
 * - Warm white background (#FBFBFD)
 * - Apple Blue (#00A39B) accent for CTAs
 * - Noto Sans KR typography, SF Pro-inspired sizing
 * - Generous whitespace, product-first approach
 */

import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { loginState } from "../pages/Intro";
import { motion, AnimatePresence } from "framer-motion";
import {
  Phone,
  Mail,
  MapPin,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";

import { categories } from "@/data/categories";

import BackButton from "./BackButton";

// categories는 @/data/categories.ts에서 import됨

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedMobile, setExpandedMobile] = useState<string | null>(null);
  const [location, setLocation] = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setExpandedMobile(null);
  }, [location]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "glass-nav border-b border-black/5 shadow-sm"
          : "bg-white"
      }`}
    >
      {/* Top Utility Bar */}
      <div className="hidden md:block border-b border-black/5 bg-[#f5f5f7]">
        <div className="w-[90%] mx-auto">
          <div className="flex items-center justify-between h-9">
            <div className="flex items-center gap-1">
              <Link
                href="/about"
                className="px-2.5 py-1 text-[12px] text-[#424245] hover:text-[#00A39B] transition-colors"
              >
                회사소개
              </Link>
              <span className="text-[#d2d2d7] text-[11px]">|</span>
              <Link
                href="/portfolio"
                className="px-2.5 py-1 text-[12px] text-[#424245] hover:text-[#00A39B] transition-colors"
              >
                포트폴리오
              </Link>
            </div>
            <div className="flex items-center gap-1">
              <Link
                href="/order-history"
                className="px-2.5 py-1 text-[12px] text-[#424245] hover:text-[#00A39B] transition-colors"
              >
                주문 이력
              </Link>
              <span className="text-[#d2d2d7] text-[11px]">|</span>
              <Link
                href="/customer-service"
                className="px-2.5 py-1 text-[12px] text-[#424245] hover:text-[#00A39B] transition-colors"
              >
                고객센터
              </Link>
              <span className="text-[#d2d2d7] text-[11px]">|</span>
              <Link
                href="/membership"
                className="px-2.5 py-1 text-[12px] text-[#424245] hover:text-[#00A39B] transition-colors"
              >
                멤버십 안내
              </Link>
              <span className="text-[#d2d2d7] text-[11px]">|</span>
              {loginState.isLoggedIn ? (
                <>
                  <span className="text-[12px] text-[#86868b] truncate max-w-[120px]">{loginState.center?.name}</span>
                  <span className="text-[#d2d2d7] text-[11px]">|</span>
                  <Link
                    href="/dashboard"
                    className="px-2.5 py-1 text-[12px] text-[#00A39B] font-medium hover:underline transition-colors"
                  >
                    내 대시보드
                  </Link>
                  <span className="text-[#d2d2d7] text-[11px]">|</span>
                  <button
                    onClick={() => {
                      loginState.isLoggedIn = false;
                      loginState.center = null;
                      loginState.user = null;
                      import("sonner").then(({ toast }) => toast.success("로그아웃 되었습니다."));
                      setLocation("/");
                    }}
                    className="px-2.5 py-1 text-[12px] text-[#86868b] hover:text-red-500 transition-colors"
                  >
                    로그아웃
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/intro"
                    className="px-3 py-1 text-[13px] font-medium text-[#1d1d1f] hover:text-[#00A39B] transition-colors"
                  >
                    보건소 로그인
                  </Link>
                  <span className="text-[#c7c7cc] text-[12px]">|</span>
                  <Link
                    href="/register"
                    className="px-3 py-1 text-[13px] font-bold text-white bg-[#00A39B] hover:bg-[#0055b3] rounded-md transition-colors"
                  >
                    등록 요청
                  </Link>

                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <nav className="w-[90%] mx-auto">
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Logo */}
          <div className="flex items-center gap-3 shrink-0">
          <Link href="/dashboard" className="flex items-center shrink-0">
            <img
              src="https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/bogunsoplus-logo-600_617d837b.png"
              alt="보건소플러스"
              className="w-auto object-contain" style={{height: '28px', width: '115px', marginBottom: '9px', marginLeft: '1px'}}
            />
          </Link>
          </div>

          {/* Desktop Navigation - 상위 카테고리 링크 (서브 메뉴 드롭다운 없이 단순 링크) */}
          <div className="hidden lg:flex items-center gap-1">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/category/${cat.id}`}
                className="px-3 py-2 text-[13px] font-medium text-[#1d1d1f] hover:text-[#00A39B] transition-all duration-150 rounded-full border border-transparent hover:border-[#1d1d1f]/25 whitespace-nowrap"
              >
                {cat.name}
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/custom-order"
              className="hidden md:inline-flex items-center gap-1.5 px-4 py-2 bg-[#00A39B] text-white text-[13px] font-medium rounded-full hover:bg-[#0055AA] transition-colors"
            >
              주문제작
            </Link>


            {/* Mobile Menu Toggle */}
            <button
              className="lg:hidden flex items-center justify-center w-9 h-9 rounded-full hover:bg-[#f5f5f7] transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? (
                <X className="w-5 h-5 text-[#1d1d1f]" />
              ) : (
                <Menu className="w-5 h-5 text-[#1d1d1f]" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="lg:hidden bg-white/95 backdrop-blur-xl border-t border-black/5 overflow-hidden"
          >
            <div className="max-w-[1200px] mx-auto px-5 py-4 space-y-0.5">
              {categories.map((cat) => {
                const isExpanded = expandedMobile === cat.id;
                return (
                  <div key={cat.id} className="rounded-xl overflow-hidden">
                    {/* 카테고리 헤더 행 */}
                    <div className="flex items-center">
                      <Link
                        href={`/category/${cat.id}`}
                        className="flex-1 px-3 py-2.5 text-[15px] font-medium text-[#1d1d1f] hover:text-[#00A39B] transition-colors"
                      >
                        {cat.name}
                      </Link>
                      {cat.sub.length > 0 && (
                        <button
                          onClick={() =>
                            setExpandedMobile(isExpanded ? null : cat.id)
                          }
                          className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-[#f5f5f7] transition-colors"
                          aria-label={isExpanded ? "서브메뉴 닫기" : "서브메뉴 열기"}
                        >
                          <ChevronDown
                            className={`w-4 h-4 text-[#86868b] transition-transform duration-200 ${
                              isExpanded ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                      )}
                    </div>

                    {/* 서브메뉴 아코디언 */}
                    <AnimatePresence initial={false}>
                      {isExpanded && cat.sub.length > 0 && (
                        <motion.div
                          key="submenu"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2, ease: "easeInOut" }}
                          className="overflow-hidden bg-[#f5f5f7] rounded-xl mx-1 mb-1"
                        >
                          <div className="py-1.5 px-1">
                            {cat.id === "80" ? (
                              <div className="grid grid-cols-3 gap-0.5">
                                {cat.sub.map((sub) => (
                                  <Link
                                    key={sub.id}
                                    href={`/category/${sub.id}`}
                                    className="block px-3 py-1.5 text-[13px] text-[#424245] hover:text-[#00A39B] rounded-lg transition-colors"
                                  >
                                    {sub.name}
                                  </Link>
                                ))}
                              </div>
                            ) : (
                              <div className="grid grid-cols-2 gap-0.5">
                                {cat.sub.map((sub) => (
                                  <Link
                                    key={sub.id}
                                    href={`/category/${sub.id}`}
                                    className="block px-3 py-2 text-[13px] text-[#424245] hover:text-[#00A39B] rounded-lg transition-colors"
                                  >
                                    {sub.name}
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}

              {/* 유틸리티 링크 */}
              <div className="pt-3 border-t border-black/5 space-y-1">
                <div className="flex items-center gap-2 flex-wrap pb-1">
                  <Link
                    href="/intro"
                    className="px-3 py-1.5 text-[13px] text-[#424245] hover:text-[#00A39B] rounded-lg transition-colors"
                  >
                    보건소 로그인
                  </Link>
                  <Link
                    href="/customer-service"
                    className="px-3 py-1.5 text-[13px] text-[#424245] hover:text-[#00A39B] rounded-lg transition-colors"
                  >
                    고객센터
                  </Link>
                  <Link
                    href="/portfolio"
                    className="px-3 py-1.5 text-[13px] text-[#424245] hover:text-[#00A39B] rounded-lg transition-colors"
                  >
                    포트폴리오
                  </Link>
                  <Link
                    href="/register"
                    className="px-3 py-1.5 text-[13px] font-semibold text-[#00A39B] hover:underline rounded-lg transition-colors"
                  >
                    등록 요청
                  </Link>

                </div>
                <Link
                  href="/custom-order"
                  className="flex items-center justify-center px-4 py-2.5 bg-[#00A39B] text-white text-[14px] font-medium rounded-full hover:bg-[#0055AA] transition-colors"
                >
                  주문제작
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function Footer() {
  return (
    <footer className="bg-[#f5f5f7] border-t border-black/5">
      {/* 직접생산확인증명서 취득 업체 정보 바 */}
      <div className="bg-[#EBF3FB] border-b border-[#C7DCF0]">
        <div className="max-w-[1200px] mx-auto px-5 md:px-8 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 text-[12px] font-semibold text-[#0055AA]">
              <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 1L10.163 5.279L15 6.09L11.5 9.521L12.326 14.5L8 12.279L3.674 14.5L4.5 9.521L1 6.09L5.837 5.279L8 1Z" fill="#00A39B" stroke="#00A39B" strokeWidth="1" strokeLinejoin="round"/>
              </svg>
              직접생산확인증명서 취득 업체
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {["명함·인쇄물", "캘린더·다이어리", "홍보물·부착물"].map((item) => (
                <span key={item} className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#00A39B] text-white text-[11px] font-medium rounded-full">
                  <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none"><path d="M2 6L5 9L10 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  {item}
                </span>
              ))}
            </div>
          </div>
          <span className="text-[11px] text-[#5B9BD5] whitespace-nowrap">
            중소기업 직접생산 확인 기준 · 조달청 등록
          </span>
        </div>
      </div>

      {/* Top Footer */}
      <div className="max-w-[1200px] mx-auto px-5 md:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center mb-3">
              <img
                src="https://d2xsxph8kpxj0f.cloudfront.net/310519663165221107/KuVVVm8PHrrw4NJEJVshEp/bogunsoplus-logo-600_617d837b.png"
                alt="보건소플러스"
                className="w-auto object-contain" style={{height: '35px'}}
              />
            </div>
            <p className="text-[13px] text-[#86868b] leading-relaxed">
              보건소 및 공공기관을 위한
              <br />
              프리미엄 인쇄물 전문 제작 서비스
            </p>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-[13px] font-semibold text-[#1d1d1f] mb-4 tracking-wide uppercase">
              상품 카테고리
            </h4>
            <ul className="space-y-2.5">
              {categories.slice(0, 4).map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/category/${cat.id}`}
                    className="text-[13px] text-[#424245] hover:text-[#00A39B] transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[13px] font-semibold text-[#1d1d1f] mb-4 tracking-wide uppercase">
              더 보기
            </h4>
            <ul className="space-y-2.5">
              {categories.slice(4).map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/category/${cat.id}`}
                    className="text-[13px] text-[#424245] hover:text-[#00A39B] transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/custom-order"
                  className="text-[13px] text-[#424245] hover:text-[#00A39B] transition-colors"
                >
                  주문제작
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-[13px] font-semibold text-[#1d1d1f] mb-4 tracking-wide uppercase">
              고객센터
            </h4>
            <div className="space-y-3">
              <a
                href="tel:15226401"
                className="flex items-center gap-2.5 text-[#424245] hover:text-[#00A39B] transition-colors"
              >
                <Phone className="w-4 h-4 text-[#86868b]" />
                <span className="text-[16px] font-bold" style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif", fontVariantNumeric: "tabular-nums" }}>1522-6401</span>
              </a>
              <a
                href="mailto:wellcomplus@wellcomplus.com"
                className="flex items-center gap-2.5 text-[13px] text-[#424245] hover:text-[#00A39B] transition-colors"
              >
                <Mail className="w-4 h-4 text-[#86868b]" />
                wellcomplus@wellcomplus.com
              </a>
              <div className="flex items-start gap-2.5 text-[13px] text-[#424245]">
                <MapPin className="w-4 h-4 text-[#86868b] mt-0.5 shrink-0" />
                <span>
                  인천광역시 연수구 송도과학로 70,
                  <br />
                  업무동 1309호
                </span>
              </div>
              <p className="text-[12px] text-[#86868b] mt-2">
                평일 09:00 - 18:00 | 토·일·공휴일 휴무
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-black/5">
        <div className="max-w-[1200px] mx-auto px-5 md:px-8 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-2">
            <p className="text-[11px] text-[#86868b]">
              Copyright © 2026 보건소플러스. All rights reserved.
            </p>
            <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#86868b]">
              <Link href="/membership#terms" className="hover:text-[#00A39B] transition-colors underline-offset-2 hover:underline">
                이용약관
              </Link>
              <span className="text-[#d2d2d7]">|</span>
              <Link href="/membership#privacy" className="font-medium hover:text-[#00A39B] transition-colors underline-offset-2 hover:underline">
                개인정보 취급방침
              </Link>
              <span className="text-[#d2d2d7]">|</span>
              <span>대표: 최주희</span>
              <span className="text-[#d2d2d7]">|</span>
              <span>사업자등록번호: 121-14-08776</span>
              <span className="text-[#d2d2d7]">|</span>
              <span>통신판매업신고: 2018-인천연수구-0950</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-14 md:pt-[100px]">{children}</main>
      <Footer />
    </div>
  );
}
