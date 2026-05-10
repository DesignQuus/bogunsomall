/**
 * /intro 페이지
 * client/src/pages/Intro.tsx 를 dynamic import 하여 점진적으로 이전
 */
import type { Metadata } from "next";
import IntroClientWrapper from "./IntroClientWrapper";

export const metadata: Metadata = {
  title: "보건소 로그인 | 보건소플러스",
  description: "보건소 코드를 입력하여 로그인하세요.",
};

export default function IntroPage() {
  return <IntroClientWrapper />;
}
