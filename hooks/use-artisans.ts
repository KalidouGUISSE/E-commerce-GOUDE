/**
 * useArtisans Hook - Gestion des artisans partenaires
 * 
 * Ce hook gère :
 * - Liste des artisans avec pagination serveur
 * - CRUD complet des artisans
 * - Filtres avancés (statut, nom, ville, date)
 * - Recherche avec debounce
 * - Actions en lot
 */

'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'

// Types pour les artisans
export interface Artisan {
  id: string
  name: string
  email: string
  phone: string
  specialty: string
  region: string
  village: string
  address: string
  status: 'active' | 'pending' | 'inactive'
  collaborationStatus: 'new' | 'active' | 'paused' | 'ended'
  rating: number
  productsCount: number
  totalOrders: number
  lastInteraction: string
  notes: string
  tags: string[]
  documents: string[]
  createdAt: string
  updatedAt: string
}

export interface ArtisanFilters {
  search: string
  status: string[]
  collaborationStatus: string[]
  region: string
  dateFrom: string
  dateTo: string
  sortBy: string
  sortOrder: 'asc' | 'desc'
  page: number
  limit: number
}

export interface ArtisanStats {
  total: number
  active: number
  pending: number
  inactive: number
  newThisMonth: number
}

export interface ArtisanFormData {
  name: string
  email: string
  phone: string
  specialty: string
  region: string
  village: string
  address: string
  notes: string
  tags: string[]
}

// Données mockées des artisans
const MOCK_ARTISANS: Artisan[] = [
  {
    id: 'art001',
    name: 'Mamadou Diop',
    email: 'mamadou.diop@email.sn',
    phone: '+221 77 123 45 67',
    specialty: 'Tissage Manjak',
    region: 'Casamance',
    village: 'Ziguinchor',
    address: 'Quartier Santchou, Ziguinchor',
    status: 'active',
    collaborationStatus: 'active',
    rating: 4.8,
    productsCount: 15,
    totalOrders: 45,
    lastInteraction: '2024-02-04T10:30:00Z',
    notes: 'Artisan expérimenté, spécialisé dans les tissus traditionnels.',
    tags: ['Manjak', 'Traditionnel', 'Certifié'],
    documents: ['carte_artisan.pdf', 'certificat_2024.pdf'],
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-02-04T10:30:00Z',
  },
  {
    id: 'art002',
    name: 'Aminata Sarr',
    email: 'aminata.sarr@email.sn',
    phone: '+221 78 234 56 78',
    specialty: 'Teinture Bogolan',
    region: 'Sine-Saloum',
    village: 'Fatick',
    address: 'Village de Djilass, Fatick',
    status: 'active',
    collaborationStatus: 'active',
    rating: 4.5,
    productsCount: 8,
    totalOrders: 23,
    lastInteraction: '2024-02-03T14:20:00Z',
    notes: 'Maîtrise les techniques ancestrales de teinture.',
    tags: ['Bogolan', 'Teinture', 'Artisan Femme'],
    documents: ['portfolio.pdf'],
    createdAt: '2024-02-01T09:00:00Z',
    updatedAt: '2024-02-03T14:20:00Z',
  },
  {
    id: 'art003',
    name: 'Coumba Ndiaye',
    email: 'coumba.ndiaye@email.sn',
    phone: '+221 76 345 67 89',
    specialty: 'Tissage Thioup',
    region: 'Dakar',
    village: 'Thies',
    address: 'Rue 10, Thies',
    status: 'pending',
    collaborationStatus: 'new',
    rating: 0,
    productsCount: 0,
    totalOrders: 0,
    lastInteraction: '2024-02-04T09:00:00Z',
    notes: 'Nouvelle artisane en processus de validation.',
    tags: ['Thioup', 'Nouveau'],
    documents: ['dossier_inscription.pdf'],
    createdAt: '2024-02-04T09:00:00Z',
    updatedAt: '2024-02-04T09:00:00Z',
  },
  {
    id: 'art004',
    name: 'Ousmane Diatta',
    email: 'ousmane.diatta@email.sn',
    phone: '+221 75 456 78 90',
    specialty: 'Tissage Bazin',
    region: 'Dakar',
    village: 'Dakar',
    address: 'Cite Douanes, Dakar',
    status: 'inactive',
    collaborationStatus: 'paused',
    rating: 4.2,
    productsCount: 12,
    totalOrders: 67,
    lastInteraction: '2024-01-20T16:00:00Z',
    notes: 'Collaboration en pause pour le moment.',
    tags: ['Bazin', 'Pause'],
    documents: [],
    createdAt: '2023-11-10T11:00:00Z',
    updatedAt: '2024-01-20T16:00:00Z',
  },
  {
    id: 'art005',
    name: 'Fatou Fall',
    email: 'fatou.fall@email.sn',
    phone: '+221 74 567 89 01',
    specialty: 'Tissage Kente',
    region: 'Kolda',
    village: 'Kolda',
    address: 'Quartier Commerce, Kolda',
    status: 'active',
    collaborationStatus: 'active',
    rating: 4.9,
    productsCount: 20,
    totalOrders: 89,
    lastInteraction: '2024-02-04T08:15:00Z',
    notes: 'Excellente qualité de travail, très demandée.',
    tags: ['Kente', 'Premium', 'Certifié'],
    documents: ['certificat_excellence.pdf', 'catalogue.pdf'],
    createdAt: '2023-06-20T10:00:00Z',
    updatedAt: '2024-02-04T08:15:00Z',
  },
  {
    id: 'art006',
    name: 'Youssoupha Ba',
    email: 'youssoupha.ba@email.sn',
    phone: '+221 73 678 90 12',
    specialty: 'Broderie Traditionnelle',
    region: 'Saint-Louis',
    village: 'Saint-Louis',
    address: 'Île de Saint-Louis',
    status: 'active',
    collaborationStatus: 'active',
    rating: 4.6,
    productsCount: 6,
    totalOrders: 34,
    lastInteraction: '2024-02-02T11:30:00Z',
    notes: 'Spécialiste de la broderie sur pagne.',
    tags: ['Broderie', 'Traditionnel'],
    documents: [' realisation.pdf'],
    createdAt: '2023-09-05T14:00:00Z',
    updatedAt: '2024-02-02T11:30:00Z',
  },
  {
    id: 'art007',
    name: 'Moussa Cissé',
    email: 'moussa.cisse@email.sn',
    phone: '+221 72 789 01 23',
    specialty: 'Tissage Sérère',
    region: 'Sine-Saloum',
    village: 'Kaolack',
    address: 'Village de Nioro, Kaolack',
    status: 'pending',
    collaborationStatus: 'new',
    rating: 0,
    productsCount: 0,
    totalOrders: 0,
    lastInteraction: '2024-02-03T16:45:00Z',
    notes: 'En attente de visite de contrôle qualité.',
    tags: ['Sérère', 'Nouveau', 'En validation'],
    documents: ['dossier_technique.pdf'],
    createdAt: '2024-02-03T16:45:00Z',
    updatedAt: '2024-02-03T16:45:00Z',
  },
  {
    id: 'art008',
    name: 'rama Traoré',
    email: 'rama.trare@email.sn',
    phone: '+221 71 890 12 34',
    specialty: 'Teinture Indigo',
    region: 'Casamance',
    village: 'Bignona',
    address: 'Route de Bignona, Casamance',
    status: 'active',
    collaborationStatus: 'active',
    rating: 4.7,
    productsCount: 10,
    totalOrders: 56,
    lastInteraction: '2024-02-04T07:30:00Z',
    notes: 'Teinture indigo naturelle, très appréciée.',
    tags: ['Indigo', 'Naturel', 'Certifié'],
    documents: ['certificat_naturel.pdf', 'process_teinture.pdf'],
    createdAt: '2023-04-12T09:00:00Z',
    updatedAt: '2024-02-04T07:30:00Z',
  },
]

// Calculer les statistiques
const calculateStats = (artisans: Artisan[]): ArtisanStats => {
  const now = new Date()
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  
  return {
    total: artisans.length,
    active: artisans.filter(a => a.status === 'active').length,
    pending: artisans.filter(a => a.status === 'pending').length,
    inactive: artisans.filter(a => a.status === 'inactive').length,
    newThisMonth: artisans.filter(a => new Date(a.createdAt) >= firstOfMonth).length,
  }
}

// Hook principal
export function useArtisans() {
  const [filters, setFilters] = useState<ArtisanFilters>({
    search: '',
    status: [],
    collaborationStatus: [],
    region: '',
    dateFrom: '',
    dateTo: '',
    sortBy: 'name',
    sortOrder: 'asc',
    page: 1,
    limit: 10,
  })
  
  const [selectedArtisans, setSelectedArtisans] = useState<string[]>([])
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false)
  const [selectedArtisan, setSelectedArtisan] = useState<Artisan | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [artisans, setArtisans] = useState<Artisan[]>(MOCK_ARTISANS)

  // Debounce pour la recherche
  const [debouncedSearch, setDebouncedSearch] = useState(filters.search)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.search)
    }, 300)

    return () => clearTimeout(timer)
  }, [filters.search])

  // Statistiques
  const stats = useMemo(() => calculateStats(artisans), [artisans])

  // Artisans filtrés (simule pagination serveur)
  const filteredArtisans = useMemo(() => {
    let filtered = [...artisans]
    
    // Recherche
    if (debouncedSearch) {
      const search = debouncedSearch.toLowerCase()
      filtered = filtered.filter(a => 
        a.name.toLowerCase().includes(search) ||
        a.email.toLowerCase().includes(search) ||
        a.specialty.toLowerCase().includes(search) ||
        a.village.toLowerCase().includes(search) ||
        a.tags.some(t => t.toLowerCase().includes(search))
      )
    }
    
    // Filtres
    if (filters.status.length > 0) {
      filtered = filtered.filter(a => filters.status.includes(a.status))
    }
    if (filters.collaborationStatus.length > 0) {
      filtered = filtered.filter(a => filters.collaborationStatus.includes(a.collaborationStatus))
    }
    if (filters.region) {
      filtered = filtered.filter(a => a.region === filters.region)
    }
    if (filters.dateFrom) {
      filtered = filtered.filter(a => new Date(a.createdAt) >= new Date(filters.dateFrom))
    }
    if (filters.dateTo) {
      filtered = filtered.filter(a => new Date(a.createdAt) <= new Date(filters.dateTo + 'T23:59:59'))
    }
    
    // Tri
    filtered.sort((a, b) => {
      let comparison = 0
      switch (filters.sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'rating':
          comparison = a.rating - b.rating
          break
        case 'productsCount':
          comparison = a.productsCount - b.productsCount
          break
        case 'lastInteraction':
          comparison = new Date(a.lastInteraction).getTime() - new Date(b.lastInteraction).getTime()
          break
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          break
        default:
          comparison = a.name.localeCompare(b.name)
      }
      return filters.sortOrder === 'asc' ? comparison : -comparison
    })
    
    return filtered
  }, [artisans, debouncedSearch, filters])

  // Pagination
  interface PaginationType {
    total: number
    page: number
    limit: number
    totalPages: number
    data: Artisan[]
  }
  
  const pagination = useMemo((): PaginationType => {
    const totalPages = Math.ceil(filteredArtisans.length / filters.limit)
    const start = (filters.page - 1) * filters.limit
    const end = start + filters.limit
    const paginatedData = filteredArtisans.slice(start, end)
    
    return {
      total: filteredArtisans.length,
      page: filters.page,
      limit: filters.limit,
      totalPages,
      data: paginatedData,
    }
  }, [filteredArtisans, filters.page, filters.limit])

  // Actions
  const updateFilters = useCallback((updates: Partial<ArtisanFilters>) => {
    setFilters(prev => ({ ...prev, ...updates }))
  }, [])

  const resetFilters = useCallback(() => {
    setFilters({
      search: '',
      status: [],
      collaborationStatus: [],
      region: '',
      dateFrom: '',
      dateTo: '',
      sortBy: 'name',
      sortOrder: 'asc',
      page: 1,
      limit: 10,
    })
    setSelectedArtisans([])
  }, [])

  const toggleSelection = useCallback((artisanId: string) => {
    setSelectedArtisans(prev => 
      prev.includes(artisanId) 
        ? prev.filter(id => id !== artisanId)
        : [...prev, artisanId]
    )
  }, [])

  const selectAll = useCallback(() => {
    setSelectedArtisans(pagination.data?.map(a => a.id) || [])
  }, [pagination.data])

  const clearSelection = useCallback(() => {
    setSelectedArtisans([])
  }, [])

  const openDetail = useCallback((artisan: Artisan) => {
    setSelectedArtisan(artisan)
    setIsDetailDrawerOpen(true)
  }, [])

  const openEdit = useCallback((artisan: Artisan) => {
    setSelectedArtisan(artisan)
    setIsEditModalOpen(true)
  }, [])

  const createArtisan = useCallback(async (data: ArtisanFormData): Promise<boolean> => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const newArtisan: Artisan = {
        id: `art${Date.now()}`,
        ...data,
        status: 'pending',
        collaborationStatus: 'new',
        rating: 0,
        productsCount: 0,
        totalOrders: 0,
        lastInteraction: new Date().toISOString(),
        documents: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      
      setArtisans(prev => [newArtisan, ...prev])
      setFeedback({ type: 'success', message: 'Artisan ajouté avec succès!' })
      setIsCreateModalOpen(false)
      return true
    } catch {
      setFeedback({ type: 'error', message: 'Erreur lors de l\'ajout' })
      return false
    } finally {
      setIsLoading(false)
      setTimeout(() => setFeedback(null), 3000)
    }
  }, [])

  const updateArtisan = useCallback(async (id: string, data: Partial<Artisan>): Promise<boolean> => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setArtisans(prev => prev.map(a => 
        a.id === id 
          ? { ...a, ...data, updatedAt: new Date().toISOString() }
          : a
      ))
      
      setFeedback({ type: 'success', message: 'Artisan mis à jour avec succès!' })
      setIsEditModalOpen(false)
      setSelectedArtisan(null)
      return true
    } catch {
      setFeedback({ type: 'error', message: 'Erreur lors de la mise à jour' })
      return false
    } finally {
      setIsLoading(false)
      setTimeout(() => setFeedback(null), 3000)
    }
  }, [])

  const deleteArtisan = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setArtisans(prev => prev.filter(a => a.id !== id))
      setFeedback({ type: 'success', message: 'Artisan supprimé avec succès!' })
      return true
    } catch {
      setFeedback({ type: 'error', message: 'Erreur lors de la suppression' })
      return false
    } finally {
      setIsLoading(false)
      setTimeout(() => setFeedback(null), 3000)
    }
  }, [])

  const deleteSelectedArtisans = useCallback(async (): Promise<boolean> => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setArtisans(prev => prev.filter(a => !selectedArtisans.includes(a.id)))
      setFeedback({ type: 'success', message: `${selectedArtisans.length} artisan(s) supprimé(s)` })
      setSelectedArtisans([])
      return true
    } catch {
      setFeedback({ type: 'error', message: 'Erreur lors de la suppression en lot' })
      return false
    } finally {
      setIsLoading(false)
      setTimeout(() => setFeedback(null), 3000)
    }
  }, [selectedArtisans])

  const bulkExport = useCallback(async (): Promise<boolean> => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      setFeedback({ type: 'success', message: `${selectedArtisans.length} artisan(s) exporté(s)` })
      return true
    } catch {
      setFeedback({ type: 'error', message: 'Erreur lors de l\'export' })
      return false
    } finally {
      setIsLoading(false)
      setTimeout(() => setFeedback(null), 3000)
    }
  }, [selectedArtisans])

  return {
    filters,
    updateFilters,
    resetFilters,
    artisans: pagination.data || [],
    pagination: {
      total: pagination.total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: pagination.totalPages,
    },
    stats,
    selectedArtisans,
    toggleSelection,
    selectAll,
    clearSelection,
    isCreateModalOpen,
    setIsCreateModalOpen,
    isEditModalOpen,
    setIsEditModalOpen,
    isDetailDrawerOpen,
    setIsDetailDrawerOpen,
    selectedArtisan,
    openDetail,
    openEdit,
    isLoading,
    feedback,
    createArtisan,
    updateArtisan,
    deleteArtisan,
    deleteSelectedArtisans,
    bulkExport,
  }
}

export default useArtisans
