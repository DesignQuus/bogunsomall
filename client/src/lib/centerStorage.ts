/**
 * centerStorage.ts
 * 보건소 정보 및 접속 이력을 localStorage에 저장/관리
 *
 * 보안 정책:
 * - localStorage: 보건소 정보만 저장 (centerCode, centerName, region, district)
 * - 4자리 간편 로그인 번호는 저장하지 않음 (세션 내에서만 사용)
 * - 접속 이력: 최근 5회 일시 기록 (보건소 단위)
 */

// ── 저장된 보건소 정보 ────────────────────────────────────────────────────────
export interface SavedCenterInfo {
  centerCode: string;
  centerName: string;
  region: string;
  district: string;
  lastAccessAt: number; // 마지막 접속 시간 (timestamp)
}

const SAVED_CENTER_KEY = "bogunsoplus_saved_center";

/**
 * 마지막으로 선택한 보건소 저장 (보건소 정보만, 코드 미포함)
 */
export function saveCenterInfo(info: Omit<SavedCenterInfo, "lastAccessAt">): void {
  try {
    const data: SavedCenterInfo = { ...info, lastAccessAt: Date.now() };
    localStorage.setItem(SAVED_CENTER_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to save center info:", e);
  }
}

/**
 * 저장된 보건소 정보 불러오기
 */
export function getSavedCenter(): SavedCenterInfo | null {
  try {
    const raw = localStorage.getItem(SAVED_CENTER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error("Failed to get saved center:", e);
    return null;
  }
}

/**
 * 저장된 보건소 정보 삭제
 */
export function clearSavedCenter(): void {
  try {
    localStorage.removeItem(SAVED_CENTER_KEY);
  } catch (e) {
    console.error("Failed to clear saved center:", e);
  }
}

// ── 빠른 재접속 이력 ─────────────────────────────────────────────────────────
/**
 * 빠른 재접속 항목: 보건소별 중복 제거, 최종 접속 시간만 보관
 */
export interface AccessLogEntry {
  centerCode: string;
  centerName: string;
  region: string;
  district: string;
  lastAccessAt: number; // 해당 보건소의 최종 접속 timestamp
}

const ACCESS_LOG_KEY = "bogunsoplus_access_log";
const MAX_ACCESS_LOG = 5;

/**
 * 빠른 재접속 이력 추가/갱신
 * - 동일 centerCode가 이미 있으면 lastAccessAt만 갱신 후 맨 앞으로 이동
 * - 없으면 새 항목 추가, 최대 5개 유지
 */
export function addAccessLog(entry: Omit<AccessLogEntry, "lastAccessAt">): void {
  try {
    const logs = getAccessLog();
    // 동일 보건소 제거 후 새 항목을 맨 앞에 추가
    const filtered = logs.filter(l => l.centerCode !== entry.centerCode);
    const newEntry: AccessLogEntry = { ...entry, lastAccessAt: Date.now() };
    const updated = [newEntry, ...filtered].slice(0, MAX_ACCESS_LOG);
    localStorage.setItem(ACCESS_LOG_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error("Failed to add access log:", e);
  }
}

/**
 * 접속 이력 전체 조회 (최신순)
 * - 구형 데이터(accessAt 필드 등) 자동 정제
 */
export function getAccessLog(): AccessLogEntry[] {
  try {
    const raw = localStorage.getItem(ACCESS_LOG_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // lastAccessAt이 없거나 유효하지 않은 항목 정제
    return parsed
      .map((entry: AccessLogEntry & { accessAt?: unknown }) => ({
        ...entry,
        lastAccessAt: typeof entry.lastAccessAt === "number" && !isNaN(entry.lastAccessAt)
          ? entry.lastAccessAt
          : typeof entry.accessAt === "number" && !isNaN(entry.accessAt as number)
            ? (entry.accessAt as number)
            : Date.now(),
      }))
      .filter((entry: AccessLogEntry) => entry.centerCode && entry.centerName);
  } catch (e) {
    console.error("Failed to get access log:", e);
    return [];
  }
}

/**
 * 접속 이력 전체 삭제
 */
export function clearAccessLog(): void {
  try {
    localStorage.removeItem(ACCESS_LOG_KEY);
  } catch (e) {
    console.error("Failed to clear access log:", e);
  }
}

/**
 * 타임스탬프를 읽기 좋은 형식으로 변환
 */
export function formatAccessTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "방금 전";
  if (minutes < 60) return `${minutes}분 전`;
  if (hours < 24) return `${hours}시간 전`;
  if (days < 7) return `${days}일 전`;

  const date = new Date(timestamp);
  return date.toLocaleDateString("ko-KR", { month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

// ── 4자리 코드 중복 확인 ──────────────────────────────────────────────────────
const REQUESTS_KEY = "admin_signup_requests";

interface SignupRequestLite {
  centerCode: string;
  deptCode: string;
  status: string;
}

/**
 * 동일 보건소 내 동일 4자리 코드 중복 여부 확인
 * admin_signup_requests에서 centerCode + deptCode 조합 검사
 */
export function isDeptCodeDuplicate(centerCode: string, deptCode: string): boolean {
  try {
    const raw = localStorage.getItem(REQUESTS_KEY);
    if (!raw) return false;
    const requests: SignupRequestLite[] = JSON.parse(raw);
    return requests.some(
      r => r.centerCode === centerCode && r.deptCode === deptCode && r.status !== "rejected"
    );
  } catch (e) {
    console.error("Failed to check dept code duplicate:", e);
    return false;
  }
}
