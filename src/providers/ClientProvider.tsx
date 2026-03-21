"use client";

import { AuthProvider } from "@/providers/AuthProvider";
import { ReactNode } from "react";

export function ClientProvider({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}