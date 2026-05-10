"use client";

import React from "react";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { RegistrationProvider } from "@/contexts/RegistrationContext";
import { CenterProvider } from "@/contexts/CenterContext";
import { TemplateProvider } from "@/contexts/TemplateContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { NavigationProvider } from "@/contexts/NavigationContext";
import { StaffProvider } from "@/contexts/StaffContext";

export function LegacyProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="light">
      <CenterProvider>
        <TemplateProvider>
          <NotificationProvider>
            <RegistrationProvider>
              <StaffProvider>
                <TooltipProvider>
                  <Toaster position="top-right" richColors />
                  <NavigationProvider>
                    {children}
                  </NavigationProvider>
                </TooltipProvider>
              </StaffProvider>
            </RegistrationProvider>
          </NotificationProvider>
        </TemplateProvider>
      </CenterProvider>
    </ThemeProvider>
  );
}
