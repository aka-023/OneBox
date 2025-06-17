import Link from "next/link"
import { Card, CardContent } from "../components/ui/card"
import { Skeleton } from "../components/ui/skeleton"
import { Mail } from "lucide-react"

export type Email = {
  id: string
  subject: string
  snippet: string
}

interface EmailListProps {
  emails: Email[]
  loading?: boolean
}

function EmailSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      </CardContent>
    </Card>
  )
}

export default function EmailList({ emails, loading = false }: EmailListProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <EmailSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (emails.length === 0) {
    return (
      <div className="text-center py-12">
        <Mail className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No emails found</h3>
        <p className="text-muted-foreground">Your inbox is empty or emails are still loading.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {emails.map((email) => (
        <Link key={email.id} href={`/dashboard/email/${email.id}`}>
          <Card className="hover:shadow-md transition-shadow cursor-pointer m-2">
            <CardContent className="p-3">
              <h3 className="font-semibold text-lg text-foreground mb-1 line-clamp-1">
                {email.subject || "(No Subject)"}
              </h3>
              <p className="text-muted-foreground text-sm line-clamp-2">{email.snippet}</p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
