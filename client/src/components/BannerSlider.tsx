/*
 * BannerSlider — 크로스페이드 전환 방식
 * - 슬라이드가 자연스럽게 페이드인/아웃으로 전환
 * - 끊김 없는 무한 루프
 * - 데스크탑: 21:4.5 비율의 70% (약 15%), 모바일: 4:3 비율의 70% (약 52.5%)
 * - 하단 도트 인디케이터, 좌우 화살표, 자동 슬라이딩, 터치 스와이프 지원
 * - textContent: 이미지 대신 텍스트로 슬라이드 내용 표시 지원
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface BannerSlideTextContent {
  badge?: string;          // 예: "OPEN", "NEW"
  badgeColor?: string;     // 배지 배경색 (기본: #1d1d1f)
  line1?: string;          // 첫 번째 줄 (일반 굵기)
  line2?: string;          // 두 번째 줄 (볼드)
  line3?: string;          // 세 번째 줄 (설명)
  bgColor?: string;        // 슬라이드 배경색
}

export interface BannerSlide {
  id: string;
  image?: string;
  mobileImage?: string;
  bgImage?: string;  // 텍스트 슬라이드의 배경 이미지
  title?: string;
  subtitle?: string;
  link?: string;
  textContent?: BannerSlideTextContent;  // 이미지 대신 텍스트로 표시
}

interface BannerSliderProps {
  slides: BannerSlide[];
  autoPlayInterval?: number;
  className?: string;
  fullWidth?: boolean;
}

export default function BannerSlider({
  slides,
  autoPlayInterval = 3500,
  className = "",
  fullWidth = false,
}: BannerSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState<number | null>(null);
  const [isFading, setIsFading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isAnimating = useRef(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const goTo = useCallback((index: number) => {
    if (isAnimating.current || index === currentIndex) return;
    isAnimating.current = true;
    setPrevIndex(currentIndex);
    setCurrentIndex(index);
    setIsFading(true);
    setTimeout(() => {
      setPrevIndex(null);
      setIsFading(false);
      isAnimating.current = false;
    }, 400);
  }, [currentIndex]);

  const goNext = useCallback(() => {
    goTo((currentIndex + 1) % slides.length);
  }, [currentIndex, slides.length, goTo]);

  const goPrev = useCallback(() => {
    goTo((currentIndex - 1 + slides.length) % slides.length);
  }, [currentIndex, slides.length, goTo]);

  // 자동 슬라이딩
  useEffect(() => {
    if (autoPlayInterval <= 0 || slides.length <= 1) return;
    autoPlayRef.current = setInterval(goNext, autoPlayInterval);
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [goNext, autoPlayInterval, slides.length]);

  // 터치 스와이프
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goNext();
      else goPrev();
    }
  };

  if (!slides.length) return null;

  const sliderHeight = isMobile ? '200px' : '250px';

  // 텍스트 슬라이드 렌더링
  const renderTextSlide = (slide: BannerSlide) => {
    const tc = slide.textContent!;
    return (
      <div
        style={{
          width: "100%",
          height: '250px',
          backgroundColor: tc.bgColor || "#e8edf2",
          display: "flex",
          alignItems: "center",
          padding: isMobile ? "0 20px" : "0 40px",
          boxSizing: "border-box",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* 배경 이미지 (우측에 자연스럽게 배치) */}
        {slide.bgImage && (
          <img
            src={slide.bgImage}
            alt=""
            aria-hidden="true"
            style={{
              position: "absolute",
              right: 0,
              top: 0,
              height: "100%",
              width: "auto",
              objectFit: "cover",
              objectPosition: "right center",
              pointerEvents: "none",
              userSelect: "none",
            }}
          />
        )}
        <div style={{ maxWidth: isMobile ? "100%" : "60%", marginLeft: isMobile ? 0 : '62px', paddingLeft: isMobile ? 0 : '31px', position: "relative", zIndex: 1 }}>
          {tc.badge && (
            <div
              style={{
                display: "inline-block",
                backgroundColor: tc.badgeColor || "#1d1d1f",
                color: "#fff",
                fontSize: isMobile ? 10 : 12,
                fontWeight: 700,
                padding: isMobile ? "2px 8px" : "3px 10px",
                borderRadius: 4,
                marginBottom: isMobile ? 8 : 12,
                letterSpacing: "0.05em",
              }}
            >
              {tc.badge}
            </div>
          )}
          {tc.line1 && (
            <div
              style={{
                fontSize: isMobile ? 14 : 18,
                fontWeight: 400,
                color: "#1d1d1f",
                lineHeight: 1.4,
                marginBottom: isMobile ? 4 : 6,
                fontFamily: "'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif",
              }}
            >
              {tc.line1}
            </div>
          )}
          {tc.line2 && (
            <div
              style={{
                fontSize: isMobile ? 18 : 26,
                fontWeight: 800,
                color: "#1d1d1f",
                lineHeight: 1.3,
                marginBottom: isMobile ? 8 : 12,
                fontFamily: "'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif",
                letterSpacing: "-0.02em",
              }}
            >
              {tc.line2}
            </div>
          )}
          {tc.line3 && (
            <div
              style={{
                fontSize: isMobile ? 12 : 15,
                fontWeight: 400,
                color: "#6e6e73",
                lineHeight: 1.5,
                fontFamily: "'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif",
              }}
            >
              {tc.line3}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      className={`relative select-none overflow-hidden ${fullWidth ? "w-full" : ""} ${className}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* 높이 고정 컨테이너 */}
      <div style={{ height: sliderHeight, position: "relative" }}>

        {/* 이전 슬라이드 (페이드아웃) */}
        {prevIndex !== null && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 1,
            opacity: isFading ? 0 : 1,
            transition: "opacity 0.4s ease-in-out",
            }}
          >
            {slides[prevIndex].textContent ? (
              renderTextSlide(slides[prevIndex])
            ) : (
              <img
                src={isMobile && slides[prevIndex].mobileImage ? slides[prevIndex].mobileImage : slides[prevIndex].image}
                alt={slides[prevIndex].title || ""}
                style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block" }}
              />
            )}
          </div>
        )}

        {/* 현재 슬라이드 (페이드인) */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 2,
            opacity: isFading ? 1 : 1,
            transition: "opacity 0.7s ease-in-out",
          }}
        >
          {slides.map((slide, i) => {
            const imgSrc = isMobile && slide.mobileImage ? slide.mobileImage : slide.image;
            return (
              <div
                key={slide.id}
                style={{
                  position: "absolute",
                  inset: 0,
                  opacity: i === currentIndex ? 1 : 0,
                  transition: "opacity 0.4s ease-in-out",
                  zIndex: i === currentIndex ? 2 : 1,
                }}
              >
                {slide.textContent ? (
                  renderTextSlide(slide)
                ) : (
                  <img
                    src={imgSrc}
                    alt={slide.title || ""}
                    style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block" }}
                    loading={i === 0 ? "eager" : "lazy"}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* 슬라이드 카운터 */}
        <div
          style={{
            position: "absolute",
            bottom: 10,
            right: 12,
            background: "rgba(0,0,0,0.45)",
            color: "#fff",
            fontSize: 12,
            fontWeight: 600,
            padding: "2px 8px",
            borderRadius: 20,
            zIndex: 20,
            letterSpacing: "0.05em",
          }}
        >
          {currentIndex + 1} / {slides.length}
        </div>

        {/* 이전 버튼 */}
        <button
          onClick={goPrev}
          aria-label="이전"
          style={{
            position: "absolute",
            left: 12,
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 20,
            background: "rgba(255,255,255,0.85)",
            border: "none",
            borderRadius: "50%",
            width: 36,
            height: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
          }}
        >
          <ChevronLeft size={18} color="#1d1d1f" />
        </button>

        {/* 다음 버튼 */}
        <button
          onClick={goNext}
          aria-label="다음"
          style={{
            position: "absolute",
            right: 12,
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 20,
            background: "rgba(255,255,255,0.85)",
            border: "none",
            borderRadius: "50%",
            width: 36,
            height: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
          }}
        >
          <ChevronRight size={18} color="#1d1d1f" />
        </button>
        {/* 도트 인디케이터 - 슬라이더 내부 하단 중앙 */}
        <div
          style={{
            position: "absolute",
            bottom: 12,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 6,
            zIndex: 20,
          }}
        >
          {slides.map((_, i) => (
            <button
              key={i}
              aria-label={`슬라이드 ${i + 1}`}
              onClick={() => goTo(i)}
              style={{
                border: "none",
                cursor: "pointer",
                padding: 0,
                background: i === currentIndex ? "#00A39B" : "rgba(0,0,0,0.25)",
                borderRadius: 9999,
                width: i === currentIndex ? 20 : 8,
                height: 8,
                transition: "all 0.3s ease",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
