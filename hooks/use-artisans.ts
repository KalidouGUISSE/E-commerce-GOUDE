"use client"

import { useState, useCallback } from "react"
import { useToast } from "@/components/ui/use-toast"
import {
  artisans as artisansData,
  users as usersData,
  orders as ordersData,
} from "@/lib/data/index"
import type { Artisan } from "@/lib/data/products"

// Extended types with relations
interface ArtisanWithRelations extends Artisan {
  user_email?: string
  user_phone?: string
  orders_count: number
  total_revenue: number
  is_verified: boolean
}

interface ArtisanFilters {
  search?: string
  is_verified?: boolean
  is_active?: boolean
  city?: string
  min_rating?: number
  start_date?: string
  end_date?: string
}

interface ArtisanStatistics {
  totalArtisans: number
  pendingVerification: number
  activeArtisans: number
  newThisMonth: number
  averageRating: number
}

export function useArtisans() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  // Get all artisans with relations
  const getArtisans = useCallback(async (): Promise<ArtisanWithRelations[]> => {
    setIsLoading(true)
    setError(null)
    
    try {
      await new Promise((resolve) => setTimeout(resolve, 300))

      const artisansList = artisansData || []
      const usersList = usersData || []
      const ordersList = ordersData || []

      const artisansWithRelations: ArtisanWithRelations[] = artisansList.map((artisan) => {
        const user = usersList.find((u) => u.id === artisan.user_id)
        
        return {
          ...artisan,
          user_email: user?.email || "N/A",
          user_phone: user?.phone || "N/A",
          orders_count: Math.floor(Math.random() * 50) + 1,
          total_revenue: Math.floor(Math.random() * 5000000) + 100000,
          is_verified: Math.random() > 0.3, // Mock: 70% verified
        }
      })

      return artisansWithRelations
    } catch {
      const errorMessage = "Erreur lors de la récupération des artisans"
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

  // Get artisan by ID
  const getArtisanById = useCallback(async (id: number): Promise<ArtisanWithRelations | null> => {
    setIsLoading(true)
    setError(null)
    
    try {
      await new Promise((resolve) => setTimeout(resolve, 200))
      
      const artisansList = artisansData || []
      const usersList = usersData || []

      const artisan = artisansList.find((a: Artisan) => a.id === id)
      if (!artisan) return null

      const user = usersList.find((u) => u.id === (artisan as Artisan).user_id)

      return {
        ...artisan,
        user_email: user?.email || "N/A",
        user_phone: user?.phone || "N/A",
        orders_count: Math.floor(Math.random() * 50) + 1,
        total_revenue: Math.floor(Math.random() * 5000000) + 100000,
        is_verified: Math.random() > 0.3,
      }
    } catch {
      setError("Erreur lors de la récupération de l'artisan")
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Verify artisan
  const verifyArtisan = useCallback(async (id: number): Promise<boolean> => {
    setIsLoading(true)
    setError(null)
    
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))

      const artisansList = artisansData || []
      const artisan = artisansList.find((a: Artisan) => a.id === id)
      if (!artisan) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Artisan non trouvé",
        })
        return false
      }

      toast({
        title: "Succès",
        description: `L'artisan "${(artisan as Artisan).name}" a été vérifié avec succès`,
      })
      
      return true
    } catch {
      const errorMessage = "Erreur lors de la vérification"
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

  // Reject artisan verification
  const rejectArtisan = useCallback(async (id: number, reason: string): Promise<boolean> => {
    setIsLoading(true)
    setError(null)
    
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))

      const artisansList = artisansData || []
      const artisan = artisansList.find((a: Artisan) => a.id === id)
      if (!artisan) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Artisan non trouvé",
        })
        return false
      }

      toast({
        title: "Vérification rejetée",
        description: `La vérification de l'artisan "${(artisan as Artisan).name}" a été rejetée. Motif: ${reason}`,
      })
      
      return true
    } catch {
      const errorMessage = "Erreur lors du rejet"
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

  // Suspend artisan
  const suspendArtisan = useCallback(async (id: number, reason: string): Promise<boolean> => {
    setIsLoading(true)
    setError(null)
    
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))

      const artisansList = artisansData || []
      const artisan = artisansList.find((a: Artisan) => a.id === id)
      if (!artisan) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Artisan non trouvé",
        })
        return false
      }

      toast({
        title: "Artisan suspendu",
        description: `L'artisan "${(artisan as Artisan).name}" a été suspendu. Motif: ${reason}`,
      })
      
      return true
    } catch {
      const errorMessage = "Erreur lors de la suspension"
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

  // Reactivate artisan
  const reactivateArtisan = useCallback(async (id: number): Promise<boolean> => {
    setIsLoading(true)
    setError(null)
    
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))

      const artisansList = artisansData || []
      const artisan = artisansList.find((a: Artisan) => a.id === id)
      if (!artisan) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Artisan non trouvé",
        })
        return false
      }

      toast({
        title: "Succès",
        description: `L'artisan "${(artisan as Artisan).name}" a été réactivé`,
      })
      
      return true
    } catch {
      const errorMessage = "Erreur lors de la réactivation"
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

  // Get statistics
  const getStatistics = useCallback(async (): Promise<ArtisanStatistics> => {
    const allArtisans = await getArtisans()
    const today = new Date()
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

    const totalArtisans = allArtisans.length
    const pendingVerification = allArtisans.filter((a) => !a.is_verified && a.is_active).length
    const activeArtisans = allArtisans.filter((a) => a.is_active).length
    const newThisMonth = allArtisans.filter(
      (a) => new Date(a.created_at) >= monthAgo
    ).length
    const averageRating = allArtisans.length > 0
      ? allArtisans.reduce((sum, a) => sum + (a.rating || 0), 0) / allArtisans.length
      : 0

    return {
      totalArtisans,
      pendingVerification,
      activeArtisans,
      newThisMonth,
      averageRating: Math.round(averageRating * 10) / 10,
    }
  }, [getArtisans])

  // Export artisans to CSV
  const exportToCSV = useCallback(() => {
    const artisansList = artisansData || []
    const usersList = usersData || []
    
    const csvContent = [
      ["ID", "Nom", "Email", "Téléphone", "Région", "Village", "Spécialité", "Note", "Vérifié", "Actif", "Inscrit le"].join(","),
      ...artisansList.map((artisan: Artisan) => {
        const user = usersList.find((u) => u.id === artisan.user_id)
        const artisanWithVerified = artisansList.find((a: Artisan) => a.id === artisan.id)
        return [
          artisan.id,
          `"${artisan.name}"`,
          user?.email || "",
          user?.phone || "",
          artisan.region,
          artisan.village,
          artisan.speciality,
          artisan.rating,
          artisanWithVerified ? "Oui" : "Non",
          artisan.is_active ? "Oui" : "Non",
          new Date(artisan.created_at).toLocaleDateString("fr-FR"),
        ].join(",")
      }),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `artisans_export_${new Date().toISOString().split("T")[0]}.csv`
    link.click()

    toast({
      title: "Export réussi",
      description: "La liste des artisans a été exportée en CSV",
    })
  }, [toast])

  return {
    isLoading,
    error,
    getArtisans,
    getArtisanById,
    verifyArtisan,
    rejectArtisan,
    suspendArtisan,
    reactivateArtisan,
    getStatistics,
    exportToCSV,
  }
}

export type {
  ArtisanWithRelations,
  ArtisanFilters,
  ArtisanStatistics,
}
