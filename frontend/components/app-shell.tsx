"use client"

import type { ReactNode } from "react"

import { usePathname } from "next/navigation"

import { Sidebar } from "@/components/sidebar"
import { WelcomeModal } from "@/components/welcome-modal"

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const isAuthPage = pathname === "/auth"

  if (isAuthPage) {
    return <>{children}</>
  }

  return (
    <>
      <WelcomeModal />
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <main className="flex-1">{children}</main>
      </div>
    </>
  )
}
