/**
 * 카테고리 데이터 — Layout, Home, CategoryPage에서 공유
 * 메뉴 구조: 명함 / 스티커 / 일반서식 / 홍보물 / 캘린더 / 표지판 / 실사출력 / 소량인쇄
 */

export interface SubCategory {
  id: string;
  name: string;
  badge?: string;
}

export interface Category {
  id: string;
  name: string;
  sub: SubCategory[];
}

export const categories: Category[] = [
  {
    id: "namecard",
    name: "명함",
    sub: [
      { id: "namecard-standard", name: "표준명함 (90×50mm)" },
      { id: "namecard-regional", name: "우리 보건소 명함" },
    ],
  },
  {
    id: "sticker",
    name: "스티커",
    sub: [
      { id: "sticker-general", name: "일반지 스티커" },
      { id: "sticker-special", name: "특수지 스티커" },
      { id: "sticker-label", name: "라벨 스티커" },
      { id: "sticker-transparent", name: "투명 스티커" },
    ],
  },
  {
    id: "form",
    name: "일반서식",
    sub: [
      { id: "form-envelope-large", name: "대봉투" },
      { id: "form-envelope-small", name: "소봉투" },
      { id: "form-envelope-medium", name: "중봉투" },
      { id: "form-notepad", name: "메모지·노트" },
      { id: "form-receipt", name: "영수증·전표" },
      { id: "form-certificate", name: "증명서·서류" },
    ],
  },
  {
    id: "promo",
    name: "홍보물",
    sub: [
      { id: "promo-poster", name: "포스터" },
      { id: "promo-leaflet", name: "전단지·리플렛" },
      { id: "promo-brochure", name: "브로슈어·카탈로그" },
      { id: "promo-banner", name: "현수막·배너" },
      { id: "promo-gift", name: "기념품·판촉물" },
      { id: "promo-bag", name: "쇼핑백" },
    ],
  },
  {
    id: "calendar",
    name: "캘린더",
    sub: [
      { id: "calendar-desk", name: "탁상용 캘린더" },
      { id: "calendar-wall", name: "벽걸이 캘린더" },
      { id: "calendar-pocket", name: "포켓 다이어리" },
      { id: "calendar-planner", name: "플래너" },
    ],
  },
  {
    id: "signage",
    name: "표지판",
    sub: [
      { id: "signage-park", name: "공원용 금연표지판" },
      { id: "signage-door", name: "안내판" },
      { id: "signage-floor", name: "바닥 표지" },
      { id: "signage-wall", name: "벽부착 표지판" },
      { id: "signage-acrylic", name: "아크릴 표지판" },
      { id: "signage-outdoor", name: "야외용 표지판" },
    ],
  },
  {
    id: "largeformat",
    name: "실사출력",
    sub: [
      { id: "largeformat-banner", name: "현수막" },
      { id: "largeformat-xbanner", name: "X배너·롤업" },
      { id: "largeformat-foam", name: "폼보드·스티로폼" },
      { id: "largeformat-canvas", name: "캔버스 출력" },
      { id: "largeformat-vinyl", name: "비닐 현수막" },
    ],
  },
  {
    id: "digital",
    name: "소량인쇄",
    sub: [
      { id: "digital-leaflet", name: "전단지" },
      { id: "digital-poster", name: "포스터" },
      { id: "digital-leaflet2", name: "리플렛" },
      { id: "digital-catalog", name: "카탈로그" },
      { id: "digital-booklet", name: "소책자" },
      { id: "digital-postcard", name: "엽서·카드" },
    ],
  },
];
