/**
 * useResellerAccount Hook - Gestion du compte revendeur
 * 
 * Ce hook gère :
 * - Informations personnelles du revendeur
 * - Informations de contact
 * - Informations professionnelles
 * - Abonnement et facturation
 * - Actions du profil
 */

'use client'

import { useState, useCallback } from 'react'

// Types pour le profil revendeur
export interface ResellerProfile {
  id: string
  email: string
  firstName: string
  lastName: string
  companyName: string
  phone: string
  avatar: string | null
  status: 'active' | 'inactive' | 'suspended'
  createdAt: string
  lastActivity: string
}

export interface ResellerAddress {
  street: string
  city: string
  postalCode: string
  country: string
  latitude?: number
  longitude?: number
}

export interface BusinessInfo {
  siret: string
  siren: string
  vatNumber: string
  apeCode: string
  legalName: string
}

export interface Subscription {
  planId: string
  planName: string
  status: 'active' | 'cancelled' | 'expired'
  startDate: string
  endDate: string
  renewalDate: string
  limits: {
    maxProducts: number
    maxOrders: number
    maxClients: number
  }
}

export interface PaymentHistory {
  id: string
  date: string
  amount: number
  status: 'completed' | 'pending' | 'failed'
  invoiceNumber: string
}

// Données mockées du profil
const MOCK_PROFILE: ResellerProfile = {
  id: 'res001',
  email: 'contact@tissus-afrique.sn',
  firstName: 'Mamadou',
  lastName: 'Diop',
  companyName: 'Tissus Afrique Distribution',
  phone: '+221 77 123 45 67',
  avatar: null,
  status: 'active',
  createdAt: '2023-01-15T10:30:00Z',
  lastActivity: '2024-02-04T14:30:00Z',
}

const MOCK_ADDRESS: ResellerAddress = {
  street: '45 Avenue Cheikh Anta Diop',
  city: 'Dakar',
  postalCode: '10500',
  country: 'Sénégal',
  latitude: 14.6928,
  longitude: -17.4467,
}

const MOCK_BUSINESS: BusinessInfo = {
  siret: '123 456 789 00012',
  siren: '123 456 789',
  vatNumber: 'SN123456789',
  apeCode: '4759Z',
  legalName: 'TISSUS AFRIQUE DISTRIBUTION SARL',
}

const MOCK_SUBSCRIPTION: Subscription = {
  planId: 'plan_pro',
  planName: 'Professionnel',
  status: 'active',
  startDate: '2024-01-01',
  endDate: '2024-12-31',
  renewalDate: '2024-12-31',
  limits: {
    maxProducts: 500,
    maxOrders: 1000,
    maxClients: 200,
  },
}

const MOCK_PAYMENT_HISTORY: PaymentHistory[] = [
  { id: 'pay001', date: '2024-01-01', amount: 150000, status: 'completed', invoiceNumber: 'FAC-2024-001' },
  { id: 'pay002', date: '2023-10-01', amount: 150000, status: 'completed', invoiceNumber: 'FAC-2023-012' },
  { id: 'pay003', date: '2023-07-01', amount: 100000, status: 'completed', invoiceNumber: 'FAC-2023-009' },
  { id: 'pay004', date: '2023-04-01', amount: 100000, status: 'completed', invoiceNumber: 'FAC-2023-006' },
]

// Hook principal
export function useResellerAccount() {
  const [isLoading, setIsLoading] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  
  const [profile, setProfile] = useState<ResellerProfile>(MOCK_PROFILE)
  const [address, setAddress] = useState<ResellerAddress>(MOCK_ADDRESS)
  const [business, setBusiness] = useState<BusinessInfo>(MOCK_BUSINESS)
  const [subscription, setSubscription] = useState<Subscription>(MOCK_SUBSCRIPTION)
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>(MOCK_PAYMENT_HISTORY)

  // Mettre à jour le profil
  const updateProfile = useCallback(async (data: Partial<ResellerProfile>): Promise<boolean> => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      setProfile(prev => ({ ...prev, ...data }))
      setFeedback({ type: 'success', message: 'Profil mis à jour avec succès' })
      return true
    } catch {
      setFeedback({ type: 'error', message: 'Erreur lors de la mise à jour' })
      return false
    } finally {
      setIsLoading(false)
      setTimeout(() => setFeedback(null), 3000)
    }
  }, [])

  // Mettre à jour l'adresse
  const updateAddress = useCallback(async (data: Partial<ResellerAddress>): Promise<boolean> => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      setAddress(prev => ({ ...prev, ...data }))
      setFeedback({ type: 'success', message: 'Adresse mise à jour avec succès' })
      return true
    } catch {
      setFeedback({ type: 'error', message: 'Erreur lors de la mise à jour' })
      return false
    } finally {
      setIsLoading(false)
      setTimeout(() => setFeedback(null), 3000)
    }
  }, [])

  // Mettre à jour les informations professionnelles
  const updateBusiness = useCallback(async (data: Partial<BusinessInfo>): Promise<boolean> => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      setBusiness(prev => ({ ...prev, ...data }))
      setFeedback({ type: 'success', message: 'Informations professionnelles mises à jour' })
      return true
    } catch {
      setFeedback({ type: 'error', message: 'Erreur lors de la mise à jour' })
      return false
    } finally {
      setIsLoading(false)
      setTimeout(() => setFeedback(null), 3000)
    }
  }, [])

  // Uploader la photo de profil
  const uploadAvatar = useCallback(async (file: File): Promise<boolean> => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setProfile(prev => ({ ...prev, avatar: URL.createObjectURL(file) }))
      setFeedback({ type: 'success', message: 'Photo de profil mise à jour' })
      return true
    } catch {
      setFeedback({ type: 'error', message: 'Erreur lors de l\'upload' })
      return false
    } finally {
      setIsLoading(false)
      setTimeout(() => setFeedback(null), 3000)
    }
  }, [])

  // Supprimer la photo de profil
  const deleteAvatar = useCallback(async (): Promise<boolean> => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      setProfile(prev => ({ ...prev, avatar: null }))
      setFeedback({ type: 'success', message: 'Photo de profil supprimée' })
      return true
    } catch {
      setFeedback({ type: 'error', message: 'Erreur lors de la suppression' })
      return false
    } finally {
      setIsLoading(false)
      setTimeout(() => setFeedback(null), 3000)
    }
  }, [])

  // Télécharger les documents
  const downloadDocument = useCallback(async (type: string): Promise<boolean> => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      console.log('Downloading document:', type)
      return true
    } catch {
      setFeedback({ type: 'error', message: 'Erreur lors du téléchargement' })
      return false
    } finally {
      setIsLoading(false)
      setTimeout(() => setFeedback(null), 3000)
    }
  }, [])

  // Contacter le support
  const contactSupport = useCallback(async (subject: string, message: string): Promise<boolean> => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      console.log('Contact support:', subject, message)
      setFeedback({ type: 'success', message: 'Message envoyé au support' })
      return true
    } catch {
      setFeedback({ type: 'error', message: 'Erreur lors de l\'envoi' })
      return false
    } finally {
      setIsLoading(false)
      setTimeout(() => setFeedback(null), 3000)
    }
  }, [])

  return {
    isLoading,
    feedback,
    profile,
    address,
    business,
    subscription,
    paymentHistory,
    updateProfile,
    updateAddress,
    updateBusiness,
    uploadAvatar,
    deleteAvatar,
    downloadDocument,
    contactSupport,
  }
}

export default useResellerAccount
