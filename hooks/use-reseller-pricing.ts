/**
 * useResellerPricing Hook - Gestion des tarifs du revendeur
 * 
 * Ce hook gère :
 * - Liste des tarifs avec pagination
 * - Niveaux de prix (tiers)
 * - CRUD sur les tarifs
 * - Filtres et recherche
 * - Calcul automatique des marges
 */

'use client'

import { useState, useCallback, useMemo } from 'react'

// Types pour les tarifs
export interface ResellerPricing {
  id: string
  productId: string
  productName: string
  reference: string
  category: string
  basePrice: number
  resellerPrice: number
  margin: number
  marginPercentage: number
  tierId: string
  tierName: string
  isActive: boolean
  validFrom: string
  validTo: string
  createdAt: string
  updatedAt: string
}

// Types pour les niveaux de prix
export interface PricingTier {
  id: string
  name: string
  minQuantity: number
  maxQuantity: number
  discountPercentage: number
  isDefault: boolean
}

// Types pour les filtres
export interface PricingFilters {
  search: string
  category: string
  tier: string
  status: string
  dateFrom: string
  dateTo: string
  sortBy: string
  sortOrder: 'asc' | 'desc'
  page: number
  limit: number
}

// Types pour les statistiques
export interface PricingStats {
  totalPricing: number
  activePricing: number
  averageMargin: number
  totalMargin: number
  expiredPricing: number
  expiringSoonPricing: number
}

// Données mockées pour les tarifs
const MOCK_PRICING: ResellerPricing[] = [
  {
    id: 'prc001',
    productId: 'prod001',
    productName: 'Pagne Manjak Rouge Premium',
    reference: 'PAG-MAN-001',
    category: 'Manjak',
    basePrice: 10000,
    resellerPrice: 15000,
    margin: 5000,
    marginPercentage: 50,
    tierId: 'tier1',
    tierName: 'Standard',
    isActive: true,
    validFrom: '2024-01-01',
    validTo: '2024-12-31',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-02-04T14:22:00Z',
  },
  {
    id: 'prc002',
    productId: 'prod002',
    productName: 'Pagne Kente Or Royal',
    reference: 'PAG-KEN-001',
    category: 'Kente',
    basePrice: 18000,
    resellerPrice: 25000,
    margin: 7000,
    marginPercentage: 38.9,
    tierId: 'tier1',
    tierName: 'Standard',
    isActive: true,
    validFrom: '2024-01-01',
    validTo: '2024-12-31',
    createdAt: '2024-01-10T08:15:00Z',
    updatedAt: '2024-02-03T11:45:00Z',
  },
  {
    id: 'prc003',
    productId: 'prod003',
    productName: 'Pagne Thioup Bleu Ciel',
    reference: 'PAG-THI-001',
    category: 'Thioup',
    basePrice: 8000,
    resellerPrice: 12000,
    margin: 4000,
    marginPercentage: 50,
    tierId: 'tier2',
    tierName: 'Premium',
    isActive: true,
    validFrom: '2024-01-01',
    validTo: '2024-06-30',
    createdAt: '2024-01-20T14:30:00Z',
    updatedAt: '2024-02-02T09:00:00Z',
  },
  {
    id: 'prc004',
    productId: 'prod004',
    productName: 'Pagne Bogolan Marron Terre',
    reference: 'PAG-BOG-001',
    category: 'Bogolan',
    basePrice: 12000,
    resellerPrice: 18000,
    margin: 6000,
    marginPercentage: 50,
    tierId: 'tier1',
    tierName: 'Standard',
    isActive: true,
    validFrom: '2024-01-01',
    validTo: '2024-12-31',
    createdAt: '2024-01-05T16:45:00Z',
    updatedAt: '2024-02-04T08:30:00Z',
  },
  {
    id: 'prc005',
    productId: 'prod005',
    productName: 'Pagne Bazin Vert Émeraude',
    reference: 'PAG-BAZ-001',
    category: 'Bazin',
    basePrice: 15000,
    resellerPrice: 22000,
    margin: 7000,
    marginPercentage: 46.7,
    tierId: 'tier3',
    tierName: 'VIP',
    isActive: true,
    validFrom: '2024-01-01',
    validTo: '2024-12-31',
    createdAt: '2024-01-08T11:20:00Z',
    updatedAt: '2024-02-01T15:00:00Z',
  },
  {
    id: 'prc006',
    productId: 'prod006',
    productName: 'Pagne Waxi Rose Poudré',
    reference: 'PAG-WAX-001',
    category: 'Waxi',
    basePrice: 10000,
    resellerPrice: 16000,
    margin: 6000,
    marginPercentage: 60,
    tierId: 'tier1',
    tierName: 'Standard',
    isActive: false,
    validFrom: '2023-06-01',
    validTo: '2023-12-31',
    createdAt: '2023-06-01T09:30:00Z',
    updatedAt: '2024-01-01T10:00:00Z',
  },
]

// Données mockées pour les niveaux de prix
const MOCK_TIERS: PricingTier[] = [
  { id: 'tier1', name: 'Standard', minQuantity: 1, maxQuantity: 10, discountPercentage: 0, isDefault: true },
  { id: 'tier2', name: 'Premium', minQuantity: 11, maxQuantity: 50, discountPercentage: 5, isDefault: false },
  { id: 'tier3', name: 'VIP', minQuantity: 51, maxQuantity: 999999, discountPercentage: 10, isDefault: false },
]

// Calculer les statistiques
const calculateStats = (pricing: ResellerPricing[]): PricingStats => {
  const totalPricing = pricing.length
  const activePricing = pricing.filter(p => p.isActive).length
  const totalMargin = pricing.reduce((sum, p) => sum + p.margin, 0)
  const averageMargin = totalPricing > 0 ? totalMargin / totalPricing : 0
  
  const now = new Date()
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
  
  const expiredPricing = pricing.filter(p => new Date(p.validTo) < now).length
  const expiringSoonPricing = pricing.filter(p => {
    const validTo = new Date(p.validTo)
    return validTo > now && validTo <= thirtyDaysFromNow
  }).length

  return {
    totalPricing,
    activePricing,
    averageMargin,
    totalMargin,
    expiredPricing,
    expiringSoonPricing,
  }
}

// Hook principal
export function useResellerPricing() {
  const [filters, setFilters] = useState<PricingFilters>({
    search: '',
    category: '',
    tier: '',
    status: '',
    dateFrom: '',
    dateTo: '',
    sortBy: 'productName',
    sortOrder: 'asc',
    page: 1,
    limit: 10,
  })
  
  const [selectedPricing, setSelectedPricing] = useState<string[]>([])
  const [tiers, setTiers] = useState<PricingTier[]>(MOCK_TIERS)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingPricing, setEditingPricing] = useState<ResellerPricing | null>(null)

  // Statistiques
  const stats = useMemo(() => calculateStats(MOCK_PRICING), [])

  // Tarifs filtrés
  const pricing = useMemo(() => {
    let filtered = [...MOCK_PRICING]
    
    // Recherche
    if (filters.search) {
      const search = filters.search.toLowerCase()
      filtered = filtered.filter(p => 
        p.productName.toLowerCase().includes(search) ||
        p.reference.toLowerCase().includes(search)
      )
    }
    
    // Filtre par catégorie
    if (filters.category) {
      filtered = filtered.filter(p => p.category === filters.category)
    }
    
    // Filtre par tier
    if (filters.tier) {
      filtered = filtered.filter(p => p.tierId === filters.tier)
    }
    
    // Filtre par statut
    if (filters.status) {
      const now = new Date()
      if (filters.status === 'active') {
        filtered = filtered.filter(p => p.isActive && new Date(p.validTo) >= now)
      } else if (filters.status === 'expired') {
        filtered = filtered.filter(p => new Date(p.validTo) < now)
      } else if (filters.status === 'expiring') {
        const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
        filtered = filtered.filter(p => {
          const validTo = new Date(p.validTo)
          return validTo >= now && validTo <= thirtyDaysFromNow
        })
      }
    }
    
    // Filtre par date
    if (filters.dateFrom) {
      filtered = filtered.filter(p => new Date(p.validFrom) >= new Date(filters.dateFrom))
    }
    if (filters.dateTo) {
      filtered = filtered.filter(p => new Date(p.validTo) <= new Date(filters.dateTo + 'T23:59:59'))
    }
    
    // Tri
    filtered.sort((a, b) => {
      let comparison = 0
      switch (filters.sortBy) {
        case 'productName':
          comparison = a.productName.localeCompare(b.productName)
          break
        case 'basePrice':
          comparison = a.basePrice - b.basePrice
          break
        case 'resellerPrice':
          comparison = a.resellerPrice - b.resellerPrice
          break
        case 'margin':
          comparison = a.margin - b.margin
          break
        case 'marginPercentage':
          comparison = a.marginPercentage - b.marginPercentage
          break
        default:
          comparison = a.productName.localeCompare(b.productName)
      }
      return filters.sortOrder === 'asc' ? comparison : -comparison
    })
    
    return filtered
  }, [filters.search, filters.category, filters.tier, filters.status, filters.dateFrom, filters.dateTo, filters.sortBy, filters.sortOrder])

  // Pagination
  const pagination = useMemo((): {
    total: number
    page: number
    limit: number
    totalPages: number
    start: number
    end: number
  } => {
    const totalPages = Math.ceil(pricing.length / filters.limit)
    return {
      total: pricing.length,
      page: filters.page,
      limit: filters.limit,
      totalPages,
      start: (filters.page - 1) * filters.limit,
      end: Math.min(filters.page * filters.limit, pricing.length),
    }
  }, [pricing.length, filters.page, filters.limit])

  const paginatedPricing = useMemo(() => {
    return pricing.slice(pagination.start, pagination.end)
  }, [pricing, pagination.start, pagination.end])

  // Catégories disponibles
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(MOCK_PRICING.map(p => p.category))]
    return uniqueCategories.sort()
  }, [])

  // Mettre à jour les filtres
  const updateFilters = useCallback((updates: Partial<PricingFilters>) => {
    setFilters(prev => ({ ...prev, ...updates }))
  }, [])

  // Réinitialiser les filtres
  const resetFilters = useCallback(() => {
    setFilters({
      search: '',
      category: '',
      tier: '',
      status: '',
      dateFrom: '',
      dateTo: '',
      sortBy: 'productName',
      sortOrder: 'asc',
      page: 1,
      limit: 10,
    })
    setSelectedPricing([])
  }, [])

  // Changer de page
  const goToPage = useCallback((page: number) => {
    setFilters(prev => ({ ...prev, page }))
  }, [])

  // Sélection/désélection
  const togglePricingSelection = useCallback((pricingId: string) => {
    setSelectedPricing(prev => 
      prev.includes(pricingId) 
        ? prev.filter(id => id !== pricingId)
        : [...prev, pricingId]
    )
  }, [])

  const selectAllPricing = useCallback(() => {
    setSelectedPricing(paginatedPricing.map(p => p.id))
  }, [paginatedPricing])

  const clearSelection = useCallback(() => {
    setSelectedPricing([])
  }, [])

  // Ouvrir le dialogue d'édition
  const openEditDialog = useCallback((pricing: ResellerPricing) => {
    setEditingPricing(pricing)
    setIsEditDialogOpen(true)
  }, [])

  // Sauvegarder un tarif
  const savePricing = useCallback(async (data: Partial<ResellerPricing>): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 500))
    console.log('Saving pricing:', editingPricing ? `Update ${editingPricing.id}` : 'Create', data)
    setIsEditDialogOpen(false)
    setEditingPricing(null)
    return true
  }, [editingPricing])

  // Calculer la marge
  const calculateMargin = useCallback((basePrice: number, resellerPrice: number): { margin: number; marginPercentage: number } => {
    const margin = resellerPrice - basePrice
    const marginPercentage = basePrice > 0 ? (margin / basePrice) * 100 : 0
    return { margin, marginPercentage }
  }, [])

  // Appliquer une marge
  const applyMargin = useCallback(async (percentage: number): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 500))
    console.log('Applying margin:', percentage, '% to', selectedPricing.length, 'items')
    return true
  }, [selectedPricing.length])

  // Exporter les tarifs
  const exportPricing = useCallback((format: 'csv') => {
    console.log('Export pricing as:', format)
  }, [])

  return {
    filters,
    updateFilters,
    resetFilters,
    goToPage,
    pagination,
    pricing: paginatedPricing,
    allPricing: pricing,
    stats,
    categories,
    tiers,
    selectedPricing,
    togglePricingSelection,
    selectAllPricing,
    clearSelection,
    isEditDialogOpen,
    setIsEditDialogOpen,
    editingPricing,
    setEditingPricing,
    openEditDialog,
    savePricing,
    calculateMargin,
    applyMargin,
    exportPricing,
  }
}

export default useResellerPricing
