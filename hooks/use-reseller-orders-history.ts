/**
 * useResellerOrdersHistory Hook - Gestion de l'historique des commandes
 * 
 * Ce hook gère :
 * - Liste des commandes validées/livrées
 * - Filtrage par période, statut, montant
 * - Recherche avancée
 * - Export PDF
 * - Statistiques
 */

'use client'

import { useState, useCallback, useMemo } from 'react'

// Types pour l'historique des commandes
export interface OrderHistory {
  id: string
  orderNumber: string
  date: string
  clientId: string
  clientName: string
  clientEmail: string
  clientPhone: string
  deliveryAddress: {
    street: string
    city: string
    postalCode: string
    country: string
  }
  products: {
    id: string
    name: string
    reference: string
    quantity: number
    unitPrice: number
    totalPrice: number
  }[]
  subtotal: number
  shippingCost: number
  tax: number
  totalAmount: number
  status: 'delivered' | 'in_transit' | 'returned' | 'cancelled'
  deliveryStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'returned'
  trackingNumber: string
  carrier: string
  carrierUrl: string
  invoiceNumber: string
  notes: string
  createdAt: string
  updatedAt: string
}

// Types pour les filtres
export interface OrderHistoryFilters {
  search: string
  period: string
  dateFrom: string
  dateTo: string
  status: string[]
  minAmount: number
  maxAmount: number
  sortBy: string
  sortOrder: 'asc' | 'desc'
  page: number
  limit: number
}

// Types pour les statistiques
export interface OrderHistoryStats {
  totalOrders: number
  totalAmount: number
  deliveryRate: number
  returnsCount: number
  cancelledCount: number
}

// Données mockées pour l'historique
const MOCK_ORDERS: OrderHistory[] = [
  {
    id: 'ord001',
    orderNumber: 'CMD-2024-001',
    date: '2024-02-04T10:30:00Z',
    clientId: 'cli001',
    clientName: 'Aminata Diop',
    clientEmail: 'aminata.diop@email.com',
    clientPhone: '+221 77 123 45 67',
    deliveryAddress: {
      street: '12 Rue de la Paix',
      city: 'Dakar',
      postalCode: '11000',
      country: 'Sénégal',
    },
    products: [
      { id: 'prod001', name: 'Pagne Manjak Rouge Premium', reference: 'PAG-MAN-001', quantity: 5, unitPrice: 15000, totalPrice: 75000 },
      { id: 'prod002', name: 'Pagne Kente Or Royal', reference: 'PAG-KEN-001', quantity: 3, unitPrice: 25000, totalPrice: 75000 },
    ],
    subtotal: 150000,
    shippingCost: 5000,
    tax: 0,
    totalAmount: 155000,
    status: 'delivered',
    deliveryStatus: 'delivered',
    trackingNumber: 'TRK-2024-001234',
    carrier: 'Chronopost',
    carrierUrl: 'https://chronopost.fr/track?TRK-2024-001234',
    invoiceNumber: 'FAC-2024-001',
    notes: 'Livraison réussie',
    createdAt: '2024-02-04T10:30:00Z',
    updatedAt: '2024-02-06T14:00:00Z',
  },
  {
    id: 'ord002',
    orderNumber: 'CMD-2024-002',
    date: '2024-02-03T09:15:00Z',
    clientId: 'cli002',
    clientName: 'Mariama Sarr',
    clientEmail: 'mariama.sarr@email.com',
    clientPhone: '+221 76 987 65 43',
    deliveryAddress: {
      street: '45 Avenue Cheikh Anta Diop',
      city: 'Dakar',
      postalCode: '10500',
      country: 'Sénégal',
    },
    products: [
      { id: 'prod003', name: 'Pagne Thioup Bleu Ciel', reference: 'PAG-THI-001', quantity: 10, unitPrice: 12000, totalPrice: 120000 },
    ],
    subtotal: 120000,
    shippingCost: 3000,
    tax: 0,
    totalAmount: 123000,
    status: 'in_transit',
    deliveryStatus: 'shipped',
    trackingNumber: 'TRK-2024-001235',
    carrier: 'DHL',
    carrierUrl: 'https://dhl.com/track?TRK-2024-001235',
    invoiceNumber: 'FAC-2024-002',
    notes: 'En cours de livraison',
    createdAt: '2024-02-03T09:15:00Z',
    updatedAt: '2024-02-05T08:30:00Z',
  },
  {
    id: 'ord003',
    orderNumber: 'CMD-2024-003',
    date: '2024-02-02T14:20:00Z',
    clientId: 'cli003',
    clientName: 'Fatou Fall',
    clientEmail: 'fatou.fall@email.com',
    clientPhone: '+221 70 456 78 90',
    deliveryAddress: {
      street: '78 Rue Mermoz',
      city: 'Dakar',
      postalCode: '12000',
      country: 'Sénégal',
    },
    products: [
      { id: 'prod004', name: 'Pagne Bogolan Marron Terre', reference: 'PAG-BOG-001', quantity: 8, unitPrice: 18000, totalPrice: 144000 },
      { id: 'prod005', name: 'Pagne Bazin Vert Émeraude', reference: 'PAG-BAZ-001', quantity: 4, unitPrice: 22000, totalPrice: 88000 },
    ],
    subtotal: 232000,
    shippingCost: 5000,
    tax: 0,
    totalAmount: 237000,
    status: 'returned',
    deliveryStatus: 'returned',
    trackingNumber: 'TRK-2024-001236',
    carrier: 'Chronopost',
    carrierUrl: 'https://chronopost.fr/track?TRK-2024-001236',
    invoiceNumber: 'FAC-2024-003',
    notes: 'Client non satisfait - remboursement effectué',
    createdAt: '2024-02-02T14:20:00Z',
    updatedAt: '2024-02-07T11:00:00Z',
  },
  {
    id: 'ord004',
    orderNumber: 'CMD-2024-004',
    date: '2024-02-01T11:00:00Z',
    clientId: 'cli004',
    clientName: 'Oumou Barry',
    clientEmail: 'oumou.barry@email.com',
    clientPhone: '+221 75 321 09 87',
    deliveryAddress: {
      street: '23 Rue Libermann',
      city: 'Dakar',
      postalCode: '13000',
      country: 'Sénégal',
    },
    products: [
      { id: 'prod006', name: 'Pagne Waxi Rose Poudré', reference: 'PAG-WAX-001', quantity: 15, unitPrice: 16000, totalPrice: 240000 },
    ],
    subtotal: 240000,
    shippingCost: 5000,
    tax: 0,
    totalAmount: 245000,
    status: 'cancelled',
    deliveryStatus: 'pending',
    trackingNumber: '',
    carrier: '',
    carrierUrl: '',
    invoiceNumber: '',
    notes: 'Commande annulée par le client',
    createdAt: '2024-02-01T11:00:00Z',
    updatedAt: '2024-02-01T15:30:00Z',
  },
  {
    id: 'ord005',
    orderNumber: 'CMD-2024-005',
    date: '2024-02-04T08:45:00Z',
    clientId: 'cli005',
    clientName: 'Ndeye Diop',
    clientEmail: 'ndeye.diop@email.com',
    clientPhone: '+221 78 654 32 10',
    deliveryAddress: {
      street: '56 Rue HLM',
      city: 'Dakar',
      postalCode: '12500',
      country: 'Sénégal',
    },
    products: [
      { id: 'prod001', name: 'Pagne Manjak Rouge Premium', reference: 'PAG-MAN-001', quantity: 2, unitPrice: 15000, totalPrice: 30000 },
      { id: 'prod003', name: 'Pagne Thioup Bleu Ciel', reference: 'PAG-THI-001', quantity: 2, unitPrice: 12000, totalPrice: 24000 },
      { id: 'prod005', name: 'Pagne Bazin Vert Émeraude', reference: 'PAG-BAZ-001', quantity: 2, unitPrice: 22000, totalPrice: 44000 },
    ],
    subtotal: 98000,
    shippingCost: 3000,
    tax: 0,
    totalAmount: 101000,
    status: 'delivered',
    deliveryStatus: 'delivered',
    trackingNumber: 'TRK-2024-001237',
    carrier: 'DHL',
    carrierUrl: 'https://dhl.com/track?TRK-2024-001237',
    invoiceNumber: 'FAC-2024-004',
    notes: '',
    createdAt: '2024-02-04T08:45:00Z',
    updatedAt: '2024-02-06T16:45:00Z',
  },
  {
    id: 'ord006',
    orderNumber: 'CMD-2024-006',
    date: '2024-01-30T07:30:00Z',
    clientId: 'cli006',
    clientName: 'Sokhna GUEYE',
    clientEmail: 'sokhna.gueye@email.com',
    clientPhone: '+221 77 111 22 33',
    deliveryAddress: {
      street: '89 Rue Sicap',
      city: 'Dakar',
      postalCode: '11500',
      country: 'Sénégal',
    },
    products: [
      { id: 'prod002', name: 'Pagne Kente Or Royal', reference: 'PAG-KEN-001', quantity: 5, unitPrice: 25000, totalPrice: 125000 },
    ],
    subtotal: 125000,
    shippingCost: 5000,
    tax: 0,
    totalAmount: 130000,
    status: 'delivered',
    deliveryStatus: 'delivered',
    trackingNumber: 'TRK-2024-001238',
    carrier: 'Chronopost',
    carrierUrl: 'https://chronopost.fr/track?TRK-2024-001238',
    invoiceNumber: 'FAC-2024-005',
    notes: 'Livraison rapide',
    createdAt: '2024-01-30T07:30:00Z',
    updatedAt: '2024-02-02T10:15:00Z',
  },
]

// Calculer les statistiques
const calculateStats = (orders: OrderHistory[]): OrderHistoryStats => {
  const totalOrders = orders.length
  const totalAmount = orders.reduce((sum, o) => sum + o.totalAmount, 0)
  const delivered = orders.filter(o => o.status === 'delivered').length
  const returnsCount = orders.filter(o => o.status === 'returned').length
  const cancelledCount = orders.filter(o => o.status === 'cancelled').length
  const deliveryRate = totalOrders > 0 ? (delivered / totalOrders) * 100 : 0

  return {
    totalOrders,
    totalAmount,
    deliveryRate,
    returnsCount,
    cancelledCount,
  }
}

// Hook principal
export function useResellerOrdersHistory() {
  const [filters, setFilters] = useState<OrderHistoryFilters>({
    search: '',
    period: 'all',
    dateFrom: '',
    dateTo: '',
    status: [],
    minAmount: 0,
    maxAmount: 0,
    sortBy: 'date',
    sortOrder: 'desc',
    page: 1,
    limit: 10,
  })
  
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<OrderHistory | null>(null)

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
        o.clientName.toLowerCase().includes(search) ||
        o.products.some(p => p.reference.toLowerCase().includes(search) || p.name.toLowerCase().includes(search))
      )
    }
    
    // Filtre par période
    const now = new Date()
    if (filters.period !== 'all') {
      let startDate: Date
      switch (filters.period) {
        case 'today':
          startDate = new Date(now.setHours(0, 0, 0, 0))
          break
        case 'week':
          startDate = new Date(now.setDate(now.getDate() - 7))
          break
        case 'month':
          startDate = new Date(now.setMonth(now.getMonth() - 1))
          break
        case 'year':
          startDate = new Date(now.setFullYear(now.getFullYear() - 1))
          break
        default:
          startDate = new Date(0)
      }
      filtered = filtered.filter(o => new Date(o.date) >= startDate)
    }
    
    // Filtre par date personnalisée
    if (filters.dateFrom) {
      filtered = filtered.filter(o => new Date(o.date) >= new Date(filters.dateFrom))
    }
    if (filters.dateTo) {
      filtered = filtered.filter(o => new Date(o.date) <= new Date(filters.dateTo + 'T23:59:59'))
    }
    
    // Filtre par statut
    if (filters.status.length > 0) {
      filtered = filtered.filter(o => filters.status.includes(o.status))
    }
    
    // Filtre par montant
    if (filters.minAmount > 0) {
      filtered = filtered.filter(o => o.totalAmount >= filters.minAmount)
    }
    if (filters.maxAmount > 0) {
      filtered = filtered.filter(o => o.totalAmount <= filters.maxAmount)
    }
    
    // Tri
    filtered.sort((a, b) => {
      let comparison = 0
      switch (filters.sortBy) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime()
          break
        case 'orderNumber':
          comparison = a.orderNumber.localeCompare(b.orderNumber)
          break
        case 'clientName':
          comparison = a.clientName.localeCompare(b.clientName)
          break
        case 'totalAmount':
          comparison = a.totalAmount - b.totalAmount
          break
        default:
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime()
      }
      return filters.sortOrder === 'asc' ? comparison : -comparison
    })
    
    return filtered
  }, [filters.search, filters.period, filters.dateFrom, filters.dateTo, filters.status, filters.minAmount, filters.maxAmount, filters.sortBy, filters.sortOrder])

  // Pagination
  const pagination = useMemo((): {
    total: number
    page: number
    limit: number
    totalPages: number
    start: number
    end: number
  } => {
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
  const updateFilters = useCallback((updates: Partial<OrderHistoryFilters>) => {
    setFilters(prev => ({ ...prev, ...updates }))
  }, [])

  // Réinitialiser les filtres
  const resetFilters = useCallback(() => {
    setFilters({
      search: '',
      period: 'all',
      dateFrom: '',
      dateTo: '',
      status: [],
      minAmount: 0,
      maxAmount: 0,
      sortBy: 'date',
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

  // Ouvrir le modal de détails
  const openDetailModal = useCallback((order: OrderHistory) => {
    setSelectedOrder(order)
    setIsDetailModalOpen(true)
  }, [])

  // Fermer le modal de détails
  const closeDetailModal = useCallback(() => {
    setIsDetailModalOpen(false)
    setSelectedOrder(null)
  }, [])

  // Télécharger le PDF
  const downloadPDF = useCallback(async (orderId: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 500))
    console.log('Downloading PDF for order:', orderId)
    return true
  }, [])

  // Suivre la livraison
  const trackDelivery = useCallback((orderId: string) => {
    const order = MOCK_ORDERS.find(o => o.id === orderId)
    if (order?.carrierUrl) {
      window.open(order.carrierUrl, '_blank')
    }
  }, [])

  // Exporter les commandes
  const exportOrders = useCallback(async (format: 'csv' | 'pdf'): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 500))
    console.log('Exporting orders as:', format)
    return true
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
    isDetailModalOpen,
    setIsDetailModalOpen,
    selectedOrder,
    openDetailModal,
    closeDetailModal,
    downloadPDF,
    trackDelivery,
    exportOrders,
  }
}

export default useResellerOrdersHistory
