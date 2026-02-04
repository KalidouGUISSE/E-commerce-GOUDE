"use client"

import { useState, useCallback } from "react"

interface User {
  id: string
  email: string
  name: string
  role: "admin" | "reseller"
  company: string
}

interface LoginCredentials {
  email: string
  password: string
}

// Mock users database
const mockUsers: User[] = [
  {
    id: "1",
    email: "admin@pagnetisse.sn",
    name: "Admin Pagne Tissé",
    role: "admin",
    company: "Pagne Tissé Distribution",
  },
  {
    id: "2",
    email: "revendeur@test.com",
    name: "Jean Dupont",
    role: "reseller",
    company: "Dupont Textiles",
  },
  {
    id: "3",
    "email": "revendeur2@test.com",
    name: "Marie Traoré",
    role: "reseller",
    company: "Africa Style SARL",
  },
]

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const login = useCallback(async (credentials: LoginCredentials): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Find user by email and password
    const foundUser = mockUsers.find((u) => u.email === credentials.email)

    if (!foundUser) {
      setError("Aucun compte trouvé avec cet email")
      setIsLoading(false)
      return false
    }

    // In production, use proper password hashing comparison
    const mockPasswords: Record<string, string> = {
      "admin@pagnetisse.sn": "admin123",
      "revendeur@test.com": "test123",
      "revendeur2@test.com": "test123",
    }

    if (credentials.password !== mockPasswords[credentials.email]) {
      setError("Mot de passe incorrect")
      setIsLoading(false)
      return false
    }

    setUser(foundUser)
    setIsLoading(false)
    return true
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setError(null)
  }, [])

  return {
    user,
    isLoading,
    error,
    login,
    logout,
    isAuthenticated: !!user,
  }
}
