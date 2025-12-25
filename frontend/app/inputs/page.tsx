"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { X, Check, Filter, Pencil } from "lucide-react"

import { apiClient, type InputItem } from "@/lib/api-client"
import { useAuth } from "@/contexts/auth-context"

export default function InputsList() {
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  const { token } = useAuth()
  const [items, setItems] = useState<InputItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = async () => {
    if (!token) return
    setIsLoading(true)
    try {
      setError(null)
      const data = await apiClient.getInputs(token)
      setItems(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
  }, [token])

  const categories = ["all", "incident", "task", "event", "issue", "log", "note"]
  const severities = ["high", "medium", "low", "unknown"]

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "severity-high"
      case "medium":
        return "severity-medium"
      default:
        return "severity-low"
    }
  }

  const filteredInputs = useMemo(() => {
    return items.filter((input) => {
      const matchesSearch = input.text.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = activeTab === "all" || input.category === activeTab
      return matchesSearch && matchesCategory
    })
  }, [activeTab, items, searchQuery])

  const openInputs = filteredInputs.filter((i) => i.status === "open")
  const doneInputs = filteredInputs.filter((i) => i.status === "done")

  const handleMarkDone = async (id: number) => {
    if (!token) return
    await apiClient.updateInput(token, id, { status: "done" })
    await refresh()
  }

  const handleDelete = async (id: number) => {
    if (!token) return
    await apiClient.deleteInput(token, id)
    await refresh()
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="p-6 space-y-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-foreground">All Inputs</h1>
            <p className="text-muted-foreground">Browse and manage all your submissions</p>
          </div>

          {/* Search and Filter */}
          <div className="flex gap-3 items-center">
            <Input
              placeholder="Search inputs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-input border-border text-foreground placeholder:text-muted-foreground"
            />
            <Button variant="outline" className="border-border text-foreground hover:bg-card bg-transparent">
              <Filter className="w-4 h-4 mr-2" />
              More Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {error && <p className="text-sm text-destructive mb-4">{error}</p>}
          {isLoading && <p className="text-sm text-muted-foreground mb-4">Loading...</p>}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* Tabs */}
            <TabsList className="bg-card border-b border-border rounded-none mb-6 p-0 h-auto">
              {categories.map((cat) => (
                <TabsTrigger
                  key={cat}
                  value={cat}
                  className="capitalize rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3 text-muted-foreground data-[state=active]:text-foreground"
                >
                  {cat === "all" ? "All Inputs" : cat}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Tab Contents */}
            {categories.map((cat) => (
              <TabsContent key={cat} value={cat} className="space-y-3">
                {/* Open Items */}
                {openInputs.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-muted-foreground px-1">Open ({openInputs.length})</h3>
                    {openInputs.map((input) => (
                      <Card key={input.id} className="bg-card border-border hover:border-primary/30 transition-colors">
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 space-y-3">
                              <p className="text-foreground font-medium">{input.text}</p>
                              <div className="flex items-center gap-3 flex-wrap">
                                <Badge className="category-badge">{input.category}</Badge>
                                <Badge className={getSeverityColor(input.severity)}>{input.severity}</Badge>
                                <span className="text-xs text-muted-foreground">{input.source}</span>
                                <span className="text-xs text-muted-foreground">
                                  {input.created_at ? new Date(input.created_at).toLocaleString() : ""}
                                </span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                asChild
                                size="sm"
                                variant="ghost"
                                className="text-muted-foreground hover:bg-card"
                                title="Edit"
                              >
                                <Link href={`/inputs/${input.id}`}>
                                  <Pencil className="w-4 h-4" />
                                </Link>
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-primary hover:bg-primary/10"
                                title="Mark as done"
                                onClick={() => void handleMarkDone(input.id)}
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-destructive hover:bg-destructive/10"
                                title="Delete"
                                onClick={() => void handleDelete(input.id)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Done Items */}
                {doneInputs.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-muted-foreground px-1">Done ({doneInputs.length})</h3>
                    {doneInputs.map((input) => (
                      <Card key={input.id} className="bg-card/30 border-border/50 opacity-60">
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 space-y-3">
                              <p className="text-muted-foreground line-through">{input.text}</p>
                              <div className="flex items-center gap-3 flex-wrap">
                                <Badge className="category-badge">{input.category}</Badge>
                                <Badge className={getSeverityColor(input.severity)}>{input.severity}</Badge>
                                <span className="text-xs text-muted-foreground">{input.source}</span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                asChild
                                size="sm"
                                variant="ghost"
                                className="text-muted-foreground hover:bg-card"
                                title="Edit"
                              >
                                <Link href={`/inputs/${input.id}`}>
                                  <Pencil className="w-4 h-4" />
                                </Link>
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-destructive hover:bg-destructive/10"
                                title="Delete"
                                onClick={() => void handleDelete(input.id)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {openInputs.length === 0 && doneInputs.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No inputs found in this category</p>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </div>
  )
}
