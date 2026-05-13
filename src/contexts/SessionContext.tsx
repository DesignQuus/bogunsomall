"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Center, Department } from "../../client/src/contexts/CenterContext";
import { getSavedLogins } from "../../client/src/lib/quickLoginStorage";

interface SessionState {
  isLoggedIn: boolean;
  center: Center | null;
  department: Department | null;
  user: { name: string } | null;
}

interface SessionContextType extends SessionState {
  setSession: (state: Partial<SessionState>) => void;
  logout: () => void;
}

const SessionContext = createContext<SessionContextType | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSessionState] = useState<SessionState>({
    isLoggedIn: false,
    center: null,
    department: null,
    user: null,
  });

  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    const saved = getSavedLogins();
    if (saved.length > 0) {
      const latest = saved[0];
      // Note: This is a simplified hydration. 
      // In a real app, you might want to verify the session with the server.
      setSessionState({
        isLoggedIn: true,
        center: {
          id: latest.centerCode,
          code: latest.centerCode,
          name: latest.centerName,
          region: latest.region,
          status: "active",
          codeStatus: "active",
          address: "",
          contactName: "",
          contactPhone: "",
          contactEmail: "",
          departments: [],
          usageCount: 0,
          createdAt: new Date(latest.timestamp).toISOString(),
          codeExpiresAt: "",
        },
        department: {
          id: latest.deptId,
          name: latest.deptName,
          status: "active",
          createdAt: new Date(latest.timestamp).toISOString(),
        },
        user: { name: latest.userName },
      });
    }
    setIsHydrated(true);
  }, []);

  const setSession = (newState: Partial<SessionState>) => {
    setSessionState((prev) => ({ ...prev, ...newState }));
  };

  const logout = () => {
    setSessionState({
      isLoggedIn: false,
      center: null,
      department: null,
      user: null,
    });
  };

  return (
    <SessionContext.Provider value={{ ...session, setSession, logout }}>
      {isHydrated ? children : null}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}
