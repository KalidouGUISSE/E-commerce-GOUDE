import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, MapPin, Award, Clock, User, Package, Shield, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { artisans, products, productTypes } from "@/lib/data/products"

interface ArtisanPageProps {
  params: Promise<{ id: string }>
}

export default async function ArtisanPage({ params }: ArtisanPageProps) {
  const { id } = await params
  const artisan = artisans.find((a) => a.id === id)

  if (!artisan) {
    notFound()
  }

  const artisanProducts = products.filter((p) => p.artisanId === artisan.id)

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Breadcrumb */}
        <section className="border-b border-border bg-card py-4">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-foreground">Accueil</Link>
              <span>/</span>
              <Link href="/artisans" className="hover:text-foreground">Artisans</Link>
              <span>/</span>
              <span className="text-foreground">{artisan.name}</span>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Back Button */}
          <Link href="/artisans">
            <Button variant="ghost" size="sm" className="mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour aux artisans
            </Button>
          </Link>

          {/* Artisan Profile Header */}
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="p-6 sm:p-8">
                  <div className="flex flex-col gap-6 sm:flex-row">
                    <div className="flex h-32 w-32 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <User className="h-16 w-16 text-primary/60" />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
                          {artisan.name}
                        </h1>
                        {artisan.certified && (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                            <Award className="mr-1 h-3 w-3" />
                            Artisan Certifié
                          </Badge>
                        )}
                      </div>
                      
                      <p className="mt-2 text-lg font-medium text-secondary">
                        {artisan.specialty}
                      </p>
                      
                      <div className="mt-4 flex flex-wrap gap-4 text-muted-foreground">
                        <span className="flex items-center gap-2">
                          <MapPin className="h-5 w-5" />
                          {artisan.location}, {artisan.region}
                        </span>
                        <span className="flex items-center gap-2">
                          <Clock className="h-5 w-5" />
                          {artisan.yearsExperience} ans d'expérience
                        </span>
                        <span className="flex items-center gap-2">
                          <Package className="h-5 w-5" />
                          {artisan.productsCount} produits
                        </span>
                      </div>

                      <Separator className="my-6" />

                      <div>
                        <h2 className="font-semibold text-foreground">À propos</h2>
                        <p className="mt-2 leading-relaxed text-muted-foreground">
                          {artisan.bio}
                        </p>
                        <p className="mt-4 leading-relaxed text-muted-foreground">
                          Cet atelier perpétue les techniques ancestrales de tissage transmises de génération en génération. 
                          Chaque pièce est réalisée avec soin, en respectant les méthodes traditionnelles tout en répondant 
                          aux standards de qualité exigés pour l'export.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Artisan Products */}
              <div className="mt-8">
                <h2 className="text-xl font-bold text-foreground">
                  Produits de {artisan.name}
                </h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {artisanProducts.map((product) => {
                    const typeLabel = productTypes.find((t) => t.value === product.type)?.label || product.type
                    return (
                      <Link key={product.id} href={`/catalogue/${product.id}`}>
                        <Card className="group h-full transition-shadow hover:shadow-md">
                          <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                            <div className="absolute inset-0 flex items-center justify-center bg-primary/10">
                              <span className="text-4xl font-bold text-primary/30">{product.name[0]}</span>
                            </div>
                            {product.featured && (
                              <Badge className="absolute top-2 right-2" variant="secondary">
                                Vedette
                              </Badge>
                            )}
                          </div>
                          <CardContent className="p-4">
                            <h3 className="font-semibold text-foreground group-hover:text-primary line-clamp-1">
                              {product.name}
                            </h3>
                            <p className="mt-1 text-sm text-muted-foreground">{typeLabel}</p>
                            <p className="mt-2 text-xs text-muted-foreground">
                              Min. {product.minQuantity} pièces
                            </p>
                          </CardContent>
                        </Card>
                      </Link>
                    )
                  })}
                </div>
                {artisanProducts.length === 0 && (
                  <p className="mt-4 text-muted-foreground">
                    Aucun produit disponible actuellement.
                  </p>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Certification Card */}
              <Card className="border-green-200 bg-green-50">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-green-900">
                    <Shield className="h-5 w-5" />
                    Certification
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-green-800">
                  <p>
                    Cet artisan est certifié par Pagne Tissé Distribution. 
                    Nos équipes ont vérifié :
                  </p>
                  <ul className="mt-3 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-green-600" />
                      Authenticité des techniques traditionnelles
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-green-600" />
                      Qualité des matériaux utilisés
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-green-600" />
                      Conditions de travail éthiques
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-green-600" />
                      Capacité de production fiable
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Stats Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Statistiques</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Produits actifs</span>
                    <span className="font-medium">{artisan.productsCount}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Expérience</span>
                    <span className="font-medium">{artisan.yearsExperience} ans</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Spécialité</span>
                    <span className="font-medium">{artisan.specialty}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Région</span>
                    <span className="font-medium">{artisan.region}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Card */}
              <Card className="border-secondary/30 bg-secondary/5">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-foreground">Commande Spéciale ?</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Vous avez besoin d'une grande quantité ou d'une personnalisation ? 
                    Contactez-nous pour un devis sur mesure.
                  </p>
                  <Link href="/contact">
                    <Button className="mt-4 w-full">
                      Demander un Devis
                    </Button>
                  </Link>
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
