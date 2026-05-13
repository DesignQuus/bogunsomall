/**
 * quickLoginStorage.ts
 * localStorage를 활용한 빠른 로그인 기능
 * 사용자가 입력한 기관 정보를 저장하고 다음 방문 시 자동으로 복원
 */

export interface SavedLoginInfo {
  centerCode: string;
  centerName: string;
  region: string;
  deptId: string;
  deptName: string;
  userName: string;
  timestamp: number; // 저장 시간
}

const STORAGE_KEY = "bogunsoplus_quick_login";
const MAX_SAVED_LOGINS = 5; // 최대 5개까지 저장

/**
 * 로그인 정보 저장
 */
export function saveLoginInfo(info: Omit<SavedLoginInfo, "timestamp">): void {
  try {
    const saved = getSavedLogins();
    
    // 중복 제거 (같은 centerCode + deptId 조합이 있으면 제거)
    const filtered = saved.filter(
      (item) => !(item.centerCode === info.centerCode && item.deptId === info.deptId)
    );
    
    // 새 정보를 맨 앞에 추가
    const newList: SavedLoginInfo[] = [
      { ...info, timestamp: Date.now() },
      ...filtered,
    ].slice(0, MAX_SAVED_LOGINS);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newList));
  } catch (error) {
    console.error("Failed to save login info:", error);
  }
}

/**
 * 저장된 모든 로그인 정보 조회
 */
export function getSavedLogins(): SavedLoginInfo[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to get saved logins:", error);
    return [];
  }
}

/**
 * 특정 로그인 정보 삭제
 */
export function removeLoginInfo(centerCode: string, deptId: string): void {
  try {
    const saved = getSavedLogins();
    const filtered = saved.filter(
      (item) => !(item.centerCode === centerCode && item.deptId === deptId)
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("Failed to remove login info:", error);
  }
}

/**
 * 모든 저장된 로그인 정보 삭제
 */
export function clearAllLoginInfo(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear login info:", error);
  }
}

/**
 * 저장된 시간을 읽기 좋은 형식으로 변환
 */
export function formatSavedTime(timestamp: number): string {
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
  return date.toLocaleDateString("ko-KR");
}
