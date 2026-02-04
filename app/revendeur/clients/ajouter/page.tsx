/**
 * Ajouter Client - Page de création de client pour les revendeurs
 * 
 * Cette page permet aux revendeurs d'ajouter de nouveaux clients
 */

'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  UserPlus,
  Mail,
  Phone,
  MapPin,
  Building,
  Save,
  X,
  CheckCircle,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'

// Type pour les données du formulaire
interface ClientFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  companyName?: string
  address: string
  city: string
  region: string
  notes?: string
}

// Données pour les régions
const REGIONS = [
  'Dakar',
  'Thiès',
  'Saint-Louis',
  'Kaolack',
  'Ziguinchor',
  'Tambacounda',
  'Louga',
  'Diourbel',
  'Fatick',
  'Kaffrine',
  'Kédougou',
  'Sédhiou',
  'Matam',
]

export default function AddClientPage() {
  const router = useRouter()
  const { user, isInitialized } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  
  // État du formulaire
  const [formData, setFormData] = useState<ClientFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    companyName: '',
    address: '',
    city: '',
    region: '',
    notes: '',
  })

  // État des erreurs
  const [errors, setErrors] = useState<Partial<Record<keyof ClientFormData, string>>>({})

  // Vérifier l'authentification
  if (!isInitialized) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Vérifier le rôle revendeur
  if (isInitialized && user?.role !== 'reseller') {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <X className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">Accès refusé</h2>
        <p className="text-muted-foreground">
          Cette page est réservée aux revendeurs.
        </p>
        <Button asChild className="mt-4">
          <Link href="/connexion">Se connecter</Link>
        </Button>
      </div>
    )
  }

  // Gérer les changements de champs
  const handleChange = (field: keyof ClientFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Effacer l'erreur quand l'utilisateur modifie le champ
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  // Valider le formulaire
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ClientFormData, string>> = {}
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Le prénom est requis'
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Le nom est requis'
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide'
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Le téléphone est requis'
    }
    
    if (!formData.address.trim()) {
      newErrors.address = 'L\'adresse est requise'
    }
    
    if (!formData.city.trim()) {
      newErrors.city = 'La ville est requise'
    }
    
    if (!formData.region) {
      newErrors.region = 'La région est requise'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Soumettre le formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast({
        variant: 'destructive',
        title: 'Erreur de validation',
        description: 'Veuillez corriger les erreurs dans le formulaire.',
      })
      return
    }

    setIsLoading(true)

    try {
      // Simuler un appel API
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Ici, vous feriez l'appel API réel
      // const response = await fetch('/api/reseller/clients', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData),
      // })

      // Succès
      toast({
        title: 'Client créé avec succès',
        description: `${formData.firstName} ${formData.lastName} a été ajouté à votre liste de clients.`,
      })

      // Rediriger vers la liste des clients
      router.push('/revendeur/clients')
    } catch {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la création du client. Veuillez réessayer.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/revendeur/clients">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Nouveau Client</h1>
            <p className="text-muted-foreground mt-1">
              Ajoutez un nouveau client à votre compte
            </p>
          </div>
        </div>
      </div>

      {/* Formulaire */}
      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Informations principales */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Informations personnelles
              </CardTitle>
              <CardDescription>
                Renseignez les informations de base du client
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Prénom *</Label>
                  <Input
                    id="firstName"
                    placeholder="Prénom du client"
                    value={formData.firstName}
                    onChange={(e) => handleChange('firstName', e.target.value)}
                    className={cn(errors.firstName && 'border-destructive')}
                    disabled={isLoading}
                  />
                  {errors.firstName && (
                    <p className="text-sm text-destructive">{errors.firstName}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lastName">Nom *</Label>
                  <Input
                    id="lastName"
                    placeholder="Nom du client"
                    value={formData.lastName}
                    onChange={(e) => handleChange('lastName', e.target.value)}
                    className={cn(errors.lastName && 'border-destructive')}
                    disabled={isLoading}
                  />
                  {errors.lastName && (
                    <p className="text-sm text-destructive">{errors.lastName}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyName">Entreprise (optionnel)</Label>
                <Input
                  id="companyName"
                  placeholder="Nom de l'entreprise"
                  value={formData.companyName}
                  onChange={(e) => handleChange('companyName', e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@exemple.com"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className={cn(errors.email && 'border-destructive')}
                    disabled={isLoading}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Téléphone *
                  </Label>
                  <Input
                    id="phone"
                    placeholder="+221 XX XXX XX XX"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className={cn(errors.phone && 'border-destructive')}
                    disabled={isLoading}
                  />
                  {errors.phone && (
                    <p className="text-sm text-destructive">{errors.phone}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Adresse */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Adresse
              </CardTitle>
              <CardDescription>
                Renseignez l'adresse de livraison
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">Adresse *</Label>
                <Input
                  id="address"
                  placeholder="Adresse postale complète"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  className={cn(errors.address && 'border-destructive')}
                  disabled={isLoading}
                />
                {errors.address && (
                  <p className="text-sm text-destructive">{errors.address}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">Ville *</Label>
                <Input
                  id="city"
                  placeholder="Ville"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  className={cn(errors.city && 'border-destructive')}
                  disabled={isLoading}
                />
                {errors.city && (
                  <p className="text-sm text-destructive">{errors.city}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="region">Région *</Label>
                <select
                  id="region"
                  value={formData.region}
                  onChange={(e) => handleChange('region', e.target.value)}
                  className={cn(
                    'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
                    errors.region && 'border-destructive'
                  )}
                  disabled={isLoading}
                >
                  <option value="">Sélectionner une région</option>
                  {REGIONS.map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
                {errors.region && (
                  <p className="text-sm text-destructive">{errors.region}</p>
                )}
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optionnel)</Label>
                <textarea
                  id="notes"
                  placeholder="Notes additionnelles sur ce client..."
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={isLoading}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4 mt-6">
          <Button type="button" variant="outline" asChild disabled={isLoading}>
            <Link href="/revendeur/clients">Annuler</Link>
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Création en cours...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Créer le client
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
