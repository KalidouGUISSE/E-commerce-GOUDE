/**
 * useResellerProducts Hook - Gestion des produits du revendeur
 * 
 * Ce hook gère :
 * - Liste des produits avec pagination
 * - Recherche et filtrage
 * - CRUD (Créer, Lire, Modifier, Supprimer)
 * - Statut actif/inactif
 * - Actions bulk
 */

'use client'

import { useState, useCallback, useMemo } from 'react'

// Types pour les produits
export interface ResellerProduct {
  id: string
  reference: string
  name: string
  description: string
  category: string
  price: number
  images: string[]
  stock: number
  minStock: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// Types pour les filtres
export interface ProductFilters {
  search: string
  category: string
  status: string
  sortBy: string
  sortOrder: 'asc' | 'desc'
  page: number
  limit: number
}

// Types pour les statistiques
export interface ProductStats {
  totalProducts: number
  activeProducts: number
  inactiveProducts: number
  totalValue: number
}

// Données mockées
const MOCK_PRODUCTS: ResellerProduct[] = [
  {
    id: 'prod001',
    reference: 'PAG-MAN-001',
    name: 'Pagne Manjak Rouge Premium',
    description: 'Pagne traditionnel manjak de couleur rouge, tissé à la main avec des motifs traditionnels.',
    category: 'Manjak',
    price: 15000,
    images: ['/images/products/manjak-red.png'],
    stock: 45,
    minStock: 10,
    isActive: true,
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-02-04T14:22:00Z',
  },
  {
    id: 'prod002',
    reference: 'PAG-KEN-001',
    name: 'Pagne Kente Or Royal',
    description: 'Pagne ghanéen kente tissé or, qualité premium avec motifs royaux.',
    category: 'Kente',
    price: 25000,
    images: ['/images/products/kente-gold.png'],
    stock: 8,
    minStock: 15,
    isActive: true,
    createdAt: '2024-01-10T08:15:00Z',
    updatedAt: '2024-02-03T11:45:00Z',
  },
  {
    id: 'prod003',
    reference: 'PAG-THI-001',
    name: 'Pagne Thioup Bleu Ciel',
    description: 'Pagne thioup de couleur bleue ciel, tissus léger et confortable.',
    category: 'Thioup',
    price: 12000,
    images: ['/images/products/thioup-blue.png'],
    stock: 0,
    minStock: 20,
    isActive: true,
    createdAt: '2024-01-20T14:30:00Z',
    updatedAt: '2024-02-02T09:00:00Z',
  },
  {
    id: 'prod004',
    reference: 'PAG-BOG-001',
    name: 'Pagne Bogolan Marron Terre',
    description: 'Pagne bogolan teint à la boue avec motifs traditionnels bambara.',
    category: 'Bogolan',
    price: 18000,
    images: ['/images/products/bogolan-brown.png'],
    stock: 32,
    minStock: 10,
    isActive: true,
    createdAt: '2024-01-05T16:45:00Z',
    updatedAt: '2024-02-04T08:30:00Z',
  },
  {
    id: 'prod005',
    reference: 'PAG-BAZ-001',
    name: 'Pagne Bazin Vert Émeraude',
    description: 'Pagne bazin de qualité premium, vert émeraude avec broderies.',
    category: 'Bazin',
    price: 22000,
    images: ['/images/products/bazin-green.png'],
    stock: 5,
    minStock: 12,
    isActive: true,
    createdAt: '2024-01-08T11:20:00Z',
    updatedAt: '2024-02-01T15:00:00Z',
  },
  {
    id: 'prod006',
    reference: 'PAG-WAX-001',
    name: 'Pagne Waxi Rose Poudré',
    description: 'Pagne waxi imprimé rose poudré, tissuswax hollandaise.',
    category: 'Waxi',
    price: 16000,
    images: ['/images/products/waxi-pink.png'],
    stock: 67,
    minStock: 15,
    isActive: true,
    createdAt: '2024-01-12T09:30:00Z',
    updatedAt: '2024-02-04T12:00:00Z',
  },
  {
    id: 'prod007',
    reference: 'PAG-SER-001',
    name: 'Pagne Sérère Blanc Naturel',
    description: 'Pagne traditionnel sérère en coton blanc naturel.',
    category: 'Sérère',
    price: 14000,
    images: ['/images/products/serere-white.png'],
    stock: 28,
    minStock: 10,
    isActive: false,
    createdAt: '2024-01-18T13:45:00Z',
    updatedAt: '2024-01-25T10:00:00Z',
  },
  {
    id: 'prod008',
    reference: 'PAG-MAN-002',
    name: 'Pagne Manjak Noir Élégance',
    description: 'Pagne traditionnel manjak noir avec bordures dorées.',
    category: 'Manjak',
    price: 15000,
    images: ['/images/products/manjak-black.png'],
    stock: 3,
    minStock: 10,
    isActive: true,
    createdAt: '2024-01-22T10:15:00Z',
    updatedAt: '2024-02-04T07:30:00Z',
  },
]

// Calculer les statistiques
const calculateStats = (products: ResellerProduct[]): ProductStats => {
  const totalProducts = products.length
  const activeProducts = products.filter(p => p.isActive).length
  const inactiveProducts = totalProducts - activeProducts
  const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0)
  
  return {
    totalProducts,
    activeProducts,
    inactiveProducts,
    totalValue,
  }
}

// Hook principal
export function useResellerProducts() {
  const [filters, setFilters] = useState<ProductFilters>({
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
  const [editingProduct, setEditingProduct] = useState<ResellerProduct | null>(null)

  // Statistiques
  const stats = useMemo(() => calculateStats(MOCK_PRODUCTS), [])

  // Produits filtrés
  const products = useMemo(() => {
    let filtered = [...MOCK_PRODUCTS]
    
    // Recherche
    if (filters.search) {
      const search = filters.search.toLowerCase()
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(search) ||
        p.reference.toLowerCase().includes(search) ||
        p.description.toLowerCase().includes(search)
      )
    }
    
    // Filtre par catégorie
    if (filters.category) {
      filtered = filtered.filter(p => p.category === filters.category)
    }
    
    // Filtre par statut
    if (filters.status) {
      if (filters.status === 'active') {
        filtered = filtered.filter(p => p.isActive)
      } else if (filters.status === 'inactive') {
        filtered = filtered.filter(p => !p.isActive)
      }
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
        case 'price':
          comparison = a.price - b.price
          break
        case 'stock':
          comparison = a.stock - b.stock
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
    const totalPages = Math.ceil(products.length / filters.limit)
    return {
      total: products.length,
      page: filters.page,
      limit: filters.limit,
      totalPages,
      start: (filters.page - 1) * filters.limit,
      end: Math.min(filters.page * filters.limit, products.length),
    }
  }, [products.length, filters.page, filters.limit])

  const paginatedProducts = useMemo(() => {
    return products.slice(pagination.start, pagination.end)
  }, [products, pagination.start, pagination.end])

  // Catégories disponibles
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(MOCK_PRODUCTS.map(p => p.category))]
    return uniqueCategories.sort()
  }, [])

  // Mettre à jour les filtres
  const updateFilters = useCallback((updates: Partial<ProductFilters>) => {
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
    setSelectedProducts(paginatedProducts.map(p => p.id))
  }, [paginatedProducts])

  const clearSelection = useCallback(() => {
    setSelectedProducts([])
  }, [])

  // Ouvrir le dialogue d'édition
  const openEditDialog = useCallback((product: ResellerProduct) => {
    setEditingProduct(product)
    setIsEditDialogOpen(true)
  }, [])

  const openAddDialog = useCallback(() => {
    setEditingProduct(null)
    setIsEditDialogOpen(true)
  }, [])

  // Sauvegarder un produit
  const saveProduct = useCallback(async (data: Partial<ResellerProduct>): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 500))
    console.log('Saving product:', editingProduct ? `Update ${editingProduct.id}` : 'Create', data)
    setIsEditDialogOpen(false)
    setEditingProduct(null)
    return true
  }, [editingProduct])

  // Supprimer un produit
  const deleteProduct = useCallback(async (productId: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 500))
    console.log('Deleting product:', productId)
    return true
  }, [])

  // Activer/désactiver un produit
  const toggleProductStatus = useCallback(async (product: ResellerProduct): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 300))
    console.log('Toggling status:', product.id)
    return true
  }, [])

  // Actions bulk
  const bulkDelete = useCallback(async (productIds: string[]): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 500))
    console.log('Bulk delete:', productIds)
    setSelectedProducts([])
    return true
  }, [])

  const bulkToggleStatus = useCallback(async (productIds: string[], activate: boolean): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 500))
    console.log('Bulk toggle status:', productIds, activate)
    setSelectedProducts([])
    return true
  }, [])

  // Exporter les produits
  const exportProducts = useCallback((format: 'csv') => {
    console.log('Export products as:', format)
  }, [])

  return {
    filters,
    updateFilters,
    resetFilters,
    goToPage,
    pagination,
    products: paginatedProducts,
    allProducts: products,
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
    deleteProduct,
    toggleProductStatus,
    bulkDelete,
    bulkToggleStatus,
    exportProducts,
  }
}

export default useResellerProducts
