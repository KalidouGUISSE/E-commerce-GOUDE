/**
 * useResellerReturns Hook - Gestion des retours et remboursements
 * 
 * Ce hook gère :
 * - Liste des retours
 * - Création de demandes de retour
 * - Suivi des remboursements
 * - Filtrage et recherche
 */

'use client'

import { useState, useCallback, useMemo } from 'react'

// Types pour les retours
export interface ReturnRequest {
  id: string
  returnNumber: string
  orderId: string
  orderNumber: string
  status: 'pending' | 'approved' | 'rejected' | 'in_transit' | 'received' | 'refunded'
  reason: 'defective' | 'wrong_item' | 'not_satisfied' | 'other'
  items: ReturnItem[]
  totalRefund: number
  createdAt: string
  updatedAt: string
  processedAt: string | null
  refundMethod: 'original' | 'store_credit' | 'bank_transfer'
  notes: string
}

export interface ReturnItem {
  productId: string
  productName: string
  sku: string
  quantity: number
  unitPrice: number
  reason: string
}

export interface ReturnFilters {
  search: string
  status: string[]
  reason: string[]
  dateFrom: string
  dateTo: string
  sortBy: string
  sortOrder: 'asc' | 'desc'
  page: number
  limit: number
}

export interface ReturnStats {
  total: number
  pending: number
  approved: number
  rejected: number
  inTransit: number
  received: number
  refunded: number
  totalRefundAmount: number
}

// Données mockées des retours
const MOCK_RETURNS: ReturnRequest[] = [
  {
    id: 'ret001',
    returnNumber: 'RET-2024-001',
    orderId: 'cmd001',
    orderNumber: 'CMD-2024-001',
    status: 'pending',
    reason: 'defective',
    items: [
      { productId: 'prod001', productName: 'Pagne Manjak - Rouge', sku: 'MJ-001-R', quantity: 2, unitPrice: 15000, reason: 'Tache sur le tissu' },
    ],
    totalRefund: 30000,
    createdAt: '2024-02-04T10:30:00Z',
    updatedAt: '2024-02-04T10:30:00Z',
    processedAt: null,
    refundMethod: 'original',
    notes: '',
  },
  {
    id: 'ret002',
    returnNumber: 'RET-2024-002',
    orderId: 'cmd002',
    orderNumber: 'CMD-2024-002',
    status: 'approved',
    reason: 'not_satisfied',
    items: [
      { productId: 'prod002', productName: 'Pagne Sérère - Bleu', sku: 'SR-002-B', quantity: 1, unitPrice: 12000, reason: 'Couleur différente des photos' },
    ],
    totalRefund: 12000,
    createdAt: '2024-02-03T14:20:00Z',
    updatedAt: '2024-02-04T09:00:00Z',
    processedAt: '2024-02-04T09:00:00Z',
    refundMethod: 'store_credit',
    notes: 'Client prefers store credit',
  },
  {
    id: 'ret003',
    returnNumber: 'RET-2024-003',
    orderId: 'cmd003',
    orderNumber: 'CMD-2024-003',
    status: 'refunded',
    reason: 'wrong_item',
    items: [
      { productId: 'prod003', productName: 'Pagne Thioup - Vert', sku: 'TP-003-V', quantity: 3, unitPrice: 18000, reason: 'Mauvaise taille envoyée' },
    ],
    totalRefund: 54000,
    createdAt: '2024-02-02T08:15:00Z',
    updatedAt: '2024-02-03T16:30:00Z',
    processedAt: '2024-02-03T16:30:00Z',
    refundMethod: 'original',
    notes: 'Remboursement effectué le 03/02/2024',
  },
  {
    id: 'ret004',
    returnNumber: 'RET-2024-004',
    orderId: 'cmd004',
    orderNumber: 'CMD-2024-004',
    status: 'in_transit',
    reason: 'other',
    items: [
      { productId: 'prod004', productName: 'Pagne Kente - Or', sku: 'KT-004-G', quantity: 1, unitPrice: 25000, reason: 'Erreur de commande' },
    ],
    totalRefund: 25000,
    createdAt: '2024-02-04T11:00:00Z',
    updatedAt: '2024-02-04T14:00:00Z',
    processedAt: null,
    refundMethod: 'bank_transfer',
    notes: 'En attente de réception du colis',
  },
  {
    id: 'ret005',
    returnNumber: 'RET-2024-005',
    orderId: 'cmd005',
    orderNumber: 'CMD-2024-005',
    status: 'rejected',
    reason: 'defective',
    items: [
      { productId: 'prod005', productName: 'Pagne Bogolan - Marron', sku: 'BG-005-B', quantity: 2, unitPrice: 14000, reason: 'Tissage defectueux' },
    ],
    totalRefund: 28000,
    createdAt: '2024-02-01T16:45:00Z',
    updatedAt: '2024-02-02T10:00:00Z',
    processedAt: '2024-02-02T10:00:00Z',
    refundMethod: 'original',
    notes: 'Defaut d\'usage, pas couvert par la garantie',
  },
]

// Calculer les statistiques
const calculateStats = (returns: ReturnRequest[]): ReturnStats => ({
  total: returns.length,
  pending: returns.filter(r => r.status === 'pending').length,
  approved: returns.filter(r => r.status === 'approved').length,
  rejected: returns.filter(r => r.status === 'rejected').length,
  inTransit: returns.filter(r => r.status === 'in_transit').length,
  received: returns.filter(r => r.status === 'received').length,
  refunded: returns.filter(r => r.status === 'refunded').length,
  totalRefundAmount: returns
    .filter(r => r.status === 'refunded')
    .reduce((sum, r) => sum + r.totalRefund, 0),
})

// Hook principal
export function useResellerReturns() {
  const [filters, setFilters] = useState<ReturnFilters>({
    search: '',
    status: [],
    reason: [],
    dateFrom: '',
    dateTo: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    page: 1,
    limit: 10,
  })
  
  const [selectedReturns, setSelectedReturns] = useState<string[]>([])
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedReturn, setSelectedReturn] = useState<ReturnRequest | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Statistiques
  const stats = useMemo(() => calculateStats(MOCK_RETURNS), [])

  // Retours filtrés
  const returns = useMemo(() => {
    let filtered = [...MOCK_RETURNS]
    
    // Recherche
    if (filters.search) {
      const search = filters.search.toLowerCase()
      filtered = filtered.filter(r => 
        r.returnNumber.toLowerCase().includes(search) ||
        r.orderNumber.toLowerCase().includes(search)
      )
    }
    
    // Filtres
    if (filters.status.length > 0) {
      filtered = filtered.filter(r => filters.status.includes(r.status))
    }
    if (filters.reason.length > 0) {
      filtered = filtered.filter(r => filters.reason.includes(r.reason))
    }
    if (filters.dateFrom) {
      filtered = filtered.filter(r => new Date(r.createdAt) >= new Date(filters.dateFrom))
    }
    if (filters.dateTo) {
      filtered = filtered.filter(r => new Date(r.createdAt) <= new Date(filters.dateTo + 'T23:59:59'))
    }
    
    // Tri
    filtered.sort((a, b) => {
      let comparison = 0
      switch (filters.sortBy) {
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          break
        case 'returnNumber':
          comparison = a.returnNumber.localeCompare(b.returnNumber)
          break
        case 'totalRefund':
          comparison = a.totalRefund - b.totalRefund
          break
        default:
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      }
      return filters.sortOrder === 'asc' ? comparison : -comparison
    })
    
    return filtered
  }, [filters])

  // Pagination
  const pagination = useMemo((): {
    total: number
    page: number
    limit: number
    totalPages: number
  } => {
    const totalPages = Math.ceil(returns.length / filters.limit)
    return {
      total: returns.length,
      page: filters.page,
      limit: filters.limit,
      totalPages,
    }
  }, [returns.length, filters.page, filters.limit])

  // Actions
  const updateFilters = useCallback((updates: Partial<ReturnFilters>) => {
    setFilters(prev => ({ ...prev, ...updates }))
  }, [])

  const resetFilters = useCallback(() => {
    setFilters({
      search: '',
      status: [],
      reason: [],
      dateFrom: '',
      dateTo: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
      page: 1,
      limit: 10,
    })
    setSelectedReturns([])
  }, [])

  const toggleSelection = useCallback((returnId: string) => {
    setSelectedReturns(prev => 
      prev.includes(returnId) 
        ? prev.filter(id => id !== returnId)
        : [...prev, returnId]
    )
  }, [])

  const selectAll = useCallback(() => {
    setSelectedReturns(returns.map(r => r.id))
  }, [returns])

  const clearSelection = useCallback(() => {
    setSelectedReturns([])
  }, [])

  const openDetail = useCallback((ret: ReturnRequest) => {
    setSelectedReturn(ret)
    setIsDetailModalOpen(true)
  }, [])

  const createReturn = useCallback(async (data: Partial<ReturnRequest>): Promise<boolean> => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      setFeedback({ type: 'success', message: 'Demande de retour créée avec succès' })
      setIsCreateModalOpen(false)
      return true
    } catch {
      setFeedback({ type: 'error', message: 'Erreur lors de la création' })
      return false
    } finally {
      setIsLoading(false)
      setTimeout(() => setFeedback(null), 3000)
    }
  }, [])

  const updateReturnStatus = useCallback(async (returnId: string, status: ReturnRequest['status']): Promise<boolean> => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      setFeedback({ type: 'success', message: 'Statut mis à jour' })
      return true
    } catch {
      setFeedback({ type: 'error', message: 'Erreur lors de la mise à jour' })
      return false
    } finally {
      setIsLoading(false)
      setTimeout(() => setFeedback(null), 3000)
    }
  }, [])

  const processRefund = useCallback(async (returnId: string, method: ReturnRequest['refundMethod']): Promise<boolean> => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      setFeedback({ type: 'success', message: 'Remboursement effectué avec succès' })
      return true
    } catch {
      setFeedback({ type: 'error', message: 'Erreur lors du remboursement' })
      return false
    } finally {
      setIsLoading(false)
      setTimeout(() => setFeedback(null), 3000)
    }
  }, [])

  return {
    filters,
    updateFilters,
    resetFilters,
    returns,
    pagination,
    stats,
    selectedReturns,
    toggleSelection,
    selectAll,
    clearSelection,
    isCreateModalOpen,
    setIsCreateModalOpen,
    isDetailModalOpen,
    setIsDetailModalOpen,
    selectedReturn,
    openDetail,
    isLoading,
    feedback,
    createReturn,
    updateReturnStatus,
    processRefund,
  }
}

export default useResellerReturns
