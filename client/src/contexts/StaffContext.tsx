"use client";
/*
 * StaffContext — 담당자(보건소 직원) 전역 상태 관리
 *
 * 설계 원칙:
 * - 인트로 Step 3에서 담당자가 직접 등록 → 코드 자동 발급
 * - 관리자 페이지에서 엑셀 일괄 업로드/다운로드
 * - 나중에 AdminStaff 페이지에서 이 Context를 그대로 사용 (병합 불필요)
 * - localStorage 기반 영속화 (추후 백엔드 연동 시 API 호출로 교체)
 *
 * 담당자 코드 형식: {기관코드}-M{순번 3자리}
 * 예: SEO-001-M001, PUS-003-M012
 */

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

// ─── 타입 정의 ────────────────────────────────────────────────────────────────

export interface Staff {
  id: string;             // 내부 고유 ID (자동 생성)
  code: string;           // 담당자 코드: SEO-001-M001
  name: string;           // 이름
  centerId: string;       // Center.id 참조
  centerCode: string;     // 기관코드 (표시용): SEO-001
  centerName: string;     // 기관명 (표시용)
  region: string;         // 시도 (표시용)
  departmentId: string;   // Department.id 참조
  deptName: string;       // 부서명 (표시용)
  role: string;           // 직책: 담당자 | 팀장 | 과장 | 계장 | 주무관 | 기타
  phone: string;          // 일반전화 (예: 02-1234-5678)
  mobile: string;         // 휴대폰 (예: 010-1234-5678)
  email: string;          // 이메일 (선택)
  createdAt: string;      // 등록일 YYYY-MM-DD
  status: "active" | "inactive"; // 활성/비활성
  lastLogin?: string;     // 마지막 로그인 YYYY-MM-DD
  memo?: string;          // 메모 (관리자용)
}

// 엑셀 업로드 시 파싱 결과 타입
export interface StaffImportRow {
  centerCode: string;   // A열: 기관코드 (필수)
  deptName: string;     // B열: 부서명 (필수)
  name: string;         // C열: 이름 (필수)
  role: string;         // D열: 직책
  phone: string;   // E열: 일반전화
  mobile: string;  // F열: 휴대폰
  email: string;   // G열: 이메일
  memo: string;          // H열: 메모
  _error?: string;      // 파싱 오류 메시지
}

interface StaffContextType {
  staffList: Staff[];
  // CRUD
  addStaff: (data: Omit<Staff, "id" | "code" | "createdAt">) => Staff;
  updateStaff: (id: string, updates: Partial<Staff>) => void;
  deleteStaff: (id: string) => void;
  // 조회
  getStaffByCenter: (centerId: string) => Staff[];
  getStaffByCode: (code: string) => Staff | undefined;
  // 엑셀 일괄 처리
  importFromRows: (rows: StaffImportRow[], centerMap: Record<string, { id: string; name: string; region: string; departments: { id: string; name: string }[] }>) => { added: number; skipped: number; errors: string[] };
  exportToRows: () => StaffExportRow[];
  // 통계
  totalCount: number;
  activeCount: number;
}

export interface StaffExportRow {
  담당자코드: string;
  기관코드: string;
  기관명: string;
  시도: string;
  부서명: string;
  이름: string;
  직책: string;
  일반전화: string;
  휴대폰: string;
  이메일: string;
  등록일: string;
  상태: string;
  메모: string;
}

// ─── 코드 생성 유틸 ──────────────────────────────────────────────────────────

export function generateStaffCode(centerCode: string, existingCodes: string[]): string {
  const prefix = `${centerCode}-M`;
  const nums = existingCodes
    .filter(c => c.startsWith(prefix))
    .map(c => parseInt(c.replace(prefix, ""), 10))
    .filter(n => !isNaN(n));
  const next = nums.length > 0 ? Math.max(...nums) + 1 : 1;
  return `${prefix}${String(next).padStart(3, "0")}`;
}

// ─── 엑셀 파싱 유틸 (SheetJS 없이 CSV 파싱) ─────────────────────────────────

export function parseCSVToStaffRows(csvText: string): StaffImportRow[] {
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  // 헤더 행 스킵 (첫 번째 행이 헤더인지 확인)
  const firstLine = lines[0].toLowerCase();
  const hasHeader = firstLine.includes("기관코드") || firstLine.includes("centercode") || firstLine.includes("이름");
  const dataLines = hasHeader ? lines.slice(1) : lines;

  return dataLines
    .filter(line => line.trim())
    .map((line, idx) => {
      const cols = line.split(",").map(c => c.replace(/^"|"$/g, "").trim());
      const [centerCode = "", deptName = "", name = "", role = "", phone = "", mobile = "", email = "", memo = ""] = cols;

      if (!centerCode || !name) {
        return { centerCode, deptName, name, role, phone, mobile, email, memo, _error: `${idx + 2}행: 기관코드 또는 이름이 비어 있습니다` };
      }
      return { centerCode: centerCode.toUpperCase(), deptName, name, role: role || "담당자", phone, mobile, email, memo };
    });
}

// ─── Context ─────────────────────────────────────────────────────────────────

const StaffContext = createContext<StaffContextType | null>(null);

const STORAGE_KEY = "bogunso_staff_v1";

// 샘플 데이터 (실제 운영 시 빈 배열로 교체)
const SAMPLE_STAFF: Staff[] = [
  {
    id: "staff-sample-1",
    code: "SEO-001-M001",
    name: "김민지",
    centerId: "center-1",
    centerCode: "SEO-001",
    centerName: "종로구보건소",
    region: "서울특별시",
    departmentId: "dept-1-1",
    deptName: "건강증진과",
    role: "주무관",
    phone: "02-1234-5678",
    mobile: "010-1234-5678",
    email: "kmj@jongno.go.kr",
    createdAt: "2026-01-15",
    status: "active",
    lastLogin: "2026-03-10",
  },
  {
    id: "staff-sample-2",
    code: "SEO-001-M002",
    name: "이준호",
    centerId: "center-1",
    centerCode: "SEO-001",
    centerName: "종로구보건소",
    region: "서울특별시",
    departmentId: "dept-1-2",
    deptName: "감염병관리과",
    role: "팀장",
    phone: "02-1234-5679",
    mobile: "",
    email: "",
    createdAt: "2026-01-20",
    status: "active",
    lastLogin: "2026-03-08",
  },
  {
    id: "staff-sample-3",
    code: "PUS-001-M001",
    name: "박서연",
    centerId: "center-26",
    centerCode: "PUS-001",
    centerName: "중구보건소",
    region: "부산광역시",
    departmentId: "dept-26-1",
    deptName: "건강증진과",
    role: "담당자",
    phone: "051-9876-5432",
    mobile: "010-9876-5432",
    email: "psy@bsjunggu.go.kr",
    createdAt: "2026-02-01",
    status: "active",
  },
];

export function StaffProvider({ children }: { children: ReactNode }) {
  const [staffList, setStaffList] = useState<Staff[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : SAMPLE_STAFF;
    } catch {
      return SAMPLE_STAFF;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(staffList));
  }, [staffList]);

  const addStaff = (data: Omit<Staff, "id" | "code" | "createdAt">): Staff => {
    const existingCodes = staffList.map(s => s.code);
    const code = generateStaffCode(data.centerCode, existingCodes);
    const newStaff: Staff = {
      ...data,
      id: `staff-${Date.now()}`,
      code,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setStaffList(prev => [newStaff, ...prev]);
    return newStaff;
  };

  const updateStaff = (id: string, updates: Partial<Staff>) => {
    setStaffList(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const deleteStaff = (id: string) => {
    setStaffList(prev => prev.filter(s => s.id !== id));
  };

  const getStaffByCenter = (centerId: string) =>
    staffList.filter(s => s.centerId === centerId);

  const getStaffByCode = (code: string) =>
    staffList.find(s => s.code.toLowerCase() === code.toLowerCase());

  // 엑셀 일괄 업로드 처리
  const importFromRows = (
    rows: StaffImportRow[],
    centerMap: Record<string, { id: string; name: string; region: string; departments: { id: string; name: string }[] }>
  ): { added: number; skipped: number; errors: string[] } => {
    let added = 0;
    let skipped = 0;
    const errors: string[] = [];
    const newStaffList: Staff[] = [...staffList];

    rows.forEach((row, idx) => {
      if (row._error) { errors.push(row._error); skipped++; return; }

      const center = centerMap[row.centerCode.toUpperCase()];
      if (!center) {
        errors.push(`${idx + 2}행 [${row.centerCode}]: 등록되지 않은 기관코드`);
        skipped++;
        return;
      }

      // 중복 체크 (같은 기관 + 같은 이름 + 같은 부서)
      const isDuplicate = newStaffList.some(
        s => s.centerCode === row.centerCode && s.name === row.name && s.deptName === row.deptName
      );
      if (isDuplicate) {
        errors.push(`${idx + 2}행 [${row.name}]: 이미 등록된 담당자 (중복 스킵)`);
        skipped++;
        return;
      }

      const dept = center.departments.find(d => d.name === row.deptName) || center.departments[0];
      const existingCodes = newStaffList.map(s => s.code);
      const code = generateStaffCode(row.centerCode, existingCodes);

      const newStaff: Staff = {
        id: `staff-${Date.now()}-${idx}`,
        code,
      name: row.name,
      centerId: center.id,
      centerCode: row.centerCode,
      centerName: center.name,
      region: center.region,
      departmentId: dept?.id || "",
      deptName: row.deptName || dept?.name || "미지정",
      role: row.role || "담당자",
      phone: row.phone || "",
      mobile: row.mobile || "",
      email: row.email || "",
        createdAt: new Date().toISOString().split("T")[0],
        status: "active",
        memo: row.memo || "",
      };
      newStaffList.push(newStaff);
      added++;
    });

    setStaffList(newStaffList);
    return { added, skipped, errors };
  };

  // 엑셀 다운로드용 데이터 변환
  const exportToRows = (): StaffExportRow[] =>
    staffList.map(s => ({
      담당자코드: s.code,
      기관코드: s.centerCode,
      기관명: s.centerName,
      시도: s.region,
      부서명: s.deptName,
      이름: s.name,
      직책: s.role,
      일반전화: s.phone,
      휴대폰: s.mobile,
      이메일: s.email,
      등록일: s.createdAt,
      상태: s.status === "active" ? "활성" : "비활성",
      메모: s.memo || "",
    }));

  const totalCount = staffList.length;
  const activeCount = staffList.filter(s => s.status === "active").length;

  return (
    <StaffContext.Provider value={{
      staffList, addStaff, updateStaff, deleteStaff,
      getStaffByCenter, getStaffByCode,
      importFromRows, exportToRows,
      totalCount, activeCount,
    }}>
      {children}
    </StaffContext.Provider>
  );
}

export function useStaff() {
  const ctx = useContext(StaffContext);
  if (!ctx) throw new Error("useStaff must be used within StaffProvider");
  return ctx;
}
