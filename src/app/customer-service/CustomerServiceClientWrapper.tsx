"use client";

import dynamic from "next/dynamic";

const CustomerServiceClient = dynamic(() => import("@/pages/CustomerService"), { ssr: false });

export default function CustomerServiceClientWrapper() {
  return <CustomerServiceClient />;
}
