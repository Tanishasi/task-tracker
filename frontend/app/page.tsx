"use client"

import { useEffect, useMemo, useState } from "react"
import { AlertCircle, Clock, Eye } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Pie, PieChart } from "recharts"

import { apiClient, type InputItem } from "@/lib/api-client"
import { useAuth } from "@/contexts/auth-context"

export default function Dashboard() {
  const { token } = useAuth()
  const [items, setItems] = useState<InputItem[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) return
    ;(async () => {
      try {
        setError(null)
        const data = await apiClient.getInputs(token)
        setItems(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load")
      }
    })()
  }, [token])

  const stats = useMemo(() => {
    const total = items.length
    const high = items.filter((i) => i.severity === "high").length
    const medium = items.filter((i) => i.severity === "medium").length
    const low = items.filter((i) => i.severity === "low").length
    return { total, high, medium, low }
  }, [items])

  const severityDistribution = useMemo(() => {
    const counts = { high: 0, medium: 0, low: 0, unknown: 0 }
    for (const item of items) {
      if (item.severity === "high") counts.high += 1
      else if (item.severity === "medium") counts.medium += 1
      else if (item.severity === "low") counts.low += 1
      else counts.unknown += 1
    }
    return counts
  }, [items])

  const openVsDone = useMemo(() => {
    const counts = { open: 0, done: 0 }
    for (const item of items) {
      if (item.status === "done") counts.done += 1
      else counts.open += 1
    }
    return counts
  }, [items])

  const severityChartConfig = {
    high: { label: "High", color: "#ef4444" },
    medium: { label: "Medium", color: "#f59e0b" },
    low: { label: "Low", color: "#22c55e" },
    unknown: { label: "Unknown", color: "#94a3b8" },
  } as const

  const severityChartData = useMemo(
    () => [
      { severity: "high", count: severityDistribution.high, fill: "var(--color-high)" },
      { severity: "medium", count: severityDistribution.medium, fill: "var(--color-medium)" },
      { severity: "low", count: severityDistribution.low, fill: "var(--color-low)" },
      { severity: "unknown", count: severityDistribution.unknown, fill: "var(--color-unknown)" },
    ],
    [severityDistribution],
  )

  const openDoneChartConfig = {
    open: { label: "Open", color: "#3b82f6" },
    done: { label: "Done", color: "#22c55e" },
  } as const

  const openDoneChartData = useMemo(
    () => [
      { status: "open", count: openVsDone.open, fill: "var(--color-open)" },
      { status: "done", count: openVsDone.done, fill: "var(--color-done)" },
    ],
    [openVsDone],
  )

  const highSeverityItems = useMemo(() => {
    return items.filter((i) => i.severity === "high" && i.status !== "done").slice(0, 6)
  }, [items])

  const categoryBreakdown = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const item of items) {
      counts[item.category] = (counts[item.category] ?? 0) + 1
    }
    const keys = Object.keys(counts)
    return keys
      .sort((a, b) => (counts[b] ?? 0) - (counts[a] ?? 0))
      .slice(0, 6)
      .map((k) => ({ name: k, count: counts[k] ?? 0, color: "bg-primary/10" }))
  }, [items])

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="p-6 space-y-1">
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Your high-priority inputs at a glance</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6 space-y-6">
          {error && <p className="text-sm text-destructive">{error}</p>}
          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-4">
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Total Inputs</p>
                  <p className="text-3xl font-bold text-foreground">{stats.total}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-destructive" />
                    <p className="text-sm text-muted-foreground">High</p>
                  </div>
                  <p className="text-3xl font-bold text-destructive">{stats.high}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-accent" />
                    <p className="text-sm text-muted-foreground">Medium</p>
                  </div>
                  <p className="text-3xl font-bold text-accent">{stats.medium}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Low</p>
                  </div>
                  <p className="text-3xl font-bold text-muted-foreground">{stats.low}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Severity Distribution</p>
                    <p className="text-lg font-semibold text-foreground">High / Medium / Low / Unknown</p>
                  </div>

                  <ChartContainer config={severityChartConfig} className="h-[220px] w-full">
                    <PieChart>
                      <ChartTooltip content={<ChartTooltipContent nameKey="severity" />} />
                      <Pie data={severityChartData} dataKey="count" nameKey="severity" innerRadius={60} strokeWidth={2} />
                      <ChartLegend content={<ChartLegendContent nameKey="severity" />} />
                    </PieChart>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Open vs Done</p>
                    <p className="text-lg font-semibold text-foreground">Backlog vs progress</p>
                  </div>

                  <ChartContainer config={openDoneChartConfig} className="h-[220px] w-full">
                    <PieChart>
                      <ChartTooltip content={<ChartTooltipContent nameKey="status" />} />
                      <Pie data={openDoneChartData} dataKey="count" nameKey="status" innerRadius={60} strokeWidth={2} />
                      <ChartLegend content={<ChartLegendContent nameKey="status" />} />
                    </PieChart>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* High Severity Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-destructive" />
              <h2 className="text-lg font-semibold text-foreground">High Priority Items</h2>
            </div>

            <div className="space-y-3">
              {highSeverityItems.map((item: InputItem) => (
                <Card key={item.id} className="bg-card/50 border-destructive/30 hover:bg-card/80 transition-colors">
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <p className="text-foreground font-medium">{item.text}</p>
                        <Badge className="severity-high">High</Badge>
                      </div>

                      <div className="flex items-center gap-4 text-sm">
                        <span className="category-badge">{item.category}</span>
                        <span className="text-muted-foreground">{item.source}</span>
                        <span className="text-muted-foreground">
                          {item.created_at
                            ? new Date(item.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                            : ""}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">Inputs by Category</h2>
            <div className="grid grid-cols-3 gap-3">
              {categoryBreakdown.map((cat: { name: string; count: number; color: string }) => (
                <Card
                  key={cat.name}
                  className="bg-card border-border hover:border-primary/50 transition-colors cursor-pointer"
                >
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">{cat.name}</p>
                      <p className="text-2xl font-bold text-foreground">{cat.count}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
