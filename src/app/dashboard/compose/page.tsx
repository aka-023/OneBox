// src/app/dashboard/compose/page.tsx
"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Send } from "lucide-react"
import { Button } from "../../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import { Textarea } from "../../components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { Alert, AlertDescription } from "../../components/ui/alert"

export default function ComposeEmailPage() {
  const router = useRouter()
  const [accounts, setAccounts] = useState<{ email: string }[]>([])
  const [formData, setFormData] = useState({
    from: "",
    to: "",
    subject: "",
    message: "",
  })
  const [sending, setSending] = useState(false)
  const [error, setError] = useState("")

  // Load linked accounts to choose 'from'
  useEffect(() => {
    fetch("/api/accounts")
      .then((res) => res.json())
      .then((data: { email: string }[]) => {
        setAccounts(data)
        if (data.length) {
          setFormData((prev) => ({ ...prev, from: data[0].email }))
        }
      })
      .catch(console.error)
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleFromChange = (value: string) => {
    setFormData((prev) => ({ ...prev, from: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    setError("")

    try {
      const res = await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to send email.")
      }

      router.push("/dashboard")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.push("/dashboard")} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Inbox
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Compose Email</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="from">From</Label>
                <Select value={formData.from} onValueChange={handleFromChange} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((acct) => (
                      <SelectItem key={acct.email} value={acct.email}>
                        {acct.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="to">To</Label>
                <Input
                  id="to"
                  name="to"
                  type="email"
                  value={formData.to}
                  onChange={handleChange}
                  placeholder="recipient@example.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Email subject"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={8}
                  placeholder="Write your message here..."
                  required
                />
              </div>

              <Button type="submit" disabled={sending} className="w-full">
                {sending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Email
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
