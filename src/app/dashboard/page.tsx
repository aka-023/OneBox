// src/app/dashboard/page.tsx
"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import EmailList, { type Email } from "../components/EmailList"
import { AppSidebar } from "../components/AppSidebar"
import { SidebarProvider, SidebarInset } from "../components/ui/sidebar"
import { Separator } from "../components/ui/separator"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "../components/ui/breadcrumb"

// Refresh interval: 5 minutes in milliseconds
const REFRESH_INTERVAL = 5 * 60 * 1000

type Account = {
  _id: string
  email: string
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [accounts, setAccounts] = useState<Account[]>([])
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
  const [emails, setEmails] = useState<Email[]>([])
  const [loadingEmails, setLoadingEmails] = useState(false)
  
  // Keep a ref to the timer so we can clear it
  const refreshTimer = useRef<number>(0)

  const linkAccount = async () => {
    try {
      const res = await fetch("/api/accounts/oauth-url")
      const { url } = await res.json()
      window.location.href = url
    } catch (err) {
      console.error("Failed to start link flow", err)
    }
  }

  // Redirect if not logged in
  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
  }, [status, router])

  // Load linked accounts once
  useEffect(() => {
    if (!session?.user?.id) return
    fetch("/api/accounts")
      .then((res) => res.json())
      .then((data: Account[]) => {
        setAccounts(data)
        if (data.length) setSelectedAccount(data[0])
      })
      .catch(console.error)
  }, [session])

  // Fetch emails for the selected account and set up refresh interval
  useEffect(() => {
    // clear previous timer
    if (refreshTimer.current) {
      clearInterval(refreshTimer.current)
    }

    if (!selectedAccount || !session?.accessToken) {
      setEmails([])
      return
    }

    const fetchEmails = async () => {
      setLoadingEmails(true)
      try {
        const res = await fetch(
          `/api/emails?account=${encodeURIComponent(selectedAccount.email)}`,
          { headers: { Authorization: `Bearer ${session.accessToken}` } }
        )
        const data = await res.json()
        setEmails(data.slice(0, 15))
      } catch (err) {
        console.error("Failed to fetch emails", err)
      } finally {
        setLoadingEmails(false)
      }
    }

    // initial fetch
    fetchEmails()
    // set refresh timer
    refreshTimer.current = window.setInterval(fetchEmails, REFRESH_INTERVAL)

    return () => {
      if (refreshTimer.current) {
        clearInterval(refreshTimer.current)
      }
    }
  }, [selectedAccount, session])

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <AppSidebar
        session={session}
        accounts={accounts}
        selectedAccount={selectedAccount}
        onAccountSelect={setSelectedAccount}
        onLinkAccount={linkAccount}
        onSignOut={() => signOut()}
      />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>
                  {selectedAccount
                    ? `${selectedAccount.email} - Inbox`
                    : "Inbox"}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold tracking-tight">Inbox</h1>
              {selectedAccount && (
                <p className="text-muted-foreground mt-1">
                  Showing latest emails from {selectedAccount.email}
                </p>
              )}
            </div>

            {!selectedAccount && accounts.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto max-w-md">
                  <h3 className="text-lg font-semibold mb-2">
                    No accounts connected
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Connect your first email account to start managing your emails
                    in one place.
                  </p>
                </div>
              </div>
            ) : (
              <EmailList emails={emails} loading={loadingEmails} />
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
