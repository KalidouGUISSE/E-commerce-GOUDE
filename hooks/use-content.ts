"use client"

import { useState, useCallback } from "react"
import { useToast } from "@/components/ui/use-toast"

// Types
export interface Content {
  id: number
  title: string
  slug: string
  content_type: "article" | "image" | "video" | "page"
  category_id: number
  category_name?: string
  body: string
  excerpt: string
  featured_image?: string
  media_url?: string
  media_type?: string
  tags: string[]
  meta_title?: string
  meta_description?: string
  meta_keywords?: string
  status: "draft" | "scheduled" | "published" | "archived"
  author_id: number
  author_name?: string
  published_at?: string
  scheduled_at?: string
  views: number
  engagement_score: number
  created_at: string
  updated_at: string
}

export interface ContentCategory {
  id: number
  name: string
  slug: string
  description?: string
  color: string
  content_count: number
}

export interface ContentFilters {
  search?: string
  content_type?: string
  category?: string
  status?: string
  start_date?: string
  end_date?: string
}

export interface ContentStatistics {
  totalContent: number
  published: number
  drafts: number
  scheduled: number
  archived: number
  totalViews: number
  averageEngagement: number
}

// Mock data
const mockCategories: ContentCategory[] = [
  { id: 1, name: "Actualités", slug: "actualites", color: "#3B82F6", description: "Actualités de l'entreprise", content_count: 12 },
  { id: 2, name: "Tutos", slug: "tutos", color: "#10B981", description: "Tutoriels et guides", content_count: 8 },
  { id: 3, name: "Blog", slug: "blog", color: "#8B5CF6", description: "Articles de blog", content_count: 25 },
  { id: 4, name: "Médias", slug: "medias", color: "#F59E0B", description: "Images et vidéos", content_count: 15 },
]

const mockContents: Content[] = [
  {
    id: 1,
    title: "Nouvelle collection de pagnes tissés 2024",
    slug: "nouvelle-collection-2024",
    content_type: "article",
    category_id: 1,
    category_name: "Actualités",
    body: "<p>Nous sommes ravis de présenter notre nouvelle collection...</p>",
    excerpt: "Découvrez notre toute nouvelle collection de pagnes tissés traditionnels.",
    featured_image: "/placeholder-content-1.jpg",
    tags: ["collection", "2024", "tradition"],
    meta_title: "Nouvelle collection 2024 | Pagne Tissé",
    meta_description: "Découvrez notre nouvelle collection de pagnes tissés traditionnels.",
    meta_keywords: "pagne, tissé, collection, 2024",
    status: "published",
    author_id: 1,
    author_name: "Admin",
    published_at: "2024-01-15T10:00:00Z",
    views: 1250,
    engagement_score: 8.5,
    created_at: "2024-01-10T08:00:00Z",
    updated_at: "2024-01-15T10:00:00Z",
  },
  {
    id: 2,
    title: "Comment entretenir vos pagnes tissés",
    slug: "comment-entretenir-pagnes",
    content_type: "article",
    category_id: 2,
    category_name: "Tutos",
    body: "<p>Voici nos conseils pour entretenir vos pagnes...</p>",
    excerpt: "Guide complet pour préserver la beauté de vos pagnes tissés.",
    featured_image: "/placeholder-content-2.jpg",
    tags: ["entretien", "conseils", "guide"],
    meta_title: "Entretien pagnes tissés | Guide complet",
    meta_description: "Apprenez à entretenir correctement vos pagnes tissés traditionnels.",
    meta_keywords: "entretien, pagnes, guide",
    status: "published",
    author_id: 1,
    author_name: "Admin",
    published_at: "2024-01-20T14:00:00Z",
    views: 890,
    engagement_score: 7.2,
    created_at: "2024-01-18T09:00:00Z",
    updated_at: "2024-01-20T14:00:00Z",
  },
  {
    id: 3,
    title: "L'art du tissage au Sénégal",
    slug: "art-tissage-senegal",
    content_type: "article",
    category_id: 3,
    category_name: "Blog",
    body: "<p>Le tissage est une tradition millénaire...</p>",
    excerpt: "Exploration de l'art traditionnel du tissage au Sénégal.",
    featured_image: "/placeholder-content-3.jpg",
    tags: ["culture", "tradition", "sénégal"],
    meta_title: "L'art du tissage au Sénégal",
    meta_description: "Découvrez l'art traditionnel du tissage au Sénégal.",
    meta_keywords: "tissage, sénégal, tradition",
    status: "scheduled",
    author_id: 1,
    author_name: "Admin",
    scheduled_at: "2024-02-01T09:00:00Z",
    views: 0,
    engagement_score: 0,
    created_at: "2024-01-25T11:00:00Z",
    updated_at: "2024-01-25T11:00:00Z",
  },
  {
    id: 4,
    title: "Vidéo: Processus de tissage traditionnel",
    slug: "video-tissage-traditionnel",
    content_type: "video",
    category_id: 4,
    category_name: "Médias",
    body: "",
    excerpt: "Vidéo montrant le processus de tissage traditionnel.",
    featured_image: "/placeholder-video.jpg",
    media_url: "https://example.com/video.mp4",
    media_type: "video/mp4",
    tags: ["vidéo", "processus", "tissage"],
    meta_title: "Vidéo: Processus de tissage",
    meta_description: "Regardez le processus de tissage traditionnel.",
    meta_keywords: "vidéo, tissage",
    status: "published",
    author_id: 1,
    author_name: "Admin",
    published_at: "2024-01-22T16:00:00Z",
    views: 2100,
    engagement_score: 9.1,
    created_at: "2024-01-20T10:00:00Z",
    updated_at: "2024-01-22T16:00:00Z",
  },
  {
    id: 5,
    title: "Galerie photos: Motifs traditionnels",
    slug: "galerie-motifs-traditionnels",
    content_type: "image",
    category_id: 4,
    category_name: "Médias",
    body: "",
    excerpt: "Collection de photos des motifs traditionnels.",
    featured_image: "/placeholder-gallery.jpg",
    tags: ["galerie", "photos", "motifs"],
    meta_title: "Galerie photos motifs traditionnels",
    meta_description: "Découvrez notre galerie de photos des motifs traditionnels.",
    meta_keywords: "galerie, photos, motifs",
    status: "draft",
    author_id: 1,
    author_name: "Admin",
    views: 0,
    engagement_score: 0,
    created_at: "2024-01-28T14:00:00Z",
    updated_at: "2024-01-28T14:00:00Z",
  },
]

export function useContent() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  // Get all contents
  const getContents = useCallback(async (): Promise<Content[]> => {
    setIsLoading(true)
    setError(null)

    try {
      await new Promise((resolve) => setTimeout(resolve, 300))
      return mockContents
    } catch {
      setError("Erreur lors de la récupération des contenus")
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Get content by ID
  const getContentById = useCallback(async (id: number): Promise<Content | null> => {
    setIsLoading(true)
    setError(null)

    try {
      await new Promise((resolve) => setTimeout(resolve, 200))
      return mockContents.find((c) => c.id === id) || null
    } catch {
      setError("Erreur lors de la récupération du contenu")
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Get categories
  const getCategories = useCallback(async (): Promise<ContentCategory[]> => {
    setIsLoading(true)
    setError(null)

    try {
      await new Promise((resolve) => setTimeout(resolve, 200))
      return mockCategories
    } catch {
      setError("Erreur lors de la récupération des catégories")
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Create content
  const createContent = useCallback(async (data: Partial<Content>): Promise<Content | null> => {
    setIsLoading(true)
    setError(null)

    try {
      await new Promise((resolve) => setTimeout(resolve, 500))

      const newContent: Content = {
        id: Math.max(...mockContents.map((c) => c.id)) + 1,
        title: data.title || "Nouveau contenu",
        slug: data.slug || data.title?.toLowerCase().replace(/\s+/g, "-") || "nouveau-contenu",
        content_type: data.content_type || "article",
        category_id: data.category_id || 1,
        category_name: mockCategories.find((c) => c.id === data.category_id)?.name,
        body: data.body || "",
        excerpt: data.excerpt || "",
        featured_image: data.featured_image,
        media_url: data.media_url,
        media_type: data.media_type,
        tags: data.tags || [],
        meta_title: data.meta_title,
        meta_description: data.meta_description,
        meta_keywords: data.meta_keywords,
        status: data.status || "draft",
        author_id: 1,
        author_name: "Admin",
        scheduled_at: data.scheduled_at,
        views: 0,
        engagement_score: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      toast({
        title: "Succès",
        description: "Le contenu a été créé avec succès",
      })

      return newContent
    } catch {
      const errorMessage = "Erreur lors de la création"
      setError(errorMessage)
      toast({
        variant: "destructive",
        title: "Erreur",
        description: errorMessage,
      })
      return null
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  // Update content
  const updateContent = useCallback(async (id: number, data: Partial<Content>): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      await new Promise((resolve) => setTimeout(resolve, 500))

      const content = mockContents.find((c) => c.id === id)
      if (!content) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Contenu non trouvé",
        })
        return false
      }

      toast({
        title: "Succès",
        description: "Le contenu a été mis à jour avec succès",
      })

      return true
    } catch {
      const errorMessage = "Erreur lors de la mise à jour"
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

  // Delete content
  const deleteContent = useCallback(async (id: number): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      await new Promise((resolve) => setTimeout(resolve, 500))

      const content = mockContents.find((c) => c.id === id)
      if (!content) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Contenu non trouvé",
        })
        return false
      }

      toast({
        title: "Succès",
        description: `Le contenu "${content.title}" a été supprimé`,
      })

      return true
    } catch {
      const errorMessage = "Erreur lors de la suppression"
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

  // Bulk actions
  const bulkAction = useCallback(async (
    ids: number[],
    action: "publish" | "archive" | "delete"
  ): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      await new Promise((resolve) => setTimeout(resolve, 500))

      const actionText = {
        publish: "publiés",
        archive: "archivés",
        delete: "supprimés",
      }

      toast({
        title: "Succès",
        description: `${ids.length} contenus ont été ${actionText[action]}`,
      })

      return true
    } catch {
      const errorMessage = "Erreur lors de l'action groupée"
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
  const getStatistics = useCallback(async (): Promise<ContentStatistics> => {
    const contents = await getContents()

    return {
      totalContent: contents.length,
      published: contents.filter((c) => c.status === "published").length,
      drafts: contents.filter((c) => c.status === "draft").length,
      scheduled: contents.filter((c) => c.status === "scheduled").length,
      archived: contents.filter((c) => c.status === "archived").length,
      totalViews: contents.reduce((sum, c) => sum + c.views, 0),
      averageEngagement: contents.length > 0
        ? contents.reduce((sum, c) => sum + c.engagement_score, 0) / contents.length
        : 0,
    }
  }, [getContents])

  // Export to CSV
  const exportToCSV = useCallback(() => {
    const csvContent = [
      ["ID", "Titre", "Type", "Catégorie", "Statut", "Vues", "Engagement", "Créé le", "Publié le"].join(","),
      ...mockContents.map((c) =>
        [
          c.id,
          `"${c.title}"`,
          c.content_type,
          c.category_name || "",
          c.status,
          c.views,
          c.engagement_score.toFixed(1),
          new Date(c.created_at).toLocaleDateString("fr-FR"),
          c.published_at ? new Date(c.published_at).toLocaleDateString("fr-FR") : "",
        ].join(",")
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `contenus_export_${new Date().toISOString().split("T")[0]}.csv`
    link.click()

    toast({
      title: "Export réussi",
      description: "La liste des contenus a été exportée en CSV",
    })
  }, [toast])

  return {
    isLoading,
    error,
    getContents,
    getContentById,
    getCategories,
    createContent,
    updateContent,
    deleteContent,
    bulkAction,
    getStatistics,
    exportToCSV,
  }
}

