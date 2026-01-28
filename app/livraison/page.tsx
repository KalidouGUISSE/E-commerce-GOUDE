import Link from "next/link"
import { ArrowLeft, Truck, Clock, MapPin, Package, AlertCircle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

const deliveryZones = [
  {
    zone: "Dakar et Banlieue",
    standard: "2-3 jours",
    express: "24h",
    standardPrice: "2 500 FCFA",
    expressPrice: "5 000 FCFA",
  },
  {
    zone: "Régions du Sénégal",
    standard: "5-7 jours",
    express: "3-4 jours",
    standardPrice: "5 000 FCFA",
    expressPrice: "10 000 FCFA",
  },
  {
    zone: "Afrique de l'Ouest",
    standard: "10-15 jours",
    express: "5-7 jours",
    standardPrice: "15 000 FCFA",
    expressPrice: "30 000 FCFA",
  },
  {
    zone: "International",
    standard: "15-21 jours",
    express: "7-10 jours",
    standardPrice: "Sur devis",
    expressPrice: "Sur devis",
  },
]

export default function DeliveryPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Page Header */}
        <section className="border-b border-border bg-primary py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Link href="/">
              <Button variant="ghost" size="sm" className="mb-4 text-primary-foreground/80 hover:bg-primary-foreground/10 hover:text-primary-foreground">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour à l'accueil
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-primary-foreground sm:text-3xl">
              Informations Livraison
            </h1>
            <p className="mt-2 text-primary-foreground/90">
              Tout ce que vous devez savoir sur nos options de livraison
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          {/* Delivery Options */}
          <section>
            <h2 className="text-xl font-bold text-foreground sm:text-2xl">
              Options de Livraison
            </h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-3">
              <Card>
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Truck className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="mt-4">Standard</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Livraison économique avec suivi. Idéale pour les commandes non urgentes.
                  </p>
                  <ul className="mt-4 space-y-2 text-sm">
                    <li className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      Suivi en ligne
                    </li>
                    <li className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      Emballage sécurisé
                    </li>
                    <li className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      Notification SMS
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-secondary">
                <CardHeader>
                  <Badge className="w-fit bg-secondary text-secondary-foreground">Recommandé</Badge>
                  <div className="mt-2 flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10">
                    <Clock className="h-6 w-6 text-secondary" />
                  </div>
                  <CardTitle className="mt-4">Express</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Livraison rapide prioritaire. Pour vos commandes urgentes.
                  </p>
                  <ul className="mt-4 space-y-2 text-sm">
                    <li className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      Traitement prioritaire
                    </li>
                    <li className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      Suivi en temps réel
                    </li>
                    <li className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      Assurance incluse
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="mt-4">Retrait sur Place</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Retirez votre commande à notre entrepôt de Dakar. Gratuit.
                  </p>
                  <ul className="mt-4 space-y-2 text-sm">
                    <li className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      Gratuit
                    </li>
                    <li className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      Disponible sous 24h
                    </li>
                    <li className="flex items-center gap-2 text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      Vérification sur place
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Delivery Zones Table */}
          <section className="mt-12">
            <h2 className="text-xl font-bold text-foreground sm:text-2xl">
              Zones et Tarifs
            </h2>
            <div className="mt-6 overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted">
                    <th className="p-4 text-left font-semibold text-foreground">Zone</th>
                    <th className="p-4 text-left font-semibold text-foreground">Délai Standard</th>
                    <th className="p-4 text-left font-semibold text-foreground">Prix Standard</th>
                    <th className="p-4 text-left font-semibold text-foreground">Délai Express</th>
                    <th className="p-4 text-left font-semibold text-foreground">Prix Express</th>
                  </tr>
                </thead>
                <tbody>
                  {deliveryZones.map((zone, index) => (
                    <tr key={zone.zone} className={index % 2 === 0 ? "bg-card" : "bg-muted/30"}>
                      <td className="p-4 font-medium text-foreground">{zone.zone}</td>
                      <td className="p-4 text-muted-foreground">{zone.standard}</td>
                      <td className="p-4 text-muted-foreground">{zone.standardPrice}</td>
                      <td className="p-4 text-muted-foreground">{zone.express}</td>
                      <td className="p-4 text-muted-foreground">{zone.expressPrice}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              * Les tarifs sont indicatifs et peuvent varier en fonction du poids et du volume de la commande.
            </p>
          </section>

          {/* Packaging Info */}
          <section className="mt-12">
            <h2 className="text-xl font-bold text-foreground sm:text-2xl">
              Emballage et Manutention
            </h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Package className="h-8 w-8 shrink-0 text-primary" />
                    <div>
                      <h3 className="font-semibold text-foreground">Emballage Sécurisé</h3>
                      <p className="mt-2 text-muted-foreground">
                        Chaque commande est soigneusement emballée pour protéger les tissus 
                        pendant le transport. Nous utilisons des matériaux de protection 
                        adaptés pour préserver la qualité de vos articles.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <AlertCircle className="h-8 w-8 shrink-0 text-secondary" />
                    <div>
                      <h3 className="font-semibold text-foreground">Vérification à la Réception</h3>
                      <p className="mt-2 text-muted-foreground">
                        Nous vous recommandons de vérifier votre commande en présence du livreur. 
                        Tout dommage visible doit être signalé immédiatement pour faciliter 
                        le traitement des réclamations.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* FAQ */}
          <section className="mt-12">
            <h2 className="text-xl font-bold text-foreground sm:text-2xl">
              Questions Fréquentes
            </h2>
            <div className="mt-6 space-y-4">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-foreground">Comment suivre ma commande ?</h3>
                  <p className="mt-2 text-muted-foreground">
                    Une fois votre commande expédiée, vous recevrez un email et un SMS avec un lien de suivi. 
                    Vous pouvez également suivre votre commande depuis votre tableau de bord.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-foreground">Que faire si je ne suis pas disponible à la livraison ?</h3>
                  <p className="mt-2 text-muted-foreground">
                    Le livreur vous contactera par téléphone. En cas d'absence, une nouvelle tentative 
                    de livraison sera programmée. Vous pouvez également modifier l'adresse ou 
                    opter pour un retrait en point relais.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-foreground">Les frais de livraison sont-ils offerts à partir d'un certain montant ?</h3>
                  <p className="mt-2 text-muted-foreground">
                    Oui, la livraison standard est offerte pour les commandes supérieures à 500 000 FCFA 
                    dans la région de Dakar. Contactez-nous pour les conditions sur les autres zones.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* CTA */}
          <section className="mt-12 rounded-lg bg-muted p-8 text-center">
            <h3 className="text-lg font-semibold text-foreground">Des questions sur la livraison ?</h3>
            <p className="mt-2 text-muted-foreground">
              Notre équipe est disponible pour répondre à toutes vos questions.
            </p>
            <Link href="/contact">
              <Button className="mt-4">Contactez-nous</Button>
            </Link>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
