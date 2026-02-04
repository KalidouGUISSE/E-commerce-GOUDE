/**
 * Page de sécurité du compte revendeur
 * Route: /revendeur/compte/securite
 * 
 * Fonctionnalités:
 * - Gestion de l'authentification à deux facteurs
 * - Gestion des mots de passe
 * - Sessions actives
 * - Journal des activités
 * - Clés API
 */

'use client'

import { useState } from 'react'
import { 
  Shield, 
  Lock, 
  Smartphone, 
  Monitor, 
  Globe, 
  Clock,
  Key,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  ExternalLink,
  History,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react'
import { useResellerSecurity } from '@/hooks/use-reseller-security'
import { formatDateTime } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { ScrollArea } from '@/components/ui/scroll-area'

export default function ResellerSecurityPage() {
  const {
    isLoading,
    feedback,
    is2FAEnabled,
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
  } = useResellerSecurity()

  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: '',
  })
  const [twoFACode, setTwoFACode] = useState('')
  const [newApiKeyName, setNewApiKeyName] = useState('')
  const [newApiKeyIps, setNewApiKeyIps] = useState('')

  const handleToggle2FA = async () => {
    await toggle2FA()
  }

  const handleSetup2FA = async (method: 'app' | 'sms') => {
    await setup2FA(method, twoFACode)
    setTwoFACode('')
  }

  const handleChangePassword = async () => {
    await changePassword(passwordData.current, passwordData.new, passwordData.confirm)
    setPasswordData({ current: '', new: '', confirm: '' })
  }

  const handleCreateApiKey = async () => {
    const ips = newApiKeyIps.split(',').map(ip => ip.trim()).filter(Boolean)
    await createApiKey(newApiKeyName, ips)
    setNewApiKeyName('')
    setNewApiKeyIps('')
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'password_change':
        return <Lock className="w-4 h-4" />
      case '2fa_enable':
      case '2fa_disable':
        return <ShieldCheck className="w-4 h-4" />
      case 'login':
        return <Monitor className="w-4 h-4" />
      case 'logout':
        return <Clock className="w-4 h-4" />
      case 'email_change':
        return <Globe className="w-4 h-4" />
      case 'api_key_create':
      case 'api_key_revoke':
        return <Key className="w-4 h-4" />
      default:
        return <Shield className="w-4 h-4" />
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Feedback Toast */}
      {feedback && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-top-2 ${
          feedback.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          {feedback.message}
        </div>
      )}

      {/* En-tête */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Sécurité</h1>
        <p className="text-muted-foreground">
          Gérez la sécurité de votre compte
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Authentification à deux facteurs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Authentification à Deux Facteurs
            </CardTitle>
            <CardDescription>
              Protégez votre compte avec une couche de sécurité supplémentaire
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                {is2FAEnabled ? (
                  <ShieldCheck className="w-8 h-8 text-green-500" />
                ) : (
                  <ShieldAlert className="w-8 h-8 text-yellow-500" />
                )}
                <div>
                  <div className="font-medium">
                    {is2FAEnabled ? '2FA activé' : '2FA désactivé'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {is2FAEnabled 
                      ? 'Votre compte est protégé par l\'authentification à deux facteurs'
                      : 'Activez la 2FA pour sécuriser votre compte'
                    }
                  </div>
                </div>
              </div>
              <Switch 
                checked={is2FAEnabled} 
                onCheckedChange={handleToggle2FA}
                disabled={isLoading}
              />
            </div>

            {is2FAEnabled && (
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIs2FASetupOpen(true)}
                >
                  <Smartphone className="mr-2 h-4 w-4" />
                  Configurer
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Gestion du mot de passe */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Mot de Passe
            </CardTitle>
            <CardDescription>
              Dernière modification: 15 janvier 2024
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Utilisez un mot de passe fort avec au moins 8 caractères, incluant des lettres majuscules, minuscules et des chiffres.
              </p>
              <Button onClick={() => setIsChangePasswordOpen(true)}>
                <Lock className="mr-2 h-4 w-4" />
                Changer le mot de passe
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sessions actives */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="w-5 h-5" />
                Sessions Actives
              </CardTitle>
              <CardDescription>
                Gérez les appareils connectés à votre compte
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={revokeAllSessions}>
              <Trash2 className="mr-2 h-4 w-4" />
              Révoquer tout
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    {session.device === 'Mobile' ? (
                      <Smartphone className="w-8 h-8 p-2 bg-background rounded-lg" />
                    ) : (
                      <Monitor className="w-8 h-8 p-2 bg-background rounded-lg" />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{session.browser}</span>
                        {session.isCurrent && (
                          <Badge variant="default" className="text-xs">Actuel</Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {session.os} • {session.location}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        IP: {session.ip} • {formatDateTime(session.lastActivity)}
                      </div>
                    </div>
                  </div>
                  {!session.isCurrent && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => revokeSession(session.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Clés API */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                Clés API
              </CardTitle>
              <CardDescription>
                Gérez les clés d'accès à l'API
              </CardDescription>
            </div>
            <Button size="sm" onClick={() => setIsCreateApiKeyOpen(true)}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Nouvelle clé
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {apiKeys.map((key) => (
                <div key={key.id} className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{key.name}</span>
                      <Badge variant={key.isActive ? 'default' : 'secondary'}>
                        {key.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => revokeApiKey(key.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                  <div className="text-sm font-mono bg-background p-2 rounded mb-2">
                    {key.key}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Créée: {formatDateTime(key.createdAt)}</span>
                    <span>Dernière utilisation: {formatDateTime(key.lastUsed)}</span>
                  </div>
                  {key.ips.length > 0 && (
                    <div className="mt-2">
                      <span className="text-xs text-muted-foreground">IPs autorisées: </span>
                      <span className="text-xs">{key.ips.join(', ')}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Journal des activités */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              Journal des Activités de Sécurité
            </CardTitle>
            <CardDescription>
              Historique des actions de sécurité sur votre compte
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-3">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-4 p-3 hover:bg-muted/50 rounded-lg">
                    <div className="p-2 bg-background rounded-full">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{activity.description}</div>
                      <div className="text-sm text-muted-foreground">
                        {activity.location} • IP: {activity.ip}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatDateTime(activity.timestamp)}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Dialog de configuration 2FA */}
      <Dialog open={is2FASetupOpen} onOpenChange={setIs2FASetupOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configurer l'Authentification à Deux Facteurs</DialogTitle>
            <DialogDescription>
              Choisissez votre méthode de vérification
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="h-24 flex flex-col gap-2"
                onClick={() => handleSetup2FA('app')}
              >
                <Smartphone className="w-8 h-8" />
                <span>Application Authentificateur</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-24 flex flex-col gap-2"
                onClick={() => handleSetup2FA('sms')}
              >
                <Globe className="w-8 h-8" />
                <span>SMS</span>
              </Button>
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">Code de vérification</Label>
              <Input
                id="code"
                placeholder="Entrez le code à 6 chiffres"
                value={twoFACode}
                onChange={(e) => setTwoFACode(e.target.value)}
                maxLength={6}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIs2FASetupOpen(false)}>
              Annuler
            </Button>
            <Button onClick={() => handleSetup2FA('app')} disabled={twoFACode.length < 6}>
              Vérifier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de changement de mot de passe */}
      <Dialog open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Changer le Mot de Passe</DialogTitle>
            <DialogDescription>
              Utilisez un mot de passe fort et unique
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="current">Mot de passe actuel</Label>
              <Input
                id="current"
                type="password"
                value={passwordData.current}
                onChange={(e) => setPasswordData(prev => ({ ...prev, current: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new">Nouveau mot de passe</Label>
              <Input
                id="new"
                type="password"
                value={passwordData.new}
                onChange={(e) => setPasswordData(prev => ({ ...prev, new: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">Confirmer le mot de passe</Label>
              <Input
                id="confirm"
                type="password"
                value={passwordData.confirm}
                onChange={(e) => setPasswordData(prev => ({ ...prev, confirm: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsChangePasswordOpen(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleChangePassword}
              disabled={!passwordData.current || !passwordData.new || !passwordData.confirm}
            >
              Changer le mot de passe
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de création de clé API */}
      <Dialog open={isCreateApiKeyOpen} onOpenChange={setIsCreateApiKeyOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer une Nouvelle Clé API</DialogTitle>
            <DialogDescription>
              Générez une clé pour accéder à l'API
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="keyName">Nom de la clé</Label>
              <Input
                id="keyName"
                placeholder="ex: Production, Développement..."
                value={newApiKeyName}
                onChange={(e) => setNewApiKeyName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="keyIps">IPs autorisées (séparées par des virgules)</Label>
              <Input
                id="keyIps"
                placeholder="ex: 192.168.1.1, 10.0.0.1"
                value={newApiKeyIps}
                onChange={(e) => setNewApiKeyIps(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Laissez vide pour autoriser toutes les IPs
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateApiKeyOpen(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleCreateApiKey}
              disabled={!newApiKeyName}
            >
              Créer la clé
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
