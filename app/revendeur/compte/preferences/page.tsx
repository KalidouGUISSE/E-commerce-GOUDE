/**
 * Page des préférences du compte revendeur
 * Route: /revendeur/compte/preferences
 * 
 * Fonctionnalités:
 * - Notifications par email
 * - Préférences de communication
 * - Paramètres d'interface
 * - Paramètres de confidentialité
 * - Préférences d'affichage
 */

'use client'

import { useState } from 'react'
import { 
  Bell, 
  Mail, 
  Globe, 
  Eye, 
  Cookie, 
  Palette,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import { useResellerPreferences } from '@/hooks/use-reseller-preferences'
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
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'

export default function ResellerPreferencesPage() {
  const {
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
  } = useResellerPreferences()

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
        <h1 className="text-3xl font-bold tracking-tight">Préférences</h1>
        <p className="text-muted-foreground">
          Personnalisez votre expérience sur la plateforme
        </p>
      </div>

      <div className="grid gap-6">
        {/* Notifications par email */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications par Email
            </CardTitle>
            <CardDescription>
              Choisissez les notifications que vous souhaitez recevoir
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="font-medium">Nouvelles commandes</div>
                  <div className="text-sm text-muted-foreground">
                    Recevez une notification pour chaque nouvelle commande
                  </div>
                </div>
              </div>
              <Switch 
                checked={emailNotifications.newOrders}
                onCheckedChange={(checked) => saveNotifications({ newOrders: checked })}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="font-medium">Confirmations de paiement</div>
                  <div className="text-sm text-muted-foreground">
                    Être informé des paiements reçus
                  </div>
                </div>
              </div>
              <Switch 
                checked={emailNotifications.paymentConfirmations}
                onCheckedChange={(checked) => saveNotifications({ paymentConfirmations: checked })}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <div className="font-medium">Rappels de paiement</div>
                  <div className="text-sm text-muted-foreground">
                    Recevoir des rappels pour les paiements en attente
                  </div>
                </div>
              </div>
              <Switch 
                checked={emailNotifications.paymentReminders}
                onCheckedChange={(checked) => saveNotifications({ paymentReminders: checked })}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Palette className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <div className="font-medium">Nouvelles fonctionnalités</div>
                  <div className="text-sm text-muted-foreground">
                    Être informé des nouvelles fonctionnalités
                  </div>
                </div>
              </div>
              <Switch 
                checked={emailNotifications.newFeatures}
                onCheckedChange={(checked) => saveNotifications({ newFeatures: checked })}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-medium">Newsletter</div>
                  <div className="text-sm text-muted-foreground">
                    Recevoir notre newsletter mensuelle
                  </div>
                </div>
              </div>
              <Switch 
                checked={emailNotifications.newsletter}
                onCheckedChange={(checked) => saveNotifications({ newsletter: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Préférences de communication */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Préférences de Communication
            </CardTitle>
            <CardDescription>
              Personnalisez vos préférences de communication
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Langue préférée</Label>
                <select 
                  className="w-full h-10 px-3 border rounded-md"
                  value={communication.language}
                  onChange={(e) => saveCommunication({ language: e.target.value })}
                >
                  <option value="fr">Français</option>
                  <option value="en">English</option>
                  <option value="wo">Wolof</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Format d'email</Label>
                <select 
                  className="w-full h-10 px-3 border rounded-md"
                  value={communication.emailFormat}
                  onChange={(e) => saveCommunication({ emailFormat: e.target.value as 'html' | 'text' })}
                >
                  <option value="html">HTML (avec mise en forme)</option>
                  <option value="text">Texte brut</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Fréquence des récapitulatifs</Label>
                <select 
                  className="w-full h-10 px-3 border rounded-md"
                  value={communication.summaryFrequency}
                  onChange={(e) => saveCommunication({ summaryFrequency: e.target.value as 'daily' | 'weekly' | 'monthly' | 'never' })}
                >
                  <option value="daily">Quotidien</option>
                  <option value="weekly">Hebdomadaire</option>
                  <option value="monthly">Mensuel</option>
                  <option value="never">Jamais</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Canal de contact préféré</Label>
                <select 
                  className="w-full h-10 px-3 border rounded-md"
                  value={communication.preferredChannel}
                  onChange={(e) => saveCommunication({ preferredChannel: e.target.value as 'email' | 'sms' | 'phone' })}
                >
                  <option value="email">Email</option>
                  <option value="sms">SMS</option>
                  <option value="phone">Téléphone</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Paramètres d'interface */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Paramètres d'Interface
            </CardTitle>
            <CardDescription>
              Personnalisez l'apparence de l'application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Thème</Label>
                <select 
                  className="w-full h-10 px-3 border rounded-md"
                  value={interfaceSettings.theme}
                  onChange={(e) => saveInterface({ theme: e.target.value as 'light' | 'dark' | 'system' })}
                >
                  <option value="light">Clair</option>
                  <option value="dark">Sombre</option>
                  <option value="system">Système</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Fuseau horaire</Label>
                <select 
                  className="w-full h-10 px-3 border rounded-md"
                  value={interfaceSettings.timezone}
                  onChange={(e) => saveInterface({ timezone: e.target.value })}
                >
                  <option value="Africa/Dakar">Dakar (UTC+0)</option>
                  <option value="Europe/Paris">Paris (UTC+1)</option>
                  <option value="America/New_York">New York (UTC-5)</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Format de date</Label>
                <select 
                  className="w-full h-10 px-3 border rounded-md"
                  value={interfaceSettings.dateFormat}
                  onChange={(e) => saveInterface({ dateFormat: e.target.value })}
                >
                  <option value="DD/MM/YYYY">JJ/MM/AAAA</option>
                  <option value="MM/DD/YYYY">MM/JJ/AAAA</option>
                  <option value="YYYY-MM-DD">AAAA-MM-JJ</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Devise d'affichage</Label>
                <select 
                  className="w-full h-10 px-3 border rounded-md"
                  value={interfaceSettings.currency}
                  onChange={(e) => saveInterface({ currency: e.target.value })}
                >
                  <option value="XOF">FCFA (XOF)</option>
                  <option value="EUR">Euro (EUR)</option>
                  <option value="USD">Dollar US (USD)</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Paramètres de confidentialité */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Confidentialité
            </CardTitle>
            <CardDescription>
              Gérez vos paramètres de confidentialité
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Visibilité du profil</Label>
              <select 
                className="w-full h-10 px-3 border rounded-md"
                value={privacy.profileVisibility}
                onChange={(e) => savePrivacy({ profileVisibility: e.target.value as 'public' | 'private' | 'restricted' })}
              >
                <option value="public">Public - Visible par tous</option>
                <option value="restricted">Restreint - Visible par les clients</option>
                <option value="private">Privé - Visible uniquement par vous</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <div className="font-medium">Partage de données anonymisées</div>
                <div className="text-sm text-muted-foreground">
                  Autoriser le partage de données anonymisées pour améliorer nos services
                </div>
              </div>
              <Switch 
                checked={privacy.shareAnonymousData}
                onCheckedChange={(checked) => savePrivacy({ shareAnonymousData: checked })}
              />
            </div>

            <Separator />

            <div>
              <h4 className="font-medium mb-4">Gestion des cookies</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <div className="font-medium">Cookies nécessaires</div>
                    <div className="text-sm text-muted-foreground">
                      Essential pour le fonctionnement du site
                    </div>
                  </div>
                  <Checkbox checked disabled />
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <div className="font-medium">Cookies analytiques</div>
                    <div className="text-sm text-muted-foreground">
                      Aider à améliorer le site
                    </div>
                  </div>
                  <Checkbox 
                    checked={privacy.cookies.analytics}
                    onCheckedChange={(checked) => savePrivacy({ 
                      cookies: { ...privacy.cookies, analytics: checked as boolean } 
                    })}
                  />
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <div className="font-medium">Cookies marketing</div>
                    <div className="text-sm text-muted-foreground">
                      Personnaliser les annonces
                    </div>
                  </div>
                  <Checkbox 
                    checked={privacy.cookies.marketing}
                    onCheckedChange={(checked) => savePrivacy({ 
                      cookies: { ...privacy.cookies, marketing: checked as boolean } 
                    })}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Préférences d'affichage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Préférences d'Affichage
            </CardTitle>
            <CardDescription>
              Personnalisez l'apparence des listes et tableaux
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Éléments par page</Label>
                <select 
                  className="w-full h-10 px-3 border rounded-md"
                  value={display.itemsPerPage}
                  onChange={(e) => saveDisplay({ itemsPerPage: parseInt(e.target.value) })}
                >
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Affichage des listes</Label>
                <select 
                  className="w-full h-10 px-3 border rounded-md"
                  value={display.listView}
                  onChange={(e) => saveDisplay({ listView: e.target.value as 'compact' | 'expanded' })}
                >
                  <option value="compact">Compact</option>
                  <option value="expanded">Étendu</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Ordre de tri par défaut</Label>
                <select 
                  className="w-full h-10 px-3 border rounded-md"
                  value={display.defaultSortOrder}
                  onChange={(e) => saveDisplay({ defaultSortOrder: e.target.value as 'asc' | 'desc' })}
                >
                  <option value="desc">Plus récent en premier</option>
                  <option value="asc">Plus ancien en premier</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
