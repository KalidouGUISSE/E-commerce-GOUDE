/**
 * Reseller Sidebar Hook - Gestion de l'état du sidebar pour les revendeurs
 * 
 * Ce hook gère l'état local du sidebar, la persistance, les sous-menus,
 * et les notifications dynamiques.
 */

'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'

// Types pour le revendeur
export interface ResellerUser {
  id: string
  name: string
  email: string
  avatar: string
  level: 'bronze' | 'argent' | 'or' | 'platine'
  status: 'active' | 'inactive' | 'pending'
  connectionStatus: 'online' | 'offline' | 'away'
}

// Types pour les notifications
export interface NotificationCount {
  orders: number
  messages: number
  stocks: number
  returns: number
  total: number
}

// Types pour les éléments de menu
export interface MenuItem {
  id: string
  label: string
  icon: string
  href?: string
  badge?: number
  children?: MenuItem[]
  description?: string
}

export interface MenuCategory {
  id: string
  title: string
  icon: string
  items: MenuItem[]
}

export interface ResellerSidebarState {
  isOpen: boolean
  isMobile: boolean
  isCompact: boolean
  expandedCategories: string[]
  currentPath: string
}

// État par défaut
const DEFAULT_RESELLER: ResellerUser = {
  id: 'r001',
  name: 'Marie Diop',
  email: 'marie.diop@email.com',
  avatar: '/placeholder-user.jpg',
  level: 'or',
  status: 'active',
  connectionStatus: 'online',
}

const DEFAULT_NOTIFICATIONS: NotificationCount = {
  orders: 5,
  messages: 3,
  stocks: 8,
  returns: 2,
  total: 18,
}

// Hook principal du sidebar revendeur
export function useResellerSidebar() {
  // État de l'utilisateur revendeur
  const [reseller, setReseller] = useState<ResellerUser>(DEFAULT_RESELLER)
  
  // État des notifications
  const [notifications, setNotifications] = useState<NotificationCount>(DEFAULT_NOTIFICATIONS)
  
  // État du sidebar
  const [state, setState] = useState<ResellerSidebarState>({
    isOpen: true,
    isMobile: false,
    isCompact: false,
    expandedCategories: ['dashboard'],
    currentPath: '/revendeur',
  })

  // Vérifier si mobile
  useEffect(() => {
    const checkMobile = () => {
      setState(prev => ({ ...prev, isMobile: window.innerWidth < 1024 }))
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Persistance de l'état du sidebar
  useEffect(() => {
    const savedState = localStorage.getItem('resellerSidebarState')
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState)
        setState(prev => ({
          ...prev,
          isOpen: parsed.isOpen ?? true,
          isCompact: parsed.isCompact ?? false,
        }))
      } catch {
        // Erreur de parsing, on garde l'état par défaut
      }
    }
  }, [])

  // Sauvegarder l'état quand il change
  useEffect(() => {
    localStorage.setItem('resellerSidebarState', JSON.stringify({
      isOpen: state.isOpen,
      isCompact: state.isCompact,
    }))
  }, [state.isOpen, state.isCompact])

  // Toggle du sidebar
  const toggleSidebar = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: !prev.isOpen }))
  }, [])

  // Toggle du mode compact
  const toggleCompact = useCallback(() => {
    setState(prev => ({ ...prev, isCompact: !prev.isCompact }))
  }, [])

  // Toggle d'une catégorie
  const toggleCategory = useCallback((categoryId: string) => {
    setState(prev => ({
      ...prev,
      expandedCategories: prev.expandedCategories.includes(categoryId)
        ? prev.expandedCategories.filter(id => id !== categoryId)
        : [...prev.expandedCategories, categoryId],
    }))
  }, [])

  // Mettre à jour le chemin actuel
  const setCurrentPath = useCallback((path: string) => {
    setState(prev => ({ ...prev, currentPath: path }))
  }, [])

  // Mettre à jour les notifications
  const updateNotifications = useCallback((update: Partial<NotificationCount>) => {
    setNotifications(prev => ({
      ...prev,
      ...update,
      total: Object.values({ ...prev, ...update }).reduce(
        (sum, val) => typeof val === 'number' ? sum + val : sum, 
        0
      ),
    }))
  }, [])

  // Calculer le niveau de résidence
  const levelInfo = useMemo(() => ({
    bronze: { color: 'text-orange-700', bg: 'bg-orange-100', label: 'Bronze' },
    argent: { color: 'text-gray-600', bg: 'bg-gray-200', label: 'Argent' },
    or: { color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Or' },
    platine: { color: 'text-purple-600', bg: 'bg-purple-100', label: 'Platine' },
  }[reseller.level]), [reseller.level])

  return {
    reseller,
    setReseller,
    notifications,
    setNotifications,
    state,
    toggleSidebar,
    toggleCompact,
    toggleCategory,
    setCurrentPath,
    updateNotifications,
    levelInfo,
  }
}

export default useResellerSidebar
