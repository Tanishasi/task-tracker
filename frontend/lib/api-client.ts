const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000"

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
  return apiFetch("/users/register", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  })
}

async function getInputs(token: string): Promise<InputItem[]> {
  return apiFetch<InputItem[]>("/inputs?order=dashboard", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

async function getInput(token: string, id: number): Promise<InputItem> {
  return apiFetch<InputItem>(`/inputs/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

async function createInput(token: string, text: string): Promise<InputItem> {
  return apiFetch<InputItem>("/inputs", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ text }),
  })
}

async function updateInput(token: string, id: number, payload: Partial<Pick<InputItem, "text" | "category" | "intent" | "severity" | "source" | "status">>) {
  return apiFetch<InputItem>(`/inputs/${id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })
}

async function deleteInput(token: string, id: number): Promise<{ status: string }> {
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
