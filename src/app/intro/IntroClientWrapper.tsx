"use client";

import dynamic from "next/dynamic";

const IntroClient = dynamic(() => import("@/pages/Intro"), { ssr: false });

export default function IntroClientWrapper() {
  return <IntroClient />;
}
