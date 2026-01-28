import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Lock, Shield, Truck, Award, User, MapPin, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { products, artisans, productTypes, productOrigins, productUnits, productColors } from "@/lib/data/products"

interface ProductPageProps {
  params: Promise<{ id: string }>
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params
  const product = products.find((p) => p.id === id)

  if (!product) {
    notFound()
  }

  const artisan = artisans.find((a) => a.id === product.artisanId)
  const typeLabel = productTypes.find((t) => t.value === product.type)?.label || product.type
  const originLabel = productOrigins.find((o) => o.value === product.origin)?.label || product.origin
  const unitLabel = productUnits.find((u) => u.value === product.unit)?.label || product.unit

  const relatedProducts = products
    .filter((p) => p.id !== product.id && (p.type === product.type || p.origin === product.origin))
    .slice(0, 4)

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
              <Link href="/catalogue" className="hover:text-foreground">Catalogue</Link>
              <span>/</span>
              <span className="text-foreground">{product.name}</span>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Back Button */}
          <Link href="/catalogue">
            <Button variant="ghost" size="sm" className="mb-6">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour au catalogue
            </Button>
          </Link>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Product Image */}
            <div className="space-y-4">
              <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
                <div className="absolute inset-0 flex items-center justify-center bg-primary/10">
                  <span className="text-8xl font-bold text-primary/20">{product.name[0]}</span>
                </div>
                {product.featured && (
                  <Badge className="absolute top-4 left-4" variant="secondary">
                    Produit Vedette
                  </Badge>
                )}
                {!product.inStock && (
                  <div className="absolute inset-0 flex items-center justify-center bg-foreground/60">
                    <span className="text-xl font-bold text-background">Rupture de Stock</span>
                  </div>
                )}
              </div>
              {/* Thumbnail placeholder */}
              <div className="flex gap-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-20 w-20 rounded-md bg-muted" />
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{typeLabel}</Badge>
                  <Badge variant="outline">{originLabel}</Badge>
                  {product.inStock ? (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">En stock</Badge>
                  ) : (
                    <Badge variant="destructive">Rupture</Badge>
                  )}
                </div>
                <h1 className="mt-4 text-2xl font-bold text-foreground sm:text-3xl">
                  {product.name}
                </h1>
                <p className="mt-4 leading-relaxed text-muted-foreground">
                  {product.description}
                </p>
              </div>

              {/* Price Section (Locked) */}
              <Card className="border-secondary/30 bg-secondary/5">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary/20">
                      <Lock className="h-6 w-6 text-secondary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Prix Réservé aux Revendeurs</h3>
                      <p className="text-sm text-muted-foreground">
                        Connectez-vous pour voir les tarifs grossiste
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-3">
                    <Link href="/connexion" className="flex-1">
                      <Button className="w-full">Se Connecter</Button>
                    </Link>
                    <Link href="/inscription" className="flex-1">
                      <Button variant="outline" className="w-full bg-transparent">Créer un Compte</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Order Requirements */}
              <div className="rounded-lg border border-border bg-card p-4">
                <h3 className="font-semibold text-foreground">Conditions de Commande</h3>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Unité de vente</span>
                    <span className="font-medium text-foreground">{unitLabel}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Quantité minimum</span>
                    <span className="font-medium text-foreground">{product.minQuantity} {unitLabel}(s)</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Couleurs disponibles</span>
                    <div className="flex gap-1">
                      {product.colors.map((color) => (
                        <Badge key={color} variant="secondary" className="text-xs">
                          {productColors.find((c) => c.value === color)?.label || color}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Specifications */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Caractéristiques</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {product.specifications.width && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Largeur</span>
                      <span className="text-foreground">{product.specifications.width}</span>
                    </div>
                  )}
                  {product.specifications.length && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Longueur</span>
                      <span className="text-foreground">{product.specifications.length}</span>
                    </div>
                  )}
                  {product.specifications.material && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Matière</span>
                      <span className="text-foreground">{product.specifications.material}</span>
                    </div>
                  )}
                  {product.specifications.technique && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Technique</span>
                      <span className="text-foreground">{product.specifications.technique}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Artisan Section */}
          {artisan && (
            <section className="mt-12">
              <h2 className="text-xl font-bold text-foreground">L'Artisan</h2>
              <Card className="mt-4">
                <CardContent className="flex flex-col gap-6 p-6 sm:flex-row">
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <User className="h-12 w-12 text-primary/60" />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-lg font-semibold text-foreground">{artisan.name}</h3>
                      {artisan.certified && (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                          <Award className="mr-1 h-3 w-3" />
                          Certifié
                        </Badge>
                      )}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {artisan.location}, {artisan.region}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {artisan.yearsExperience} ans d'expérience
                      </span>
                    </div>
                    <p className="mt-3 text-muted-foreground">{artisan.bio}</p>
                    <Link href={`/artisans/${artisan.id}`}>
                      <Button variant="outline" size="sm" className="mt-4 bg-transparent">
                        Voir le profil
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </section>
          )}

          {/* Trust Signals */}
          <section className="mt-12 grid gap-4 sm:grid-cols-3">
            <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <h4 className="font-medium text-foreground">Authenticité Garantie</h4>
                <p className="text-sm text-muted-foreground">Certificat d'origine</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
              <Truck className="h-8 w-8 text-primary" />
              <div>
                <h4 className="font-medium text-foreground">Livraison Sécurisée</h4>
                <p className="text-sm text-muted-foreground">Suivi complet</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
              <Award className="h-8 w-8 text-primary" />
              <div>
                <h4 className="font-medium text-foreground">Qualité Contrôlée</h4>
                <p className="text-sm text-muted-foreground">Inspection avant envoi</p>
              </div>
            </div>
          </section>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <section className="mt-12">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-foreground">Produits Similaires</h2>
                <Link href="/catalogue">
                  <Button variant="ghost" size="sm">Voir tout</Button>
                </Link>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {relatedProducts.map((relatedProduct) => (
                  <Link key={relatedProduct.id} href={`/catalogue/${relatedProduct.id}`}>
                    <Card className="group h-full overflow-hidden transition-shadow hover:shadow-md">
                      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                        <div className="absolute inset-0 flex items-center justify-center bg-primary/10">
                          <span className="text-3xl font-bold text-primary/30">{relatedProduct.name[0]}</span>
                        </div>
                      </div>
                      <CardContent className="p-3">
                        <h3 className="font-medium text-foreground group-hover:text-primary line-clamp-1">
                          {relatedProduct.name}
                        </h3>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Min. {relatedProduct.minQuantity} pièces
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
