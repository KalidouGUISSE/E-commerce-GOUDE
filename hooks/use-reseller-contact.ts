/**
 * useResellerContact Hook - Gestion du contact support
 * 
 * Ce hook gère :
 * - Formulaire de contact
 * - Historique des contacts
 * - Informations de contact快速
 */

'use client'

import { useState, useCallback } from 'react'

// Types pour les contacts
export interface ContactMessage {
  id: string
  subject: string
  category: 'general' | 'sales' | 'technical' | 'billing' | 'partnership'
  priority: 'low' | 'medium' | 'high'
  message: string
  attachments: string[]
  createdAt: string
  status: 'sent' | 'read' | 'replied'
}

export interface ContactInfo {
  email: string
  phone: string
  address: string
  hours: string
  responseTime: string
}

// Informations de contact de l'entreprise
const CONTACT_INFO: ContactInfo = {
  email: 'support@pagnetisse.sn',
  phone: '+221 33 123 45 67',
  address: 'Dakar, Sénégal',
  hours: 'Lun-Ven: 8h-18h | Sam: 9h-13h',
  responseTime: '24-48h ouvrées',
}

// Données mockées des messages
const MOCK_MESSAGES: ContactMessage[] = [
  {
    id: 'msg001',
    subject: 'Question sur les délais de livraison',
    category: 'general',
    priority: 'medium',
    message: 'Je voudrais savoir quels sont les délais de livraison pour la zone de Thiès.',
    attachments: [],
    createdAt: '2024-02-04T10:30:00Z',
    status: 'replied',
  },
  {
    id: 'msg002',
    subject: 'Demande de devis pour grosse commande',
    category: 'sales',
    priority: 'high',
    message: 'Nous souhaiterions commander 500 pagines pour un mariage. Pouvez-vous nous faire un devis?',
    attachments: ['devis_mariage.pdf'],
    createdAt: '2024-02-03T14:20:00Z',
    status: 'read',
  },
  {
    id: 'msg003',
    subject: 'Problème avec mon compte revendeur',
    category: 'technical',
    priority: 'high',
    message: 'Je n\'arrive pas à accéder à mes statistiques depuis ce matin.',
    attachments: [],
    createdAt: '2024-02-02T09:15:00Z',
    status: 'sent',
  },
]

// Hook principal
export function useResellerContact() {
  const [isLoading, setIsLoading] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [messages, setMessages] = useState<ContactMessage[]>(MOCK_MESSAGES)
  const [contactInfo] = useState<ContactInfo>(CONTACT_INFO)

  const sendMessage = useCallback(async (data: Omit<ContactMessage, 'id' | 'createdAt' | 'status'>): Promise<boolean> => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const newMessage: ContactMessage = {
        ...data,
        id: `msg${Date.now()}`,
        createdAt: new Date().toISOString(),
        status: 'sent',
      }
      
      setMessages(prev => [newMessage, ...prev])
      setFeedback({ type: 'success', message: 'Message envoyé avec succès!' })
      return true
    } catch {
      setFeedback({ type: 'error', message: 'Erreur lors de l\'envoi du message' })
      return false
    } finally {
      setIsLoading(false)
      setTimeout(() => setFeedback(null), 3000)
    }
  }, [])

  const clearFeedback = useCallback(() => {
    setFeedback(null)
  }, [])

  return {
    isLoading,
    feedback,
    messages,
    contactInfo,
    sendMessage,
    clearFeedback,
  }
}

export default useResellerContact
