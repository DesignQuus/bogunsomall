"use client";
/**
 * TemplateContext.tsx
 * 표준 양식 및 주문 이력 관리
 */

import { createContext, useContext, useState, useCallback } from "react";
import { StandardTemplate, OrderHistory, ProductType } from "@/../../shared/types";

// 표준 명함 양식 (예시)
const defaultNamecardTemplate: StandardTemplate = {
  id: "tpl-namecard-001",
  name: "표준 명함",
  productType: "namecard",
  standardSpec: {
    size: "90mm × 50mm",
    paper: "300g 매트 코팅지",
    printing: "양면 컬러",
    finishing: "모서리 라운딩",
  },
  editableFields: {
    name: { label: "이름", type: "text", required: true },
    position: { label: "직급/직책", type: "text", required: false },
    department: { label: "부서명", type: "text", required: true },
    phone: { label: "전화", type: "tel", required: false },
    email: { label: "이메일", type: "email", required: false },
    color: { label: "색상", type: "color", required: false },
  },
  previewImage: "https://via.placeholder.com/300x150?text=Namecard+Template",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Mock 주문 이력 — TEST-001 보건소플러스 테스트보건소 (2024~2026.03)
const mockOrderHistory: OrderHistory[] = [
  {
    id: "ORD-2024-001",
    userId: "user-001",
    templateId: "tpl-namecard-001",
    productType: "namecard",
    productName: "명함 — 건강증진과 김민준 과장",
    orderDate: "2024-03-10",
    status: "completed",
    quantity: 500,
    specifications: {
      name: "김민준",
      position: "과장",
      department: "건강증진과",
      phone: "02-0000-1001",
      email: "minjun.kim@test-health.go.kr",
      color: "#00A39B",
    },
    modifications: "보건소 로고 삽입 요청",
    deliveryDate: "2024-03-17",
    notes: "신규 발령 명함 제작",
    createdAt: "2024-03-10",
    updatedAt: "2024-03-17",
  },
  {
    id: "ORD-2024-002",
    userId: "user-001",
    templateId: "tpl-namecard-001",
    productType: "namecard",
    productName: "명함 — 감염병관리과 이수연 주임",
    orderDate: "2024-05-22",
    status: "completed",
    quantity: 300,
    specifications: {
      name: "이수연",
      position: "주임",
      department: "감염병관리과",
      phone: "02-0000-1002",
      email: "suyeon.lee@test-health.go.kr",
      color: "#00A39B",
    },
    modifications: "",
    deliveryDate: "2024-05-29",
    notes: "",
    createdAt: "2024-05-22",
    updatedAt: "2024-05-29",
  },
  {
    id: "ORD-2024-003",
    userId: "user-001",
    templateId: "tpl-campaign-001",
    productType: "poster",
    productName: "금연 캠페인 포스터 — 세계 금연의 날",
    orderDate: "2024-05-10",
    status: "completed",
    quantity: 100,
    specifications: {
      campaign: "세계 금연의 날 (5월 31일)",
      size: "A2 (420×594mm)",
      paper: "200g 아트지",
      printing: "단면 컬러",
    },
    modifications: "보건소 주소 및 연락처 하단 삽입",
    deliveryDate: "2024-05-20",
    notes: "5월 31일 세계 금연의 날 행사용",
    createdAt: "2024-05-10",
    updatedAt: "2024-05-20",
  },
  {
    id: "ORD-2024-004",
    userId: "user-001",
    templateId: "tpl-namecard-001",
    productType: "namecard",
    productName: "명함 — 방문건강관리팀 박지훈 팀장",
    orderDate: "2024-07-15",
    status: "completed",
    quantity: 500,
    specifications: {
      name: "박지훈",
      position: "팀장",
      department: "방문건강관리팀",
      phone: "02-0000-1003",
      email: "jihoon.park@test-health.go.kr",
      color: "#005BAC",
    },
    modifications: "직책 변경 반영 (팀장 승진)",
    deliveryDate: "2024-07-22",
    notes: "승진 기념 명함 재제작",
    createdAt: "2024-07-15",
    updatedAt: "2024-07-22",
  },
  {
    id: "ORD-2024-005",
    userId: "user-001",
    templateId: "tpl-campaign-002",
    productType: "leaflet",
    productName: "금연 캠페인 리플렛 — 금연 클리닉 안내",
    orderDate: "2024-09-03",
    status: "completed",
    quantity: 2000,
    specifications: {
      campaign: "금연클리닉 등록 안내",
      size: "3단 접지 (A4)",
      paper: "150g 아트지",
      printing: "양면 컬러",
    },
    modifications: "QR코드 삽입 (금연 상담 예약 링크)",
    deliveryDate: "2024-09-12",
    notes: "보건소 민원실 및 금연클리닉 배포용",
    createdAt: "2024-09-03",
    updatedAt: "2024-09-12",
  },
  {
    id: "ORD-2024-006",
    userId: "user-001",
    templateId: "tpl-namecard-001",
    productType: "namecard",
    productName: "명함 — 구강보건팀 최은지 치위생사",
    orderDate: "2024-10-28",
    status: "completed",
    quantity: 300,
    specifications: {
      name: "최은지",
      position: "치위생사",
      department: "구강보건팀",
      phone: "02-0000-1004",
      email: "eunji.choi@test-health.go.kr",
      color: "#00A39B",
    },
    modifications: "",
    deliveryDate: "2024-11-04",
    notes: "",
    createdAt: "2024-10-28",
    updatedAt: "2024-11-04",
  },
  {
    id: "ORD-2025-001",
    userId: "user-001",
    templateId: "tpl-campaign-003",
    productType: "poster",
    productName: "금연 캠페인 포스터 — 2025 금연 결심 새해",
    orderDate: "2025-01-06",
    status: "completed",
    quantity: 150,
    specifications: {
      campaign: "2025 새해 금연 결심 캠페인",
      size: "B2 (515×728mm)",
      paper: "200g 아트지",
      printing: "단면 컬러",
    },
    modifications: "보건소장 서명란 하단 추가",
    deliveryDate: "2025-01-13",
    notes: "보건소 로비 및 대기실 부착용",
    createdAt: "2025-01-06",
    updatedAt: "2025-01-13",
  },
  {
    id: "ORD-2025-002",
    userId: "user-001",
    templateId: "tpl-namecard-001",
    productType: "namecard",
    productName: "명함 — 금연클리닉 정하늘 상담사",
    orderDate: "2025-03-17",
    status: "completed",
    quantity: 500,
    specifications: {
      name: "정하늘",
      position: "금연상담사",
      department: "금연클리닉",
      phone: "02-0000-1005",
      email: "haneul.jung@test-health.go.kr",
      color: "#2E7D32",
    },
    modifications: "금연클리닉 전용 녹색 컬러 적용",
    deliveryDate: "2025-03-24",
    notes: "신규 상담사 채용 명함",
    createdAt: "2025-03-17",
    updatedAt: "2025-03-24",
  },
  {
    id: "ORD-2025-003",
    userId: "user-001",
    templateId: "tpl-campaign-004",
    productType: "leaflet",
    productName: "금연 캠페인 리플렛 — 세계 금연의 날 2025",
    orderDate: "2025-05-12",
    status: "completed",
    quantity: 3000,
    specifications: {
      campaign: "세계 금연의 날 2025 (5월 31일)",
      size: "3단 접지 (A4)",
      paper: "150g 아트지",
      printing: "양면 컬러",
    },
    modifications: "2025년 금연 통계 데이터 업데이트",
    deliveryDate: "2025-05-22",
    notes: "지역 약국 및 병원 배포 포함",
    createdAt: "2025-05-12",
    updatedAt: "2025-05-22",
  },
  {
    id: "ORD-2026-001",
    userId: "user-001",
    templateId: "tpl-namecard-001",
    productType: "namecard",
    productName: "명함 — 건강증진과 오세진 신규 직원",
    orderDate: "2026-03-05",
    status: "completed",
    quantity: 500,
    specifications: {
      name: "오세진",
      position: "주무관",
      department: "건강증진과",
      phone: "02-0000-1006",
      email: "sejin.oh@test-health.go.kr",
      color: "#00A39B",
    },
    modifications: "",
    deliveryDate: "2026-03-12",
    notes: "2026년 3월 신규 발령자 명함",
    createdAt: "2026-03-05",
    updatedAt: "2026-03-12",
  },
];

interface TemplateContextType {
  templates: StandardTemplate[];
  orderHistory: OrderHistory[];
  getTemplateById: (id: string) => StandardTemplate | undefined;
  getOrderHistoryByUserId: (userId: string) => OrderHistory[];
  addOrderHistory: (order: OrderHistory) => void;
  updateOrderHistory: (id: string, updates: Partial<OrderHistory>) => void;
}

const TemplateContext = createContext<TemplateContextType | undefined>(undefined);

export function TemplateProvider({ children }: { children: React.ReactNode }) {
  const [templates, setTemplates] = useState<StandardTemplate[]>([defaultNamecardTemplate]);
  const [orderHistory, setOrderHistory] = useState<OrderHistory[]>(mockOrderHistory);

  const getTemplateById = useCallback(
    (id: string) => templates.find((t) => t.id === id),
    [templates]
  );

  const getOrderHistoryByUserId = useCallback(
    (userId: string) => orderHistory.filter((o) => o.userId === userId),
    [orderHistory]
  );

  const addOrderHistory = useCallback((order: OrderHistory) => {
    setOrderHistory((prev) => [...prev, order]);
  }, []);

  const updateOrderHistory = useCallback((id: string, updates: Partial<OrderHistory>) => {
    setOrderHistory((prev) =>
      prev.map((o) => (o.id === id ? { ...o, ...updates } : o))
    );
  }, []);

  return (
    <TemplateContext.Provider
      value={{
        templates,
        orderHistory,
        getTemplateById,
        getOrderHistoryByUserId,
        addOrderHistory,
        updateOrderHistory,
      }}
    >
      {children}
    </TemplateContext.Provider>
  );
}

// 담당자 코드 검증 함수
const validateStaffCode = (code: string): boolean => {
  // 형식: STAFF-YYYY-XXX (예: STAFF-2024-001)
  const staffCodePattern = /^STAFF-\d{4}-\d{3}$/;
  return staffCodePattern.test(code);
};

// 담당자 코드로 사용자 정보 조회 (Mock)
const getStaffByCode = (code: string) => {
  const staffDatabase: Record<string, any> = {
    "STAFF-2024-001": {
      id: "staff-001",
      code: "STAFF-2024-001",
      name: "홍길동",
      organization: "서울 강남구보건소",
      department: "감염병관리과",
      phone: "010-1234-5678",
      email: "hong@example.com",
    },
    "STAFF-2024-002": {
      id: "staff-002",
      code: "STAFF-2024-002",
      name: "김민지",
      organization: "부산 해운대구보건소",
      department: "건강증진팀",
      phone: "010-2345-6789",
      email: "kim@example.com",
    },
  };
  return staffDatabase[code] || null;
};

export function useTemplate() {
  const context = useContext(TemplateContext);
  if (!context) {
    throw new Error("useTemplate must be used within TemplateProvider");
  }
  return context;
}

export { validateStaffCode, getStaffByCode };
