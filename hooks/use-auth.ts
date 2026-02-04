"use client"

import { useState, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { users } from "@/lib/data/index"

interface AuthUser {
  id: number
  email: string
  name: string
  first_name: string
  last_name: string
  role: "admin" | "reseller" | "artisan"
  company?: string
}

interface LoginCredentials {
  email: string
  password: string
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Initialize auth from localStorage on mount
  useEffect(() => {
    const initAuth = () => {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("auth_user")
        if (stored) {
          try {
            const parsedUser = JSON.parse(stored)
            setUser(parsedUser)
          } catch {
            localStorage.removeItem("auth_user")
          }
        }
      }
      setIsInitialized(true)
    }

    initAuth()
  }, [])

  const login = useCallback(async (credentials: LoginCredentials): Promise<AuthUser | null> => {
    setIsLoading(true)
    setError(null)

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    // Find user by email
    const dbUser = users.find((u) => u.email === credentials.email)

    if (!dbUser) {
      setError("Aucun compte trouvé avec cet email")
      setIsLoading(false)
      return null
    }

    // Check password
    if (credentials.password !== dbUser.password_hash) {
      setError("Mot de passe incorrect")
      setIsLoading(false)
      return null
    }

    // Determine role and company
    let role: AuthUser["role"] = "reseller"
    let company: string | undefined
    let name: string

    if (dbUser.role_id === 1) {
      role = "admin"
      name = `${dbUser.first_name} ${dbUser.last_name}`
    } else {
      // Get reseller or artisan info
      const { resellers, artisans } = await import("@/lib/data/index")
      const reseller = resellers.find((r: { user_id: number }) => r.user_id === dbUser.id)
      const artisan = artisans.find((a: { user_id: number }) => a.user_id === dbUser.id)
      
      if (dbUser.role_id === 2) {
        role = "reseller"
        company = reseller?.company_name
        name = `${dbUser.first_name} ${dbUser.last_name}`
      } else {
        role = "artisan"
        name = artisan?.name || `${dbUser.first_name} ${dbUser.last_name}`
      }
    }

    const authUser: AuthUser = {
      id: dbUser.id,
      email: dbUser.email,
      name,
      first_name: dbUser.first_name,
      last_name: dbUser.last_name,
      role,
      company,
    }

    setUser(authUser)
    setIsLoading(false)
    
    // Store in localStorage for persistence
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_user", JSON.stringify(authUser))
    }
    
    return authUser
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setError(null)
    
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_user")
    }
    
    router.push("/")
  }, [router])

  const checkAuth = useCallback(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("auth_user")
      if (stored) {
        try {
          setUser(JSON.parse(stored))
        } catch {
          localStorage.removeItem("auth_user")
        }
      }
    }
    setIsInitialized(true)
  }, [])

  return {
    user,
    isLoading,
    isInitialized,
    error,
    login,
    logout,
    checkAuth,
    isAuthenticated: !!user,
  }
}
