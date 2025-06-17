"use client"

import type { Session } from "next-auth"
import Link from "next/link"
import { Mail, Plus, Settings, User, LogOut, Inbox, PenTool } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../components/ui/dropdown-menu"

type Account = {
  _id: string
  email: string
}

interface AppSidebarProps {
  session: Session | null
  accounts: Account[]
  selectedAccount: Account | null
  onAccountSelect: (account: Account) => void
  onLinkAccount: () => void
  onSignOut: () => void
}

export function AppSidebar({
  session,
  accounts,
  selectedAccount,
  onAccountSelect,
  onLinkAccount,
  onSignOut,
}: AppSidebarProps) {
  const getInitials = (email: string) => {
    return email.split("@")[0].slice(0, 2).toUpperCase()
  }

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Mail className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-semibold">OneBox</span>
            <span className="text-xs text-muted-foreground">All emails in one place</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Actions</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/dashboard/compose">
                    <PenTool className="h-4 w-4" />
                    <span>Compose</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/dashboard">
                    <Inbox className="h-4 w-4" />
                    <span>Inbox</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Email Accounts</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {accounts.map((account) => (
                <SidebarMenuItem key={account._id}>
                  <SidebarMenuButton
                    onClick={() => onAccountSelect(account)}
                    isActive={selectedAccount?.email === account.email}
                    className="w-full justify-start"
                  >
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">{getInitials(account.email)}</AvatarFallback>
                    </Avatar>
                    <span className="truncate">{account.email}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton onClick={onLinkAccount} className="w-full justify-start text-muted-foreground">
                  <Plus className="h-4 w-4" />
                  <span>Add Account</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="w-full">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={session?.user?.image || undefined} />
                    <AvatarFallback>{session?.user?.name?.slice(0, 2).toUpperCase() || "U"}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start text-left">
                    <span className="text-sm font-medium truncate">{session?.user?.name || "User"}</span>
                    <span className="text-xs text-muted-foreground truncate">{session?.user?.email}</span>
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" className="w-[--radix-popper-anchor-width]">
                <DropdownMenuItem>
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
