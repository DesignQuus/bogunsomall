/**
 * 보건소플러스 주문 시스템 타입 정의
 * - 표준 템플릿, 디자인 옵션, 주문 폼 등
 */

// ─── 표준 템플릿 ───────────────────────────────────────────
export type ProductType = "namecard" | "sticker" | "label" | "merchandise";
export type DesignOptionType = "standard" | "custom";

export interface TemplateField {
  key: string;
  label: string;
  type: "text" | "email" | "phone" | "select" | "textarea";
  required: boolean;
  maxLength?: number;
  placeholder?: string;
  options?: Array<{ label: string; value: string }>;
}

export interface DesignOption {
  id: string;
  type: DesignOptionType;
  label: string;
  description?: string;
  preview?: string;
}

export interface StandardTemplate {
  id: string;
  productType: ProductType;
  name: string;
  description?: string;
  preview: string;
  designOptions: DesignOption[];
  fields: TemplateField[];
  defaultQuantity?: number;
}

// ─── 개인 정보 (행 데이터) ───────────────────────────────
export interface PersonalInfoRow {
  id?: string; // 클라이언트 사이드 고유 ID (UUID)
  [key: string]: any; // 동적 필드 (이름, 직책, 부서 등)
}

// ─── 단일 주문 (1명) ───────────────────────────────────────
export interface SingleOrderForm {
  productType: ProductType;
  templateId: string;
  designOption: DesignOptionType;
  customImageUrl?: string;
  
  // 개인 정보
  personalInfo: PersonalInfoRow;
  
  // 주문 정보
  quantity: number;
  shippingAddress: string;
  recipientName: string;
  recipientPhone: string;
  deadline?: string;
  specialRequests?: string;
  shippingMethod: "pickup" | "delivery";
}

// ─── 대량 주문 (2명 이상) ──────────────────────────────────
export interface BulkOrderForm {
  productType: ProductType;
  templateId: string;
  designOption: DesignOptionType;
  customImageUrl?: string;
  
  // 여러 명의 정보
  rows: PersonalInfoRow[];
  
  // 주문 정보 (공통)
  quantity: number;
  shippingAddress: string;
  recipientName: string;
  recipientPhone: string;
  deadline?: string;
  specialRequests?: string;
  shippingMethod: "pickup" | "delivery";
}

// ─── 주문 제출 데이터 ──────────────────────────────────────
export type OrderFormData = SingleOrderForm | BulkOrderForm;

export interface OrderSubmission {
  id?: string;
  formData: OrderFormData;
  submittedAt?: string;
  status: "pending" | "approved" | "in_progress" | "completed";
}

// ─── 엑셀 업로드 결과 ──────────────────────────────────────
export interface ExcelUploadResult {
  success: boolean;
  rows: PersonalInfoRow[];
  errors?: Array<{
    rowIndex: number;
    field: string;
    message: string;
  }>;
}
