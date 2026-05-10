/**
 * Next.js와 Vite의 환경 변수 차이를 극복하기 위한 심(Shim)
 */

export function getEnv(key: string): string | undefined {
  // Vite 스타일 (Next.js에서 빌드 타임에 치환되지 않으면 undefined)
  // @ts-ignore
  if (typeof import.meta !== "undefined" && import.meta.env && import.meta.env[key]) {
    // @ts-ignore
    return import.meta.env[key];
  }

  // Next.js 스타일
  const nextKey = key.startsWith("VITE_") 
    ? key.replace("VITE_", "NEXT_PUBLIC_") 
    : key;
    
  return process.env[nextKey] || process.env[key];
}
