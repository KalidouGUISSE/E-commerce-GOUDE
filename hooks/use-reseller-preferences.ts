/**
 * useResellerPreferences Hook - Gestion des préférences du compte
 * 
 * Ce hook gère :
 * - Notifications par email
 * - Préférences de communication
 * - Paramètres d'interface
 * - Paramètres de confidentialité
 */

'use client'

import { useState, useCallback } from 'react'

// Types pour les préférences
export interface EmailNotifications {
  newOrders: boolean
  paymentConfirmations: boolean
  paymentReminders: boolean
  newFeatures: boolean
  newsletter: boolean
}

export interface CommunicationPreferences {
  language: string
  emailFormat: 'html' | 'text'
  summaryFrequency: 'daily' | 'weekly' | 'monthly' | 'never'
  preferredChannel: 'email' | 'sms' | 'phone'
}

export interface InterfaceSettings {
  theme: 'light' | 'dark' | 'system'
  timezone: string
  dateFormat: string
  currency: string
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'restricted'
  shareAnonymousData: boolean
  cookies: {
    necessary: boolean
    analytics: boolean
    marketing: boolean
  }
}

export interface DisplayPreferences {
  itemsPerPage: number
  listView: 'compact' | 'expanded'
  defaultSortOrder: 'asc' | 'desc'
}

// Données mockées des préférences
const MOCK_EMAIL_NOTIFICATIONS: EmailNotifications = {
  newOrders: true,
  paymentConfirmations: true,
  paymentReminders: true,
  newFeatures: false,
  newsletter: true,
}

const MOCK_COMMUNICATION: CommunicationPreferences = {
  language: 'fr',
  emailFormat: 'html',
  summaryFrequency: 'weekly',
  preferredChannel: 'email',
}

const MOCK_INTERFACE: InterfaceSettings = {
  theme: 'light',
  timezone: 'Africa/Dakar',
  dateFormat: 'DD/MM/YYYY',
  currency: 'XOF',
}

const MOCK_PRIVACY: PrivacySettings = {
  profileVisibility: 'private',
  shareAnonymousData: false,
  cookies: {
    necessary: true,
    analytics: true,
    marketing: false,
  },
}

const MOCK_DISPLAY: DisplayPreferences = {
  itemsPerPage: 10,
  listView: 'expanded',
  defaultSortOrder: 'desc',
}

// Hook principal
export function useResellerPreferences() {
  const [isLoading, setIsLoading] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  
  const [emailNotifications, setEmailNotifications] = useState<EmailNotifications>(MOCK_EMAIL_NOTIFICATIONS)
  const [communication, setCommunication] = useState<CommunicationPreferences>(MOCK_COMMUNICATION)
  const [interfaceSettings, setInterfaceSettings] = useState<InterfaceSettings>(MOCK_INTERFACE)
  const [privacy, setPrivacy] = useState<PrivacySettings>(MOCK_PRIVACY)
  const [display, setDisplay] = useState<DisplayPreferences>(MOCK_DISPLAY)

  // Sauvegarder les notifications
  const saveNotifications = useCallback(async (data: Partial<EmailNotifications>): Promise<boolean> => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      setEmailNotifications(prev => ({ ...prev, ...data }))
      setFeedback({ type: 'success', message: 'Préférences de notification mises à jour' })
      return true
    } catch {
      setFeedback({ type: 'error', message: 'Erreur lors de la mise à jour' })
      return false
    } finally {
      setIsLoading(false)
      setTimeout(() => setFeedback(null), 3000)
    }
  }, [])

  // Sauvegarder les préférences de communication
  const saveCommunication = useCallback(async (data: Partial<CommunicationPreferences>): Promise<boolean> => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      setCommunication(prev => ({ ...prev, ...data }))
      setFeedback({ type: 'success', message: 'Préférences de communication mises à jour' })
      return true
    } catch {
      setFeedback({ type: 'error', message: 'Erreur lors de la mise à jour' })
      return false
    } finally {
      setIsLoading(false)
      setTimeout(() => setFeedback(null), 3000)
    }
  }, [])

  // Sauvegarder les paramètres d'interface
  const saveInterface = useCallback(async (data: Partial<InterfaceSettings>): Promise<boolean> => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      setInterfaceSettings(prev => ({ ...prev, ...data }))
      setFeedback({ type: 'success', message: 'Paramètres d\'interface mis à jour' })
      return true
    } catch {
      setFeedback({ type: 'error', message: 'Erreur lors de la mise à jour' })
      return false
    } finally {
      setIsLoading(false)
      setTimeout(() => setFeedback(null), 3000)
    }
  }, [])

  // Sauvegarder les paramètres de confidentialité
  const savePrivacy = useCallback(async (data: Partial<PrivacySettings>): Promise<boolean> => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      setPrivacy(prev => ({ ...prev, ...data }))
      setFeedback({ type: 'success', message: 'Paramètres de confidentialité mis à jour' })
      return true
    } catch {
      setFeedback({ type: 'error', message: 'Erreur lors de la mise à jour' })
      return false
    } finally {
      setIsLoading(false)
      setTimeout(() => setFeedback(null), 3000)
    }
  }, [])

  // Sauvegarder les préférences d'affichage
  const saveDisplay = useCallback(async (data: Partial<DisplayPreferences>): Promise<boolean> => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      setDisplay(prev => ({ ...prev, ...data }))
      setFeedback({ type: 'success', message: 'Préférences d\'affichage mises à jour' })
      return true
    } catch {
      setFeedback({ type: 'error', message: 'Erreur lors de la mise à jour' })
      return false
    } finally {
      setIsLoading(false)
      setTimeout(() => setFeedback(null), 3000)
    }
  }, [])

  return {
    isLoading,
    feedback,
    emailNotifications,
    communication,
    interfaceSettings,
    privacy,
    display,
    saveNotifications,
    saveCommunication,
    saveInterface,
    savePrivacy,
    saveDisplay,
  }
}

export default useResellerPreferences
