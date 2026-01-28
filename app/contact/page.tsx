"use client"

import React from "react"

import { useState } from "react"
import Link from "next/link"
import { Phone, Mail, MapPin, Clock, Send, MessageSquare, HelpCircle, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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

const contactReasons = [
  { value: "order", label: "Question sur une commande" },
  { value: "quote", label: "Demande de devis" },
  { value: "partnership", label: "Devenir partenaire (artisan)" },
  { value: "reseller", label: "Devenir revendeur" },
  { value: "support", label: "Support technique" },
  { value: "other", label: "Autre" },
]

const faqs = [
  {
    question: "Comment devenir revendeur ?",
    answer: "Créez un compte sur notre plateforme et remplissez le formulaire d'inscription revendeur. Notre équipe validera votre profil sous 24-48h.",
  },
  {
    question: "Quels sont les modes de paiement acceptés ?",
    answer: "Nous acceptons Orange Money, Wave, et les virements bancaires. Les paiements Mobile Money sont traités instantanément.",
  },
  {
    question: "Quelle est la quantité minimum de commande ?",
    answer: "Les quantités minimum varient selon les produits, généralement entre 5 et 20 pièces. Consultez chaque fiche produit pour les détails.",
  },
  {
    question: "Livrez-vous à l'international ?",
    answer: "Oui, nous livrons dans toute l'Afrique de l'Ouest et à l'international. Les frais et délais varient selon la destination.",
  },
]

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      setSubmitted(true)
    }, 1500)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Page Header */}
        <section className="border-b border-border bg-primary py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold text-primary-foreground sm:text-3xl lg:text-4xl">
              Contactez-nous
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-primary-foreground/90">
              Notre équipe est disponible pour répondre à toutes vos questions 
              concernant nos produits, commandes et partenariats.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-3">
            {/* Contact Info */}
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-foreground">Informations de Contact</h2>
                <p className="mt-2 text-muted-foreground">
                  N'hésitez pas à nous contacter par le moyen qui vous convient le mieux.
                </p>
              </div>

              <div className="space-y-4">
                <Card>
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Téléphone</p>
                      <p className="text-sm text-muted-foreground">+221 33 XXX XX XX</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Email</p>
                      <p className="text-sm text-muted-foreground">contact@pagnetisse.sn</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Adresse</p>
                      <p className="text-sm text-muted-foreground">Dakar, Sénégal</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Horaires</p>
                      <p className="text-sm text-muted-foreground">Lun-Ven: 8h-18h / Sam: 9h-13h</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Links */}
              <div className="pt-4">
                <h3 className="font-semibold text-foreground">Liens Utiles</h3>
                <div className="mt-3 space-y-2">
                  <Link href="/faq" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                    <HelpCircle className="h-4 w-4" />
                    Foire aux Questions
                  </Link>
                  <Link href="/livraison" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                    <FileText className="h-4 w-4" />
                    Informations Livraison
                  </Link>
                  <Link href="/cgv" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                    <FileText className="h-4 w-4" />
                    Conditions Générales
                  </Link>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Envoyez-nous un Message
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {submitted ? (
                    <div className="py-8 text-center">
                      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                        <Send className="h-8 w-8 text-green-600" />
                      </div>
                      <h3 className="mt-4 text-lg font-semibold text-foreground">Message Envoyé</h3>
                      <p className="mt-2 text-muted-foreground">
                        Merci pour votre message. Notre équipe vous répondra dans les plus brefs délais.
                      </p>
                      <Button className="mt-6" onClick={() => setSubmitted(false)}>
                        Envoyer un autre message
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="name">Nom complet</Label>
                          <Input id="name" placeholder="Votre nom" required />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input id="email" type="email" placeholder="votre@email.com" required />
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="phone">Téléphone</Label>
                          <Input id="phone" type="tel" placeholder="+221 77 XXX XX XX" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="reason">Sujet</Label>
                          <Select>
                            <SelectTrigger id="reason">
                              <SelectValue placeholder="Choisir un sujet" />
                            </SelectTrigger>
                            <SelectContent>
                              {contactReasons.map((reason) => (
                                <SelectItem key={reason.value} value={reason.value}>
                                  {reason.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="orderNumber">Numéro de commande (si applicable)</Label>
                        <Input id="orderNumber" placeholder="CMD-2024-XXXX" />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message">Message</Label>
                        <Textarea
                          id="message"
                          placeholder="Décrivez votre demande en détail..."
                          className="min-h-[150px]"
                          required
                        />
                      </div>

                      <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? "Envoi en cours..." : "Envoyer le Message"}
                        {!isSubmitting && <Send className="ml-2 h-4 w-4" />}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* FAQ Section */}
          <section className="mt-16">
            <h2 className="text-xl font-bold text-foreground sm:text-2xl">
              Questions Fréquentes
            </h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {faqs.map((faq, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-foreground">{faq.question}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
