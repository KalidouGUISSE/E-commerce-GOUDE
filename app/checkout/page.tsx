"use client"

import React from "react"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Truck, CreditCard, Smartphone, Building2, CheckCircle2, Shield, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

// Demo order items
const orderItems = [
  {
    id: "1",
    name: "Pagne Manjak Traditionnel Indigo",
    quantity: 10,
    unit: "pièce",
    price: 15000,
    artisan: "Atelier Diatta",
  },
  {
    id: "4",
    name: "Kente Royal Ghana",
    quantity: 5,
    unit: "pièce",
    price: 25000,
    artisan: "Atelier Ashanti",
  },
]

const deliveryOptions = [
  {
    id: "standard",
    name: "Livraison Standard",
    description: "5-7 jours ouvrés",
    price: 5000,
  },
  {
    id: "express",
    name: "Livraison Express",
    description: "2-3 jours ouvrés",
    price: 12000,
  },
  {
    id: "pickup",
    name: "Retrait sur place",
    description: "Dakar - Gratuit",
    price: 0,
  },
]

const paymentMethods = [
  {
    id: "orange-money",
    name: "Orange Money",
    icon: Smartphone,
    description: "Paiement mobile instantané",
  },
  {
    id: "wave",
    name: "Wave",
    icon: Smartphone,
    description: "Paiement mobile instantané",
  },
  {
    id: "virement",
    name: "Virement Bancaire",
    icon: Building2,
    description: "Traitement sous 24-48h",
  },
]

export default function CheckoutPage() {
  const [step, setStep] = useState(1)
  const [deliveryMethod, setDeliveryMethod] = useState("standard")
  const [paymentMethod, setPaymentMethod] = useState("orange-money")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const deliveryPrice = deliveryOptions.find((d) => d.id === deliveryMethod)?.price || 0
  const total = subtotal + deliveryPrice

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (step < 3) {
      setStep(step + 1)
      return
    }
    setIsSubmitting(true)
    // Simulate order submission
    setTimeout(() => {
      setIsSubmitting(false)
      setStep(4) // Success state
    }, 2000)
  }

  if (step === 4) {
    // Order Success State
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center px-4 py-12">
          <div className="mx-auto max-w-md text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="mt-6 text-2xl font-bold text-foreground">Commande Confirmée</h1>
            <p className="mt-2 text-muted-foreground">
              Votre commande #CMD-2024-0042 a été enregistrée avec succès.
            </p>
            <Card className="mt-6 text-left">
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Montant total</span>
                  <span className="font-semibold">{total.toLocaleString()} FCFA</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Mode de paiement</span>
                  <span>{paymentMethods.find((p) => p.id === paymentMethod)?.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Livraison estimée</span>
                  <span>{deliveryOptions.find((d) => d.id === deliveryMethod)?.description}</span>
                </div>
              </CardContent>
            </Card>
            <p className="mt-4 text-sm text-muted-foreground">
              Un email de confirmation a été envoyé à votre adresse.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link href="/tableau-de-bord">
                <Button>Voir mes commandes</Button>
              </Link>
              <Link href="/catalogue">
                <Button variant="outline">Continuer mes achats</Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Page Header */}
        <section className="border-b border-border bg-card py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Link href="/panier">
              <Button variant="ghost" size="sm" className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour au panier
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-foreground">Finaliser la Commande</h1>
            
            {/* Progress Steps */}
            <div className="mt-6 flex items-center gap-4">
              {[
                { num: 1, label: "Livraison" },
                { num: 2, label: "Paiement" },
                { num: 3, label: "Confirmation" },
              ].map((s, index) => (
                <div key={s.num} className="flex items-center">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                    step >= s.num ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}>
                    {step > s.num ? <CheckCircle2 className="h-4 w-4" /> : s.num}
                  </div>
                  <span className={`ml-2 hidden text-sm sm:inline ${
                    step >= s.num ? "text-foreground font-medium" : "text-muted-foreground"
                  }`}>
                    {s.label}
                  </span>
                  {index < 2 && <div className={`ml-4 h-px w-8 ${step > s.num ? "bg-primary" : "bg-border"}`} />}
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Form Section */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit}>
                {step === 1 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Truck className="h-5 w-5" />
                        Adresse de Livraison
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">Prénom</Label>
                          <Input id="firstName" defaultValue="Mamadou" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Nom</Label>
                          <Input id="lastName" defaultValue="Diallo" required />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Téléphone</Label>
                        <Input id="phone" type="tel" defaultValue="+221 77 123 45 67" required />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address">Adresse</Label>
                        <Textarea id="address" placeholder="Rue, numéro, quartier..." required />
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="city">Ville</Label>
                          <Input id="city" placeholder="Dakar" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="region">Région</Label>
                          <Select defaultValue="dakar">
                            <SelectTrigger id="region">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="dakar">Dakar</SelectItem>
                              <SelectItem value="thies">Thiès</SelectItem>
                              <SelectItem value="saint-louis">Saint-Louis</SelectItem>
                              <SelectItem value="ziguinchor">Ziguinchor</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <Separator className="my-6" />

                      <div className="space-y-4">
                        <Label>Mode de Livraison</Label>
                        <RadioGroup value={deliveryMethod} onValueChange={setDeliveryMethod}>
                          {deliveryOptions.map((option) => (
                            <div key={option.id} className="flex items-center justify-between rounded-lg border border-border p-4">
                              <div className="flex items-center gap-3">
                                <RadioGroupItem value={option.id} id={option.id} />
                                <div>
                                  <Label htmlFor={option.id} className="cursor-pointer font-medium">
                                    {option.name}
                                  </Label>
                                  <p className="text-sm text-muted-foreground">{option.description}</p>
                                </div>
                              </div>
                              <span className="font-medium">
                                {option.price === 0 ? "Gratuit" : `${option.price.toLocaleString()} FCFA`}
                              </span>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>

                      <Button type="submit" className="w-full mt-6">
                        Continuer vers le Paiement
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {step === 2 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Mode de Paiement
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                        {paymentMethods.map((method) => (
                          <div key={method.id} className={`flex items-center justify-between rounded-lg border p-4 ${
                            paymentMethod === method.id ? "border-primary bg-primary/5" : "border-border"
                          }`}>
                            <div className="flex items-center gap-3">
                              <RadioGroupItem value={method.id} id={method.id} />
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                                  <method.icon className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div>
                                  <Label htmlFor={method.id} className="cursor-pointer font-medium">
                                    {method.name}
                                  </Label>
                                  <p className="text-sm text-muted-foreground">{method.description}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </RadioGroup>

                      {(paymentMethod === "orange-money" || paymentMethod === "wave") && (
                        <div className="rounded-lg bg-muted p-4 mt-4">
                          <h4 className="font-medium text-foreground">Instructions de Paiement</h4>
                          <ol className="mt-2 space-y-1 text-sm text-muted-foreground list-decimal list-inside">
                            <li>Vous recevrez une notification sur votre téléphone</li>
                            <li>Entrez votre code PIN pour confirmer le paiement</li>
                            <li>Votre commande sera confirmée automatiquement</li>
                          </ol>
                        </div>
                      )}

                      {paymentMethod === "virement" && (
                        <div className="rounded-lg bg-muted p-4 mt-4">
                          <h4 className="font-medium text-foreground">Coordonnées Bancaires</h4>
                          <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                            <p>Banque: CBAO Groupe Attijariwafa Bank</p>
                            <p>IBAN: SN08 SN00 0100 0000 1234 5678 901</p>
                            <p>Référence: CMD-2024-0042</p>
                          </div>
                          <p className="mt-3 text-xs text-muted-foreground">
                            Votre commande sera traitée après réception du virement (24-48h)
                          </p>
                        </div>
                      )}

                      <div className="flex gap-3 mt-6">
                        <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">
                          Retour
                        </Button>
                        <Button type="submit" className="flex-1">
                          Continuer
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {step === 3 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5" />
                        Confirmation de Commande
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Order Summary */}
                      <div>
                        <h4 className="font-medium text-foreground mb-3">Articles Commandés</h4>
                        <div className="space-y-3">
                          {orderItems.map((item) => (
                            <div key={item.id} className="flex justify-between text-sm">
                              <div>
                                <span className="text-foreground">{item.name}</span>
                                <span className="text-muted-foreground"> x{item.quantity}</span>
                              </div>
                              <span className="font-medium">{(item.price * item.quantity).toLocaleString()} FCFA</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Separator />

                      {/* Delivery Info */}
                      <div>
                        <h4 className="font-medium text-foreground mb-2">Livraison</h4>
                        <p className="text-sm text-muted-foreground">
                          {deliveryOptions.find((d) => d.id === deliveryMethod)?.name} - {deliveryOptions.find((d) => d.id === deliveryMethod)?.description}
                        </p>
                      </div>

                      {/* Payment Info */}
                      <div>
                        <h4 className="font-medium text-foreground mb-2">Paiement</h4>
                        <p className="text-sm text-muted-foreground">
                          {paymentMethods.find((p) => p.id === paymentMethod)?.name}
                        </p>
                      </div>

                      <Separator />

                      {/* Total */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Sous-total</span>
                          <span>{subtotal.toLocaleString()} FCFA</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Livraison</span>
                          <span>{deliveryPrice === 0 ? "Gratuit" : `${deliveryPrice.toLocaleString()} FCFA`}</span>
                        </div>
                        <div className="flex justify-between text-lg font-semibold pt-2">
                          <span>Total</span>
                          <span>{total.toLocaleString()} FCFA</span>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Button type="button" variant="outline" onClick={() => setStep(2)} className="flex-1">
                          Retour
                        </Button>
                        <Button type="submit" className="flex-1" disabled={isSubmitting}>
                          {isSubmitting ? "Traitement en cours..." : "Confirmer la Commande"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </form>
            </div>

            {/* Order Summary Sidebar */}
            <div>
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Votre Commande</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {orderItems.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="h-16 w-16 shrink-0 rounded bg-muted flex items-center justify-center">
                        <span className="text-lg font-bold text-primary/30">{item.name[0]}</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground line-clamp-1">{item.name}</p>
                        <p className="text-xs text-muted-foreground">Qté: {item.quantity}</p>
                        <p className="text-sm font-medium">{(item.price * item.quantity).toLocaleString()} FCFA</p>
                      </div>
                    </div>
                  ))}

                  <Separator />

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sous-total</span>
                      <span>{subtotal.toLocaleString()} FCFA</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Livraison</span>
                      <span>{deliveryPrice === 0 ? "Gratuit" : `${deliveryPrice.toLocaleString()} FCFA`}</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>{total.toLocaleString()} FCFA</span>
                  </div>

                  {/* Trust Signals */}
                  <div className="pt-4 space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Shield className="h-4 w-4" />
                      <span>Paiement sécurisé</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Truck className="h-4 w-4" />
                      <span>Livraison suivie</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>Support 7j/7</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
