/**
 * useResellerClients Hook - Gestion des clients du revendeur
 * 
 * Ce hook gère :
 * - Liste des clients avec pagination
 * - Recherche et filtrage
 * - CRUD (Créer, Lire, Modifier, Supprimer)
 * - Statistiques clients
 */

'use client'

import { useState, useCallback, useMemo } from 'react'

// Types pour les clients
export interface ResellerClient {
  id: string
  reference: string
  firstName: string
  lastName: string
  companyName?: string
  email: string
  phone: string
  address: string
  city: string
  region: string
  status: 'active' | 'inactive' | 'pending' | 'blocked'
  totalOrders: number
  totalSpent: number
  averageOrderValue: number
  lastOrderDate: string
  registrationDate: string
  notes?: string
  tags: string[]
}

// Types pour les filtres
export interface ClientFilters {
  search: string
  status: string
  region: string
  sortBy: string
  sortOrder: 'asc' | 'desc'
  page: number
  limit: number
}

// Types pour les données du formulaire
export interface ClientFormData {
  firstName: string
  lastName: string
  companyName?: string
  email: string
  phone: string
  address: string
  city: string
  region: string
  notes?: string
  tags: string[]
}

// Données mockées
const MOCK_CLIENTS: ResellerClient[] = [
  {
    id: 'c001',
    reference: 'REF-C-001',
    firstName: 'Aminata',
    lastName: 'Fall',
    companyName: 'Commerce Dakar',
    email: 'aminata.fall@email.com',
    phone: '+221 77 123 45 67',
    address: '12 Rue de la Paix',
    city: 'Dakar',
    region: 'Dakar',
    status: 'active',
    totalOrders: 45,
    totalSpent: 1250000,
    averageOrderValue: 27778,
    lastOrderDate: '2024-02-03',
    registrationDate: '2023-06-15',
    tags: ['VIP', 'Premier client'],
  },
  {
    id: 'c002',
    reference: 'REF-C-002',
    firstName: 'Fatou',
    lastName: 'Diop',
    email: 'fatou.diop@email.com',
    phone: '+221 76 234 56 78',
    address: '25 Avenue Cheikh Anta Diop',
    city: 'Rufisque',
    region: 'Dakar',
    status: 'active',
    totalOrders: 32,
    totalSpent: 890000,
    averageOrderValue: 27813,
    lastOrderDate: '2024-02-01',
    registrationDate: '2023-08-22',
    tags: ['Régular'],
  },
  {
    id: 'c003',
    reference: 'REF-C-003',
    firstName: 'Mariama',
    lastName: 'Sy',
    companyName: 'Étoffes du Sénégal',
    email: 'mariama.sy@email.com',
    phone: '+221 70 345 67 89',
    address: '8 Boulevard de la République',
    city: 'Thiès',
    region: 'Thiès',
    status: 'active',
    totalOrders: 78,
    totalSpent: 2450000,
    averageOrderValue: 31410,
    lastOrderDate: '2024-02-04',
    registrationDate: '2023-03-10',
    tags: ['VIP', 'Gros acheteur'],
  },
  {
    id: 'c004',
    reference: 'REF-C-004',
    firstName: 'Ndèye Fatou',
    lastName: 'Ndiaye',
    email: 'ndeye.fatou@email.com',
    phone: '+221 78 456 78 90',
    address: '3 Rue Principale',
    city: 'Saint-Louis',
    region: 'Saint-Louis',
    status: 'pending',
    totalOrders: 0,
    totalSpent: 0,
    averageOrderValue: 0,
    lastOrderDate: '',
    registrationDate: '2024-01-28',
    tags: ['Nouveau'],
  },
  {
    id: 'c005',
    reference: 'REF-C-005',
    firstName: 'Sokhna',
    lastName: 'Aïssa',
    companyName: 'Maison du Tissu',
    email: 'sokhna.aissa@email.com',
    phone: '+221 77 567 89 01',
    address: '45 Rue du Marché',
    city: 'Kaolack',
    region: 'Kaolack',
    status: 'active',
    totalOrders: 56,
    totalSpent: 1680000,
    averageOrderValue: 30000,
    lastOrderDate: '2024-02-02',
    registrationDate: '2023-05-05',
    tags: ['VIP'],
  },
  {
    id: 'c006',
    reference: 'REF-C-006',
    firstName: 'Adama',
    lastName: 'Traoré',
    email: 'adama.traore@email.com',
    phone: '+221 76 678 90 12',
    address: '18 Avenue de la Liberation',
    city: 'Ziguinchor',
    region: 'Ziguinchor',
    status: 'inactive',
    totalOrders: 12,
    totalSpent: 320000,
    averageOrderValue: 26667,
    lastOrderDate: '2023-11-15',
    registrationDate: '2023-07-20',
    tags: ['Inactif'],
  },
  {
    id: 'c007',
    reference: 'REF-C-007',
    firstName: 'Ousmane',
    lastName: 'Diallo',
    companyName: 'Diallo Textiles',
    email: 'ousmane.diallo@email.com',
    phone: '+221 70 789 01 23',
    address: '7 Rue du Commerce',
    city: 'Louga',
    region: 'Louga',
    status: 'active',
    totalOrders: 28,
    totalSpent: 720000,
    averageOrderValue: 25714,
    lastOrderDate: '2024-01-30',
    registrationDate: '2023-09-12',
    tags: ['Régular'],
  },
  {
    id: 'c008',
    reference: 'REF-C-008',
    firstName: 'Khady',
    lastName: 'Sow',
    email: 'khady.sow@email.com',
    phone: '+221 78 890 12 34',
    address: '22 Rue de l\'Indépendance',
    city: 'Tambacounda',
    region: 'Tambacounda',
    status: 'blocked',
    totalOrders: 5,
    totalSpent: 125000,
    averageOrderValue: 25000,
    lastOrderDate: '2023-10-20',
    registrationDate: '2023-10-01',
    tags: ['Bloqué'],
  },
]

// Statistiques
const MOCK_STATS = {
  totalClients: 156,
  activeClients: 142,
  pendingClients: 8,
  blockedClients: 6,
  newThisMonth: 12,
  totalRevenue: 4250000,
  averageClientValue: 27244,
}

// Hook principal
export function useResellerClients() {
  const [filters, setFilters] = useState<ClientFilters>({
    search: '',
    status: '',
    region: '',
    sortBy: 'lastOrderDate',
    sortOrder: 'desc',
    page: 1,
    limit: 10,
  })
  
  const [selectedClient, setSelectedClient] = useState<ResellerClient | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [clientToDelete, setClientToDelete] = useState<ResellerClient | null>(null)

  // Statistiques
  const stats = useMemo(() => MOCK_STATS, [])

  // Clients filtrés
  const clients = useMemo(() => {
    let filtered = [...MOCK_CLIENTS]
    
    // Recherche
    if (filters.search) {
      const search = filters.search.toLowerCase()
      filtered = filtered.filter(c => 
        c.firstName.toLowerCase().includes(search) ||
        c.lastName.toLowerCase().includes(search) ||
        c.email.toLowerCase().includes(search) ||
        c.reference.toLowerCase().includes(search) ||
        c.companyName?.toLowerCase().includes(search)
      )
    }
    
    // Filtre par statut
    if (filters.status) {
      filtered = filtered.filter(c => c.status === filters.status)
    }
    
    // Filtre par région
    if (filters.region) {
      filtered = filtered.filter(c => c.region === filters.region)
    }
    
    // Tri
    filtered.sort((a, b) => {
      let comparison = 0
      switch (filters.sortBy) {
        case 'name':
          comparison = `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`)
          break
        case 'totalSpent':
          comparison = a.totalSpent - b.totalSpent
          break
        case 'totalOrders':
          comparison = a.totalOrders - b.totalOrders
          break
        case 'lastOrderDate':
          comparison = (a.lastOrderDate || '').localeCompare(b.lastOrderDate || '')
          break
        case 'registrationDate':
          comparison = a.registrationDate.localeCompare(b.registrationDate)
          break
        default:
          comparison = (a.lastOrderDate || '').localeCompare(b.lastOrderDate || '')
      }
      return filters.sortOrder === 'asc' ? comparison : -comparison
    })
    
    return filtered
  }, [filters.search, filters.status, filters.region, filters.sortBy, filters.sortOrder])

  // Pagination
  const pagination = useMemo(() => {
    const totalPages = Math.ceil(clients.length / filters.limit)
    return {
      total: clients.length,
      page: filters.page,
      limit: filters.limit,
      totalPages,
      start: (filters.page - 1) * filters.limit,
      end: Math.min(filters.page * filters.limit, clients.length),
    }
  }, [clients.length, filters.page, filters.limit])

  const paginatedClients = useMemo(() => {
    return clients.slice(pagination.start, pagination.end)
  }, [clients, pagination.start, pagination.end])

  // Régions disponibles
  const regions = useMemo(() => {
    const uniqueRegions = [...new Set(MOCK_CLIENTS.map(c => c.region))]
    return uniqueRegions.sort()
  }, [])

  // Mettre à jour les filtres
  const updateFilters = useCallback((updates: Partial<ClientFilters>) => {
    setFilters(prev => ({ ...prev, ...updates }))
  }, [])

  // Réinitialiser les filtres
  const resetFilters = useCallback(() => {
    setFilters({
      search: '',
      status: '',
      region: '',
      sortBy: 'lastOrderDate',
      sortOrder: 'desc',
      page: 1,
      limit: 10,
    })
  }, [])

  // Changer de page
  const goToPage = useCallback((page: number) => {
    setFilters(prev => ({ ...prev, page }))
  }, [])

  // Ouvrir le formulaire d'ajout
  const openAddForm = useCallback(() => {
    setSelectedClient(null)
    setIsFormOpen(true)
  }, [])

  // Ouvrir le formulaire d'édition
  const openEditForm = useCallback((client: ResellerClient) => {
    setSelectedClient(client)
    setIsFormOpen(true)
  }, [])

  // Ouvrir le dialogue de suppression
  const openDeleteDialog = useCallback((client: ResellerClient) => {
    setClientToDelete(client)
    setIsDeleteDialogOpen(true)
  }, [])

  // Sauvegarder un client (création ou modification)
  const saveClient = useCallback(async (data: ClientFormData): Promise<boolean> => {
    // Simulation d'un appel API
    await new Promise(resolve => setTimeout(resolve, 500))
    
    console.log('Saving client:', selectedClient ? `Update ${selectedClient.id}` : 'Create', data)
    return true
  }, [selectedClient])

  // Supprimer un client
  const deleteClient = useCallback(async (): Promise<boolean> => {
    if (!clientToDelete) return false
    
    // Simulation d'un appel API
    await new Promise(resolve => setTimeout(resolve, 500))
    
    console.log('Deleting client:', clientToDelete.id)
    setIsDeleteDialogOpen(false)
    setClientToDelete(null)
    return true
  }, [clientToDelete])

  // Exporter les clients
  const exportClients = useCallback((format: 'csv' | 'pdf') => {
    console.log('Export clients as:', format)
    // Implémenter l'export
  }, [])

  return {
    filters,
    updateFilters,
    resetFilters,
    goToPage,
    pagination,
    clients: paginatedClients,
    allClients: clients,
    stats,
    regions,
    selectedClient,
    isFormOpen,
    setIsFormOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    openAddForm,
    openEditForm,
    openDeleteDialog,
    saveClient,
    deleteClient,
    exportClients,
  }
}

export default useResellerClients
