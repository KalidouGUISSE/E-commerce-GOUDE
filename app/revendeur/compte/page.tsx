/**
 * Page principale du compte revendeur
 * Route: /revendeur/compte
 * 
 * Fonctionnalités:
 * - Informations personnelles
 * - Coordonnées
 * - Informations professionnelles
 * - Abonnement et facturation
 */

'use client'

import { useState, useRef } from 'react'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Building, 
  FileText,
  Calendar,
  Clock,
  CreditCard,
  Download,
  Edit2,
  Camera,
  Trash2,
  Shield,
  MessageCircle,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { useResellerAccount } from '@/hooks/use-reseller-account'
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils'
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
import { Textarea } from '@/components/ui/textarea'

export default function ResellerAccountPage() {
  const {
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
  } = useResellerAccount()

  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false)
  const [isEditAddressOpen, setIsEditAddressOpen] = useState(false)
  const [isContactSupportOpen, setIsContactSupportOpen] = useState(false)
  const [supportMessage, setSupportMessage] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      await uploadAvatar(file)
    }
  }

  const handleContactSupport = async () => {
    if (supportMessage.trim()) {
      await contactSupport('Demande de support', supportMessage)
      setSupportMessage('')
      setIsContactSupportOpen(false)
    }
  }

  const handleDeleteAvatar = async () => {
    await deleteAvatar()
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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mon Compte</h1>
          <p className="text-muted-foreground">
            Gérez vos informations personnelles et professionnelles
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsContactSupportOpen(true)}>
            <MessageCircle className="mr-2 h-4 w-4" />
            Contacter le support
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informations personnelles */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Informations Personnelles</CardTitle>
                <CardDescription>Vos informations de contact</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => setIsEditProfileOpen(true)}>
                <Edit2 className="mr-2 h-4 w-4" />
                Modifier
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="relative">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={profile.avatar || undefined} />
                    <AvatarFallback className="text-2xl">
                      {profile.firstName[0]}{profile.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">
                      {profile.firstName} {profile.lastName}
                    </h3>
                    <Badge variant={profile.status === 'active' ? 'default' : 'secondary'}>
                      {profile.status === 'active' ? 'Actif' : profile.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{profile.companyName}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Membre depuis {formatDate(profile.createdAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Dernière activité: {formatDateTime(profile.lastActivity)}
                    </span>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    Email
                  </Label>
                  <div className="flex items-center gap-2">
                    <span className="flex-1">{profile.email}</span>
                    <Badge variant="outline" className="text-xs">
                      <CheckCircle2 className="w-3 h-3 mr-1 text-green-500" />
                      Vérifié
                    </Badge>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    Téléphone
                  </Label>
                  <div className="flex items-center gap-2">
                    <span className="flex-1">{profile.phone}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Adresse */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Adresse</CardTitle>
                <CardDescription>Votre adresse de livraison et facturation</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => setIsEditAddressOpen(true)}>
                <Edit2 className="mr-2 h-4 w-4" />
                Modifier
              </Button>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <div>{address.street}</div>
                  <div className="text-muted-foreground">
                    {address.postalCode} {address.city}, {address.country}
                  </div>
                </div>
              </div>
              {/* Carte Google Maps simulée */}
              <div className="mt-4 h-32 bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <MapPin className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">Carte Google Maps</p>
                  <p className="text-xs">{address.latitude}, {address.longitude}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informations professionnelles */}
          <Card>
            <CardHeader>
              <CardTitle>Informations Professionnelles</CardTitle>
              <CardDescription>Détails de votre entreprise</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-muted-foreground" />
                    Raison sociale
                  </Label>
                  <p className="font-medium">{business.legalName}</p>
                </div>
                <div className="space-y-1">
                  <Label className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    SIRET
                  </Label>
                  <p className="font-medium">{business.siret}</p>
                </div>
                <div className="space-y-1">
                  <Label className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    SIREN
                  </Label>
                  <p className="font-medium">{business.siren}</p>
                </div>
                <div className="space-y-1">
                  <Label className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-muted-foreground" />
                    TVA Intracommunautaire
                  </Label>
                  <p className="font-medium">{business.vatNumber}</p>
                </div>
                <div className="space-y-1">
                  <Label className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    Code APE/NAF
                  </Label>
                  <p className="font-medium">{business.apeCode}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Colonne latérale */}
        <div className="space-y-6">
          {/* Abonnement */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Abonnement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-primary/10 rounded-lg">
                <Badge variant="default" className="mb-2">
                  {subscription.planName}
                </Badge>
                <div className="text-2xl font-bold">
                  {formatCurrency(150000)}
                  <span className="text-sm font-normal text-muted-foreground">/an</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-sm">
                  <div className="flex justify-between mb-1">
                    <span>Produits</span>
                    <span className="font-medium">124/500</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-[24.8%]" />
                  </div>
                </div>
                <div className="text-sm">
                  <div className="flex justify-between mb-1">
                    <span>Commandes</span>
                    <span className="font-medium">342/1000</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-[34.2%]" />
                  </div>
                </div>
                <div className="text-sm">
                  <div className="flex justify-between mb-1">
                    <span>Clients</span>
                    <span className="font-medium">67/200</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-[33.5%]" />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date de renouvellement</span>
                  <span className="font-medium">{formatDate(subscription.renewalDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Statut</span>
                  <Badge variant={subscription.status === 'active' ? 'default' : 'secondary'}>
                    {subscription.status}
                  </Badge>
                </div>
              </div>

              <Button className="w-full" variant="outline">
                Changer de plan
              </Button>
            </CardContent>
          </Card>

          {/* Historique des paiements */}
          <Card>
            <CardHeader>
              <CardTitle>Historique des Paiements</CardTitle>
              <CardDescription>Vos dernières transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {paymentHistory.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <div className="font-medium">{formatCurrency(payment.amount)}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(payment.date)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={payment.status === 'completed' ? 'default' : 'secondary'}>
                        {payment.status}
                      </Badge>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => downloadDocument(payment.invoiceNumber)}
                        title="Télécharger"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                Voir toutes les factures
              </Button>
            </CardContent>
          </Card>

          {/* Actions rapides */}
          <Card>
            <CardHeader>
              <CardTitle>Actions Rapides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" onClick={() => setIsEditProfileOpen(true)}>
                <Edit2 className="mr-2 h-4 w-4" />
                Modifier le profil
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => setIsContactSupportOpen(true)}>
                <MessageCircle className="mr-2 h-4 w-4" />
                Contacter le support
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Download className="mr-2 h-4 w-4" />
                Télécharger mes données
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialog de modification du profil */}
      <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le profil</DialogTitle>
            <DialogDescription>
              Mettez à jour vos informations personnelles
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom</Label>
                <Input id="firstName" defaultValue={profile.firstName} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nom</Label>
                <Input id="lastName" defaultValue={profile.lastName} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Raison sociale</Label>
              <Input id="company" defaultValue={profile.companyName} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input id="phone" defaultValue={profile.phone} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditProfileOpen(false)}>
              Annuler
            </Button>
            <Button onClick={() => updateProfile({})}>
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de modification de l'adresse */}
      <Dialog open={isEditAddressOpen} onOpenChange={setIsEditAddressOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier l'adresse</DialogTitle>
            <DialogDescription>
              Mettez à jour votre adresse de livraison
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="street">Rue</Label>
              <Input id="street" defaultValue={address.street} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="postalCode">Code postal</Label>
                <Input id="postalCode" defaultValue={address.postalCode} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Ville</Label>
                <Input id="city" defaultValue={address.city} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Pays</Label>
              <Input id="country" defaultValue={address.country} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditAddressOpen(false)}>
              Annuler
            </Button>
            <Button onClick={() => updateAddress({})}>
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de contact support */}
      <Dialog open={isContactSupportOpen} onOpenChange={setIsContactSupportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contacter le support</DialogTitle>
            <DialogDescription>
              Enviez-nous un message, nous vous répondrons sous 24h
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Décrivez votre demande..."
                value={supportMessage}
                onChange={(e) => setSupportMessage(e.target.value)}
                rows={5}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsContactSupportOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleContactSupport} disabled={!supportMessage.trim()}>
              Envoyer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
