/**
 * useResellerInvoices Hook - Gestion des factures
 * 
 * Ce hook gère :
 * - Liste des factures avec pagination
 * - Filtrage par statut, période, type
 * - Génération PDF
 * - Envoi par email
 * - Statistiques
 */

'use client'

import { useState, useCallback, useMemo } from 'react'

// Types pour les factures
export interface Invoice {
  id: string
  invoiceNumber: string
  orderId: string
  orderNumber: string
  issueDate: string
  dueDate: string
  clientName: string
  clientEmail: string
  clientAddress: {
    street: string
    city: string
    postalCode: string
    country: string
  }
  items: {
    id: string
    description: string
    quantity: number
    unitPrice: number
    totalPrice: number
  }[]
  subtotal: number
  taxRate: number
  taxAmount: number
  totalAmount: number
  status: 'paid' | 'pending' | 'overdue' | 'cancelled'
  paymentMethod: string
  paymentDate: string | null
  notes: string
  createdAt: string
}

// Types pour les avoirs/notes de crédit
export interface CreditNote {
  id: string
  creditNoteNumber: string
  invoiceId: string
  invoiceNumber: string
  reason: string
  amount: number
  createdAt: string
}

// Types pour les filtres
export interface InvoiceFilters {
  search: string
  status: string[]
  period: string
  dateFrom: string
  dateTo: string
  documentType: string
  minAmount: number
  maxAmount: number
  sortBy: string
  sortOrder: 'asc' | 'desc'
  page: number
  limit: number
}

// Types pour les statistiques
export interface InvoiceStats {
  totalInvoices: number
  totalAmount: number
  paidAmount: number
  pendingAmount: number
  overdueAmount: number
}

// Données mockées pour les factures
const MOCK_INVOICES: Invoice[] = [
  {
    id: 'inv001',
    invoiceNumber: 'FAC-2024-001',
    orderId: 'ord001',
    orderNumber: 'CMD-2024-001',
    issueDate: '2024-02-04',
    dueDate: '2024-03-04',
    clientName: 'Aminata Diop',
    clientEmail: 'aminata.diop@email.com',
    clientAddress: {
      street: '12 Rue de la Paix',
      city: 'Dakar',
      postalCode: '11000',
      country: 'Sénégal',
    },
    items: [
      { id: 'item1', description: 'Pagne Manjak Rouge Premium × 5', quantity: 5, unitPrice: 15000, totalPrice: 75000 },
      { id: 'item2', description: 'Pagne Kente Or Royal × 3', quantity: 3, unitPrice: 25000, totalPrice: 75000 },
    ],
    subtotal: 150000,
    taxRate: 0,
    taxAmount: 0,
    totalAmount: 155000,
    status: 'paid',
    paymentMethod: 'Virement bancaire',
    paymentDate: '2024-02-05',
    notes: 'Paiement reçu le lendemain',
    createdAt: '2024-02-04T10:30:00Z',
  },
  {
    id: 'inv002',
    invoiceNumber: 'FAC-2024-002',
    orderId: 'ord002',
    orderNumber: 'CMD-2024-002',
    issueDate: '2024-02-03',
    dueDate: '2024-03-03',
    clientName: 'Mariama Sarr',
    clientEmail: 'mariama.sarr@email.com',
    clientAddress: {
      street: '45 Avenue Cheikh Anta Diop',
      city: 'Dakar',
      postalCode: '10500',
      country: 'Sénégal',
    },
    items: [
      { id: 'item3', description: 'Pagne Thioup Bleu Ciel × 10', quantity: 10, unitPrice: 12000, totalPrice: 120000 },
    ],
    subtotal: 120000,
    taxRate: 0,
    taxAmount: 0,
    totalAmount: 123000,
    status: 'pending',
    paymentMethod: '',
    paymentDate: null,
    notes: '',
    createdAt: '2024-02-03T09:15:00Z',
  },
  {
    id: 'inv003',
    invoiceNumber: 'FAC-2024-003',
    orderId: 'ord003',
    orderNumber: 'CMD-2024-003',
    issueDate: '2024-02-02',
    dueDate: '2024-03-02',
    clientName: 'Fatou Fall',
    clientEmail: 'fatou.fall@email.com',
    clientAddress: {
      street: '78 Rue Mermoz',
      city: 'Dakar',
      postalCode: '12000',
      country: 'Sénégal',
    },
    items: [
      { id: 'item4', description: 'Pagne Bogolan Marron Terre × 8', quantity: 8, unitPrice: 18000, totalPrice: 144000 },
      { id: 'item5', description: 'Pagne Bazin Vert Émeraude × 4', quantity: 4, unitPrice: 22000, totalPrice: 88000 },
    ],
    subtotal: 232000,
    taxRate: 0,
    taxAmount: 0,
    totalAmount: 237000,
    status: 'cancelled',
    paymentMethod: '',
    paymentDate: null,
    notes: 'Remboursement effectué',
    createdAt: '2024-02-02T14:20:00Z',
  },
  {
    id: 'inv004',
    invoiceNumber: 'FAC-2024-004',
    orderId: 'ord005',
    orderNumber: 'CMD-2024-005',
    issueDate: '2024-02-04',
    dueDate: '2024-02-07',
    clientName: 'Ndeye Diop',
    clientEmail: 'ndeye.diop@email.com',
    clientAddress: {
      street: '56 Rue HLM',
      city: 'Dakar',
      postalCode: '12500',
      country: 'Sénégal',
    },
    items: [
      { id: 'item6', description: 'Pagne Manjak Rouge Premium × 2', quantity: 2, unitPrice: 15000, totalPrice: 30000 },
      { id: 'item7', description: 'Pagne Thioup Bleu Ciel × 2', quantity: 2, unitPrice: 12000, totalPrice: 24000 },
      { id: 'item8', description: 'Pagne Bazin Vert Émeraude × 2', quantity: 2, unitPrice: 22000, totalPrice: 44000 },
    ],
    subtotal: 98000,
    taxRate: 0,
    taxAmount: 0,
    totalAmount: 101000,
    status: 'overdue',
    paymentMethod: '',
    paymentDate: null,
    notes: 'Relance发送ée',
    createdAt: '2024-02-04T08:45:00Z',
  },
  {
    id: 'inv005',
    invoiceNumber: 'FAC-2024-005',
    orderId: 'ord006',
    orderNumber: 'CMD-2024-006',
    issueDate: '2024-01-30',
    dueDate: '2024-02-15',
    clientName: 'Sokhna GUEYE',
    clientEmail: 'sokhna.gueye@email.com',
    clientAddress: {
      street: '89 Rue Sicap',
      city: 'Dakar',
      postalCode: '11500',
      country: 'Sénégal',
    },
    items: [
      { id: 'item9', description: 'Pagne Kente Or Royal × 5', quantity: 5, unitPrice: 25000, totalPrice: 125000 },
    ],
    subtotal: 125000,
    taxRate: 0,
    taxAmount: 0,
    totalAmount: 130000,
    status: 'paid',
    paymentMethod: 'Mobile Money (Orange)',
    paymentDate: '2024-02-01',
    notes: '',
    createdAt: '2024-01-30T07:30:00Z',
  },
]

// Calculer les statistiques
const calculateStats = (invoices: Invoice[]): InvoiceStats => {
  const totalInvoices = invoices.length
  const totalAmount = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0)
  const paidAmount = invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.totalAmount, 0)
  const pendingAmount = invoices.filter(inv => inv.status === 'pending').reduce((sum, inv) => sum + inv.totalAmount, 0)
  const overdueAmount = invoices.filter(inv => inv.status === 'overdue').reduce((sum, inv) => sum + inv.totalAmount, 0)

  return {
    totalInvoices,
    totalAmount,
    paidAmount,
    pendingAmount,
    overdueAmount,
  }
}

// Hook principal
export function useResellerInvoices() {
  const [filters, setFilters] = useState<InvoiceFilters>({
    search: '',
    status: [],
    period: 'all',
    dateFrom: '',
    dateTo: '',
    documentType: 'all',
    minAmount: 0,
    maxAmount: 0,
    sortBy: 'issueDate',
    sortOrder: 'desc',
    page: 1,
    limit: 10,
  })
  
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([])
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)
  const [isSendModalOpen, setIsSendModalOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [emailRecipient, setEmailRecipient] = useState('')

  // Statistiques
  const stats = useMemo(() => calculateStats(MOCK_INVOICES), [])

  // Factures filtrées
  const invoices = useMemo(() => {
    let filtered = [...MOCK_INVOICES]
    
    // Recherche
    if (filters.search) {
      const search = filters.search.toLowerCase()
      filtered = filtered.filter(inv => 
        inv.invoiceNumber.toLowerCase().includes(search) ||
        inv.orderNumber.toLowerCase().includes(search) ||
        inv.clientName.toLowerCase().includes(search) ||
        inv.clientEmail.toLowerCase().includes(search)
      )
    }
    
    // Filtre par statut
    if (filters.status.length > 0) {
      filtered = filtered.filter(inv => filters.status.includes(inv.status))
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
      filtered = filtered.filter(inv => new Date(inv.issueDate) >= startDate)
    }
    
    // Filtre par date personnalisée
    if (filters.dateFrom) {
      filtered = filtered.filter(inv => new Date(inv.issueDate) >= new Date(filters.dateFrom))
    }
    if (filters.dateTo) {
      filtered = filtered.filter(inv => new Date(inv.issueDate) <= new Date(filters.dateTo + 'T23:59:59'))
    }
    
    // Filtre par type de document
    if (filters.documentType === 'credit_notes') {
      filtered = filtered.filter(inv => false) // Placeholder for credit notes
    }
    
    // Filtre par montant
    if (filters.minAmount > 0) {
      filtered = filtered.filter(inv => inv.totalAmount >= filters.minAmount)
    }
    if (filters.maxAmount > 0) {
      filtered = filtered.filter(inv => inv.totalAmount <= filters.maxAmount)
    }
    
    // Tri
    filtered.sort((a, b) => {
      let comparison = 0
      switch (filters.sortBy) {
        case 'issueDate':
          comparison = new Date(a.issueDate).getTime() - new Date(b.issueDate).getTime()
          break
        case 'dueDate':
          comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
          break
        case 'invoiceNumber':
          comparison = a.invoiceNumber.localeCompare(b.invoiceNumber)
          break
        case 'clientName':
          comparison = a.clientName.localeCompare(b.clientName)
          break
        case 'totalAmount':
          comparison = a.totalAmount - b.totalAmount
          break
        default:
          comparison = new Date(a.issueDate).getTime() - new Date(b.issueDate).getTime()
      }
      return filters.sortOrder === 'asc' ? comparison : -comparison
    })
    
    return filtered
  }, [filters.search, filters.status, filters.period, filters.dateFrom, filters.dateTo, filters.documentType, filters.minAmount, filters.maxAmount, filters.sortBy, filters.sortOrder])

  // Pagination
  const pagination = useMemo((): {
    total: number
    page: number
    limit: number
    totalPages: number
    start: number
    end: number
  } => {
    const totalPages = Math.ceil(invoices.length / filters.limit)
    return {
      total: invoices.length,
      page: filters.page,
      limit: filters.limit,
      totalPages,
      start: (filters.page - 1) * filters.limit,
      end: Math.min(filters.page * filters.limit, invoices.length),
    }
  }, [invoices.length, filters.page, filters.limit])

  const paginatedInvoices = useMemo(() => {
    return invoices.slice(pagination.start, pagination.end)
  }, [invoices, pagination.start, pagination.end])

  // Mettre à jour les filtres
  const updateFilters = useCallback((updates: Partial<InvoiceFilters>) => {
    setFilters(prev => ({ ...prev, ...updates }))
  }, [])

  // Réinitialiser les filtres
  const resetFilters = useCallback(() => {
    setFilters({
      search: '',
      status: [],
      period: 'all',
      dateFrom: '',
      dateTo: '',
      documentType: 'all',
      minAmount: 0,
      maxAmount: 0,
      sortBy: 'issueDate',
      sortOrder: 'desc',
      page: 1,
      limit: 10,
    })
    setSelectedInvoices([])
  }, [])

  // Changer de page
  const goToPage = useCallback((page: number) => {
    setFilters(prev => ({ ...prev, page }))
  }, [])

  // Sélection/désélection
  const toggleInvoiceSelection = useCallback((invoiceId: string) => {
    setSelectedInvoices(prev => 
      prev.includes(invoiceId) 
        ? prev.filter(id => id !== invoiceId)
        : [...prev, invoiceId]
    )
  }, [])

  const selectAllInvoices = useCallback(() => {
    setSelectedInvoices(paginatedInvoices.map(inv => inv.id))
  }, [paginatedInvoices])

  const clearSelection = useCallback(() => {
    setSelectedInvoices([])
  }, [])

  // Ouvrir le modal de prévisualisation
  const openPreviewModal = useCallback((invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setIsPreviewModalOpen(true)
  }, [])

  // Fermer le modal de prévisualisation
  const closePreviewModal = useCallback(() => {
    setIsPreviewModalOpen(false)
    setSelectedInvoice(null)
  }, [])

  // Ouvrir le modal d'envoi
  const openSendModal = useCallback((invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setEmailRecipient(invoice.clientEmail)
    setIsSendModalOpen(true)
  }, [])

  // Fermer le modal d'envoi
  const closeSendModal = useCallback(() => {
    setIsSendModalOpen(false)
    setSelectedInvoice(null)
    setEmailRecipient('')
  }, [])

  // Télécharger le PDF
  const downloadPDF = useCallback(async (invoiceId: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 500))
    console.log('Downloading PDF for invoice:', invoiceId)
    return true
  }, [])

  // Envoyer par email
  const sendByEmail = useCallback(async (): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 500))
    console.log('Sending invoice to:', emailRecipient)
    return true
  }, [emailRecipient])

  // Exporter les factures
  const exportInvoices = useCallback(async (format: 'csv' | 'pdf'): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 500))
    console.log('Exporting invoices as:', format)
    return true
  }, [])

  return {
    filters,
    updateFilters,
    resetFilters,
    goToPage,
    pagination,
    invoices: paginatedInvoices,
    allInvoices: invoices,
    stats,
    selectedInvoices,
    toggleInvoiceSelection,
    selectAllInvoices,
    clearSelection,
    isPreviewModalOpen,
    setIsPreviewModalOpen,
    isSendModalOpen,
    setIsSendModalOpen,
    selectedInvoice,
    emailRecipient,
    setEmailRecipient,
    openPreviewModal,
    closePreviewModal,
    openSendModal,
    closeSendModal,
    downloadPDF,
    sendByEmail,
    exportInvoices,
  }
}

export default useResellerInvoices
