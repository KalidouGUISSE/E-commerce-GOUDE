"use client"

import Link from "next/link"
import { Minus, Plus, Trash2, ShoppingCart, Lock, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

// Demo cart items (in a real app, this would come from state/context)
const cartItems = [
  {
    id: "1",
    name: "Pagne Manjak Traditionnel Indigo",
    unit: "pièce",
    minQuantity: 10,
    quantity: 10,
    artisan: "Atelier Diatta",
  },
  {
    id: "4",
    name: "Kente Royal Ghana",
    unit: "pièce",
    minQuantity: 5,
    quantity: 5,
    artisan: "Atelier Ashanti",
  },
]

export default function CartPage() {
  const isLoggedIn = false // Demo: user not logged in
  const isEmpty = cartItems.length === 0

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Page Header */}
        <section className="border-b border-border bg-card py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
              Votre Panier
            </h1>
            <p className="mt-2 text-muted-foreground">
              {isEmpty ? "Votre panier est vide" : `${cartItems.length} article(s) dans votre panier`}
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {isEmpty ? (
            /* Empty Cart State */
            <div className="py-16 text-center">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-muted">
                <ShoppingCart className="h-12 w-12 text-muted-foreground" />
              </div>
              <h2 className="mt-6 text-xl font-semibold text-foreground">Votre panier est vide</h2>
              <p className="mt-2 text-muted-foreground">
                Parcourez notre catalogue pour découvrir nos tissus africains authentiques
              </p>
              <Link href="/catalogue">
                <Button className="mt-6">
                  Voir le Catalogue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-8 lg:grid-cols-3">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Articles</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {cartItems.map((item, index) => (
                      <div key={item.id}>
                        <div className="flex gap-4">
                          {/* Item Image Placeholder */}
                          <div className="h-20 w-20 shrink-0 rounded-md bg-muted flex items-center justify-center">
                            <span className="text-2xl font-bold text-primary/30">{item.name[0]}</span>
                          </div>

                          {/* Item Details */}
                          <div className="flex flex-1 flex-col justify-between">
                            <div>
                              <Link href={`/catalogue/${item.id}`}>
                                <h3 className="font-medium text-foreground hover:text-primary">
                                  {item.name}
                                </h3>
                              </Link>
                              <p className="mt-1 text-sm text-muted-foreground">
                                Par {item.artisan}
                              </p>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Minimum: {item.minQuantity} {item.unit}(s)
                            </p>
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex flex-col items-end justify-between">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Supprimer</span>
                            </Button>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="icon" className="h-8 w-8 bg-transparent">
                                <Minus className="h-3 w-3" />
                                <span className="sr-only">Diminuer</span>
                              </Button>
                              <span className="w-12 text-center text-sm font-medium">
                                {item.quantity}
                              </span>
                              <Button variant="outline" size="icon" className="h-8 w-8 bg-transparent">
                                <Plus className="h-3 w-3" />
                                <span className="sr-only">Augmenter</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                        {index < cartItems.length - 1 && <Separator className="mt-4" />}
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Continue Shopping */}
                <div className="mt-4">
                  <Link href="/catalogue">
                    <Button variant="outline">
                      Continuer vos achats
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Order Summary */}
              <div>
                <Card className="sticky top-24">
                  <CardHeader>
                    <CardTitle>Récapitulatif</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Items Summary */}
                    <div className="space-y-2">
                      {cartItems.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-muted-foreground line-clamp-1 max-w-[180px]">
                            {item.name}
                          </span>
                          <span className="text-foreground">x{item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    <Separator />

                    {/* Price Section */}
                    {isLoggedIn ? (
                      <>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Sous-total</span>
                            <span className="text-foreground">--- FCFA</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Livraison</span>
                            <span className="text-foreground">À calculer</span>
                          </div>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-semibold">
                          <span>Total</span>
                          <span>--- FCFA</span>
                        </div>
                        <Link href="/checkout">
                          <Button className="w-full">
                            Passer la Commande
                          </Button>
                        </Link>
                      </>
                    ) : (
                      <div className="rounded-lg bg-muted p-4">
                        <div className="flex items-center gap-3">
                          <Lock className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium text-foreground">Connexion Requise</p>
                            <p className="text-sm text-muted-foreground">
                              Connectez-vous pour voir les prix et finaliser votre commande
                            </p>
                          </div>
                        </div>
                        <div className="mt-4 space-y-2">
                          <Link href="/connexion">
                            <Button className="w-full">Se Connecter</Button>
                          </Link>
                          <Link href="/inscription">
                            <Button variant="outline" className="w-full bg-transparent">
                              Créer un Compte Revendeur
                            </Button>
                          </Link>
                        </div>
                      </div>
                    )}

                    {/* Trust Signals */}
                    <div className="pt-4 space-y-2 text-xs text-muted-foreground">
                      <p className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                        Paiement Mobile Money accepté
                      </p>
                      <p className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                        Livraison suivie
                      </p>
                      <p className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                        Service client disponible
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Large Order Notice */}
                <Card className="mt-4 border-secondary/30 bg-secondary/5">
                  <CardContent className="p-4">
                    <h4 className="font-medium text-foreground">Commande importante ?</h4>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Pour les commandes supérieures à 100 pièces, demandez un devis personnalisé.
                    </p>
                    <Link href="/contact">
                      <Button variant="link" className="mt-2 h-auto p-0 text-secondary">
                        Demander un Devis
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
