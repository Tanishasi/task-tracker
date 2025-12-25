"use client"

import type { FormEvent } from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"

import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/contexts/auth-context"

export default function SubmitInput() {
  const [text, setText] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { token } = useAuth()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    if (!token) {
      setError("Not authenticated")
      setIsSubmitting(false)
      return
    }

    try {
      setError(null)
      await apiClient.createInput(token, text)

      setSubmitted(true)
      setText("")

      setTimeout(() => setSubmitted(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="p-6 space-y-1">
          <h1 className="text-3xl font-bold text-foreground">Submit New Input</h1>
          <p className="text-muted-foreground">Add unstructured data to be categorized and analyzed</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-2xl space-y-6">
          {/* Success Message */}
          {submitted && (
            <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg text-primary">
              <p className="font-medium">✓ Input submitted successfully</p>
              <p className="text-sm text-primary/80">Your input will be categorized and analyzed automatically</p>
            </div>
          )}

          {/* Form Card */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Input Details</CardTitle>
              <CardDescription>Provide the unstructured data you want to submit</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Text Input */}
                <div className="space-y-2">
                  <label htmlFor="text" className="block text-sm font-medium text-foreground">
                    Input Text <span className="text-destructive">*</span>
                  </label>
                  <Textarea
                    id="text"
                    placeholder="Paste your unstructured input here... (logs, errors, notes, events, etc.)"
                    value={text}
                    onChange={(e) => setText(e.currentTarget.value)}
                    required
                    className="bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-primary min-h-40 resize-none"
                  />
                  {/* <p className="text-xs text-muted-foreground">
                    The AI will automatically categorize this as an issue, event, log, task, incident, or note
                  </p> */}
                </div>

                {error && <p className="text-sm text-destructive">{error}</p>}

                {/* Info Box */}
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg space-y-2">
         
                </div>

                {/* Submit Button */}
                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-border hover:bg-card bg-transparent"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    disabled={isSubmitting || !text.trim()}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Input"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
