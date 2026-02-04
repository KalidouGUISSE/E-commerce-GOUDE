/**
 * useResellerStocks Hook - Gestion des stocks du revendeur
 * 
 * Ce hook gère :
 * - Liste des produits en stock avec pagination
 * - Recherche et filtrage par catégorie, statut
 * - Mise à jour des produits
 * - Statistiques de stock
 * - Actions bulk (export, mise à jour multiple)
 */

'use client'

import { useState, useCallback, useMemo } from 'react'

// Types pour les produits en stock
export interface ResellerStock {
  id: string
  reference: string
  name: string
  category: string
  description: string
  sellingPrice: number
  costPrice: number
  quantity: number
  alertThreshold: number
  status: 'in_stock' | 'low_stock' | 'out_of_stock'
  lastUpdated: string
  imageUrl?: string
  variants?: {
    name: string
    quantity: number
  }[]
}

// Types pour les filtres
export interface StockFilters {
  search: string
  category: string
  status: string
  sortBy: string
  sortOrder: 'asc' | 'desc'
  page: number
  limit: number
}

// Types pour les statistiques
export interface StockStats {
  totalProducts: number
  totalValue: number
  outOfStockCount: number
  lowStockCount: number
  inStockCount: number
  averageMargin: number
}

// Données mockées
const MOCK_STOCKS: ResellerStock[] = [
  {
    id: 'stk001',
    reference: 'PAG-MAN-001',
    name: 'Pagne Manjak Rouge',
    category: 'Manjak',
    description: 'Pagne traditionnel manjak de couleur rouge',
    sellingPrice: 15000,
    costPrice: 10000,
    quantity: 45,
    alertThreshold: 10,
    status: 'in_stock',
    lastUpdated: '2024-02-04T10:30:00Z',
    imageUrl: '/images/products/manjak-red.png',
  },
  {
    id: 'stk002',
    reference: 'PAG-KEN-001',
    name: 'Pagne Kente Or',
    category: 'Kente',
    description: 'Pagne ghanéen kente tissé or',
    sellingPrice: 25000,
    costPrice: 18000,
    quantity: 8,
    alertThreshold: 15,
    status: 'low_stock',
    lastUpdated: '2024-02-03T14:22:00Z',
    imageUrl: '/images/products/kente-gold.png',
  },
  {
    id: 'stk003',
    reference: 'PAG-THI-001',
    name: 'Pagne Thioup Bleu',
    category: 'Thioup',
    description: 'Pagne thioup de couleur bleue',
    sellingPrice: 12000,
    costPrice: 8000,
    quantity: 0,
    alertThreshold: 20,
    status: 'out_of_stock',
    lastUpdated: '2024-02-02T11:45:00Z',
    imageUrl: '/images/products/thioup-blue.png',
  },
  {
    id: 'stk004',
    reference: 'PAG-BOG-001',
    name: 'Pagne Bogolan Marron',
    category: 'Bogolan',
    description: 'Pagne bogolan teint à la boue',
    sellingPrice: 18000,
    costPrice: 12000,
    quantity: 32,
    alertThreshold: 10,
    status: 'in_stock',
    lastUpdated: '2024-02-04T08:00:00Z',
    imageUrl: '/images/products/bogolan-brown.png',
  },
  {
    id: 'stk005',
    reference: 'PAG-BAZ-001',
    name: 'Pagne Bazin Vert',
    category: 'Bazin',
    description: 'Pagne bazin de qualité premium vert',
    sellingPrice: 22000,
    costPrice: 15000,
    quantity: 5,
    alertThreshold: 12,
    status: 'low_stock',
    lastUpdated: '2024-02-01T16:30:00Z',
    imageUrl: '/images/products/bazin-green.png',
  },
  {
    id: 'stk006',
    reference: 'PAG-WAX-001',
    name: 'Pagne Waxi Rose',
    category: 'Waxi',
    description: 'Pagne waxi imprimé rose',
    sellingPrice: 16000,
    costPrice: 10000,
    quantity: 67,
    alertThreshold: 15,
    status: 'in_stock',
    lastUpdated: '2024-02-04T12:00:00Z',
    imageUrl: '/images/products/waxi-pink.png',
  },
  {
    id: 'stk007',
    reference: 'PAG-SER-001',
    name: 'Pagne Sérère Blanc',
    category: 'Sérère',
    description: 'Pagne traditionnel sérère blanc',
    sellingPrice: 14000,
    costPrice: 9000,
    quantity: 28,
    alertThreshold: 10,
    status: 'in_stock',
    lastUpdated: '2024-02-03T09:15:00Z',
    imageUrl: '/images/products/serere-white.png',
  },
  {
    id: 'stk008',
    reference: 'PAG-MAN-002',
    name: 'Pagne Manjak Noir',
    category: 'Manjak',
    description: 'Pagne traditionnel manjak noir',
    sellingPrice: 15000,
    costPrice: 10000,
    quantity: 3,
    alertThreshold: 10,
    status: 'low_stock',
    lastUpdated: '2024-02-04T07:30:00Z',
    imageUrl: '/images/products/manjak-black.png',
  },
]

// Calculer les statistiques
const calculateStats = (stocks: ResellerStock[]): StockStats => {
  const totalProducts = stocks.length
  const totalValue = stocks.reduce((sum, s) => sum + (s.quantity * s.costPrice), 0)
  const outOfStockCount = stocks.filter(s => s.status === 'out_of_stock').length
  const lowStockCount = stocks.filter(s => s.status === 'low_stock').length
  const inStockCount = stocks.filter(s => s.status === 'in_stock').length
  
  const totalMargin = stocks.reduce((sum, s) => sum + ((s.sellingPrice - s.costPrice) * s.quantity), 0)
  const totalCost = stocks.reduce((sum, s) => sum + (s.costPrice * s.quantity), 0)
  const averageMargin = totalCost > 0 ? (totalMargin / totalCost) * 100 : 0
  
  return {
    totalProducts,
    totalValue,
    outOfStockCount,
    lowStockCount,
    inStockCount,
    averageMargin,
  }
}

// Hook principal
export function useResellerStocks() {
  const [filters, setFilters] = useState<StockFilters>({
    search: '',
    category: '',
    status: '',
    sortBy: 'name',
    sortOrder: 'asc',
    page: 1,
    limit: 10,
  })
  
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<ResellerStock | null>(null)

  // Statistiques
  const stats = useMemo(() => calculateStats(MOCK_STOCKS), [])

  // Produits filtrés
  const stocks = useMemo(() => {
    let filtered = [...MOCK_STOCKS]
    
    // Recherche
    if (filters.search) {
      const search = filters.search.toLowerCase()
      filtered = filtered.filter(s => 
        s.name.toLowerCase().includes(search) ||
        s.reference.toLowerCase().includes(search) ||
        s.category.toLowerCase().includes(search)
      )
    }
    
    // Filtre par catégorie
    if (filters.category) {
      filtered = filtered.filter(s => s.category === filters.category)
    }
    
    // Filtre par statut
    if (filters.status) {
      filtered = filtered.filter(s => s.status === filters.status)
    }
    
    // Tri
    filtered.sort((a, b) => {
      let comparison = 0
      switch (filters.sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'reference':
          comparison = a.reference.localeCompare(b.reference)
          break
        case 'quantity':
          comparison = a.quantity - b.quantity
          break
        case 'sellingPrice':
          comparison = a.sellingPrice - b.sellingPrice
          break
        case 'costPrice':
          comparison = a.costPrice - b.costPrice
          break
        case 'lastUpdated':
          comparison = new Date(a.lastUpdated).getTime() - new Date(b.lastUpdated).getTime()
          break
        default:
          comparison = a.name.localeCompare(b.name)
      }
      return filters.sortOrder === 'asc' ? comparison : -comparison
    })
    
    return filtered
  }, [filters.search, filters.category, filters.status, filters.sortBy, filters.sortOrder])

  // Pagination
  const pagination = useMemo((): {
    total: number
    page: number
    limit: number
    totalPages: number
    start: number
    end: number
  } => {
    const totalPages = Math.ceil(stocks.length / filters.limit)
    return {
      total: stocks.length,
      page: filters.page,
      limit: filters.limit,
      totalPages,
      start: (filters.page - 1) * filters.limit,
      end: Math.min(filters.page * filters.limit, stocks.length),
    }
  }, [stocks.length, filters.page, filters.limit])

  const paginatedStocks = useMemo(() => {
    return stocks.slice(pagination.start, pagination.end)
  }, [stocks, pagination.start, pagination.end])

  // Catégories disponibles
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(MOCK_STOCKS.map(s => s.category))]
    return uniqueCategories.sort()
  }, [])

  // Mettre à jour les filtres
  const updateFilters = useCallback((updates: Partial<StockFilters>) => {
    setFilters(prev => ({ ...prev, ...updates }))
  }, [])

  // Réinitialiser les filtres
  const resetFilters = useCallback(() => {
    setFilters({
      search: '',
      category: '',
      status: '',
      sortBy: 'name',
      sortOrder: 'asc',
      page: 1,
      limit: 10,
    })
    setSelectedProducts([])
  }, [])

  // Changer de page
  const goToPage = useCallback((page: number) => {
    setFilters(prev => ({ ...prev, page }))
  }, [])

  // Sélection/désélection
  const toggleProductSelection = useCallback((productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }, [])

  const selectAllProducts = useCallback(() => {
    setSelectedProducts(paginatedStocks.map(s => s.id))
  }, [paginatedStocks])

  const clearSelection = useCallback(() => {
    setSelectedProducts([])
  }, [])

  // Ouvrir le dialogue d'édition
  const openEditDialog = useCallback((product: ResellerStock) => {
    setEditingProduct(product)
    setIsEditDialogOpen(true)
  }, [])

  const openAddDialog = useCallback(() => {
    setEditingProduct(null)
    setIsEditDialogOpen(true)
  }, [])

  // Sauvegarder un produit
  const saveProduct = useCallback(async (data: Partial<ResellerStock>): Promise<boolean> => {
    // Simulation d'un appel API
    await new Promise(resolve => setTimeout(resolve, 500))
    
    console.log('Saving product:', editingProduct ? `Update ${editingProduct.id}` : 'Create', data)
    setIsEditDialogOpen(false)
    setEditingProduct(null)
    return true
  }, [editingProduct])

  // Exporter les stocks
  const exportStocks = useCallback((format: 'csv') => {
    console.log('Export stocks as:', format)
    // Implémenter l'export CSV
  }, [])

  // Mettre à jour la quantité en masse
  const bulkUpdateQuantity = useCallback(async (productIds: string[], adjustment: number): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 500))
    console.log('Bulk update:', productIds, 'adjustment:', adjustment)
    return true
  }, [])

  return {
    filters,
    updateFilters,
    resetFilters,
    goToPage,
    pagination,
    stocks: paginatedStocks,
    allStocks: stocks,
    stats,
    categories,
    selectedProducts,
    toggleProductSelection,
    selectAllProducts,
    clearSelection,
    isEditDialogOpen,
    setIsEditDialogOpen,
    editingProduct,
    openEditDialog,
    openAddDialog,
    saveProduct,
    exportStocks,
    bulkUpdateQuantity,
  }
}

export default useResellerStocks
