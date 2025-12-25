"use client"

import type { ReactNode } from "react"

import { AuthProvider } from "@/contexts/auth-context"
import { AuthGate } from "@/components/auth-gate"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <AuthGate>{children}</AuthGate>
    </AuthProvider>
  )
}
