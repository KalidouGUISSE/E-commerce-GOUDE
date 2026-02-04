"use client"

import React, { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { AdminSidebar } from "@/components/layout/admin-sidebar"
import { Loader2 } from "lucide-react"

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, isLoading, isInitialized, checkAuth } = useAuth()
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  useEffect(() => {
    // Wait for auth to be initialized before checking
    if (!isInitialized) return

    // Redirect if not logged in
    if (!user) {
      router.push("/connexion")
      return
    }

    // Redirect if not admin
    if (user.role !== "admin") {
      router.push("/")
      return
    }
  }, [user, isInitialized, router])

  // Show loading state while initializing
  if (!isInitialized) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Vérification des accès...</p>
        </div>
      </div>
    )
  }

  // Show loading during login
  if (isLoading && !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Connexion en cours...</p>
        </div>
      </div>
    )
  }

  // If not admin, don't render (will redirect)
  if (!user || user.role !== "admin") {
    return null
  }

  return <AdminSidebar>{children}</AdminSidebar>
}
