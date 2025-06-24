"use client";

import React, { createContext, useContext } from "react";
import {
  whitelabel,
  WhitelabelConfig,
  getWhitelabelContent,
} from "@/config/whitelabel";

interface WhitelabelContextType {
  config: WhitelabelConfig;
  getContent: typeof getWhitelabelContent;
}

const WhitelabelContext = createContext<WhitelabelContextType | undefined>(
  undefined,
);

export function WhitelabelProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WhitelabelContext.Provider
      value={{ config: whitelabel, getContent: getWhitelabelContent }}
    >
      {children}
    </WhitelabelContext.Provider>
  );
}

export function useWhitelabel() {
  const context = useContext(WhitelabelContext);
  if (!context) {
    throw new Error("useWhitelabel must be used within a WhitelabelProvider");
  }
  return context;
}

// Convenience hooks for common use cases
export function useBranding() {
  const { config } = useWhitelabel();
  return config.branding;
}

export function useFeatures() {
  const { config } = useWhitelabel();
  return config.features;
}

export function useRoutes() {
  const { config } = useWhitelabel();
  return config.routes;
}
