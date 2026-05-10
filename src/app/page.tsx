import { redirect } from "next/navigation";

// 루트 경로(/)는 /intro로 리다이렉트
export default function RootPage() {
  redirect("/intro");
}
