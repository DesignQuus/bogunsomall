/**
 * /dashboard 페이지
 * client/src/pages/Dashboard.tsx 를 dynamic import 하여 점진적으로 이전
 */
import type { Metadata } from "next";
import DashboardClientWrapper from "./DashboardClientWrapper";

export const metadata: Metadata = {
  title: "대시보드 | 보건소플러스",
  description: "보건소 업무 현황 및 관리 대시보드",
};

export default function DashboardPage() {
  return <DashboardClientWrapper />;
}
