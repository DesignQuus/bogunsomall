"use client";
/**
 * RegistrationContext
 * 기관 등록 신청 데이터를 전역으로 관리합니다.
 * localStorage를 통해 페이지 이동 후에도 상태가 유지됩니다.
 * 신청 폼(/register)에서 제출된 데이터가 어드민(/admin/registrations)에 실시간 반영됩니다.
 */

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface RegistrationItem {
  id: string;
  name: string;
  region: string;
  district: string;
  address: string;
  phone: string;
  contactName: string;
  contactDept: string;
  contactPhone: string;
  contactEmail: string;
  businessNumber: string;
  appliedAt: string;
  status: "pending" | "approved" | "rejected";
  note?: string;
  isNew?: boolean; // 신규 제출 여부 (어드민에서 강조 표시용)
}

// 초기 샘플 데이터
const INITIAL_DATA: RegistrationItem[] = [
  {
    id: "REG-2024-089",
    name: "화성시 동탄보건소",
    region: "경기도",
    district: "화성시",
    address: "경기 화성시 동탄대로 607",
    phone: "031-8015-4700",
    contactName: "이수진",
    contactDept: "건강증진팀",
    contactPhone: "010-1234-5678",
    contactEmail: "sujin@hwaseong.go.kr",
    businessNumber: "123-45-67890",
    appliedAt: "2024.03.11",
    status: "pending",
  },
  {
    id: "REG-2024-088",
    name: "세종시 조치원보건지소",
    region: "세종특별자치시",
    district: "세종시",
    address: "세종 조치원읍 충현로 50",
    phone: "044-300-4800",
    contactName: "박민준",
    contactDept: "지역보건팀",
    contactPhone: "010-2345-6789",
    contactEmail: "minjun@sejong.go.kr",
    businessNumber: "234-56-78901",
    appliedAt: "2024.03.10",
    status: "pending",
  },
  {
    id: "REG-2024-087",
    name: "김포시보건소",
    region: "경기도",
    district: "김포시",
    address: "경기 김포시 사우중로 1",
    phone: "031-980-4700",
    contactName: "최지영",
    contactDept: "만성질환팀",
    contactPhone: "010-3456-7890",
    contactEmail: "jiyoung@gimpo.go.kr",
    businessNumber: "345-67-89012",
    appliedAt: "2024.03.09",
    status: "approved",
  },
  {
    id: "REG-2024-086",
    name: "양주시보건소",
    region: "경기도",
    district: "양주시",
    address: "경기 양주시 양주시청로 1",
    phone: "031-8082-4700",
    contactName: "김동현",
    contactDept: "금연클리닉",
    contactPhone: "010-4567-8901",
    contactEmail: "donghyun@yangju.go.kr",
    businessNumber: "456-78-90123",
    appliedAt: "2024.03.08",
    status: "approved",
  },
  {
    id: "REG-2024-085",
    name: "포천시보건소",
    region: "경기도",
    district: "포천시",
    address: "경기 포천시 중앙로 87",
    phone: "031-538-3700",
    contactName: "정서현",
    contactDept: "영양관리팀",
    contactPhone: "010-5678-9012",
    contactEmail: "seohyun@pocheon.go.kr",
    businessNumber: "567-89-01234",
    appliedAt: "2024.03.07",
    status: "rejected",
    note: "사업자등록번호 불일치",
  },
  {
    id: "REG-2024-084",
    name: "가평군보건소",
    region: "경기도",
    district: "가평군",
    address: "경기 가평군 가평읍 군청로 29",
    phone: "031-580-2700",
    contactName: "윤지호",
    contactDept: "치매안심센터",
    contactPhone: "010-6789-0123",
    contactEmail: "jiho@gapyeong.go.kr",
    businessNumber: "678-90-12345",
    appliedAt: "2024.03.06",
    status: "pending",
  },
  {
    id: "REG-2024-083",
    name: "연천군보건소",
    region: "경기도",
    district: "연천군",
    address: "경기 연천군 연천읍 군청로 1",
    phone: "031-839-2700",
    contactName: "한소희",
    contactDept: "모자보건팀",
    contactPhone: "010-7890-1234",
    contactEmail: "sohee@yeoncheon.go.kr",
    businessNumber: "789-01-23456",
    appliedAt: "2024.03.05",
    status: "pending",
  },
];

const STORAGE_KEY = "bogunsoplus_registrations";

function loadFromStorage(): RegistrationItem[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as RegistrationItem[];
  } catch {
    return null;
  }
}

function saveToStorage(data: RegistrationItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

interface RegistrationContextType {
  registrations: RegistrationItem[];
  addRegistration: (item: Omit<RegistrationItem, "id" | "appliedAt" | "status" | "isNew">) => string;
  updateStatus: (id: string, status: "approved" | "rejected", note?: string) => void;
  deleteRegistration: (id: string) => void;
  pendingCount: number;
}

const RegistrationContext = createContext<RegistrationContextType | null>(null);

export function RegistrationProvider({ children }: { children: ReactNode }) {
  const [registrations, setRegistrations] = useState<RegistrationItem[]>(INITIAL_DATA);

  // 초기 로드 (client-only)
  useEffect(() => {
    const stored = loadFromStorage();
    if (stored) {
      setRegistrations(stored);
    }
  }, []);

  // 상태 변경 시 localStorage에 저장
  useEffect(() => {
    saveToStorage(registrations);
  }, [registrations]);

  const addRegistration = (item: Omit<RegistrationItem, "id" | "appliedAt" | "status" | "isNew">): string => {
    const now = new Date();
    const dateStr = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, "0")}.${String(now.getDate()).padStart(2, "0")}`;
    const stored = loadFromStorage() ?? INITIAL_DATA;
    const newId = `REG-${now.getFullYear()}-${String(stored.length + 90).padStart(3, "0")}`;
    const newItem: RegistrationItem = {
      ...item,
      id: newId,
      appliedAt: dateStr,
      status: "pending",
      isNew: true,
    };
    setRegistrations((prev) => {
      const updated = [newItem, ...prev];
      saveToStorage(updated);
      return updated;
    });
    return newId;
  };

  const updateStatus = (id: string, status: "approved" | "rejected", note?: string) => {
    setRegistrations((prev) => {
      const updated = prev.map((r) =>
        r.id === id ? { ...r, status, note: note === "" ? undefined : (note || r.note), isNew: false } : r
      );
      saveToStorage(updated);
      return updated;
    });
  };

  const deleteRegistration = (id: string) => {
    setRegistrations((prev) => {
      const updated = prev.filter((r) => r.id !== id);
      saveToStorage(updated);
      return updated;
    });
  };

  const pendingCount = registrations.filter((r) => r.status === "pending").length;

  return (
    <RegistrationContext.Provider value={{ registrations, addRegistration, updateStatus, deleteRegistration, pendingCount }}>
      {children}
    </RegistrationContext.Provider>
  );
}

export function useRegistrations() {
  const ctx = useContext(RegistrationContext);
  if (!ctx) throw new Error("useRegistrations must be used within RegistrationProvider");
  return ctx;
}
