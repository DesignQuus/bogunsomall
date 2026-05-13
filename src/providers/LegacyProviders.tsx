"use client";

import React from "react";
import { Toaster } from "sonner";
import { TooltipProvider } from "../../client/src/components/ui/tooltip";
import { ThemeProvider } from "../../client/src/contexts/ThemeContext";
import { RegistrationProvider } from "../../client/src/contexts/RegistrationContext";
import { CenterProvider } from "../../client/src/contexts/CenterContext";
import { TemplateProvider } from "../../client/src/contexts/TemplateContext";
import { NotificationProvider } from "../../client/src/contexts/NotificationContext";
import { NavigationProvider } from "../../client/src/contexts/NavigationContext";
import { StaffProvider } from "../../client/src/contexts/StaffContext";

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
