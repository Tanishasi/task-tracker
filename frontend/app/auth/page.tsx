"use client"

import type { FormEvent } from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/contexts/auth-context"

export default function AuthPage() {
  const router = useRouter()
  const { login, register } = useAuth()

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_DEMO_MODE !== "false") {
      router.replace("/")
    }
  }, [router])

  const [mode, setMode] = useState<"login" | "register">("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      if (mode === "login") {
        await login(email, password)
      } else {
        await register(email, password)
      }
      router.replace("/")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md bg-card border-border">
        <CardHeader>
          <CardTitle>{mode === "login" ? "Sign in" : "Create account"}</CardTitle>
          <CardDescription>
            {mode === "login" ? "Login to access your dashboard" : "Register and start submitting inputs"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground" htmlFor="email">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.currentTarget.value)}
                required
                className="bg-input border-border"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground" htmlFor="password">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.currentTarget.value)}
                required
                className="bg-input border-border"
              />
              <p className="text-xs text-muted-foreground">Minimum 8 characters</p>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" className="w-full" disabled={isSubmitting || !email || !password}>
              {isSubmitting ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
            </Button>

            <button
              type="button"
              className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => {
                setError(null)
                setMode((prev: "login" | "register") => (prev === "login" ? "register" : "login"))
              }}
            >
              {mode === "login" ? "New here? Create an account" : "Already have an account? Sign in"}
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
