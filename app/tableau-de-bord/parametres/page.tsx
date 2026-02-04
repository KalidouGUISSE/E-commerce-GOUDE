"use client"

import React, { useState, useEffect, useCallback } from "react"
import {
  Settings,
  Users,
  Shield,
  Bell,
  Database,
  Activity,
  Save,
  RefreshCw,
  CheckCircle,
  XCircle,
  Lock,
  Eye,
  EyeOff,
  Plus,
  Edit,
  Trash2,
  Download,
  Upload,
  AlertTriangle,
  Clock,
  Calendar,
  Mail,
  Globe,
  Smartphone,
  ShieldCheck,
  ShieldAlert,
  History,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import {
  useSettings,
  type AdminUser,
  type Role,
  type Permission,
  type SystemSettings,
  type NotificationSettings,
  type ActivityLog,
  type BackupInfo,
} from "@/hooks/use-settings"
import { useToast } from "@/components/ui/use-toast"

// Constants
const ITEMS_PER_PAGE = 10

const ROLE_COLORS: Record<string, string> = {
  super_admin: "bg-red-100 text-red-800",
  admin: "bg-blue-100 text-blue-800",
  moderator: "bg-green-100 text-green-800",
}

const LOG_CATEGORIES = [
  { value: "all", label: "Toutes" },
  { value: "Authentification", label: "Authentification" },
  { value: "Paramètres", label: "Paramètres" },
  { value: "Utilisateurs", label: "Utilisateurs" },
  { value: "Commandes", label: "Commandes" },
  { value: "Contenu", label: "Contenu" },
]

export default function SettingsPage() {
  const {
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
    isLoading,
  } = useSettings()
  const { toast } = useToast()

  // Active tab
  const [activeTab, setActiveTab] = useState("general")

  // Data states
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(null)
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings | null>(null)
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([])
  const [backups, setBackups] = useState<BackupInfo[]>([])

  // Dialog states
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false)
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false)
  const [isBackupDialogOpen, setIsBackupDialogOpen] = useState(false)
  const [isRestoreConfirmOpen, setIsRestoreConfirmOpen] = useState(false)
  const [selectedBackup, setSelectedBackup] = useState<BackupInfo | null>(null)

  // Form states
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)
  const [userFormData, setUserFormData] = useState({
    name: "",
    email: "",
    role: "admin" as AdminUser["role"],
    password: "",
  })
  const [selectedRolePermissions, setSelectedRolePermissions] = useState<string[]>([])
  const [editingRole, setEditingRole] = useState<Role | null>(null)

  // Password visibility
  const [showPassword, setShowPassword] = useState(false)

  // Load data
  const loadData = useCallback(async () => {
    const [users, rolesData, perms, settings, notifSettings, logs, backupsData] = await Promise.all([
      getAdminUsers(),
      getRoles(),
      getPermissions(),
      getSystemSettings(),
      getNotificationSettings(),
      getActivityLogs(),
      getBackups(),
    ])
    setAdminUsers(users)
    setRoles(rolesData)
    setPermissions(perms)
    setSystemSettings(settings)
    setNotificationSettings(notifSettings)
    setActivityLogs(logs)
    setBackups(backupsData)
  }, [getAdminUsers, getRoles, getPermissions, getSystemSettings, getNotificationSettings, getActivityLogs, getBackups])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Handle user dialog
  const handleOpenUserDialog = (user?: AdminUser) => {
    if (user) {
      setEditingUser(user)
      setUserFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        password: "",
      })
    } else {
      setEditingUser(null)
      setUserFormData({ name: "", email: "", role: "admin", password: "" })
    }
    setIsUserDialogOpen(true)
  }

  const handleSaveUser = async () => {
    if (!userFormData.name || !userFormData.email) {
      toast({ variant: "destructive", title: "Erreur", description: "Veuillez remplir tous les champs obligatoires" })
      return
    }

    if (editingUser) {
      await updateAdminUser(editingUser.id, { name: userFormData.name, role: userFormData.role })
    } else {
      await createAdminUser({ name: userFormData.name, email: userFormData.email, role: userFormData.role })
    }
    setIsUserDialogOpen(false)
    loadData()
  }

  const handleToggleUserStatus = async (user: AdminUser) => {
    await toggleAdminStatus(user.id)
    loadData()
  }

  // Handle role dialog
  const handleOpenRoleDialog = (role: Role) => {
    setEditingRole(role)
    setSelectedRolePermissions(role.permissions)
    setIsRoleDialogOpen(true)
  }

  const handleSaveRolePermissions = async () => {
    if (editingRole) {
      await updateRolePermissions(editingRole.id, selectedRolePermissions)
      setIsRoleDialogOpen(false)
      loadData()
    }
  }

  // Handle settings changes
  const handleSettingsChange = (key: keyof SystemSettings, value: string | number | boolean) => {
    if (systemSettings) {
      setSystemSettings({ ...systemSettings, [key]: value })
    }
  }

  const handleSaveSettings = async () => {
    if (systemSettings) {
      await updateSystemSettings(systemSettings)
    }
  }

  const handleNotificationChange = (key: keyof NotificationSettings, value: boolean) => {
    if (notificationSettings) {
      setNotificationSettings({ ...notificationSettings, [key]: value })
    }
  }

  const handleSaveNotifications = async () => {
    if (notificationSettings) {
      await updateNotificationSettings(notificationSettings)
    }
  }

  // Handle backups
  const handleCreateBackup = async () => {
    await createBackup()
    loadData()
  }

  const handleOpenRestoreConfirm = (backup: BackupInfo) => {
    setSelectedBackup(backup)
    setIsRestoreConfirmOpen(true)
  }

  const handleRestoreBackup = async () => {
    if (selectedBackup) {
      await restoreBackup(selectedBackup.id)
      setIsRestoreConfirmOpen(false)
      loadData()
    }
  }

  // Get permissions by category
  const permissionsByCategory = permissions.reduce((acc, perm) => {
    if (!acc[perm.category]) {
      acc[perm.category] = []
    }
    acc[perm.category].push(perm)
    return acc
  }, {} as Record<string, Permission[]>)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Paramètres Système</h1>
          <p className="text-muted-foreground">
            Configurez les paramètres globaux et gérez les accès administrateurs
          </p>
        </div>
        <Button onClick={handleSaveSettings} disabled={isLoading}>
          <Save className="mr-2 h-4 w-4" />
          Enregistrer les modifications
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 lg:grid-cols-7">
          <TabsTrigger value="general" className="gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Général</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Sécurité</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Admins</span>
          </TabsTrigger>
          <TabsTrigger value="roles" className="gap-2">
            <ShieldCheck className="h-4 w-4" />
            <span className="hidden sm:inline">Rôles</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="logs" className="gap-2">
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">Logs</span>
          </TabsTrigger>
          <TabsTrigger value="backup" className="gap-2">
            <Database className="h-4 w-4" />
            <span className="hidden sm:inline">Sauvegarde</span>
          </TabsTrigger>
        </TabsList>

        {/* General & Security Tab */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres du Site</CardTitle>
              <CardDescription>Configuration générale de l'application</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="site_name">Nom du site</Label>
                  <Input
                    id="site_name"
                    value={systemSettings?.site_name || ""}
                    onChange={(e) => handleSettingsChange("site_name", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="site_url">URL du site</Label>
                  <Input
                    id="site_url"
                    value={systemSettings?.site_url || ""}
                    onChange={(e) => handleSettingsChange("site_url", e.target.value)}
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="currency">Devise</Label>
                  <Select
                    value={systemSettings?.default_currency || "XOF"}
                    onValueChange={(value) => handleSettingsChange("default_currency", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="XOF">XOF (FCFA)</SelectItem>
                      <SelectItem value="EUR">EUR (Euro)</SelectItem>
                      <SelectItem value="USD">USD (Dollar)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Fuseau horaire</Label>
                  <Select
                    value={systemSettings?.timezone || "Africa/Dakar"}
                    onValueChange={(value) => handleSettingsChange("timezone", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Africa/Dakar">Dakar (UTC+0)</SelectItem>
                      <SelectItem value="Europe/Paris">Paris (UTC+1)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="items_per_page">Éléments par page</Label>
                  <Input
                    id="items_per_page"
                    type="number"
                    value={systemSettings?.items_per_page || 10}
                    onChange={(e) => handleSettingsChange("items_per_page", parseInt(e.target.value))}
                  />
                </div>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-medium">Mode maintenance</p>
                    <p className="text-sm text-muted-foreground">
                      Empêche l'accès des utilisateurs ordinaires
                    </p>
                  </div>
                </div>
                <Switch
                  checked={systemSettings?.maintenance_mode || false}
                  onCheckedChange={(checked) => handleSettingsChange("maintenance_mode", checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Politiques de Mot de Passe</CardTitle>
              <CardDescription>Exigences de sécurité pour les mots de passe</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="password_min_length">Longueur minimale</Label>
                  <Input
                    id="password_min_length"
                    type="number"
                    value={systemSettings?.password_min_length || 8}
                    onChange={(e) => handleSettingsChange("password_min_length", parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max_login_attempts">Tentatives de connexion max</Label>
                  <Input
                    id="max_login_attempts"
                    type="number"
                    value={systemSettings?.max_login_attempts || 5}
                    onChange={(e) => handleSettingsChange("max_login_attempts", parseInt(e.target.value))}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Caractère spécial requis</p>
                    <p className="text-sm text-muted-foreground">
                      Au moins un caractère spécial (!@#$%...)
                    </p>
                  </div>
                  <Switch
                    checked={systemSettings?.password_require_special || false}
                    onCheckedChange={(checked) => handleSettingsChange("password_require_special", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Chiffre requis</p>
                    <p className="text-sm text-muted-foreground">
                      Au moins un chiffre (0-9)
                    </p>
                  </div>
                  <Switch
                    checked={systemSettings?.password_require_number || false}
                    onCheckedChange={(checked) => handleSettingsChange("password_require_number", checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Authentification à Deux Facteurs (2FA)</CardTitle>
              <CardDescription>Sécurisation supplémentaire des comptes administrateurs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Smartphone className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">2FA requis pour tous les admins</p>
                    <p className="text-sm text-muted-foreground">
                      Chaque administrateur devra configurer Google Authenticator
                    </p>
                  </div>
                </div>
                <Switch
                  checked={systemSettings?.two_factor_required || false}
                  onCheckedChange={(checked) => handleSettingsChange("two_factor_required", checked)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Configuration SMTP</CardTitle>
              <CardDescription>Paramètres pour l'envoi d'emails</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="smtp_host">Hôte SMTP</Label>
                  <Input
                    id="smtp_host"
                    value={systemSettings?.smtp_host || ""}
                    onChange={(e) => handleSettingsChange("smtp_host", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp_port">Port SMTP</Label>
                  <Input
                    id="smtp_port"
                    type="number"
                    value={systemSettings?.smtp_port || 587}
                    onChange={(e) => handleSettingsChange("smtp_port", parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp_from">Email expéditeur</Label>
                  <Input
                    id="smtp_from"
                    type="email"
                    value={systemSettings?.smtp_from_email || ""}
                    onChange={(e) => handleSettingsChange("smtp_from_email", e.target.value)}
                  />
                </div>
              </div>
              <Button variant="outline" className="w-full">
                <Mail className="mr-2 h-4 w-4" />
                Tester la configuration email
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Comptes Administrateurs</CardTitle>
                <CardDescription>Gérez les comptes avec accès administrateur</CardDescription>
              </div>
              <Button onClick={() => handleOpenUserDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Ajouter un admin
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {adminUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge className={ROLE_COLORS[user.role]}>
                        {user.role.replace("_", " ")}
                      </Badge>
                      <Badge variant={user.is_2fa_enabled ? "default" : "outline"}>
                        {user.is_2fa_enabled ? "2FA activé" : "2FA désactivé"}
                      </Badge>
                      <Badge variant={user.is_active ? "default" : "destructive"}>
                        {user.is_active ? "Actif" : "Inactif"}
                      </Badge>
                      {user.last_login && (
                        <span className="text-xs text-muted-foreground">
                          Dernière connexion: {formatDate(user.last_login)}
                        </span>
                      )}
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenUserDialog(user)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleUserStatus(user)}
                          className={user.is_active ? "text-amber-600" : "text-green-600"}
                        >
                          {user.is_active ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Roles Tab */}
        <TabsContent value="roles" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Rôles et Permissions</CardTitle>
              <CardDescription>Configurez les droits d'accès pour chaque rôle</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {roles.map((role) => (
                  <div
                    key={role.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <ShieldCheck className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{role.name}</p>
                        <p className="text-sm text-muted-foreground">{role.description}</p>
                        <div className="flex gap-1 mt-1">
                          <Badge variant="outline">{role.users_count} utilisateur(s)</Badge>
                          <Badge variant="secondary">{role.permissions.length} permission(s)</Badge>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" onClick={() => handleOpenRoleDialog(role)}>
                      Gérer les permissions
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres de Notification</CardTitle>
              <CardDescription>Configurez les notifications par email</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Bell className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Activer les notifications email</p>
                    <p className="text-sm text-muted-foreground">
                      Recevoir des notifications pour les événements importants
                    </p>
                  </div>
                </div>
                <Switch
                  checked={notificationSettings?.email_notifications || false}
                  onCheckedChange={(checked) => handleNotificationChange("email_notifications", checked)}
                />
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Événements surveillés</h4>
                {[
                  { key: "new_user_registration", label: "Nouvelle inscription", desc: "Lorsqu'un nouvel utilisateur s'inscrit" },
                  { key: "new_order", label: "Nouvelle commande", desc: "Lorsqu'une nouvelle commande est passée" },
                  { key: "payment_received", label: "Paiement reçu", desc: "Lorsqu'un paiement est confirmé" },
                  { key: "low_stock_alert", label: "Stock faible", desc: "Lorsqu'un produit est en rupture de stock" },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{item.label}</p>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                    <Switch
                      checked={notificationSettings?.[item.key as keyof NotificationSettings] || false}
                      onCheckedChange={(checked) => handleNotificationChange(item.key as keyof NotificationSettings, checked)}
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Rapports</h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Résumé quotidien</p>
                      <p className="text-sm text-muted-foreground">Recevoir un résumé chaque matin</p>
                    </div>
                    <Switch
                      checked={notificationSettings?.daily_summary || false}
                      onCheckedChange={(checked) => handleNotificationChange("daily_summary", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Rapport hebdomadaire</p>
                      <p className="text-sm text-muted-foreground">Recevoir un rapport chaque semaine</p>
                    </div>
                    <Switch
                      checked={notificationSettings?.weekly_report || false}
                      onCheckedChange={(checked) => handleNotificationChange("weekly_report", checked)}
                    />
                  </div>
                </div>
              </div>

              <Button onClick={handleSaveNotifications} disabled={isLoading}>
                <Save className="mr-2 h-4 w-4" />
                Enregistrer les notifications
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Logs Tab */}
        <TabsContent value="logs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Historique d'Activité</CardTitle>
              <CardDescription>Journal des actions effectuées par les administrateurs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <Select defaultValue="all">
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LOG_CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  {activityLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex flex-col md:flex-row md:items-center justify-between p-3 border rounded-lg gap-2"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <div>
                          <p className="font-medium">{log.action}</p>
                          <p className="text-sm text-muted-foreground">{log.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{log.user_name}</span>
                        <span>{log.ip_address}</span>
                        <span>{formatDate(log.created_at)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Backup Tab */}
        <TabsContent value="backup" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Sauvegardes</CardTitle>
                <CardDescription>Gérez les sauvegardes de la base de données</CardDescription>
              </div>
              <Button onClick={handleCreateBackup} disabled={isLoading}>
                <Download className="mr-2 h-4 w-4" />
                Nouvelle sauvegarde
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {backups.map((backup) => (
                  <div
                    key={backup.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Database className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{backup.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {backup.size} • {formatDate(backup.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="outline">{backup.type}</Badge>
                      <Badge
                        variant={backup.status === "completed" ? "default" : "destructive"}
                      >
                        {backup.status}
                      </Badge>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" title="Télécharger">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Restaurer"
                          onClick={() => handleOpenRestoreConfirm(backup)}
                        >
                          <Upload className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* User Dialog */}
      <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingUser ? "Modifier l'administrateur" : "Nouvel administrateur"}</DialogTitle>
            <DialogDescription>
              {editingUser ? "Modifiez les informations de l'administrateur" : "Ajoutez un nouveau compte administrateur"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="user_name">Nom complet *</Label>
              <Input
                id="user_name"
                value={userFormData.name}
                onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="user_email">Email *</Label>
              <Input
                id="user_email"
                type="email"
                value={userFormData.email}
                onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
              />
            </div>
            {!editingUser && (
              <div className="space-y-2">
                <Label htmlFor="user_password">Mot de passe *</Label>
                <div className="relative">
                  <Input
                    id="user_password"
                    type={showPassword ? "text" : "password"}
                    value={userFormData.password}
                    onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="user_role">Rôle</Label>
              <Select
                value={userFormData.role}
                onValueChange={(value) => setUserFormData({ ...userFormData, role: value as AdminUser["role"] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="super_admin">Super Administrateur</SelectItem>
                  <SelectItem value="admin">Administrateur</SelectItem>
                  <SelectItem value="moderator">Modérateur</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUserDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSaveUser} disabled={isLoading}>
              {isLoading && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
              {editingUser ? "Enregistrer" : "Créer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Role Permissions Dialog */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Permissions - {editingRole?.name}</DialogTitle>
            <DialogDescription>
              Cochez les permissions à attribuer à ce rôle
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            {Object.entries(permissionsByCategory).map(([category, perms]) => (
              <div key={category}>
                <h4 className="font-medium mb-2">{category}</h4>
                <div className="space-y-2">
                  {perms.map((perm) => (
                    <label key={perm.id} className="flex items-center gap-3 p-2 border rounded-lg cursor-pointer hover:bg-muted/50">
                      <input
                        type="checkbox"
                        checked={selectedRolePermissions.includes(perm.slug) || selectedRolePermissions.includes("*")}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedRolePermissions([...selectedRolePermissions, perm.slug])
                          } else {
                            setSelectedRolePermissions(selectedRolePermissions.filter((p) => p !== perm.slug))
                          }
                        }}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <div>
                        <p className="font-medium text-sm">{perm.name}</p>
                        <p className="text-xs text-muted-foreground">{perm.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRoleDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSaveRolePermissions} disabled={isLoading}>
              {isLoading && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
              Enregistrer les permissions
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Restore Confirmation Dialog */}
      <Dialog open={isRestoreConfirmOpen} onOpenChange={setIsRestoreConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la restauration</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir restaurer la sauvegarde "{selectedBackup?.name}" ?
              Cette action remplacera toutes les données actuelles.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <p className="text-sm text-amber-800">
              Cette action est irréversible. Assurez-vous d'avoir une sauvegarde récente.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRestoreConfirmOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleRestoreBackup} disabled={isLoading}>
              {isLoading && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
              Restaurer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
