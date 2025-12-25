"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Plus, LayoutGrid, List } from "lucide-react"

export function Sidebar() {
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  return (
    <aside className="w-64 border-r border-border bg-sidebar">
      <div className="flex flex-col h-full">
        {/* Header - Empty div for spacing */}
        <div className="h-16 border-b border-sidebar-border"></div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <Link
            href="/"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive("/")
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent/10"
            }`}
          >
            <LayoutGrid className="w-5 h-5" />
            <span className="font-medium">Dashboard</span>
          </Link>

          <Link
            href="/submit"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive("/submit")
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent/10"
            }`}
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">Submit Input</span>
          </Link>

          <Link
            href="/inputs"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              isActive("/inputs")
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent/10"
            }`}
          >
            <List className="w-5 h-5" />
            <span className="font-medium">All Inputs</span>
          </Link>
        </nav>
      </div>
    </aside>
  )
}
