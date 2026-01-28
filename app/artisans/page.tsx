import Link from "next/link"
import { MapPin, Award, Clock, User, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { artisans } from "@/lib/data/products"

export default function ArtisansPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Page Header */}
        <section className="border-b border-border bg-primary py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold text-primary-foreground sm:text-3xl lg:text-4xl">
              Nos Artisans Partenaires
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-primary-foreground/90">
              Découvrez les maîtres tisserands et artisans qui perpétuent les traditions textiles africaines. 
              Chaque artisan est vérifié et certifié pour garantir l'authenticité de nos produits.
            </p>
          </div>
        </section>

        {/* Stats */}
        <section className="border-b border-border bg-card py-8">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-8 px-4 sm:justify-between sm:px-6 lg:px-8">
            <div className="text-center">
              <p className="text-3xl font-bold text-foreground">{artisans.length}+</p>
              <p className="text-sm text-muted-foreground">Artisans Certifiés</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-foreground">5</p>
              <p className="text-sm text-muted-foreground">Régions Couvertes</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-foreground">150+</p>
              <p className="text-sm text-muted-foreground">Produits Uniques</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-foreground">30</p>
              <p className="text-sm text-muted-foreground">Années d'Expérience Moy.</p>
            </div>
          </div>
        </section>

        {/* Artisans Grid */}
        <section className="py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {artisans.map((artisan) => (
                <Link key={artisan.id} href={`/artisans/${artisan.id}`}>
                  <Card className="group h-full transition-shadow hover:shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary/10">
                          <User className="h-8 w-8 text-primary/60" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-foreground group-hover:text-primary">
                              {artisan.name}
                            </h3>
                            {artisan.certified && (
                              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                <Award className="mr-1 h-3 w-3" />
                                Certifié
                              </Badge>
                            )}
                          </div>
                          <p className="mt-1 text-sm font-medium text-secondary">
                            {artisan.specialty}
                          </p>
                        </div>
                      </div>
                      
                      <p className="mt-4 text-sm leading-relaxed text-muted-foreground line-clamp-2">
                        {artisan.bio}
                      </p>
                      
                      <div className="mt-4 flex flex-wrap gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {artisan.location}, {artisan.region}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {artisan.yearsExperience} ans
                        </span>
                      </div>
                      
                      <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                        <span className="text-sm text-muted-foreground">
                          {artisan.productsCount} produits
                        </span>
                        <span className="flex items-center text-sm font-medium text-primary group-hover:underline">
                          Voir le profil
                          <ArrowRight className="ml-1 h-4 w-4" />
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="border-t border-border bg-muted py-12">
          <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-foreground sm:text-2xl">
              Vous êtes artisan tisserand ?
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-muted-foreground">
              Rejoignez notre réseau de distribution et connectez-vous avec des revendeurs 
              locaux et internationaux.
            </p>
            <Link href="/contact">
              <Button className="mt-6">
                Devenir Partenaire
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
