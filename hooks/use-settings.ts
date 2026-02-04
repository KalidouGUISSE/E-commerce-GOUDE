"use client"

import { useState, useCallback } from "react"
import { useToast } from "@/components/ui/use-toast"

// Types
export interface AdminUser {
  id: number
  name: string
  email: string
  role: "super_admin" | "admin" | "moderator"
  is_active: boolean
  is_2fa_enabled: boolean
  last_login?: string
  created_at: string
}

export interface Role {
  id: number
  name: string
  slug: string
  description: string
  permissions: string[]
  users_count: number
}

export interface Permission {
  id: number
  name: string
  slug: string
  description: string
  category: string
}

export interface SystemSettings {
  site_name: string
  site_url: string
  maintenance_mode: boolean
  registration_enabled: boolean
  email_verification_required: boolean
  password_min_length: number
  password_require_special: boolean
  password_require_number: boolean
  session_timeout: number
  max_login_attempts: number
  lockout_duration: number
  two_factor_required: boolean
  smtp_host: string
  smtp_port: number
  smtp_from_email: string
  default_currency: string
  timezone: string
  date_format: string
  items_per_page: number
}

export interface NotificationSettings {
  email_notifications: boolean
  new_user_registration: boolean
  new_order: boolean
  low_stock_alert: boolean
  payment_received: boolean
  daily_summary: boolean
  weekly_report: boolean
  marketing_emails: boolean
}

export interface ActivityLog {
  id: number
  user_id: number
  user_name: string
  action: string
  category: string
  description: string
  ip_address: string
  user_agent: string
  created_at: string
}

export interface BackupInfo {
  id: number
  name: string
  size: string
  created_at: string
  type: "full" | "incremental"
  status: "completed" | "failed" | "in_progress"
}

// Mock data
const mockAdminUsers: AdminUser[] = [
  {
    id: 1,
    name: "Administrateur Principal",
    email: "admin@pagnetisse.sn",
    role: "super_admin",
    is_active: true,
    is_2fa_enabled: true,
    last_login: "2024-01-28T10:30:00Z",
    created_at: "2023-01-01T00:00:00Z",
  },
  {
    id: 2,
    name: "Modérateur Content",
    email: "moderateur@pagnetisse.sn",
    role: "moderator",
    is_active: true,
    is_2fa_enabled: false,
    last_login: "2024-01-27T15:45:00Z",
    created_at: "2023-06-15T08:00:00Z",
  },
  {
    id: 3,
    name: "Gestionnaire Commandes",
    email: "gestionnaire@pagnetisse.sn",
    role: "admin",
    is_active: true,
    is_2fa_enabled: true,
    last_login: "2024-01-28T09:15:00Z",
    created_at: "2023-09-01T12:00:00Z",
  },
  {
    id: 4,
    name: "Ancien Admin",
    email: "ancien@pagnetisse.sn",
    role: "admin",
    is_active: false,
    is_2fa_enabled: false,
    created_at: "2023-03-01T10:00:00Z",
  },
]

const mockRoles: Role[] = [
  {
    id: 1,
    name: "Super Administrateur",
    slug: "super_admin",
    description: "Accès complet à toutes les fonctionnalités",
    permissions: ["*"],
    users_count: 1,
  },
  {
    id: 2,
    name: "Administrateur",
    slug: "admin",
    description: "Gestion complète des ressources",
    permissions: [
      "users.read",
      "users.write",
      "users.delete",
      "products.read",
      "products.write",
      "orders.read",
      "orders.write",
      "content.read",
      "content.write",
    ],
    users_count: 2,
  },
  {
    id: 3,
    name: "Modérateur",
    slug: "moderator",
    description: "Modération du contenu uniquement",
    permissions: ["content.read", "content.write", "users.read"],
    users_count: 1,
  },
]

const mockPermissions: Permission[] = [
  { id: 1, name: "Lire utilisateurs", slug: "users.read", description: "Voir la liste des utilisateurs", category: "Utilisateurs" },
  { id: 2, name: "Gérer utilisateurs", slug: "users.write", description: "Créer et modifier des utilisateurs", category: "Utilisateurs" },
  { id: 3, name: "Supprimer utilisateurs", slug: "users.delete", description: "Supprimer des utilisateurs", category: "Utilisateurs" },
  { id: 4, name: "Lire produits", slug: "products.read", description: "Voir les produits", category: "Produits" },
  { id: 5, name: "Gérer produits", slug: "products.write", description: "Créer et modifier des produits", category: "Produits" },
  { id: 6, name: "Supprimer produits", slug: "products.delete", description: "Supprimer des produits", category: "Produits" },
  { id: 7, name: "Lire commandes", slug: "orders.read", description: "Voir les commandes", category: "Commandes" },
  { id: 8, name: "Gérer commandes", slug: "orders.write", description: "Modifier le statut des commandes", category: "Commandes" },
  { id: 9, name: "Lire contenu", slug: "content.read", description: "Voir le contenu", category: "Contenu" },
  { id: 10, name: "Gérer contenu", slug: "content.write", description: "Créer et modifier du contenu", category: "Contenu" },
  { id: 11, name: "Lire statistiques", slug: "stats.read", description: "Voir les statistiques", category: "Statistiques" },
  { id: 12, name: "Gérer paramètres", slug: "settings.write", description: "Modifier les paramètres système", category: "Paramètres" },
]

const mockActivityLogs: ActivityLog[] = [
  {
    id: 1,
    user_id: 1,
    user_name: "Administrateur Principal",
    action: "Connexion",
    category: "Authentification",
    description: "Connexion réussie",
    ip_address: "192.168.1.100",
    user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    created_at: "2024-01-28T10:30:00Z",
  },
  {
    id: 2,
    user_id: 1,
    user_name: "Administrateur Principal",
    action: "Mise à jour",
    category: "Paramètres",
    description: "Modification des paramètres de sécurité",
    ip_address: "192.168.1.100",
    user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    created_at: "2024-01-28T10:25:00Z",
  },
  {
    id: 3,
    user_id: 3,
    user_name: "Gestionnaire Commandes",
    action: "Création",
    category: "Commandes",
    description: "Nouvelle commande #1234 créée",
    ip_address: "192.168.1.105",
    user_agent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
    created_at: "2024-01-28T09:15:00Z",
  },
  {
    id: 4,
    user_id: 2,
    user_name: "Modérateur Content",
    action: "Publication",
    category: "Contenu",
    description: "Article 'Nouvelle collection' publié",
    ip_address: "192.168.1.108",
    user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    created_at: "2024-01-27T16:00:00Z",
  },
  {
    id: 5,
    user_id: 1,
    user_name: "Administrateur Principal",
    action: "Ajout",
    category: "Utilisateurs",
    description: "Nouvel utilisateur 'test@test.com' ajouté",
    ip_address: "192.168.1.100",
    user_agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    created_at: "2024-01-27T14:30:00Z",
  },
]

const mockBackups: BackupInfo[] = [
  {
    id: 1,
    name: "backup_2024-01-28_full",
    size: "256 MB",
    created_at: "2024-01-28T02:00:00Z",
    type: "full",
    status: "completed",
  },
  {
    id: 2,
    name: "backup_2024-01-27_incremental",
    size: "12 MB",
    created_at: "2024-01-27T02:00:00Z",
    type: "incremental",
    status: "completed",
  },
  {
    id: 3,
    name: "backup_2024-01-26_incremental",
    size: "8 MB",
    created_at: "2024-01-26T02:00:00Z",
    type: "incremental",
    status: "completed",
  },
]

const defaultSettings: SystemSettings = {
  site_name: "Pagne Tissé Distribution",
  site_url: "https://pagnetisse.sn",
  maintenance_mode: false,
  registration_enabled: true,
  email_verification_required: true,
  password_min_length: 8,
  password_require_special: true,
  password_require_number: true,
  session_timeout: 60,
  max_login_attempts: 5,
  lockout_duration: 30,
  two_factor_required: false,
  smtp_host: "smtp.pagnetisse.sn",
  smtp_port: 587,
  smtp_from_email: "noreply@pagnetisse.sn",
  default_currency: "XOF",
  timezone: "Africa/Dakar",
  date_format: "DD/MM/YYYY",
  items_per_page: 10,
}

const defaultNotificationSettings: NotificationSettings = {
  email_notifications: true,
  new_user_registration: true,
  new_order: true,
  low_stock_alert: true,
  payment_received: true,
  daily_summary: false,
  weekly_report: true,
  marketing_emails: false,
}

export function useSettings() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  // Admin Users
  const getAdminUsers = useCallback(async (): Promise<AdminUser[]> => {
    setIsLoading(true)
    setError(null)
    try {
      await new Promise((resolve) => setTimeout(resolve, 300))
      return mockAdminUsers
    } catch {
      setError("Erreur lors de la récupération des administrateurs")
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])

  const createAdminUser = useCallback(async (data: Partial<AdminUser>): Promise<boolean> => {
    setIsLoading(true)
    setError(null)
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))
      toast({ title: "Succès", description: "Administrateur créé avec succès" })
      return true
    } catch {
      toast({ variant: "destructive", title: "Erreur", description: "Erreur lors de la création" })
      return false
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  const updateAdminUser = useCallback(async (id: number, data: Partial<AdminUser>): Promise<boolean> => {
    setIsLoading(true)
    setError(null)
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))
      toast({ title: "Succès", description: "Administrateur mis à jour" })
      return true
    } catch {
      toast({ variant: "destructive", title: "Erreur", description: "Erreur lors de la mise à jour" })
      return false
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  const toggleAdminStatus = useCallback(async (id: number): Promise<boolean> => {
    setIsLoading(true)
    setError(null)
    try {
      await new Promise((resolve) => setTimeout(resolve, 300))
      toast({ title: "Succès", description: "Statut modifié avec succès" })
      return true
    } catch {
      toast({ variant: "destructive", title: "Erreur", description: "Erreur lors de la modification" })
      return false
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  // Roles & Permissions
  const getRoles = useCallback(async (): Promise<Role[]> => {
    setIsLoading(true)
    setError(null)
    try {
      await new Promise((resolve) => setTimeout(resolve, 300))
      return mockRoles
    } catch {
      setError("Erreur lors de la récupération des rôles")
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getPermissions = useCallback(async (): Promise<Permission[]> => {
    setIsLoading(true)
    setError(null)
    try {
      await new Promise((resolve) => setTimeout(resolve, 200))
      return mockPermissions
    } catch {
      setError("Erreur lors de la récupération des permissions")
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateRolePermissions = useCallback(async (roleId: number, permissions: string[]): Promise<boolean> => {
    setIsLoading(true)
    setError(null)
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))
      toast({ title: "Succès", description: "Permissions mises à jour" })
      return true
    } catch {
      toast({ variant: "destructive", title: "Erreur", description: "Erreur lors de la mise à jour" })
      return false
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  // System Settings
  const getSystemSettings = useCallback(async (): Promise<SystemSettings> => {
    setIsLoading(true)
    setError(null)
    try {
      await new Promise((resolve) => setTimeout(resolve, 200))
      return defaultSettings
    } catch {
      setError("Erreur lors de la récupération des paramètres")
      return defaultSettings
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateSystemSettings = useCallback(async (settings: Partial<SystemSettings>): Promise<boolean> => {
    setIsLoading(true)
    setError(null)
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))
      toast({ title: "Succès", description: "Paramètres mis à jour" })
      return true
    } catch {
      toast({ variant: "destructive", title: "Erreur", description: "Erreur lors de la mise à jour" })
      return false
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  // Notification Settings
  const getNotificationSettings = useCallback(async (): Promise<NotificationSettings> => {
    setIsLoading(true)
    setError(null)
    try {
      await new Promise((resolve) => setTimeout(resolve, 200))
      return defaultNotificationSettings
    } catch {
      setError("Erreur lors de la récupération des notifications")
      return defaultNotificationSettings
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateNotificationSettings = useCallback(async (settings: Partial<NotificationSettings>): Promise<boolean> => {
    setIsLoading(true)
    setError(null)
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))
      toast({ title: "Succès", description: "Paramètres de notification mis à jour" })
      return true
    } catch {
      toast({ variant: "destructive", title: "Erreur", description: "Erreur lors de la mise à jour" })
      return false
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  // Activity Logs
  const getActivityLogs = useCallback(async (): Promise<ActivityLog[]> => {
    setIsLoading(true)
    setError(null)
    try {
      await new Promise((resolve) => setTimeout(resolve, 300))
      return mockActivityLogs
    } catch {
      setError("Erreur lors de la récupération des logs")
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Backups
  const getBackups = useCallback(async (): Promise<BackupInfo[]> => {
    setIsLoading(true)
    setError(null)
    try {
      await new Promise((resolve) => setTimeout(resolve, 300))
      return mockBackups
    } catch {
      setError("Erreur lors de la récupération des sauvegardes")
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])

  const createBackup = useCallback(async (): Promise<boolean> => {
    setIsLoading(true)
    setError(null)
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))
      toast({ title: "Succès", description: "Sauvegarde créée avec succès" })
      return true
    } catch {
      toast({ variant: "destructive", title: "Erreur", description: "Erreur lors de la création" })
      return false
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  const restoreBackup = useCallback(async (backupId: number): Promise<boolean> => {
    setIsLoading(true)
    setError(null)
    try {
      await new Promise((resolve) => setTimeout(resolve, 3000))
      toast({ title: "Succès", description: "Sauvegarde restaurée avec succès" })
      return true
    } catch {
      toast({ variant: "destructive", title: "Erreur", description: "Erreur lors de la restauration" })
      return false
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  return {
    isLoading,
    error,
    getAdminUsers,
    createAdminUser,
    updateAdminUser,
    toggleAdminStatus,
    getRoles,
    getPermissions,
    updateRolePermissions,
    getSystemSettings,
    updateSystemSettings,
    getNotificationSettings,
    updateNotificationSettings,
    getActivityLogs,
    getBackups,
    createBackup,
    restoreBackup,
  }
}

