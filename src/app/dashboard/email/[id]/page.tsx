// src/app/dashboard/email/[id]/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Reply, Forward, Archive, Trash2 } from "lucide-react"
import { Button } from "../../../components/ui/button"
import { Card, CardContent, CardHeader } from "../../../components/ui/card"
import { Separator } from "../../../components/ui/separator"
import { Badge } from "../../../components/ui/badge"

type Email = {
  subject: string
  from: string
  body: string
}

export default function EmailDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [email, setEmail] = useState<Email>()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEmail = async () => {
      try {
        const res = await fetch(`/api/emails/${id}`)
        const data = await res.json()
        setEmail(data)
      } catch (error) {
        console.error("Failed to fetch email:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchEmail()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-8 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!email) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto text-center py-12">
          <h2 className="text-xl font-semibold mb-2">Email not found</h2>
          <p className="text-muted-foreground mb-4">The email you're looking for doesn't exist or has been deleted.</p>
          <Button onClick={() => router.push("/dashboard")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Inbox
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.push("/dashboard")} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Inbox
          </Button>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <h1 className="text-2xl font-bold leading-tight">{email.subject || "(No Subject)"}</h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>From:</span>
                  <Badge variant="secondary">{email.from}</Badge>
                </div>
              </div>
            </div>

            <Separator className="mt-4" />

            <div className="flex gap-2 pt-2">
              <Button variant="outline" size="sm">
                <Reply className="h-4 w-4 mr-2" />
                Reply
              </Button>
              <Button variant="outline" size="sm">
                <Forward className="h-4 w-4 mr-2" />
                Forward
              </Button>
              <Button variant="outline" size="sm">
                <Archive className="h-4 w-4 mr-2" />
                Archive
              </Button>
              <Button variant="outline" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            <div
              className="prose prose-sm max-w-none text-foreground"
              dangerouslySetInnerHTML={{ __html: email.body }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
