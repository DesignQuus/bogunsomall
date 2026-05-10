/**
 * 보건소플러스 표준 템플릿 데이터
 * - 명함, 스티커, 부착물, 기념품 등
 */

import { StandardTemplate } from "@/types/order";

// ─── 명함 템플릿 ───────────────────────────────────────────
export const namecardTemplates: StandardTemplate[] = [
  {
    id: "namecard_blue_001",
    productType: "namecard",
    name: "표준명함 - 블루 디자인",
    description: "전문적이고 신뢰감 있는 블루 컬러 명함",
    preview: "https://images.unsplash.com/photo-1611532736579-6b16e2b50449?w=400&h=250&fit=crop&q=80",
    designOptions: [
      {
        id: "namecard_blue_standard",
        type: "standard",
        label: "표준 명함",
        description: "보건소플러스 기본 디자인",
      },
      {
        id: "namecard_blue_custom",
        type: "custom",
        label: "기존 명함 동일 디자인",
        description: "보유 중인 명함 이미지 업로드",
      },
    ],
    fields: [
      {
        key: "name",
        label: "이름",
        type: "text",
        required: true,
        maxLength: 20,
        placeholder: "홍길동",
      },
      {
        key: "title",
        label: "직책",
        type: "text",
        required: true,
        maxLength: 15,
        placeholder: "과장",
      },
      {
        key: "department",
        label: "부서명",
        type: "text",
        required: true,
        maxLength: 30,
        placeholder: "건강증진과",
      },
      {
        key: "phone",
        label: "연락처",
        type: "phone",
        required: true,
        placeholder: "010-1234-5678",
      },
      {
        key: "email",
        label: "이메일",
        type: "email",
        required: false,
        placeholder: "hong@example.com",
      },
      {
        key: "extension",
        label: "확장번호",
        type: "text",
        required: false,
        maxLength: 5,
        placeholder: "123",
      },
    ],
    defaultQuantity: 500,
  },
  {
    id: "namecard_green_001",
    productType: "namecard",
    name: "표준명함 - 그린 디자인",
    description: "건강하고 신선한 이미지의 그린 컬러 명함",
    preview: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&h=250&fit=crop&q=80",
    designOptions: [
      {
        id: "namecard_green_standard",
        type: "standard",
        label: "표준 명함",
        description: "보건소플러스 기본 디자인",
      },
      {
        id: "namecard_green_custom",
        type: "custom",
        label: "기존 명함 동일 디자인",
        description: "보유 중인 명함 이미지 업로드",
      },
    ],
    fields: [
      {
        key: "name",
        label: "이름",
        type: "text",
        required: true,
        maxLength: 20,
        placeholder: "홍길동",
      },
      {
        key: "title",
        label: "직책",
        type: "text",
        required: true,
        maxLength: 15,
        placeholder: "과장",
      },
      {
        key: "department",
        label: "부서명",
        type: "text",
        required: true,
        maxLength: 30,
        placeholder: "건강증진과",
      },
      {
        key: "phone",
        label: "연락처",
        type: "phone",
        required: true,
        placeholder: "010-1234-5678",
      },
      {
        key: "email",
        label: "이메일",
        type: "email",
        required: false,
        placeholder: "hong@example.com",
      },
      {
        key: "extension",
        label: "확장번호",
        type: "text",
        required: false,
        maxLength: 5,
        placeholder: "123",
      },
    ],
    defaultQuantity: 500,
  },
  {
    id: "namecard_red_001",
    productType: "namecard",
    name: "표준명함 - 레드 디자인",
    description: "강렬하고 활동적인 레드 컬러 명함",
    preview: "https://images.unsplash.com/photo-1611532736579-6b16e2b50449?w=400&h=250&fit=crop&q=80",
    designOptions: [
      {
        id: "namecard_red_standard",
        type: "standard",
        label: "표준 명함",
        description: "보건소플러스 기본 디자인",
      },
      {
        id: "namecard_red_custom",
        type: "custom",
        label: "기존 명함 동일 디자인",
        description: "보유 중인 명함 이미지 업로드",
      },
    ],
    fields: [
      {
        key: "name",
        label: "이름",
        type: "text",
        required: true,
        maxLength: 20,
        placeholder: "홍길동",
      },
      {
        key: "title",
        label: "직책",
        type: "text",
        required: true,
        maxLength: 15,
        placeholder: "과장",
      },
      {
        key: "department",
        label: "부서명",
        type: "text",
        required: true,
        maxLength: 30,
        placeholder: "건강증진과",
      },
      {
        key: "phone",
        label: "연락처",
        type: "phone",
        required: true,
        placeholder: "010-1234-5678",
      },
      {
        key: "email",
        label: "이메일",
        type: "email",
        required: false,
        placeholder: "hong@example.com",
      },
      {
        key: "extension",
        label: "확장번호",
        type: "text",
        required: false,
        maxLength: 5,
        placeholder: "123",
      },
    ],
    defaultQuantity: 500,
  },
];

// ─── 스티커 템플릿 ───────────────────────────────────────────
export const stickerTemplates: StandardTemplate[] = [
  {
    id: "sticker_round_001",
    productType: "sticker",
    name: "원형 스티커",
    description: "원형 디자인의 다목적 스티커",
    preview: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=400&h=250&fit=crop&q=80",
    designOptions: [
      {
        id: "sticker_round_standard",
        type: "standard",
        label: "표준 스티커",
        description: "텍스트 커스터마이징 가능",
      },
      {
        id: "sticker_round_custom",
        type: "custom",
        label: "기존 디자인 동일 제작",
        description: "기존 스티커 이미지 업로드",
      },
    ],
    fields: [
      {
        key: "text1",
        label: "텍스트 1줄",
        type: "text",
        required: true,
        maxLength: 20,
        placeholder: "금연 성공!",
      },
      {
        key: "text2",
        label: "텍스트 2줄 (선택)",
        type: "text",
        required: false,
        maxLength: 20,
        placeholder: "축하합니다",
      },
      {
        key: "size",
        label: "사이즈",
        type: "select",
        required: true,
        options: [
          { label: "30mm", value: "30mm" },
          { label: "50mm", value: "50mm" },
          { label: "70mm", value: "70mm" },
        ],
      },
    ],
    defaultQuantity: 1000,
  },
  {
    id: "sticker_square_001",
    productType: "sticker",
    name: "사각형 스티커",
    description: "사각형 디자인의 스티커",
    preview: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=400&h=250&fit=crop&q=80",
    designOptions: [
      {
        id: "sticker_square_standard",
        type: "standard",
        label: "표준 스티커",
        description: "텍스트 커스터마이징 가능",
      },
      {
        id: "sticker_square_custom",
        type: "custom",
        label: "기존 디자인 동일 제작",
        description: "기존 스티커 이미지 업로드",
      },
    ],
    fields: [
      {
        key: "text1",
        label: "텍스트 1줄",
        type: "text",
        required: true,
        maxLength: 20,
        placeholder: "예방접종 안내",
      },
      {
        key: "text2",
        label: "텍스트 2줄 (선택)",
        type: "text",
        required: false,
        maxLength: 20,
        placeholder: "정기 검진",
      },
      {
        key: "size",
        label: "사이즈",
        type: "select",
        required: true,
        options: [
          { label: "50×50mm", value: "50x50" },
          { label: "70×70mm", value: "70x70" },
          { label: "100×100mm", value: "100x100" },
        ],
      },
    ],
    defaultQuantity: 1000,
  },
];

// ─── 부착물 템플릿 ───────────────────────────────────────────
export const labelTemplates: StandardTemplate[] = [
  {
    id: "label_small_001",
    productType: "label",
    name: "소형 부착물",
    description: "소형 사이즈 부착물",
    preview: "https://images.unsplash.com/photo-1611532736579-6b16e2b50449?w=400&h=250&fit=crop&q=80",
    designOptions: [
      {
        id: "label_small_standard",
        type: "standard",
        label: "표준 부착물",
        description: "텍스트 커스터마이징 가능",
      },
      {
        id: "label_small_custom",
        type: "custom",
        label: "기존 디자인 동일 제작",
        description: "기존 부착물 이미지 업로드",
      },
    ],
    fields: [
      {
        key: "text",
        label: "텍스트",
        type: "textarea",
        required: true,
        maxLength: 100,
        placeholder: "부착물 텍스트 입력",
      },
      {
        key: "size",
        label: "사이즈",
        type: "select",
        required: true,
        options: [
          { label: "50×50mm", value: "50x50" },
          { label: "70×70mm", value: "70x70" },
        ],
      },
    ],
    defaultQuantity: 500,
  },
  {
    id: "label_large_001",
    productType: "label",
    name: "대형 부착물",
    description: "대형 사이즈 부착물",
    preview: "https://images.unsplash.com/photo-1611532736579-6b16e2b50449?w=400&h=250&fit=crop&q=80",
    designOptions: [
      {
        id: "label_large_standard",
        type: "standard",
        label: "표준 부착물",
        description: "텍스트 커스터마이징 가능",
      },
      {
        id: "label_large_custom",
        type: "custom",
        label: "기존 디자인 동일 제작",
        description: "기존 부착물 이미지 업로드",
      },
    ],
    fields: [
      {
        key: "text",
        label: "텍스트",
        type: "textarea",
        required: true,
        maxLength: 100,
        placeholder: "부착물 텍스트 입력",
      },
      {
        key: "size",
        label: "사이즈",
        type: "select",
        required: true,
        options: [
          { label: "100×100mm", value: "100x100" },
          { label: "150×150mm", value: "150x150" },
        ],
      },
    ],
    defaultQuantity: 300,
  },
];

// ─── 기념품 템플릿 ───────────────────────────────────────────
export const merchandiseTemplates: StandardTemplate[] = [
  {
    id: "merchandise_tshirt_001",
    productType: "merchandise",
    name: "기념 티셔츠",
    description: "기념품용 티셔츠",
    preview: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=250&fit=crop&q=80",
    designOptions: [
      {
        id: "merchandise_tshirt_standard",
        type: "standard",
        label: "표준 기념품",
        description: "이름, 부서명 인쇄",
      },
      {
        id: "merchandise_tshirt_custom",
        type: "custom",
        label: "기존 디자인 동일 제작",
        description: "기존 기념품 이미지 업로드",
      },
    ],
    fields: [
      {
        key: "name",
        label: "이름",
        type: "text",
        required: true,
        maxLength: 20,
        placeholder: "홍길동",
      },
      {
        key: "department",
        label: "부서명",
        type: "text",
        required: false,
        maxLength: 30,
        placeholder: "건강증진과",
      },
      {
        key: "size",
        label: "사이즈",
        type: "select",
        required: true,
        options: [
          { label: "S", value: "S" },
          { label: "M", value: "M" },
          { label: "L", value: "L" },
          { label: "XL", value: "XL" },
        ],
      },
    ],
    defaultQuantity: 50,
  },
  {
    id: "merchandise_mug_001",
    productType: "merchandise",
    name: "기념 머그컵",
    description: "기념품용 머그컵",
    preview: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=250&fit=crop&q=80",
    designOptions: [
      {
        id: "merchandise_mug_standard",
        type: "standard",
        label: "표준 기념품",
        description: "이름, 부서명 인쇄",
      },
      {
        id: "merchandise_mug_custom",
        type: "custom",
        label: "기존 디자인 동일 제작",
        description: "기존 기념품 이미지 업로드",
      },
    ],
    fields: [
      {
        key: "name",
        label: "이름",
        type: "text",
        required: true,
        maxLength: 20,
        placeholder: "홍길동",
      },
      {
        key: "department",
        label: "부서명",
        type: "text",
        required: false,
        maxLength: 30,
        placeholder: "건강증진과",
      },
    ],
    defaultQuantity: 100,
  },
];

// ─── 모든 템플릿 통합 ──────────────────────────────────────
export const allTemplates: StandardTemplate[] = [
  ...namecardTemplates,
  ...stickerTemplates,
  ...labelTemplates,
  ...merchandiseTemplates,
];

// ─── 템플릿 조회 함수 ──────────────────────────────────────
export function getTemplatesByProduct(productType: string): StandardTemplate[] {
  return allTemplates.filter((t) => t.productType === productType);
}

export function getTemplateById(id: string): StandardTemplate | undefined {
  return allTemplates.find((t) => t.id === id);
}
