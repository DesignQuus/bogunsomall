"use client";

import dynamic from "next/dynamic";

const DashboardClient = dynamic(() => import("@/pages/Dashboard"), { ssr: false });

export default function DashboardClientWrapper() {
  return <DashboardClient />;
}
