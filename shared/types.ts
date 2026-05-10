/**
 * 표준 양식 및 주문 이력 관련 타입 정의
 */

// 제품 종류
export type ProductType = 'namecard' | 'flyer' | 'poster' | 'leaflet' | 'shopping_bag' | 'calendar' | 'sticker' | 'envelope' | 'digital';

// 주문 상태
export type OrderStatus = 'completed' | 'in_progress' | 'cancelled' | 'pending';

// 표준 양식 - 명함
export interface NamecardTemplate {
  id: string;
  name: string;
  productType: 'namecard';
  standardSpec: {
    size: string;
    paper: string;
    printing: string;
    finishing: string;
  };
  editableFields: {
    name: { label: string; type: 'text'; required: boolean };
    position: { label: string; type: 'text'; required: boolean };
    department: { label: string; type: 'text'; required: boolean };
    phone: { label: string; type: 'tel'; required: boolean };
    email: { label: string; type: 'email'; required: boolean };
    color: { label: string; type: 'color'; required: boolean };
    logo?: { label: string; type: 'file'; required: boolean };
  };
  previewImage: string;
  createdAt: string;
  updatedAt: string;
}

// 표준 양식 - 기타 상품
export interface SimpleProductTemplate {
  id: string;
  name: string;
  productType: ProductType;
  standardSpec: {
    size?: string;
    paper?: string;
    printing?: string;
    finishing?: string;
  };
  reorderOption: 'same' | 'similar' | 'custom';
  designerNotes?: string;
  previewImage: string;
  createdAt: string;
  updatedAt: string;
}

export type StandardTemplate = NamecardTemplate | SimpleProductTemplate;

// 주문 이력
export interface OrderHistory {
  id: string;
  userId: string;
  templateId: string;
  productType: ProductType;
  productName: string;
  orderDate: string;
  status: OrderStatus;
  quantity: number;
  specifications: Record<string, any>;
  modifications: string;
  deliveryDate: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// 주문 생성 요청
export interface CreateOrderRequest {
  templateId: string;
  productType: ProductType;
  quantity: number;
  specifications: Record<string, any>;
  modifications?: string;
  deliveryDate: string;
  notes?: string;
}

// 주문 업데이트 요청
export interface UpdateOrderRequest {
  quantity?: number;
  specifications?: Record<string, any>;
  modifications?: string;
  deliveryDate?: string;
  notes?: string;
  status?: OrderStatus;
}
