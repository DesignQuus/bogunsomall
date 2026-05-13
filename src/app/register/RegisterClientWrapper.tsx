"use client";

import dynamic from "next/dynamic";

const RegisterClient = dynamic(() => import("@/pages/Register"), { ssr: false });

export default function RegisterClientWrapper() {
  return <RegisterClient />;
}
