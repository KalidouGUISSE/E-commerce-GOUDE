/**
 * Artisan Sidebar Hook - Gestion de l'état du sidebar pour les artisans
 * 
 * Ce hook gère l'état local du sidebar artisan, la persistance, les sous-menus,
 * et les notifications dynamiques spécifiques aux artisans.
 */

'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'

// Types pour l'artisan
export interface ArtisanUser {
  id: string
  name: string
  email: string
  avatar: string
  specialty: string
  region: string
  rating: number
  status: 'active' | 'inactive' | 'pending' | 'certified'
  connectionStatus: 'online' | 'offline' | 'away'
}

// Types pour les notifications artisan
export interface ArtisanNotificationCount {
  orders: number
  messages: number
  quotes: number
  products: number
  total: number
}

// Types pour les éléments de menu
export interface ArtisanMenuItem {
  id: string
  label: string
  icon: string
  href?: string
  badge?: number
  description?: string
}

export interface ArtisanMenuCategory {
  id: string
  title: string
  icon: string
  items: ArtisanMenuItem[]
}

export interface ArtisanSidebarState {
  isOpen: boolean
  isMobile: boolean
  isCompact: boolean
  isOpenMobile: boolean
  expandedCategories: string[]
  currentPath: string
}

// État par défaut de l'artisan
const DEFAULT_ARTISAN: ArtisanUser = {
  id: 'art001',
  name: 'Mamadou Diop',
  email: 'mamadou.diop@artisan.sn',
  avatar: '/placeholder-user.jpg',
  specialty: 'Tissage Manjak',
  region: 'Casamance',
  rating: 4.8,
  status: 'certified',
  connectionStatus: 'online',
}

const DEFAULT_NOTIFICATIONS: ArtisanNotificationCount = {
  orders: 3,
  messages: 5,
  quotes: 2,
  products: 1,
  total: 11,
}

// Hook principal du sidebar artisan
export function useArtisanSidebar() {
  // État de l'utilisateur artisan
  const [artisan, setArtisan] = useState<ArtisanUser>(DEFAULT_ARTISAN)
  
  // État des notifications
  const [notifications, setNotifications] = useState<ArtisanNotificationCount>(DEFAULT_NOTIFICATIONS)
  
  // État du sidebar
  const [state, setSidebarState] = useState<ArtisanSidebarState>({
    isOpen: true,
    isMobile: false,
    isCompact: false,
    isOpenMobile: false,
    expandedCategories: ['dashboard'],
    currentPath: '/artisans',
  })

  // Vérifier si mobile
  useEffect(() => {
    const checkMobile = () => {
      setSidebarState(prev => ({ ...prev, isMobile: window.innerWidth < 1024 }))
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Persistance de l'état du sidebar
  useEffect(() => {
    const savedState = localStorage.getItem('artisanSidebarState')
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState)
        setSidebarState(prev => ({
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
    localStorage.setItem('artisanSidebarState', JSON.stringify({
      isOpen: state.isOpen,
      isCompact: state.isCompact,
    }))
  }, [state.isOpen, state.isCompact])

  // Toggle du sidebar
  const toggleSidebar = useCallback(() => {
    setSidebarState(prev => ({ ...prev, isOpen: !prev.isOpen }))
  }, [])

  // Toggle du mode compact
  const toggleCompact = useCallback(() => {
    setSidebarState(prev => ({ ...prev, isCompact: !prev.isCompact }))
  }, [])

  // Toggle d'une catégorie
  const toggleCategory = useCallback((categoryId: string) => {
    setSidebarState(prev => ({
      ...prev,
      expandedCategories: prev.expandedCategories.includes(categoryId)
        ? prev.expandedCategories.filter(id => id !== categoryId)
        : [...prev.expandedCategories, categoryId],
    }))
  }, [])

  // Toggle du mobile
  const toggleMobile = useCallback((open?: boolean) => {
    setSidebarState(prev => ({ 
      ...prev, 
      isOpenMobile: open ?? !prev.isOpenMobile 
    }))
  }, [])

  // Mettre à jour le chemin actuel
  const setCurrentPath = useCallback((path: string) => {
    setSidebarState(prev => ({ ...prev, currentPath: path }))
  }, [])

  // Mettre à jour les notifications
  const updateNotifications = useCallback((update: Partial<ArtisanNotificationCount>) => {
    setNotifications(prev => ({
      ...prev,
      ...update,
      total: Object.values({ ...prev, ...update }).reduce(
        (sum, val) => typeof val === 'number' ? sum + val : sum, 
        0
      ),
    }))
  }, [])

  // Calculer le niveau de certification
  interface CertificationInfo {
    color: string
    bg: string
    label: string
    icon: string
  }
  
  const certificationInfo = useMemo((): CertificationInfo => {
    if (artisan.rating >= 4.5) {
      return { color: 'text-purple-600', bg: 'bg-purple-100', label: 'Maître Artisan', icon: 'Award' }
    } else if (artisan.rating >= 4.0) {
      return { color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Artisan Certifié', icon: 'CheckCircle' }
    } else if (artisan.rating >= 3.5) {
      return { color: 'text-blue-600', bg: 'bg-blue-100', label: 'Artisan Confirmé', icon: 'Star' }
    }
    return { color: 'text-gray-600', bg: 'bg-gray-100', label: 'Artisan', icon: 'User' }
  }, [artisan.rating])

  return {
    artisan,
    setArtisan,
    notifications,
    setNotifications,
    state,
    toggleSidebar,
    toggleCompact,
    toggleCategory,
    toggleMobile,
    setCurrentPath,
    updateNotifications,
    certificationInfo,
  }
}

export default useArtisanSidebar
