/**
 * useResellerActivity Hook - Gestion des données d'activité du revendeur
 * 
 * Ce hook gère :
 * - KPIs (indicateurs de performance)
 * - Données graphiques (CA, commandes, catégories)
 * - Historique d'activité
 * - Alertes et notifications
 * - Objectifs commerciaux
 */

'use client'

import { useState, useCallback, useMemo } from 'react'

// Types pour les KPIs
export interface KPI {
  id: string
  label: string
  value: number | string
  previousValue: number | string
  unit: string
  trend: 'up' | 'down' | 'neutral'
  changePercent: number
  icon: string
}

// Types pour les données graphiques
export interface ChartDataPoint {
  label: string
  value: number
  date?: string
}

export interface CategoryData {
  category: string
  value: number
  color: string
}

export interface OrderStatusData {
  status: string
  count: number
  color: string
}

// Types pour l'historique
export interface ActivityItem {
  id: string
  date: string
  time: string
  type: 'order' | 'quote' | 'payment' | 'registration' | 'account_update'
  description: string
  user: string
  userRef: string
  status: string
  actions: ActivityAction[]
}

export interface ActivityAction {
  label: string
  icon: string
  href: string
}

// Types pour les alertes
export interface Alert {
  id: string
  type: 'warning' | 'info' | 'success' | 'error'
  title: string
  message: string
  href: string
  isRead: boolean
  createdAt: string
}

// Types pour les objectifs
export interface Objective {
  id: string
  label: string
  currentValue: number
  targetValue: number
  unit: string
  period: 'monthly' | 'quarterly'
  status: 'on_track' | 'at_risk' | 'behind'
  changePercent: number
}

// Types pour les filtres
export interface ActivityFilters {
  type: string
  status: string
  startDate: string
  endDate: string
  search: string
  page: number
  limit: number
}

// Types pour les données complètes
export interface ActivityData {
  kpis: KPI[]
  revenueChart: ChartDataPoint[]
  categoryChart: CategoryData[]
  orderStatusChart: OrderStatusData[]
  activities: ActivityItem[]
  alerts: Alert[]
  objectives: Objective[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

// Données mockées
const MOCK_KPIS: KPI[] = [
  {
    id: 'orders',
    label: 'Commandes du mois',
    value: 156,
    previousValue: 142,
    unit: '',
    trend: 'up',
    changePercent: 9.86,
    icon: 'shopping-cart',
  },
  {
    id: 'revenue',
    label: 'Chiffre d\'affaires',
    value: 2456789,
    previousValue: 2189450,
    unit: 'CFA',
    trend: 'up',
    changePercent: 12.21,
    icon: 'dollar',
  },
  {
    id: 'customers',
    label: 'Clients actifs',
    value: 89,
    previousValue: 92,
    unit: '',
    trend: 'down',
    changePercent: -3.26,
    icon: 'users',
  },
  {
    id: 'conversion',
    label: 'Taux de conversion',
    value: 24.5,
    previousValue: 21.8,
    unit: '%',
    trend: 'up',
    changePercent: 12.39,
    icon: 'trending-up',
  },
]

const MOCK_REVENUE_CHART: ChartDataPoint[] = [
  { label: 'Jan', value: 1850000, date: '2024-01' },
  { label: 'Fév', value: 2100000, date: '2024-02' },
  { label: 'Mar', value: 1950000, date: '2024-03' },
  { label: 'Avr', value: 2300000, date: '2024-04' },
  { label: 'Mai', value: 2450000, date: '2024-05' },
  { label: 'Juin', value: 2800000, date: '2024-06' },
  { label: 'Juil', value: 2600000, date: '2024-07' },
  { label: 'Août', value: 3100000, date: '2024-08' },
  { label: 'Sep', value: 2950000, date: '2024-09' },
  { label: 'Oct', value: 3300000, date: '2024-10' },
  { label: 'Nov', value: 3500000, date: '2024-11' },
  { label: 'Déc', value: 3800000, date: '2024-12' },
]

const MOCK_CATEGORY_CHART: CategoryData[] = [
  { category: 'Manjak', value: 450000, color: '#f97316' },
  { category: 'Kente', value: 380000, color: '#8b5cf6' },
  { category: 'Bogolan', value: 290000, color: '#a855f7' },
  { category: 'Thioup', value: 220000, color: '#06b6d4' },
  { category: 'Bazin', value: 560000, color: '#eab308' },
  { category: 'Waxi', value: 180000, color: '#ef4444' },
]

const MOCK_ORDER_STATUS: OrderStatusData[] = [
  { status: 'En attente', count: 23, color: '#f59e0b' },
  { status: 'Validée', count: 45, color: '#3b82f6' },
  { status: 'Expédiée', count: 67, color: '#8b5cf6' },
  { status: 'Livrée', count: 189, color: '#22c55e' },
  { status: 'Annulée', count: 12, color: '#ef4444' },
]

const MOCK_ACTIVITIES: ActivityItem[] = [
  {
    id: 'a001',
    date: '04/02/2024',
    time: '14:32',
    type: 'order',
    description: 'Nouvelle commande CMD-2024-156',
    user: 'Aminata Fall',
    userRef: 'REF-C-001',
    status: 'En attente',
    actions: [
      { label: 'Voir détails', icon: 'eye', href: '/revendeur/commandes/CMD-2024-156' },
      { label: 'Télécharger', icon: 'download', href: '#' },
    ],
  },
  {
    id: 'a002',
    date: '04/02/2024',
    time: '11:15',
    type: 'payment',
    description: 'Paiement reçu - 125.000 CFA',
    user: 'Fatou Diop',
    userRef: 'REF-C-002',
    status: 'Confirmé',
    actions: [
      { label: 'Voir facture', icon: 'file', href: '#' },
      { label: 'Reçu', icon: 'download', href: '#' },
    ],
  },
  {
    id: 'a003',
    date: '03/02/2024',
    time: '16:45',
    type: 'quote',
    description: 'Devis créé - 2.450.000 CFA',
    user: 'Mariama Sy',
    userRef: 'REF-C-003',
    status: 'En attente de validation',
    actions: [
      { label: 'Voir devis', icon: 'eye', href: '#' },
      { label: 'Envoyer', icon: 'send', href: '#' },
    ],
  },
  {
    id: 'a004',
    date: '03/02/2024',
    time: '10:20',
    type: 'registration',
    description: 'Nouveau client inscrit',
    user: 'Ndèye Fatou',
    userRef: 'REF-C-004',
    status: 'Vérifié',
    actions: [
      { label: 'Profil', icon: 'user', href: '#' },
      { label: 'Contacter', icon: 'mail', href: '#' },
    ],
  },
  {
    id: 'a005',
    date: '02/02/2024',
    time: '15:30',
    type: 'payment',
    description: 'Échéance de paiement',
    user: 'Commerce Équitable',
    userRef: 'REF-B-001',
    status: 'En retard',
    actions: [
      { label: 'Détails', icon: 'eye', href: '#' },
      { label: 'Relancer', icon: 'bell', href: '#' },
    ],
  },
  {
    id: 'a006',
    date: '02/02/2024',
    time: '09:00',
    type: 'account_update',
    description: 'Informations mise à jour',
    user: 'Marie Diop',
    userRef: 'REV-001',
    status: 'Terminé',
    actions: [
      { label: 'Historique', icon: 'history', href: '#' },
    ],
  },
  {
    id: 'a007',
    date: '01/02/2024',
    time: '17:45',
    type: 'order',
    description: 'Commande livrée CMD-2024-150',
    user: 'Sokhna Aïssa',
    userRef: 'REF-C-005',
    status: 'Livrée',
    actions: [
      { label: 'Voir détails', icon: 'eye', href: '#' },
      { label: 'Facture', icon: 'file', href: '#' },
    ],
  },
]

const MOCK_ALERTS: Alert[] = [
  {
    id: 'alert1',
    type: 'warning',
    title: 'Commandes en attente',
    message: '5 commandes en attente de validation depuis plus de 48h',
    href: '/revendeur/commandes?status=pending',
    isRead: false,
    createdAt: '2024-02-04T10:00:00Z',
  },
  {
    id: 'alert2',
    type: 'info',
    title: 'Paiements en attente',
    message: '3 paiements en attente de confirmation',
    href: '/revendeur/paiements',
    isRead: false,
    createdAt: '2024-02-04T08:30:00Z',
  },
  {
    id: 'alert3',
    type: 'warning',
    title: 'Stocks bas',
    message: '3 produits populaires avec stock critique',
    href: '/revendeur/stocks',
    isRead: true,
    createdAt: '2024-02-03T14:20:00Z',
  },
  {
    id: 'alert4',
    type: 'error',
    title: 'Échéance dépassée',
    message: '2 échéances de paiement en retard',
    href: '/revendeur/paiements?status=overdue',
    isRead: false,
    createdAt: '2024-02-03T09:00:00Z',
  },
  {
    id: 'alert5',
    type: 'success',
    title: 'Nouveau devis',
    message: '2 nouvelles demandes de devis reçues',
    href: '/revendeur/devis',
    isRead: false,
    createdAt: '2024-02-04T07:00:00Z',
  },
]

const MOCK_OBJECTIVES: Objective[] = [
  {
    id: 'obj1',
    label: 'Objectif mensuel - CA',
    currentValue: 2456789,
    targetValue: 3000000,
    unit: 'CFA',
    period: 'monthly',
    status: 'on_track',
    changePercent: 12.21,
  },
  {
    id: 'obj2',
    label: 'Objectif mensuel - Commandes',
    currentValue: 156,
    targetValue: 200,
    unit: '',
    period: 'monthly',
    status: 'at_risk',
    changePercent: -22,
  },
  {
    id: 'obj3',
    label: 'Objectif mensuel - Nouveaux clients',
    currentValue: 12,
    targetValue: 20,
    unit: '',
    period: 'monthly',
    status: 'behind',
    changePercent: -40,
  },
  {
    id: 'obj4',
    label: 'Objectif trimestriel - CA',
    currentValue: 7850000,
    targetValue: 10000000,
    unit: 'CFA',
    period: 'quarterly',
    status: 'on_track',
    changePercent: 8.5,
  },
]

// Hook principal
export function useResellerActivity() {
  const [filters, setFilters] = useState<ActivityFilters>({
    type: '',
    status: '',
    startDate: '',
    endDate: '',
    search: '',
    page: 1,
    limit: 10,
  })
  
  const [selectedChartView, setSelectedChartView] = useState<'monthly' | 'weekly'>('monthly')
  const [chartFilter, setChartFilter] = useState<string | null>(null)
  
  // KPIs
  const kpis = useMemo(() => MOCK_KPIS, [])
  
  // Graphiques
  const revenueChart = useMemo(() => MOCK_REVENUE_CHART, [])
  const categoryChart = useMemo(() => MOCK_CATEGORY_CHART, [])
  const orderStatusChart = useMemo(() => MOCK_ORDER_STATUS, [])
  
  // Historique filtré
  const activities = useMemo(() => {
    let filtered = [...MOCK_ACTIVITIES]
    
    if (filters.type) {
      filtered = filtered.filter(a => a.type === filters.type)
    }
    if (filters.status) {
      filtered = filtered.filter(a => a.status === filters.status)
    }
    if (filters.search) {
      const search = filters.search.toLowerCase()
      filtered = filtered.filter(a => 
        a.description.toLowerCase().includes(search) ||
        a.user.toLowerCase().includes(search)
      )
    }
    
    return filtered
  }, [filters])
  
  // Pagination
  const pagination = useMemo(() => {
    const totalPages = Math.ceil(activities.length / filters.limit)
    return {
      total: activities.length,
      page: filters.page,
      limit: filters.limit,
      totalPages,
      start: (filters.page - 1) * filters.limit,
      end: Math.min(filters.page * filters.limit, activities.length),
    }
  }, [activities.length, filters.page, filters.limit])
  
  const paginatedActivities = useMemo(() => {
    return activities.slice(pagination.start, pagination.end)
  }, [activities, pagination.start, pagination.end])
  
  // Alertes
  const alerts = useMemo(() => MOCK_ALERTS, [])
  const unreadAlerts = useMemo(() => alerts.filter(a => !a.isRead), [alerts])
  
  // Objectifs
  const objectives = useMemo(() => MOCK_OBJECTIVES, [])
  
  // Mettre à jour les filtres
  const updateFilters = useCallback((updates: Partial<ActivityFilters>) => {
    setFilters(prev => ({ ...prev, ...updates }))
  }, [])
  
  // Réinitialiser les filtres
  const resetFilters = useCallback(() => {
    setFilters({
      type: '',
      status: '',
      startDate: '',
      endDate: '',
      search: '',
      page: 1,
      limit: 10,
    })
  }, [])
  
  // Changer de page
  const goToPage = useCallback((page: number) => {
    setFilters(prev => ({ ...prev, page }))
  }, [])
  
  // Dismiss une alerte
  const dismissAlert = useCallback((alertId: string) => {
    // Dans une vraie app, cela ferait un API call
    console.log('Dismiss alert:', alertId)
  }, [])
  
  // Exporter les données
  const exportData = useCallback((format: 'csv' | 'pdf') => {
    console.log('Export as:', format)
    // Implémenter l'export
  }, [])
  
  return {
    filters,
    updateFilters,
    resetFilters,
    goToPage,
    pagination,
    kpis,
    revenueChart,
    categoryChart,
    orderStatusChart,
    activities: paginatedActivities,
    allActivities: activities,
    alerts,
    unreadAlerts,
    dismissAlert,
    objectives,
    selectedChartView,
    setSelectedChartView,
    chartFilter,
    setChartFilter,
    exportData,
  }
}

export default useResellerActivity
