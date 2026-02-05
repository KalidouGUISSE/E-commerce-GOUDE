/**
 * useResellerTickets Hook - Gestion des tickets de support
 * 
 * Ce hook gère :
 * - Liste des tickets
 * - CRUD des tickets
 * - Filtrage et recherche
 * - Actions en lot
 */

'use client'

import { useState, useCallback, useMemo } from 'react'

// Types pour les tickets
export interface SupportTicket {
  id: string
  ticketNumber: string
  subject: string
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category: 'technical' | 'commercial' | 'billing' | 'other'
  description: string
  assignee: string | null
  clientName: string
  clientEmail: string
  createdAt: string
  updatedAt: string
  lastResponse: string
  messages: TicketMessage[]
}

export interface TicketMessage {
  id: string
  sender: string
  content: string
  createdAt: string
  isSupport: boolean
}

// Types pour les filtres
export interface TicketFilters {
  search: string
  status: string[]
  priority: string[]
  category: string[]
  assignee: string
  dateFrom: string
  dateTo: string
  sortBy: string
  sortOrder: 'asc' | 'desc'
  page: number
  limit: number
}

// Types pour les statistiques
export interface TicketStats {
  total: number
  open: number
  inProgress: number
  resolved: number
  closed: number
}

// Données mockées des tickets
const MOCK_TICKETS: SupportTicket[] = [
  {
    id: 'tkt001',
    ticketNumber: 'TKT-2024-001',
    subject: 'Problème de connexion à l\'API',
    status: 'open',
    priority: 'high',
    category: 'technical',
    description: 'Je n\'arrive plus à me connecter à l\'API depuis ce matin.',
    assignee: 'Support Technique',
    clientName: 'Mamadou Diop',
    clientEmail: 'mamadou@exemple.sn',
    createdAt: '2024-02-04T10:30:00Z',
    updatedAt: '2024-02-04T14:30:00Z',
    lastResponse: '2024-02-04T14:30:00Z',
    messages: [
      { id: 'msg1', sender: 'Mamadou Diop', content: 'Je n\'arrive plus à me connecter à l\'API depuis ce matin.', createdAt: '2024-02-04T10:30:00Z', isSupport: false },
      { id: 'msg2', sender: 'Support Technique', content: 'Bonjour, nous investiguons le problème.', createdAt: '2024-02-04T14:30:00Z', isSupport: true },
    ],
  },
  {
    id: 'tkt002',
    ticketNumber: 'TKT-2024-002',
    subject: 'Question sur la facturation',
    status: 'in_progress',
    priority: 'medium',
    category: 'billing',
    description: 'Je ne comprends pas une ligne sur ma facture.',
    assignee: 'Support Facturation',
    clientName: 'Aminata Diop',
    clientEmail: 'aminata@exemple.sn',
    createdAt: '2024-02-03T09:15:00Z',
    updatedAt: '2024-02-04T11:00:00Z',
    lastResponse: '2024-02-04T11:00:00Z',
    messages: [],
  },
  {
    id: 'tkt003',
    ticketNumber: 'TKT-2024-003',
    subject: 'Demande de partenariat commercial',
    status: 'resolved',
    priority: 'low',
    category: 'commercial',
    description: 'Je souhaiterais discuter d\'un partenariat.',
    assignee: 'Service Commercial',
    clientName: 'Mariama Sarr',
    clientEmail: 'mariama@entreprise.sn',
    createdAt: '2024-02-02T14:20:00Z',
    updatedAt: '2024-02-03T16:00:00Z',
    lastResponse: '2024-02-03T16:00:00Z',
    messages: [],
  },
  {
    id: 'tkt004',
    ticketNumber: 'TKT-2024-004',
    subject: 'Bogue sur le dashboard',
    status: 'closed',
    priority: 'urgent',
    category: 'technical',
    description: 'Le dashboard ne s\'affiche plus correctement.',
    assignee: 'Support Technique',
    clientName: 'Fatou Fall',
    clientEmail: 'fatou@exemple.sn',
    createdAt: '2024-02-01T11:00:00Z',
    updatedAt: '2024-02-02T09:00:00Z',
    lastResponse: '2024-02-02T09:00:00Z',
    messages: [],
  },
  {
    id: 'tkt005',
    ticketNumber: 'TKT-2024-005',
    subject: 'Modification de commande',
    status: 'open',
    priority: 'medium',
    category: 'other',
    description: 'Je souhaiterais modifier une commande passée.',
    assignee: null,
    clientName: 'Oumou Barry',
    clientEmail: 'oumou@exemple.sn',
    createdAt: '2024-02-04T08:45:00Z',
    updatedAt: '2024-02-04T08:45:00Z',
    lastResponse: '2024-02-04T08:45:00Z',
    messages: [],
  },
]

// Calculer les statistiques
const calculateStats = (tickets: SupportTicket[]): TicketStats => ({
  total: tickets.length,
  open: tickets.filter(t => t.status === 'open').length,
  inProgress: tickets.filter(t => t.status === 'in_progress').length,
  resolved: tickets.filter(t => t.status === 'resolved').length,
  closed: tickets.filter(t => t.status === 'closed').length,
})

// Hook principal
export function useResellerTickets() {
  const [filters, setFilters] = useState<TicketFilters>({
    search: '',
    status: [],
    priority: [],
    category: [],
    assignee: '',
    dateFrom: '',
    dateTo: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    page: 1,
    limit: 10,
  })
  
  const [selectedTickets, setSelectedTickets] = useState<string[]>([])
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Statistiques
  const stats = useMemo(() => calculateStats(MOCK_TICKETS), [])

  // Tickets filtrés
  const tickets = useMemo(() => {
    let filtered = [...MOCK_TICKETS]
    
    // Recherche
    if (filters.search) {
      const search = filters.search.toLowerCase()
      filtered = filtered.filter(t => 
        t.ticketNumber.toLowerCase().includes(search) ||
        t.subject.toLowerCase().includes(search) ||
        t.clientName.toLowerCase().includes(search)
      )
    }
    
    // Filtres
    if (filters.status.length > 0) {
      filtered = filtered.filter(t => filters.status.includes(t.status))
    }
    if (filters.priority.length > 0) {
      filtered = filtered.filter(t => filters.priority.includes(t.priority))
    }
    if (filters.category.length > 0) {
      filtered = filtered.filter(t => filters.category.includes(t.category))
    }
    if (filters.assignee) {
      filtered = filtered.filter(t => t.assignee === filters.assignee)
    }
    if (filters.dateFrom) {
      filtered = filtered.filter(t => new Date(t.createdAt) >= new Date(filters.dateFrom))
    }
    if (filters.dateTo) {
      filtered = filtered.filter(t => new Date(t.createdAt) <= new Date(filters.dateTo + 'T23:59:59'))
    }
    
    // Tri
    filtered.sort((a, b) => {
      let comparison = 0
      switch (filters.sortBy) {
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          break
        case 'ticketNumber':
          comparison = a.ticketNumber.localeCompare(b.ticketNumber)
          break
        case 'priority':
          const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 }
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority]
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
    const totalPages = Math.ceil(tickets.length / filters.limit)
    return {
      total: tickets.length,
      page: filters.page,
      limit: filters.limit,
      totalPages,
    }
  }, [tickets.length, filters.page, filters.limit])

  // Actions
  const updateFilters = useCallback((updates: Partial<TicketFilters>) => {
    setFilters(prev => ({ ...prev, ...updates }))
  }, [])

  const resetFilters = useCallback(() => {
    setFilters({
      search: '',
      status: [],
      priority: [],
      category: [],
      assignee: '',
      dateFrom: '',
      dateTo: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
      page: 1,
      limit: 10,
    })
    setSelectedTickets([])
  }, [])

  const toggleSelection = useCallback((ticketId: string) => {
    setSelectedTickets(prev => 
      prev.includes(ticketId) 
        ? prev.filter(id => id !== ticketId)
        : [...prev, ticketId]
    )
  }, [])

  const selectAll = useCallback(() => {
    setSelectedTickets(tickets.map(t => t.id))
  }, [tickets])

  const clearSelection = useCallback(() => {
    setSelectedTickets([])
  }, [])

  const openDetail = useCallback((ticket: SupportTicket) => {
    setSelectedTicket(ticket)
    setIsDetailModalOpen(true)
  }, [])

  const createTicket = useCallback(async (data: Partial<SupportTicket>): Promise<boolean> => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      setFeedback({ type: 'success', message: 'Ticket créé avec succès' })
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

  const updateTicketStatus = useCallback(async (ticketId: string, status: SupportTicket['status']): Promise<boolean> => {
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

  const addMessage = useCallback(async (ticketId: string, content: string): Promise<boolean> => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      return true
    } catch {
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    filters,
    updateFilters,
    resetFilters,
    tickets,
    pagination,
    stats,
    selectedTickets,
    toggleSelection,
    selectAll,
    clearSelection,
    isCreateModalOpen,
    setIsCreateModalOpen,
    isDetailModalOpen,
    setIsDetailModalOpen,
    selectedTicket,
    openDetail,
    isLoading,
    feedback,
    createTicket,
    updateTicketStatus,
    addMessage,
  }
}

export default useResellerTickets
