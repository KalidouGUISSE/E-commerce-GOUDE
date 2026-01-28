"use client"

import React from "react"

import { useState } from "react"
import Link from "next/link"
import { Eye, EyeOff, User, Mail, Phone, Building2, MapPin, CheckCircle2, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

const businessTypes = [
  { value: "boutique", label: "Boutique / Magasin" },
  { value: "marche", label: "Commerçant de marché" },
  { value: "grossiste", label: "Grossiste" },
  { value: "couturier", label: "Couturier / Atelier" },
  { value: "export", label: "Exportateur" },
  { value: "autre", label: "Autre" },
]

const regions = [
  { value: "dakar", label: "Dakar" },
  { value: "thies", label: "Thiès" },
  { value: "saint-louis", label: "Saint-Louis" },
  { value: "ziguinchor", label: "Ziguinchor" },
  { value: "kaolack", label: "Kaolack" },
  { value: "fatick", label: "Fatick" },
  { value: "diourbel", label: "Diourbel" },
  { value: "tambacounda", label: "Tambacounda" },
  { value: "international", label: "International" },
]

export default function RegistrationPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (step < 2) {
      setStep(2)
      return
    }
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      // Handle registration logic
    }, 1500)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-center gap-4">
              <div className="flex items-center gap-2">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full ${step >= 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  1
                </div>
                <span className={`text-sm font-medium ${step >= 1 ? "text-foreground" : "text-muted-foreground"}`}>
                  Informations
                </span>
              </div>
              <div className={`h-px w-12 ${step >= 2 ? "bg-primary" : "bg-border"}`} />
              <div className="flex items-center gap-2">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full ${step >= 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  2
                </div>
                <span className={`text-sm font-medium ${step >= 2 ? "text-foreground" : "text-muted-foreground"}`}>
                  Activité
                </span>
              </div>
            </div>
          </div>

          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Devenir Revendeur</CardTitle>
              <CardDescription>
                {step === 1 
                  ? "Créez votre compte professionnel pour accéder aux prix grossiste"
                  : "Décrivez votre activité pour finaliser votre inscription"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {step === 1 ? (
                  <>
                    {/* Step 1: Personal Info */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">Prénom</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            id="firstName"
                            placeholder="Votre prénom"
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Nom</Label>
                        <Input
                          id="lastName"
                          placeholder="Votre nom"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Adresse email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="votre@email.com"
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Téléphone</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+221 77 XXX XX XX"
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Mot de passe</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Minimum 8 caractères"
                          className="pr-10"
                          required
                          minLength={8}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          <span className="sr-only">{showPassword ? "Masquer" : "Afficher"} le mot de passe</span>
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Utilisez au moins 8 caractères avec lettres et chiffres
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Step 2: Business Info */}
                    <div className="space-y-2">
                      <Label htmlFor="businessName">Nom de l'entreprise / Commerce</Label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="businessName"
                          placeholder="Nom de votre activité"
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="businessType">Type d'activité</Label>
                      <Select required>
                        <SelectTrigger id="businessType">
                          <SelectValue placeholder="Sélectionnez votre activité" />
                        </SelectTrigger>
                        <SelectContent>
                          {businessTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="region">Région</Label>
                      <Select required>
                        <SelectTrigger id="region">
                          <SelectValue placeholder="Sélectionnez votre région" />
                        </SelectTrigger>
                        <SelectContent>
                          {regions.map((region) => (
                            <SelectItem key={region.value} value={region.value}>
                              {region.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Adresse complète</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Textarea
                          id="address"
                          placeholder="Adresse de votre commerce ou lieu d'activité"
                          className="min-h-[80px] pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ninea">NINEA (optionnel)</Label>
                      <Input
                        id="ninea"
                        placeholder="Numéro d'identification nationale des entreprises"
                      />
                      <p className="text-xs text-muted-foreground">
                        Fournir votre NINEA accélère la validation de votre compte
                      </p>
                    </div>

                    <div className="flex items-start gap-2 pt-2">
                      <Checkbox id="terms" required />
                      <Label htmlFor="terms" className="text-sm font-normal leading-relaxed cursor-pointer">
                        J'accepte les{" "}
                        <Link href="/cgv" className="text-primary hover:underline">
                          Conditions Générales de Vente
                        </Link>{" "}
                        et la{" "}
                        <Link href="/confidentialite" className="text-primary hover:underline">
                          Politique de Confidentialité
                        </Link>
                      </Label>
                    </div>
                  </>
                )}

                <div className="flex gap-3 pt-4">
                  {step > 1 && (
                    <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">
                      Retour
                    </Button>
                  )}
                  <Button type="submit" className="flex-1" disabled={isLoading}>
                    {isLoading ? "Création en cours..." : step === 1 ? "Continuer" : "Créer mon compte"}
                    {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Button>
                </div>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Déjà inscrit ?{" "}
                  <Link href="/connexion" className="font-medium text-primary hover:underline">
                    Se connecter
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Info Box */}
          <Card className="mt-6 border-secondary/30 bg-secondary/5">
            <CardContent className="p-6">
              <h3 className="font-semibold text-foreground">Processus de Validation</h3>
              <div className="mt-4 space-y-3">
                <div className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-secondary" />
                  <div>
                    <p className="font-medium text-foreground">1. Inscription</p>
                    <p className="text-sm text-muted-foreground">Remplissez le formulaire avec vos informations</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-secondary" />
                  <div>
                    <p className="font-medium text-foreground">2. Vérification</p>
                    <p className="text-sm text-muted-foreground">Notre équipe vérifie votre profil (24-48h)</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-secondary" />
                  <div>
                    <p className="font-medium text-foreground">3. Activation</p>
                    <p className="text-sm text-muted-foreground">Accès complet aux prix et commandes</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
