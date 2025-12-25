"use client"

import type { ReactNode } from "react"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"

import { useAuth } from "@/contexts/auth-context"

export function AuthGate({ children }: { children: ReactNode }) {
  const { token, isLoading } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return
    if (pathname === "/auth") return
    if (!token) {
      router.replace("/auth")
    }
  }, [isLoading, pathname, router, token])

  if (isLoading) return null
  if (pathname !== "/auth" && !token) return null

  return children
}
