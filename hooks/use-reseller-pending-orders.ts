/**
 * useResellerPendingOrders Hook - Gestion des commandes en attente
 * 
 * Ce hook gère :
 * - Liste des commandes en attente de validation
 * - Validation/Refus de commandes
 * - Filtres et recherche
 * - Statistiques des commandes en attente
 */

'use client'

import { useState, useCallback, useMemo } from 'react'

// Types pour les commandes en attente
export interface PendingOrder {
  id: string
  orderNumber: string
  date: string
  clientId: string
  clientName: string
  clientEmail: string
  products: {
    id: string
    name: string
    reference: string
    quantity: number
    unitPrice: number
    totalPrice: number
  }[]
  totalAmount: number
  status: 'pending' | 'approved' | 'rejected'
  notes: string
  createdAt: string
}

// Types pour les filtres
export interface PendingOrderFilters {
  search: string
  dateFrom: string
  dateTo: string
  sortBy: string
  sortOrder: 'asc' | 'desc'
  page: number
  limit: number
}

// Types pour les statistiques
export interface PendingOrderStats {
  totalPending: number
  totalApproved: number
  totalRejected: number
  totalAmount: number
}

// Données mockées pour les commandes en attente
const MOCK_PENDING_ORDERS: PendingOrder[] = [
  {
    id: 'ord001',
    orderNumber: 'CMD-2024-001',
    date: '2024-02-04T10:30:00Z',
    clientId: 'cli001',
    clientName: 'Aminata Diop',
    clientEmail: 'aminata.diop@email.com',
    products: [
      { id: 'prod001', name: 'Pagne Manjak Rouge Premium', reference: 'PAG-MAN-001', quantity: 5, unitPrice: 15000, totalPrice: 75000 },
      { id: 'prod002', name: 'Pagne Kente Or Royal', reference: 'PAG-KEN-001', quantity: 3, unitPrice: 25000, totalPrice: 75000 },
    ],
    totalAmount: 150000,
    status: 'pending',
    notes: 'Livraison urgente souhaitée',
    createdAt: '2024-02-04T10:30:00Z',
  },
  {
    id: 'ord002',
    orderNumber: 'CMD-2024-002',
    date: '2024-02-04T09:15:00Z',
    clientId: 'cli002',
    clientName: 'Mariama Sarr',
    clientEmail: 'mariama.sarr@email.com',
    products: [
      { id: 'prod003', name: 'Pagne Thioup Bleu Ciel', reference: 'PAG-THI-001', quantity: 10, unitPrice: 12000, totalPrice: 120000 },
    ],
    totalAmount: 120000,
    status: 'pending',
    notes: '',
    createdAt: '2024-02-04T09:15:00Z',
  },
  {
    id: 'ord003',
    orderNumber: 'CMD-2024-003',
    date: '2024-02-03T14:20:00Z',
    clientId: 'cli003',
    clientName: 'Fatou Fall',
    clientEmail: 'fatou.fall@email.com',
    products: [
      { id: 'prod004', name: 'Pagne Bogolan Marron Terre', reference: 'PAG-BOG-001', quantity: 8, unitPrice: 18000, totalPrice: 144000 },
      { id: 'prod005', name: 'Pagne Bazin Vert Émeraude', reference: 'PAG-BAZ-001', quantity: 4, unitPrice: 22000, totalPrice: 88000 },
    ],
    totalAmount: 232000,
    status: 'approved',
    notes: 'Client fidèle - réduction appliquée',
    createdAt: '2024-02-03T14:20:00Z',
  },
  {
    id: 'ord004',
    orderNumber: 'CMD-2024-004',
    date: '2024-02-03T11:00:00Z',
    clientId: 'cli004',
    clientName: 'Oumou Barry',
    clientEmail: 'oumou.barry@email.com',
    products: [
      { id: 'prod006', name: 'Pagne Waxi Rose Poudré', reference: 'PAG-WAX-001', quantity: 15, unitPrice: 16000, totalPrice: 240000 },
    ],
    totalAmount: 240000,
    status: 'rejected',
    notes: 'Stock insuffisant - client notifié',
    createdAt: '2024-02-03T11:00:00Z',
  },
  {
    id: 'ord005',
    orderNumber: 'CMD-2024-005',
    date: '2024-02-04T08:45:00Z',
    clientId: 'cli005',
    clientName: 'Ndeye Diop',
    clientEmail: 'ndeye.diop@email.com',
    products: [
      { id: 'prod001', name: 'Pagne Manjak Rouge Premium', reference: 'PAG-MAN-001', quantity: 2, unitPrice: 15000, totalPrice: 30000 },
      { id: 'prod003', name: 'Pagne Thioup Bleu Ciel', reference: 'PAG-THI-001', quantity: 2, unitPrice: 12000, totalPrice: 24000 },
      { id: 'prod005', name: 'Pagne Bazin Vert Émeraude', reference: 'PAG-BAZ-001', quantity: 2, unitPrice: 22000, totalPrice: 44000 },
    ],
    totalAmount: 98000,
    status: 'pending',
    notes: 'Paiement par virement',
    createdAt: '2024-02-04T08:45:00Z',
  },
  {
    id: 'ord006',
    orderNumber: 'CMD-2024-006',
    date: '2024-02-04T07:30:00Z',
    clientId: 'cli006',
    clientName: 'Sokhna GUEYE',
    clientEmail: 'sokhna.gueye@email.com',
    products: [
      { id: 'prod002', name: 'Pagne Kente Or Royal', reference: 'PAG-KEN-001', quantity: 5, unitPrice: 25000, totalPrice: 125000 },
    ],
    totalAmount: 125000,
    status: 'pending',
    notes: '',
    createdAt: '2024-02-04T07:30:00Z',
  },
]

// Calculer les statistiques
const calculateStats = (orders: PendingOrder[]): PendingOrderStats => {
  const pending = orders.filter(o => o.status === 'pending')
  const approved = orders.filter(o => o.status === 'approved')
  const rejected = orders.filter(o => o.status === 'rejected')

  return {
    totalPending: pending.length,
    totalApproved: approved.length,
    totalRejected: rejected.length,
    totalAmount: pending.reduce((sum, o) => sum + o.totalAmount, 0),
  }
}

// Hook principal
export function useResellerPendingOrders() {
  const [filters, setFilters] = useState<PendingOrderFilters>({
    search: '',
    dateFrom: '',
    dateTo: '',
    sortBy: 'date',
    sortOrder: 'desc',
    page: 1,
    limit: 10,
  })
  
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false)
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [approvingOrder, setApprovingOrder] = useState<PendingOrder | null>(null)
  const [rejectingOrder, setRejectingOrder] = useState<PendingOrder | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  // Statistiques
  const stats = useMemo(() => calculateStats(MOCK_PENDING_ORDERS), [])

  // Commandes filtrées
  const orders = useMemo(() => {
    let filtered = [...MOCK_PENDING_ORDERS]
    
    // Recherche
    if (filters.search) {
      const search = filters.search.toLowerCase()
      filtered = filtered.filter(o => 
        o.orderNumber.toLowerCase().includes(search) ||
        o.clientName.toLowerCase().includes(search) ||
        o.clientEmail.toLowerCase().includes(search)
      )
    }
    
    // Filtre par date
    if (filters.dateFrom) {
      filtered = filtered.filter(o => new Date(o.date) >= new Date(filters.dateFrom))
    }
    if (filters.dateTo) {
      filtered = filtered.filter(o => new Date(o.date) <= new Date(filters.dateTo + 'T23:59:59'))
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
  }, [filters.search, filters.dateFrom, filters.dateTo, filters.sortBy, filters.sortOrder])

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
  const updateFilters = useCallback((updates: Partial<PendingOrderFilters>) => {
    setFilters(prev => ({ ...prev, ...updates }))
  }, [])

  // Réinitialiser les filtres
  const resetFilters = useCallback(() => {
    setFilters({
      search: '',
      dateFrom: '',
      dateTo: '',
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

  // Ouvrir le dialogue d'approbation
  const openApproveDialog = useCallback((order: PendingOrder) => {
    setApprovingOrder(order)
    setIsApproveDialogOpen(true)
  }, [])

  // Ouvrir le dialogue de rejet
  const openRejectDialog = useCallback((order: PendingOrder) => {
    setRejectingOrder(order)
    setRejectReason('')
    setIsRejectDialogOpen(true)
  }, [])

  // Approuver une commande
  const approveOrder = useCallback(async (): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 500))
    console.log('Approving order:', approvingOrder?.id)
    setIsApproveDialogOpen(false)
    setApprovingOrder(null)
    return true
  }, [approvingOrder])

  // Rejeter une commande
  const rejectOrder = useCallback(async (): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 500))
    console.log('Rejecting order:', rejectingOrder?.id, 'Reason:', rejectReason)
    setIsRejectDialogOpen(false)
    setRejectingOrder(null)
    setRejectReason('')
    return true
  }, [rejectingOrder, rejectReason])

  // Approuver plusieurs commandes
  const approveSelectedOrders = useCallback(async (): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 500))
    console.log('Approving orders:', selectedOrders)
    setSelectedOrders([])
    return true
  }, [selectedOrders])

  // Rejeter plusieurs commandes
  const rejectSelectedOrders = useCallback(async (): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 500))
    console.log('Rejecting orders:', selectedOrders)
    setSelectedOrders([])
    return true
  }, [selectedOrders])

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
    isApproveDialogOpen,
    setIsApproveDialogOpen,
    isRejectDialogOpen,
    setIsRejectDialogOpen,
    approvingOrder,
    rejectingOrder,
    rejectReason,
    setRejectReason,
    openApproveDialog,
    openRejectDialog,
    approveOrder,
    rejectOrder,
    approveSelectedOrders,
    rejectSelectedOrders,
  }
}

export default useResellerPendingOrders
