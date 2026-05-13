"use client";
/*
 * CenterContext — 기관(보건소) 및 부서 전역 상태 관리
 * - INITIAL_CENTERS(centersData.ts)를 항상 기준으로 사용
 * - 사용자가 추가한 부서만 localStorage에 별도 저장 (bogunso_user_depts_v1)
 * - 기관 목록 자체는 localStorage 캐시 없이 항상 최신 코드 데이터 사용
 * - 이렇게 하면 배포 시 새 기관(TEST-001 등)이 즉시 반영됨
 */

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { INITIAL_CENTERS } from "./centersData";

export interface Department {
  id: string;
  name: string;
  createdAt: string;
  status: "active" | "pending";
}

export interface Center {
  id: string;
  code: string;           // 예: SEO-001 (기관 등록 시 자동 발급)
  name: string;
  region: string;
  address: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  departments: Department[];
  status: "active" | "inactive" | "suspended";
  createdAt: string;
  codeExpiresAt: string;
  // 코드 관리 메타데이터
  codeStatus: "active" | "expired" | "suspended";
  usageCount: number;
  lastUsed?: string;
}

interface UserDeptOverride {
  centerId: string;
  extraDepts: Department[];
}

interface CenterContextType {
  centers: Center[];
  addCenter: (center: Omit<Center, "id" | "createdAt" | "usageCount" | "codeStatus">) => Center;
  updateCenter: (id: string, updates: Partial<Center>) => void;
  deleteCenter: (id: string) => void;
  getCenterByCode: (code: string) => Center | undefined;
  findCenterByCode: (code: string) => Center | undefined; // 상태 무관 검색 (정지/만료 포함)
  addDepartment: (centerId: string, deptName: string, requireApproval?: boolean) => Department;
  updateDepartmentStatus: (centerId: string, deptId: string, status: "active" | "pending") => void;
  deleteDepartment: (centerId: string, deptId: string) => void;
  // 코드 관리 전용 액션
  updateCodeStatus: (centerId: string, status: "active" | "expired" | "suspended") => void;
  reissueCode: (centerId: string) => string;
  incrementUsage: (centerId: string) => void;
}

const CenterContext = createContext<CenterContextType | null>(null);

export function generateCode(region: string, existingCodes: string[]): string {
  const prefixMap: Record<string, string> = {
    "서울특별시": "SEO", "인천광역시": "ICN", "경기도": "GGI",
    "부산광역시": "PUS", "대구광역시": "DAE", "광주광역시": "GWJ",
    "대전광역시": "DJN", "울산광역시": "ULS", "세종특별자치시": "SJG",
    "강원도": "GWO", "충청북도": "CNB", "충청남도": "CNA",
    "전라북도": "JNB", "전라남도": "JNA", "경상북도": "GSB",
    "경상남도": "GSN", "제주특별자치도": "JJU",
  };
  const prefix = prefixMap[region] || "ETC";
  const regionCodes = existingCodes.filter(c => c.startsWith(prefix));
  const nextNum = regionCodes.length + 1;
  return `${prefix}-${String(nextNum).padStart(3, "0")}`;
}

// localStorage에서 사용자 추가 부서 오버라이드 로드
function loadUserDeptOverrides(): UserDeptOverride[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem("bogunso_user_depts_v1");
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return [];
}

// localStorage에 사용자 추가 부서 오버라이드 저장
function saveUserDeptOverrides(overrides: UserDeptOverride[]) {
  try {
    localStorage.setItem("bogunso_user_depts_v1", JSON.stringify(overrides));
  } catch { /* ignore */ }
}

// 구버전 localStorage 키 정리
function cleanupOldStorage() {
  try {
    localStorage.removeItem("bogunso_centers");
    localStorage.removeItem("bogunso_centers_v2");
    localStorage.removeItem("bogunso_centers_v3");
    localStorage.removeItem("bogunso_centers_v4");
  } catch { /* ignore */ }
}

// INITIAL_CENTERS에 사용자 추가 부서를 병합
function mergeCentersWithOverrides(
  baseCenters: Center[],
  overrides: UserDeptOverride[]
): Center[] {
  if (overrides.length === 0) return baseCenters;
  return baseCenters.map(center => {
    const override = overrides.find(o => o.centerId === center.id);
    if (!override || override.extraDepts.length === 0) return center;
    // 기존 부서 ID와 중복되지 않는 것만 추가
    const existingIds = new Set(center.departments.map(d => d.id));
    const newDepts = override.extraDepts.filter(d => !existingIds.has(d.id));
    return { ...center, departments: [...center.departments, ...newDepts] };
  });
}

export function CenterProvider({ children }: { children: ReactNode }) {
  // 구버전 키 정리 (최초 1회)
  useEffect(() => { cleanupOldStorage(); }, []);

  // 사용자 추가 부서 오버라이드 (localStorage)
  const [userDeptOverrides, setUserDeptOverrides] = useState<UserDeptOverride[]>([]);

  // 초기 로드
  useEffect(() => {
    const stored = loadUserDeptOverrides();
    if (stored.length > 0) {
      setUserDeptOverrides(stored);
    }
  }, []);

  // 추가 기관 (관리자가 런타임에 추가한 기관, 세션 내 유지)
  const [extraCenters, setExtraCenters] = useState<Center[]>([]);

  // 최종 centers = INITIAL_CENTERS + extraCenters + 사용자 부서 오버라이드
  const allBaseCenters = [...INITIAL_CENTERS, ...extraCenters];
  const centers = mergeCentersWithOverrides(allBaseCenters, userDeptOverrides);

  // 오버라이드 변경 시 localStorage 저장
  useEffect(() => {
    if (userDeptOverrides.length > 0) {
      saveUserDeptOverrides(userDeptOverrides);
    }
  }, [userDeptOverrides]);

  const addCenter = (centerData: Omit<Center, "id" | "createdAt" | "usageCount" | "codeStatus">): Center => {
    const newCenter: Center = {
      ...centerData,
      id: `c${Date.now()}`,
      createdAt: new Date().toISOString().split("T")[0],
      codeStatus: "active",
      usageCount: 0,
    };
    setExtraCenters(prev => [newCenter, ...prev]);
    return newCenter;
  };

  const updateCenter = (id: string, updates: Partial<Center>) => {
    // INITIAL_CENTERS는 수정 불가 (extraCenters만 수정)
    setExtraCenters(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const deleteCenter = (id: string) => {
    setExtraCenters(prev => prev.filter(c => c.id !== id));
  };

  const getCenterByCode = (code: string): Center | undefined => {
    return centers.find(
      c => c.code.toLowerCase() === code.toLowerCase()
        && c.status === "active"
        && c.codeStatus === "active"
    );
  };

  // 상태 무관 검색 (정지/만료 기관 안내용)
  const findCenterByCode = (code: string): Center | undefined => {
    return centers.find(c => c.code.toLowerCase() === code.toLowerCase());
  };

  const addDepartment = (centerId: string, deptName: string, requireApproval = false): Department => {
    const newDept: Department = {
      id: `d${Date.now()}`,
      name: deptName,
      createdAt: new Date().toISOString().split("T")[0],
      status: requireApproval ? "pending" : "active",
    };
    setUserDeptOverrides(prev => {
      const existing = prev.find(o => o.centerId === centerId);
      if (existing) {
        return prev.map(o =>
          o.centerId === centerId
            ? { ...o, extraDepts: [...o.extraDepts, newDept] }
            : o
        );
      }
      return [...prev, { centerId, extraDepts: [newDept] }];
    });
    return newDept;
  };

  const updateDepartmentStatus = (centerId: string, deptId: string, status: "active" | "pending") => {
    setUserDeptOverrides(prev =>
      prev.map(o =>
        o.centerId === centerId
          ? { ...o, extraDepts: o.extraDepts.map(d => d.id === deptId ? { ...d, status } : d) }
          : o
      )
    );
  };

  const deleteDepartment = (centerId: string, deptId: string) => {
    setUserDeptOverrides(prev =>
      prev.map(o =>
        o.centerId === centerId
          ? { ...o, extraDepts: o.extraDepts.filter(d => d.id !== deptId) }
          : o
      )
    );
  };

  // 코드 관리 전용 액션 (extraCenters만 수정 가능)
  const updateCodeStatus = (centerId: string, status: "active" | "expired" | "suspended") => {
    setExtraCenters(prev => prev.map(c =>
      c.id === centerId ? { ...c, codeStatus: status } : c
    ));
  };

  const reissueCode = (centerId: string): string => {
    const center = centers.find(c => c.id === centerId);
    if (!center) return "";
    const otherCodes = centers.filter(c => c.id !== centerId).map(c => c.code);
    const newCode = generateCode(center.region, otherCodes);
    const newExpiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    setExtraCenters(prev => prev.map(c =>
      c.id === centerId
        ? { ...c, code: newCode, codeStatus: "active", codeExpiresAt: newExpiry }
        : c
    ));
    return newCode;
  };

  const incrementUsage = (centerId: string) => {
    const today = new Date().toISOString().split("T")[0];
    setExtraCenters(prev => prev.map(c =>
      c.id === centerId
        ? { ...c, usageCount: c.usageCount + 1, lastUsed: today }
        : c
    ));
  };

  return (
    <CenterContext.Provider value={{
      centers, addCenter, updateCenter, deleteCenter, getCenterByCode, findCenterByCode,
      addDepartment, updateDepartmentStatus, deleteDepartment,
      updateCodeStatus, reissueCode, incrementUsage,
    }}>
      {children}
    </CenterContext.Provider>
  );
}

export function useCenters() {
  const ctx = useContext(CenterContext);
  if (!ctx) throw new Error("useCenters must be used within CenterProvider");
  return ctx;
}
