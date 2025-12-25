const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000"
const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE !== "false"
const DEMO_STORAGE_KEY = "input-dash-demo-items"

export type LoginResponse = {
  access_token: string
  token_type: string
}

export type InputItem = {
  id: number
  text: string
  category: string
  intent: string
  severity: string
  source: string
  status: string
  created_at: string | null
}

const DEMO_SEED: InputItem[] = [
   {
     id: 1,
     text: "Prod API returning 500 when submitting checkout form — started after last deploy.",
     category: "incident",
     intent: "warning",
     severity: "high",
     source: "machine",
     status: "open",
     created_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
   },
   {
     id: 2,
     text: "Follow up with vendor about SLA breach for EU region latency spike.",
     category: "task",
     intent: "todo",
     severity: "medium",
     source: "human",
     status: "open",
     created_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
   },
   {
     id: 3,
     text: "[INFO] Nightly job completed successfully in 4m 12s.",
     category: "log",
     intent: "information",
     severity: "low",
     source: "machine",
     status: "done",
     created_at: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
   },
   {
     id: 4,
     text: "Customer asked if we can export dashboard metrics to CSV.",
     category: "issue",
     intent: "question",
     severity: "low",
     source: "human",
     status: "open",
     created_at: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
   },
 ]

function readDemoItems(): InputItem[] {
   if (typeof window === "undefined") return DEMO_SEED
   try {
     const raw = window.localStorage.getItem(DEMO_STORAGE_KEY)
     if (!raw) {
       window.localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(DEMO_SEED))
       return DEMO_SEED
     }
     const parsed = JSON.parse(raw) as unknown
     if (!Array.isArray(parsed)) return DEMO_SEED
     return parsed as InputItem[]
   } catch {
     return DEMO_SEED
   }
 }

function writeDemoItems(items: InputItem[]) {
   if (typeof window === "undefined") return
   window.localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(items))
 }

function classifyText(text: string): Pick<InputItem, "category" | "intent" | "severity" | "source"> {
   const normalized = text.toLowerCase()
   const isMachine = normalized.includes("[info]") || normalized.includes("error") || normalized.includes("exception") || normalized.includes("stack")
   const source = isMachine ? "machine" : "human"

   if (normalized.includes("incident") || normalized.includes("outage") || normalized.includes("down") || normalized.includes("sev")) {
     return { category: "incident", intent: "warning", severity: "high", source }
   }
   if (normalized.includes("error") || normalized.includes("bug") || normalized.includes("500") || normalized.includes("failed")) {
     return { category: "issue", intent: "warning", severity: "high", source }
   }
   if (normalized.includes("todo") || normalized.includes("follow up") || normalized.includes("call") || normalized.includes("email")) {
     return { category: "task", intent: "todo", severity: "medium", source }
   }
   if (normalized.startsWith("[info]") || normalized.includes("log")) {
     return { category: "log", intent: "information", severity: "low", source }
   }
   return { category: "note", intent: "information", severity: "low", source }
 }

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  })

  if (!response.ok) {
    const detail = await response.text().catch(() => "")
    throw new Error(detail || response.statusText)
  }

  return response.json() as Promise<T>
}

async function loginRequest(email: string, password: string): Promise<LoginResponse> {
  if (DEMO_MODE) {
    return { access_token: "demo-token", token_type: "bearer" }
  }

  const body = new URLSearchParams({ username: email, password })
  const response = await fetch(`${API_BASE_URL}/users/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  })

  if (!response.ok) {
    const detail = await response.text().catch(() => "")
    throw new Error(detail || response.statusText)
  }

  return response.json() as Promise<LoginResponse>
}

async function registerRequest(email: string, password: string) {
  if (DEMO_MODE) return
  return apiFetch("/users/register", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  })
}

async function getInputs(token: string): Promise<InputItem[]> {
  if (DEMO_MODE) {
    const items = readDemoItems()
    return [...items].sort((a, b) => (b.id ?? 0) - (a.id ?? 0))
  }
  return apiFetch<InputItem[]>("/inputs?order=dashboard", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

async function getInput(token: string, id: number): Promise<InputItem> {
  if (DEMO_MODE) {
    const items = readDemoItems()
    const item = items.find((i) => i.id === id)
    if (!item) throw new Error("Not found")
    return item
  }
  return apiFetch<InputItem>(`/inputs/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

async function createInput(token: string, text: string): Promise<InputItem> {
  if (DEMO_MODE) {
    const items = readDemoItems()
    const nextId = items.reduce((max, item) => Math.max(max, item.id), 0) + 1
    const meta = classifyText(text)
    const created: InputItem = {
      id: nextId,
      text,
      status: "open",
      created_at: new Date().toISOString(),
      ...meta,
    }
    const next = [created, ...items]
    writeDemoItems(next)
    return created
  }
  return apiFetch<InputItem>("/inputs", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ text }),
  })
}

async function updateInput(token: string, id: number, payload: Partial<Pick<InputItem, "text" | "category" | "intent" | "severity" | "source" | "status">>) {
  if (DEMO_MODE) {
    const items = readDemoItems()
    const idx = items.findIndex((i) => i.id === id)
    if (idx < 0) throw new Error("Not found")

    const existing = items[idx]
    const next: InputItem = {
      ...existing,
      ...payload,
    }

    if (typeof payload.text === "string" && payload.text.trim()) {
      const meta = classifyText(payload.text)
      next.category = payload.category ?? meta.category
      next.intent = payload.intent ?? meta.intent
      next.severity = payload.severity ?? meta.severity
      next.source = payload.source ?? meta.source
    }

    const updated = [...items]
    updated[idx] = next
    writeDemoItems(updated)
    return next
  }
  return apiFetch<InputItem>(`/inputs/${id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })
}

async function deleteInput(token: string, id: number): Promise<{ status: string }> {
  if (DEMO_MODE) {
    const items = readDemoItems()
    const next = items.filter((i) => i.id !== id)
    writeDemoItems(next)
    return { status: "ok" }
  }
  return apiFetch<{ status: string }>(`/inputs/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

export const apiClient = {
  loginRequest,
  registerRequest,
  getInputs,
  getInput,
  createInput,
  updateInput,
  deleteInput,
}
