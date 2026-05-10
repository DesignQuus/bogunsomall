"use client";

/**
 * 기존 Vite SPA 컴포넌트를 Next.js에서 re-export하는 브릿지
 * client/src/pages/Intro.tsx → Next.js dynamic import 가능하게 연결
 * 
 * 주의: client/src 내에서 @/ 는 client/src를 가리켰으나
 *       여기서는 절대 경로로 직접 import 합니다.
 */
export { default } from "../../client/src/pages/Intro";
