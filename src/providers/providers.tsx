"use client";

import React from "react";
import { TRPCProvider } from "./TRPCProvider";
import { LegacyProviders } from "./LegacyProviders";
import { SessionProvider } from "../contexts/SessionContext";

/**
 * Step 5: 통합 Provider 설정
 * 모든 Context Provider를 하나의 providers.tsx로 관리합니다.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TRPCProvider>
      <SessionProvider>
        <LegacyProviders>
          {children}
        </LegacyProviders>
      </SessionProvider>
    </TRPCProvider>
  );
}
