"use client"

import type { FormEvent } from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

import { apiClient, type InputItem } from "@/lib/api-client"
import { useAuth } from "@/contexts/auth-context"

export default function EditInputPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const { token } = useAuth()

  const [item, setItem] = useState<InputItem | null>(null)
  const [original, setOriginal] = useState<InputItem | null>(null)
  const [text, setText] = useState("")
  const [status, setStatus] = useState<"open" | "done">("open")
  const [category, setCategory] = useState("")
  const [intent, setIntent] = useState("")
  const [severity, setSeverity] = useState("")
  const [source, setSource] = useState("")

  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const idNum = Number.parseInt(params.id, 10)

  const categoryOptions = ["issue", "event", "log", "task", "incident", "note"]
  const intentOptions = ["todo", "warning", "deadline", "information", "question", "unknown"]
  const severityOptions = ["low", "medium", "high", "unknown"]
  const sourceOptions = ["human", "machine", "vendor", "unknown"]

  useEffect(() => {
    const run = async () => {
      if (!token) return
      if (!Number.isFinite(idNum)) {
        setError("Invalid input id")
        return
      }

      setIsLoading(true)
      try {
        setError(null)
        const data = await apiClient.getInput(token, idNum)
        setItem(data)
        setOriginal(data)
        setText(data.text)
        setStatus(data.status === "done" ? "done" : "open")
        setCategory(data.category)
        setIntent(data.intent)
        setSeverity(data.severity)
        setSource(data.source)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load")
      } finally {
        setIsLoading(false)
      }
    }

    void run()
  }, [idNum, token])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!token) {
      setError("Not authenticated")
      return
    }

    if (!Number.isFinite(idNum)) {
      setError("Invalid input id")
      return
    }

    setIsSaving(true)
    try {
      setError(null)
      const payload: Partial<Pick<InputItem, "text" | "category" | "intent" | "severity" | "source" | "status">> = {}

      if (original) {
        if (text !== original.text) payload.text = text
        if (status !== original.status) payload.status = status
        if (category !== original.category) payload.category = category
        if (intent !== original.intent) payload.intent = intent
        if (severity !== original.severity) payload.severity = severity
        if (source !== original.source) payload.source = source
      } else {
        payload.text = text
        payload.status = status
        payload.category = category
        payload.intent = intent
        payload.severity = severity
        payload.source = source
      }

      const updated = await apiClient.updateInput(token, idNum, payload)
      setItem(updated)
      router.push("/inputs")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-2xl">Edit Input</CardTitle>
          <CardDescription>Update the text or mark the item as done.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && <p className="text-sm text-destructive">{error}</p>}
          {isLoading && <p className="text-sm text-muted-foreground">Loading...</p>}

          {item && (
            <div className="flex flex-wrap gap-2">
              <Badge className="category-badge">{item.category}</Badge>
              <Badge className={item.severity === "high" ? "severity-high" : item.severity === "medium" ? "severity-medium" : "severity-low"}>
                {item.severity}
              </Badge>
              <span className="text-xs text-muted-foreground">{item.intent}</span>
              <span className="text-xs text-muted-foreground">{item.source}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="text" className="block text-sm font-medium text-foreground">
                Text
              </label>
              <Textarea
                id="text"
                value={text}
                onChange={(e) => setText(e.currentTarget.value)}
                className="bg-input border-border text-foreground placeholder:text-muted-foreground min-h-40 resize-none"
                required
              />
              <p className="text-xs text-muted-foreground">
                Saving a text change will re-run classification on the backend.
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="status" className="block text-sm font-medium text-foreground">
                Status
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.currentTarget.value === "done" ? "done" : "open")}
                className="w-full h-10 rounded-md border border-border bg-input px-3 text-sm text-foreground"
              >
                <option value="open">open</option>
                <option value="done">done</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="category" className="block text-sm font-medium text-foreground">
                  Category
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.currentTarget.value)}
                  className="w-full h-10 rounded-md border border-border bg-input px-3 text-sm text-foreground"
                >
                  {categoryOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="intent" className="block text-sm font-medium text-foreground">
                  Intent
                </label>
                <select
                  id="intent"
                  value={intent}
                  onChange={(e) => setIntent(e.currentTarget.value)}
                  className="w-full h-10 rounded-md border border-border bg-input px-3 text-sm text-foreground"
                >
                  {intentOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="severity" className="block text-sm font-medium text-foreground">
                  Severity
                </label>
                <select
                  id="severity"
                  value={severity}
                  onChange={(e) => setSeverity(e.currentTarget.value)}
                  className="w-full h-10 rounded-md border border-border bg-input px-3 text-sm text-foreground"
                >
                  {severityOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="source" className="block text-sm font-medium text-foreground">
                  Source
                </label>
                <select
                  id="source"
                  value={source}
                  onChange={(e) => setSource(e.currentTarget.value)}
                  className="w-full h-10 rounded-md border border-border bg-input px-3 text-sm text-foreground"
                >
                  {sourceOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={isSaving || isLoading}>
                {isSaving ? "Saving..." : "Save"}
              </Button>
              <Button asChild type="button" variant="outline" className="bg-transparent">
                <Link href="/inputs">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
