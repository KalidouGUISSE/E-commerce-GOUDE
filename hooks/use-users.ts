"use client"

import { useState, useCallback } from "react"
import { useToast } from "@/components/ui/use-toast"
import { users, roles, type User } from "@/lib/data/index"

// Extended user type with role_name
interface UserWithRole extends User {
  role_name: string
}

interface CreateUserData {
  first_name: string
  last_name: string
  email: string
  password: string
  phone?: string
  role_id: number
  company_name?: string
}

interface UpdateUserData extends Partial<CreateUserData> {
  is_active?: boolean
}

export function useUsers() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  // Get all users with their roles
  const getUsers = useCallback(async (): Promise<UserWithRole[]> => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 300))
      
      const usersWithRoles: UserWithRole[] = users.map((user) => ({
        ...user,
        role_name: roles.find((r) => r.id === user.role_id)?.name || "unknown",
      }))
      
      return usersWithRoles
    } catch {
      const errorMessage = "Erreur lors de la récupération des utilisateurs"
      setError(errorMessage)
      toast({
        variant: "destructive",
        title: "Erreur",
        description: errorMessage,
      })
      return []
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  // Create a new user
  const createUser = useCallback(async (data: CreateUserData): Promise<boolean> => {
    setIsLoading(true)
    setError(null)
    
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Check if email already exists
      if (users.some((u) => u.email === data.email)) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Un utilisateur avec cet email existe déjà",
        })
        return false
      }

      const newUser: User = {
        id: Math.max(...users.map((u) => u.id)) + 1,
        role_id: data.role_id,
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone || "",
        password_hash: data.password,
        language: "fr",
        is_active: true,
        created_at: new Date().toISOString(),
      }

      // In a real app, this would be an API call
      // For demo, we just simulate success
      toast({
        title: "Succès",
        description: `L'utilisateur ${newUser.first_name} ${newUser.last_name} a été créé avec succès`,
      })
      
      return true
    } catch {
      const errorMessage = "Erreur lors de la création de l'utilisateur"
      setError(errorMessage)
      toast({
        variant: "destructive",
        title: "Erreur",
        description: errorMessage,
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  // Update an existing user
  const updateUser = useCallback(async (id: number, data: UpdateUserData): Promise<boolean> => {
    setIsLoading(true)
    setError(null)
    
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))

      const user = users.find((u) => u.id === id)
      if (!user) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Utilisateur non trouvé",
        })
        return false
      }

      // Check email uniqueness if changing
      if (data.email && data.email !== user.email && users.some((u) => u.email === data.email)) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Un utilisateur avec cet email existe déjà",
        })
        return false
      }

      toast({
        title: "Succès",
        description: `Les informations de l'utilisateur ont été mises à jour`,
      })
      
      return true
    } catch {
      const errorMessage = "Erreur lors de la mise à jour de l'utilisateur"
      setError(errorMessage)
      toast({
        variant: "destructive",
        title: "Erreur",
        description: errorMessage,
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  // Delete a user
  const deleteUser = useCallback(async (id: number): Promise<boolean> => {
    setIsLoading(true)
    setError(null)
    
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))

      const user = users.find((u) => u.id === id)
      if (!user) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Utilisateur non trouvé",
        })
        return false
      }

      // Prevent deleting yourself
      toast({
        variant: "destructive",
        title: "Action non autorisée",
        description: "Vous ne pouvez pas supprimer votre propre compte",
      })
      return false
    } catch {
      const errorMessage = "Erreur lors de la suppression de l'utilisateur"
      setError(errorMessage)
      toast({
        variant: "destructive",
        title: "Erreur",
        description: errorMessage,
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  // Get user by ID
  const getUserById = useCallback(async (id: number): Promise<UserWithRole | null> => {
    setIsLoading(true)
    setError(null)
    
    try {
      await new Promise((resolve) => setTimeout(resolve, 200))
      
      const user = users.find((u) => u.id === id)
      if (!user) return null
      
      return {
        ...user,
        role_name: roles.find((r) => r.id === user.role_id)?.name || "unknown",
      }
    } catch {
      setError("Erreur lors de la récupération de l'utilisateur")
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    isLoading,
    error,
    getUsers,
    createUser,
    updateUser,
    deleteUser,
    getUserById,
  }
}

export type { UserWithRole, CreateUserData, UpdateUserData }
