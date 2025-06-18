//src/app/login/page.tsx
"use client"

import { signIn, signOut, useSession } from "next-auth/react"
import { motion } from "framer-motion"
import { useState } from "react"
import { Mail, LogIn, LogOut, Loader2, CheckCircle, User } from "lucide-react"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar"
import { Badge } from "../components/ui/badge"

export default function LoginPage() {
  const { data: session, status } = useSession()
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)

  const handleSignIn = async () => {
    setIsSigningIn(true)
    try {
      await signIn("google", { callbackUrl: "/dashboard" })
    } catch (error) {
      console.error("Sign in error:", error)
    } finally {
      setIsSigningIn(false)
    }
  }

  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      await signOut()
    } catch (error) {
      console.error("Sign out error:", error)
    } finally {
      setIsSigningOut(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 px-4 py-8">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-md"
      >
        <motion.div variants={itemVariants} className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mb-4 shadow-lg">
            <Mail className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            OneBox
          </h1>
          <p className="text-muted-foreground text-lg">All your emails in one place</p>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-4">
              {!session ? (
                <>
                  <CardTitle className="text-2xl font-semibold">Welcome back</CardTitle>
                  <CardDescription className="text-base">Sign in to access your unified inbox</CardDescription>
                </>
              ) : (
                <>
                  <CardTitle className="text-2xl font-semibold flex items-center justify-center gap-2">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                    You're signed in
                  </CardTitle>
                  <CardDescription>Ready to manage your emails</CardDescription>
                </>
              )}
            </CardHeader>

            <CardContent className="space-y-6">
              {!session ? (
                <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={handleSignIn}
                    disabled={isSigningIn}
                    size="lg"
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg transition-all duration-200"
                  >
                    {isSigningIn ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        <LogIn className="h-5 w-5 mr-2" />
                        Continue with Google
                      </>
                    )}
                  </Button>
                </motion.div>
              ) : (
                <motion.div variants={itemVariants} className="space-y-6">
                  {/* User Info Card */}
                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border">
                    <Avatar className="h-12 w-12 ring-2 ring-blue-200">
                      <AvatarImage src={session.user?.image || undefined} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white">
                        {session.user?.name?.slice(0, 2).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground truncate">{session.user?.name || "User"}</h3>
                        <Badge variant="secondary" className="text-xs">
                          <User className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{session.user?.email}</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        onClick={() => (window.location.href = "/dashboard")}
                        size="lg"
                        className="w-full h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold shadow-lg"
                      >
                        <Mail className="h-5 w-5 mr-2" />
                        Go to Dashboard
                      </Button>
                    </motion.div>

                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        onClick={handleSignOut}
                        disabled={isSigningOut}
                        variant="outline"
                        size="lg"
                        className="w-full h-12 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 font-semibold"
                      >
                        {isSigningOut ? (
                          <>
                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                            Signing out...
                          </>
                        ) : (
                          <>
                            <LogOut className="h-5 w-5 mr-2" />
                            Sign out
                          </>
                        )}
                      </Button>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Footer */}
        <motion.div variants={itemVariants} className="text-center mt-8">
          <p className="text-sm text-muted-foreground">Secure authentication powered by Google</p>
          <div className="flex items-center justify-center gap-4 mt-4 text-xs text-muted-foreground">
            <span>Privacy Policy</span>
            <span>•</span>
            <span>Terms of Service</span>
            <span>•</span>
            <span>Support</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
