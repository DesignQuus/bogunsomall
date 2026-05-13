"use client";

import dynamic from "next/dynamic";

const AdminClient = dynamic(() => import("@/pages/Admin"), { ssr: false });

export default function AdminClientWrapper() {
  return <AdminClient />;
}
