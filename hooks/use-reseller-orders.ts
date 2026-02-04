/**
 * useResellerOrders Hook - Gestion des commandes du revendeur
 * 
 * Ce hook gère :
 * - Liste des commandes avec pagination
 * - Recherche et filtrage par statut
 * - Mise à jour du statut
 * - Actions bulk
 * - Statistiques
 */

'use client'

import { useState, useCallback, useMemo } from 'react'

// Types pour les produits dans une commande
export interface OrderProduct {
  id: string
  name: string
  category: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

// Types pour les commandes
export interface ResellerOrder {
  id: string
  orderNumber: string
  customerName: string
  customerEmail: string
  customerPhone: string
  customerRef: string
  products: OrderProduct[]
  subtotal: number
  shippingCost: number
  tax: number
  total: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  paymentStatus: 'pending' | 'paid' | 'refunded'
  shippingAddress: string
  shippingCity: string
  shippingRegion: string
  notes?: string
  createdAt: string
  updatedAt: string
}

// Types pour les filtres
export interface OrderFilters {
  search: string
  status: string
  paymentStatus: string
  dateFrom: string
  dateTo: string
  sortBy: string
  sortOrder: 'asc' | 'desc'
  page: number
  limit: number
}

// Statistiques
export interface OrderStats {
  totalOrders: number
  totalAmount: number
  pendingCount: number
  processingCount: number
  shippedCount: number
  deliveredCount: number
  cancelledCount: number
  averageOrderValue: number
}

// Données mockées
const MOCK_ORDERS: ResellerOrder[] = [
  {
    id: 'ord001',
    orderNumber: 'CMD-2024-001',
    customerName: 'Aminata Fall',
    customerEmail: 'aminata.fall@email.com',
    customerPhone: '+221 77 123 45 67',
    customerRef: 'REF-C-001',
    products: [
      { id: 'p1', name: 'Pagne Manjak Rouge', category: 'Manjak', quantity: 10, unitPrice: 15000, totalPrice: 150000 },
      { id: 'p2', name: 'Pagne Thioup Bleu', category: 'Thioup', quantity: 5, unitPrice: 12000, totalPrice: 60000 },
    ],
    subtotal: 210000,
    shippingCost: 5000,
    tax: 0,
    total: 215000,
    status: 'pending',
    paymentStatus: 'pending',
    shippingAddress: '12 Rue de la Paix',
    shippingCity: 'Dakar',
    shippingRegion: 'Dakar',
    createdAt: '2024-02-04T10:30:00Z',
    updatedAt: '2024-02-04T10:30:00Z',
  },
  {
    id: 'ord002',
    orderNumber: 'CMD-2024-002',
    customerName: 'Fatou Diop',
    customerEmail: 'fatou.diop@email.com',
    customerPhone: '+221 76 234 56 78',
    customerRef: 'REF-C-002',
    products: [
      { id: 'p3', name: 'Pagne Kente Or', category: 'Kente', quantity: 8, unitPrice: 25000, totalPrice: 200000 },
    ],
    subtotal: 200000,
    shippingCost: 3500,
    tax: 0,
    total: 203500,
    status: 'processing',
    paymentStatus: 'paid',
    shippingAddress: '25 Avenue Cheikh Anta Diop',
    shippingCity: 'Rufisque',
    shippingRegion: 'Dakar',
    createdAt: '2024-02-03T14:22:00Z',
    updatedAt: '2024-02-04T09:15:00Z',
  },
  {
    id: 'ord003',
    orderNumber: 'CMD-2024-003',
    customerName: 'Mariama Sy',
    customerEmail: 'mariama.sy@email.com',
    customerPhone: '+221 70 345 67 89',
    customerRef: 'REF-C-003',
    products: [
      { id: 'p4', name: 'Pagne Bogolan Marron', category: 'Bogolan', quantity: 15, unitPrice: 18000, totalPrice: 270000 },
      { id: 'p5', name: 'Pagne Bazin Vert', category: 'Bazin', quantity: 20, unitPrice: 22000, totalPrice: 440000 },
      { id: 'p6', name: 'Pagne Waxi Rose', category: 'Waxi', quantity: 10, unitPrice: 16000, totalPrice: 160000 },
    ],
    subtotal: 870000,
    shippingCost: 8000,
    tax: 0,
    total: 878000,
    status: 'shipped',
    paymentStatus: 'paid',
    shippingAddress: '8 Boulevard de la République',
    shippingCity: 'Thiès',
    shippingRegion: 'Thiès',
    createdAt: '2024-02-02T11:45:00Z',
    updatedAt: '2024-02-04T08:00:00Z',
  },
  {
    id: 'ord004',
    orderNumber: 'CMD-2024-004',
    customerName: 'Sokhna Aïssa',
    customerEmail: 'sokhna.aissa@email.com',
    customerPhone: '+221 77 567 89 01',
    customerRef: 'REF-C-005',
    products: [
      { id: 'p7', name: 'Pagne Sérère Blanc', category: 'Sérère', quantity: 25, unitPrice: 14000, totalPrice: 350000 },
    ],
    subtotal: 350000,
    shippingCost: 6000,
    tax: 0,
    total: 356000,
    status: 'delivered',
    paymentStatus: 'paid',
    shippingAddress: '45 Rue du Marché',
    shippingCity: 'Kaolack',
    shippingRegion: 'Kaolack',
    createdAt: '2024-01-28T16:30:00Z',
    updatedAt: '2024-02-01T14:20:00Z',
  },
  {
    id: 'ord005',
    orderNumber: 'CMD-2024-005',
    customerName: 'Adama Traoré',
    customerEmail: 'adama.traore@email.com',
    customerPhone: '+221 76 678 90 12',
    customerRef: 'REF-C-006',
    products: [
      { id: 'p8', name: 'Pagne Manjak Noir', category: 'Manjak', quantity: 5, unitPrice: 15000, totalPrice: 75000 },
    ],
    subtotal: 75000,
    shippingCost: 4000,
    tax: 0,
    total: 79000,
    status: 'cancelled',
    paymentStatus: 'refunded',
    shippingAddress: '18 Avenue de la Liberation',
    shippingCity: 'Ziguinchor',
    shippingRegion: 'Ziguinchor',
    createdAt: '2024-01-25T09:15:00Z',
    updatedAt: '2024-01-26T11:00:00Z',
  },
  {
    id: 'ord006',
    orderNumber: 'CMD-2024-006',
    customerName: 'Ousmane Diallo',
    customerEmail: 'ousmane.diallo@email.com',
    customerPhone: '+221 70 789 01 23',
    customerRef: 'REF-C-007',
    products: [
      { id: 'p9', name: 'Pagne Thioup Jaune', category: 'Thioup', quantity: 12, unitPrice: 12000, totalPrice: 144000 },
      { id: 'p10', name: 'Pagne Kente Rouge', category: 'Kente', quantity: 6, unitPrice: 25000, totalPrice: 150000 },
    ],
    subtotal: 294000,
    shippingCost: 5500,
    tax: 0,
    total: 299500,
    status: 'pending',
    paymentStatus: 'pending',
    shippingAddress: '7 Rue du Commerce',
    shippingCity: 'Louga',
    shippingRegion: 'Louga',
    createdAt: '2024-02-04T08:00:00Z',
    updatedAt: '2024-02-04T08:00:00Z',
  },
]

// Calculer les statistiques
const calculateStats = (orders: ResellerOrder[]): OrderStats => {
  const totalOrders = orders.length
  const totalAmount = orders.reduce((sum, o) => sum + o.total, 0)
  const pendingCount = orders.filter(o => o.status === 'pending').length
  const processingCount = orders.filter(o => o.status === 'processing').length
  const shippedCount = orders.filter(o => o.status === 'shipped').length
  const deliveredCount = orders.filter(o => o.status === 'delivered').length
  const cancelledCount = orders.filter(o => o.status === 'cancelled').length
  
  return {
    totalOrders,
    totalAmount,
    pendingCount,
    processingCount,
    shippedCount,
    deliveredCount,
    cancelledCount,
    averageOrderValue: totalOrders > 0 ? totalAmount / totalOrders : 0,
  }
}

// Hook principal
export function useResellerOrders() {
  const [filters, setFilters] = useState<OrderFilters>({
    search: '',
    status: '',
    paymentStatus: '',
    dateFrom: '',
    dateTo: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    page: 1,
    limit: 10,
  })
  
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)
  const [newStatus, setNewStatus] = useState<ResellerOrder['status'] | null>(null)

  // Statistiques
  const stats = useMemo(() => calculateStats(MOCK_ORDERS), [])

  // Commandes filtrées
  const orders = useMemo(() => {
    let filtered = [...MOCK_ORDERS]
    
    // Recherche
    if (filters.search) {
      const search = filters.search.toLowerCase()
      filtered = filtered.filter(o => 
        o.orderNumber.toLowerCase().includes(search) ||
        o.customerName.toLowerCase().includes(search) ||
        o.customerEmail.toLowerCase().includes(search) ||
        o.customerRef.toLowerCase().includes(search)
      )
    }
    
    // Filtre par statut
    if (filters.status) {
      filtered = filtered.filter(o => o.status === filters.status)
    }
    
    // Filtre par statut de paiement
    if (filters.paymentStatus) {
      filtered = filtered.filter(o => o.paymentStatus === filters.paymentStatus)
    }
    
    // Filtre par date
    if (filters.dateFrom) {
      filtered = filtered.filter(o => new Date(o.createdAt) >= new Date(filters.dateFrom))
    }
    if (filters.dateTo) {
      filtered = filtered.filter(o => new Date(o.createdAt) <= new Date(filters.dateTo + 'T23:59:59'))
    }
    
    // Tri
    filtered.sort((a, b) => {
      let comparison = 0
      switch (filters.sortBy) {
        case 'orderNumber':
          comparison = a.orderNumber.localeCompare(b.orderNumber)
          break
        case 'customerName':
          comparison = a.customerName.localeCompare(b.customerName)
          break
        case 'total':
          comparison = a.total - b.total
          break
        case 'status':
          comparison = a.status.localeCompare(b.status)
          break
        case 'createdAt':
        default:
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      }
      return filters.sortOrder === 'asc' ? comparison : -comparison
    })
    
    return filtered
  }, [filters.search, filters.status, filters.paymentStatus, filters.dateFrom, filters.dateTo, filters.sortBy, filters.sortOrder])

  // Pagination
  const pagination = useMemo(() => {
    const totalPages = Math.ceil(orders.length / filters.limit)
    return {
      total: orders.length,
      page: filters.page,
      limit: filters.limit,
      totalPages,
      start: (filters.page - 1) * filters.limit,
      end: Math.min(filters.page * filters.limit, orders.length),
    }
  }, [orders.length, filters.page, filters.limit])

  const paginatedOrders = useMemo(() => {
    return orders.slice(pagination.start, pagination.end)
  }, [orders, pagination.start, pagination.end])

  // Mettre à jour les filtres
  const updateFilters = useCallback((updates: Partial<OrderFilters>) => {
    setFilters(prev => ({ ...prev, ...updates }))
  }, [])

  // Réinitialiser les filtres
  const resetFilters = useCallback(() => {
    setFilters({
      search: '',
      status: '',
      paymentStatus: '',
      dateFrom: '',
      dateTo: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
      page: 1,
      limit: 10,
    })
    setSelectedOrders([])
  }, [])

  // Changer de page
  const goToPage = useCallback((page: number) => {
    setFilters(prev => ({ ...prev, page }))
  }, [])

  // Sélection/désélection
  const toggleOrderSelection = useCallback((orderId: string) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    )
  }, [])

  const selectAllOrders = useCallback(() => {
    setSelectedOrders(paginatedOrders.map(o => o.id))
  }, [paginatedOrders])

  const clearSelection = useCallback(() => {
    setSelectedOrders([])
  }, [])

  // Ouvrir le dialogue de changement de statut
  const openStatusDialog = useCallback((status: ResellerOrder['status']) => {
    setNewStatus(status)
    setIsStatusDialogOpen(true)
  }, [])

  // Mettre à jour le statut
  const updateOrderStatus = useCallback(async (orderIds: string[], status: ResellerOrder['status']): Promise<boolean> => {
    // Simulation d'un appel API
    await new Promise(resolve => setTimeout(resolve, 500))
    
    console.log('Updating orders:', orderIds, 'to status:', status)
    setIsStatusDialogOpen(false)
    setNewStatus(null)
    setSelectedOrders([])
    return true
  }, [])

  // Exporter les commandes
  const exportOrders = useCallback((format: 'csv') => {
    console.log('Export orders as:', format)
    // Implémenter l'export CSV
  }, [])

  return {
    filters,
    updateFilters,
    resetFilters,
    goToPage,
    pagination,
    orders: paginatedOrders,
    allOrders: orders,
    stats,
    selectedOrders,
    toggleOrderSelection,
    selectAllOrders,
    clearSelection,
    isStatusDialogOpen,
    setIsStatusDialogOpen,
    newStatus,
    openStatusDialog,
    updateOrderStatus,
    exportOrders,
  }
}

export default useResellerOrders
