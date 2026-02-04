/**
 * useResellerSecurity Hook - Gestion de la sécurité du compte
 * 
 * Ce hook gère :
 * - Authentification à deux facteurs (2FA)
 * - Gestion des mots de passe
 * - Sessions actives
 * - Journal des activités
 * - Clés API
 */

'use client'

import { useState, useCallback, useMemo } from 'react'

// Types pour les sessions
export interface ActiveSession {
  id: string
  device: string
  browser: string
  os: string
  ip: string
  location: string
  lastActivity: string
  isCurrent: boolean
}

// Types pour les activités de sécurité
export interface SecurityActivity {
  id: string
  type: 'password_change' | '2fa_enable' | '2fa_disable' | 'login' | 'logout' | 'email_change' | 'api_key_create' | 'api_key_revoke'
  description: string
  ip: string
  location: string
  timestamp: string
}

// Types pour les clés API
export interface ApiKey {
  id: string
  name: string
  key: string
  createdAt: string
  lastUsed: string
  ips: string[]
  isActive: boolean
}

// Données mockées des sessions
const MOCK_SESSIONS: ActiveSession[] = [
  {
    id: 'ses001',
    device: 'Desktop',
    browser: 'Chrome 121',
    os: 'Windows 11',
    ip: '197.234.92.45',
    location: 'Dakar, Sénégal',
    lastActivity: '2024-02-04T14:30:00Z',
    isCurrent: true,
  },
  {
    id: 'ses002',
    device: 'Mobile',
    browser: 'Safari',
    os: 'iOS 17',
    ip: '197.234.92.45',
    location: 'Dakar, Sénégal',
    lastActivity: '2024-02-04T10:15:00Z',
    isCurrent: false,
  },
  {
    id: 'ses003',
    device: 'Desktop',
    browser: 'Firefox 122',
    os: 'Ubuntu 22.04',
    ip: '41.82.134.22',
    location: 'Thiès, Sénégal',
    lastActivity: '2024-02-03T16:45:00Z',
    isCurrent: false,
  },
]

// Données mockées des activités
const MOCK_ACTIVITIES: SecurityActivity[] = [
  { id: 'act001', type: 'login', description: 'Connexion réussie', ip: '197.234.92.45', location: 'Dakar, Sénégal', timestamp: '2024-02-04T14:30:00Z' },
  { id: 'act002', type: '2fa_disable', description: '2FA désactivé par SMS', ip: '197.234.92.45', location: 'Dakar, Sénégal', timestamp: '2024-02-04T12:00:00Z' },
  { id: 'act003', type: 'password_change', description: 'Mot de passe modifié', ip: '197.234.92.45', location: 'Dakar, Sénégal', timestamp: '2024-02-03T09:15:00Z' },
  { id: 'act004', type: 'api_key_create', description: 'Nouvelle clé API créée: "Production"', ip: '197.234.92.45', location: 'Dakar, Sénégal', timestamp: '2024-02-02T11:30:00Z' },
  { id: 'act005', type: 'login', description: 'Connexion depuis un nouvel appareil', ip: '41.82.134.22', location: 'Thiès, Sénégal', timestamp: '2024-02-03T16:45:00Z' },
  { id: 'act006', type: 'email_change', description: 'Adresse email de récupération mise à jour', ip: '197.234.92.45', location: 'Dakar, Sénégal', timestamp: '2024-02-01T08:00:00Z' },
]

// Données mockées des clés API
const MOCK_API_KEYS: ApiKey[] = [
  {
    id: 'key001',
    name: 'Production',
    key: 'pk_live_****************************abcd',
    createdAt: '2024-02-02T11:30:00Z',
    lastUsed: '2024-02-04T14:25:00Z',
    ips: ['197.234.92.45'],
    isActive: true,
  },
  {
    id: 'key002',
    name: 'Développement',
    key: 'pk_test_****************************efgh',
    createdAt: '2024-01-15T09:00:00Z',
    lastUsed: '2024-02-04T10:00:00Z',
    ips: [],
    isActive: true,
  },
]

// Hook principal
export function useResellerSecurity() {
  const [isLoading, setIsLoading] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  
  const [is2FAEnabled, setIs2FAEnabled] = useState(false)
  const [twoFAMethod, setTwoFAMethod] = useState<'app' | 'sms' | null>(null)
  const [is2FASetupOpen, setIs2FASetupOpen] = useState(false)
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false)
  const [isCreateApiKeyOpen, setIsCreateApiKeyOpen] = useState(false)

  const [sessions, setSessions] = useState<ActiveSession[]>(MOCK_SESSIONS)
  const [activities, setActivities] = useState<SecurityActivity[]>(MOCK_ACTIVITIES)
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(MOCK_API_KEYS)

  // Activé/Désactiver 2FA
  const toggle2FA = useCallback(async (): Promise<boolean> => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      setIs2FAEnabled(prev => !prev)
      if (!is2FAEnabled) {
        setIs2FASetupOpen(true)
      }
      setFeedback({ 
        type: 'success', 
        message: is2FAEnabled ? '2FA désactivé avec succès' : '2FA activé avec succès' 
      })
      return true
    } catch {
      setFeedback({ type: 'error', message: 'Erreur lors de la modification' })
      return false
    } finally {
      setIsLoading(false)
      setTimeout(() => setFeedback(null), 3000)
    }
  }, [is2FAEnabled])

  // Configurer 2FA
  const setup2FA = useCallback(async (method: 'app' | 'sms', code: string): Promise<boolean> => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      setTwoFAMethod(method)
      setIs2FAEnabled(true)
      setIs2FASetupOpen(false)
      setFeedback({ type: 'success', message: '2FA configuré avec succès' })
      return true
    } catch {
      setFeedback({ type: 'error', message: 'Code invalide' })
      return false
    } finally {
      setIsLoading(false)
      setTimeout(() => setFeedback(null), 3000)
    }
  }, [])

  // Changer le mot de passe
  const changePassword = useCallback(async (
    currentPassword: string, 
    newPassword: string, 
    confirmPassword: string
  ): Promise<boolean> => {
    setIsLoading(true)
    try {
      if (newPassword !== confirmPassword) {
        throw new Error('Les mots de passe ne correspondent pas')
      }
      if (newPassword.length < 8) {
        throw new Error('Le mot de passe doit contenir au moins 8 caractères')
      }
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Ajouter l'activité
      const newActivity: SecurityActivity = {
        id: `act${Date.now()}`,
        type: 'password_change',
        description: 'Mot de passe modifié',
        ip: '197.234.92.45',
        location: 'Dakar, Sénégal',
        timestamp: new Date().toISOString(),
      }
      setActivities(prev => [newActivity, ...prev])
      
      setIsChangePasswordOpen(false)
      setFeedback({ type: 'success', message: 'Mot de passe modifié avec succès' })
      return true
    } catch (error) {
      setFeedback({ type: 'error', message: (error as Error).message })
      return false
    } finally {
      setIsLoading(false)
      setTimeout(() => setFeedback(null), 3000)
    }
  }, [])

  // Révoquer une session
  const revokeSession = useCallback(async (sessionId: string): Promise<boolean> => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      setSessions(prev => prev.filter(s => s.id !== sessionId))
      setFeedback({ type: 'success', message: 'Session révoquée' })
      return true
    } catch {
      setFeedback({ type: 'error', message: 'Erreur lors de la révocation' })
      return false
    } finally {
      setIsLoading(false)
      setTimeout(() => setFeedback(null), 3000)
    }
  }, [])

  // Révoquer toutes les sessions
  const revokeAllSessions = useCallback(async (): Promise<boolean> => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      setSessions(prev => prev.filter(s => s.isCurrent))
      setFeedback({ type: 'success', message: 'Toutes les sessions ont été révoquées' })
      return true
    } catch {
      setFeedback({ type: 'error', message: 'Erreur lors de la révocation' })
      return false
    } finally {
      setIsLoading(false)
      setTimeout(() => setFeedback(null), 3000)
    }
  }, [])

  // Créer une clé API
  const createApiKey = useCallback(async (name: string, ips: string[]): Promise<boolean> => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      const newKey: ApiKey = {
        id: `key${Date.now()}`,
        name,
        key: `pk_${Math.random().toString(36).substring(2, 15)}_****************************${Math.random().toString(36).substring(2, 6)}`,
        createdAt: new Date().toISOString(),
        lastUsed: new Date().toISOString(),
        ips,
        isActive: true,
      }
      setApiKeys(prev => [newKey, ...prev])
      
      // Ajouter l'activité
      const newActivity: SecurityActivity = {
        id: `act${Date.now()}`,
        type: 'api_key_create',
        description: `Nouvelle clé API créée: "${name}"`,
        ip: '197.234.92.45',
        location: 'Dakar, Sénégal',
        timestamp: new Date().toISOString(),
      }
      setActivities(prev => [newActivity, ...prev])
      
      setIsCreateApiKeyOpen(false)
      setFeedback({ type: 'success', message: 'Clé API créée avec succès' })
      return true
    } catch {
      setFeedback({ type: 'error', message: 'Erreur lors de la création' })
      return false
    } finally {
      setIsLoading(false)
      setTimeout(() => setFeedback(null), 3000)
    }
  }, [])

  // Révoquer une clé API
  const revokeApiKey = useCallback(async (keyId: string): Promise<boolean> => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      setApiKeys(prev => prev.filter(k => k.id !== keyId))
      setFeedback({ type: 'success', message: 'Clé API révoquée' })
      return true
    } catch {
      setFeedback({ type: 'error', message: 'Erreur lors de la révocation' })
      return false
    } finally {
      setIsLoading(false)
      setTimeout(() => setFeedback(null), 3000)
    }
  }, [])

  return {
    isLoading,
    feedback,
    is2FAEnabled,
    twoFAMethod,
    is2FASetupOpen,
    setIs2FASetupOpen,
    isChangePasswordOpen,
    setIsChangePasswordOpen,
    isCreateApiKeyOpen,
    setIsCreateApiKeyOpen,
    sessions,
    activities,
    apiKeys,
    toggle2FA,
    setup2FA,
    changePassword,
    revokeSession,
    revokeAllSessions,
    createApiKey,
    revokeApiKey,
  }
}

export default useResellerSecurity
