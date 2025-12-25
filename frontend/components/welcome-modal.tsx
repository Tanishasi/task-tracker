"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Plus, LayoutGrid, Sparkles } from "lucide-react"

export function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(true)

  useEffect(() => {
    // Check if user has dismissed the modal
    const isDismissed = localStorage.getItem("welcome-modal-dismissed")
    if (isDismissed) {
      setIsOpen(false)
    }
  }, [])

  const handleDismiss = () => {
    localStorage.setItem("welcome-modal-dismissed", "true")
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen}>
      <DialogContent className="max-w-md border-border bg-card shadow-lg">
        <div className="space-y-6 py-4">
          {/* Header */}
          <div className="space-y-3 text-center">
            <div className="flex justify-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">Welcome</h2>
              <p className="text-sm text-muted-foreground mt-2">
                Organize and analyze unstructured inputs with AI-powered categorization
              </p>
            </div>
          </div>

          {/* Action Cards */}
          <div className="space-y-3">
            <Link href="/submit" onClick={handleDismiss} className="block">
              <button className="w-full p-4 rounded-lg border-2 border-primary/30 hover:border-primary/60 bg-primary/8 hover:bg-primary/12 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                    <Plus className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-foreground text-sm">Add New Input</p>
                    <p className="text-xs text-muted-foreground">Submit unstructured data</p>
                  </div>
                </div>
              </button>
            </Link>

            <Link href="/" onClick={handleDismiss} className="block">
              <button className="w-full p-4 rounded-lg border-2 border-accent/30 hover:border-accent/60 bg-accent/8 hover:bg-accent/12 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                    <LayoutGrid className="w-5 h-5 text-accent" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-foreground text-sm">View Dashboard</p>
                    <p className="text-xs text-muted-foreground">See high-priority items</p>
                  </div>
                </div>
              </button>
            </Link>
          </div>

          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="w-full py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Dismiss
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
