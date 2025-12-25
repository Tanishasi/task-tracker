"use client"

import type { ReactNode } from "react"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"

import { apiClient, type LoginResponse } from "@/lib/api-client"

const STORAGE_KEY = "input-dash-auth"
const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE !== "false"

type StoredAuth = {
  token: string
  email: string
}

type AuthContextValue = {
  token: string | null
  email: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<LoginResponse>
  register: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function readStorage(): StoredAuth | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as StoredAuth
    if (typeof parsed.token !== "string" || typeof parsed.email !== "string") {
      return null
    }
    return parsed
  } catch {
    return null
  }
}

function writeStorage(data: StoredAuth | null) {
  if (typeof window === "undefined") return
  if (!data) {
    window.localStorage.removeItem(STORAGE_KEY)
    return
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(DEMO_MODE ? "demo-token" : null)
  const [email, setEmail] = useState<string | null>(DEMO_MODE ? "demo@local" : null)
  const [isLoading, setIsLoading] = useState(!DEMO_MODE)

  useEffect(() => {
    if (DEMO_MODE) {
      return
    }

    const stored = readStorage()
    if (stored) {
      setToken(stored.token)
      setEmail(stored.email)
    }
    setIsLoading(false)
  }, [])

  const logout = useCallback(() => {
    if (DEMO_MODE) return
    setToken(null)
    setEmail(null)
    writeStorage(null)
  }, [])

  const setAuthState = useCallback((next: StoredAuth) => {
    if (DEMO_MODE) {
      setToken("demo-token")
      setEmail("demo@local")
      return
    }
    setToken(next.token)
    setEmail(next.email)
    writeStorage(next)
  }, [])

  const login = useCallback(async (emailValue: string, password: string) => {
    if (DEMO_MODE) {
      const response = await apiClient.loginRequest(emailValue, password)
      setToken(response.access_token)
      setEmail(emailValue)
      return response
    }
    const response = await apiClient.loginRequest(emailValue, password)
    setAuthState({ token: response.access_token, email: emailValue })
    return response
  }, [setAuthState])

  const register = useCallback(async (emailValue: string, password: string) => {
    if (DEMO_MODE) {
      await apiClient.registerRequest(emailValue, password)
      await login(emailValue, password)
      return
    }
    await apiClient.registerRequest(emailValue, password)
    await login(emailValue, password)
  }, [login])

  const value = useMemo<AuthContextValue>(
    () => ({ token, email, isLoading, login, register, logout }),
    [token, email, isLoading, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
