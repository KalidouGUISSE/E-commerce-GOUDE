import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Shield, Truck, Users, Award, CheckCircle2, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

const features = [
  {
    icon: Shield,
    title: "Qualité Certifiée",
    description: "Tous nos tissus proviennent d'artisans vérifiés avec des certificats d'authenticité.",
  },
  {
    icon: Truck,
    title: "Livraison Fiable",
    description: "Expédition nationale et internationale avec suivi complet de vos commandes.",
  },
  {
    icon: Users,
    title: "Réseau d'Artisans",
    description: "Plus de 200 tisserands certifiés à travers le Sénégal et l'Afrique de l'Ouest.",
  },
  {
    icon: Award,
    title: "Prix Grossiste",
    description: "Tarifs préférentiels pour les revendeurs avec des quantités minimum adaptées.",
  },
]

const categories = [
  {
    name: "Pagne Manjak",
    origin: "Casamance",
    image: "/images/manjak.jpg",
  },
  {
    name: "Pagne Sérère",
    origin: "Sine-Saloum",
    image: "/images/serere.jpg",
  },
  {
    name: "Thioup",
    origin: "Sénégal",
    image: "/images/thioup.jpg",
  },
  {
    name: "Kente",
    origin: "Ghana",
    image: "/images/kente.jpg",
  },
]

const stats = [
  { value: "200+", label: "Artisans Partenaires" },
  { value: "15K+", label: "Pièces en Stock" },
  { value: "500+", label: "Revendeurs Actifs" },
  { value: "12", label: "Pays Livrés" },
]

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-primary">
          <div className="absolute inset-0 bg-[url('/images/hero-pattern.jpg')] opacity-10" />
          <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-medium uppercase tracking-wider text-primary-foreground/80">
                Plateforme B2B de Distribution
              </p>
              <h1 className="mt-4 text-balance text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl lg:text-5xl">
                Tissus Africains Traditionnels pour Professionnels
              </h1>
              <p className="mt-6 text-pretty text-lg leading-relaxed text-primary-foreground/90">
                Connectez-vous directement avec des artisans certifiés du Sénégal. 
                Approvisionnement fiable en pagnes tissés authentiques pour votre activité de revente.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link href="/inscription">
                  <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                    Devenir Revendeur
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/catalogue">
                  <Button size="lg" variant="outline" className="w-full border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 sm:w-auto bg-transparent">
                    Voir le Catalogue
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Banner */}
        <section className="border-b border-border bg-card py-6">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-6 px-4 sm:gap-12 lg:justify-between">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-bold text-foreground sm:text-3xl">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
                Comment ça fonctionne
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
                Une plateforme simple et efficace pour approvisionner votre commerce en tissus authentiques.
              </p>
            </div>
            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { step: "1", title: "Inscription", desc: "Créez votre compte revendeur en quelques minutes" },
                { step: "2", title: "Validation", desc: "Notre équipe vérifie votre profil professionnel" },
                { step: "3", title: "Commande", desc: "Accédez aux prix grossiste et passez commande" },
                { step: "4", title: "Livraison", desc: "Recevez vos tissus avec suivi complet" },
              ].map((item) => (
                <div key={item.step} className="relative text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                    {item.step}
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Categories Preview */}
        <section className="bg-muted py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
                  Nos Catégories de Tissus
                </h2>
                <p className="mt-2 text-muted-foreground">
                  Une sélection de pagnes tissés traditionnels d'Afrique de l'Ouest
                </p>
              </div>
              <Link href="/catalogue">
                <Button variant="outline">
                  Voir tout le catalogue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {categories.map((category) => (
                <Link key={category.name} href={`/catalogue?type=${category.name.toLowerCase()}`}>
                  <Card className="group overflow-hidden transition-shadow hover:shadow-lg">
                    <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                      <div className="absolute inset-0 flex items-center justify-center bg-primary/10">
                        <span className="text-4xl font-bold text-primary/30">{category.name[0]}</span>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-foreground group-hover:text-primary">
                        {category.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">Origine: {category.origin}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
                Pourquoi choisir Pagne Tissé Distribution
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
                Une plateforme conçue pour les professionnels du textile africain
              </p>
            </div>
            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => (
                <Card key={feature.title} className="border-0 bg-muted/50">
                  <CardContent className="p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="mt-4 font-semibold text-foreground">{feature.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* B2B Notice */}
        <section className="border-y border-border bg-card py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center gap-6 rounded-lg bg-muted p-6 sm:flex-row sm:p-8">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-secondary/20">
                <Shield className="h-8 w-8 text-secondary" />
              </div>
              <div className="text-center sm:text-left">
                <h3 className="text-lg font-semibold text-foreground">
                  Plateforme Réservée aux Professionnels
                </h3>
                <p className="mt-1 text-muted-foreground">
                  Les prix et quantités sont visibles uniquement après validation de votre compte revendeur. 
                  Quantités minimum obligatoires pour toutes les commandes.
                </p>
              </div>
              <Link href="/inscription" className="shrink-0">
                <Button>
                  S'inscrire
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-primary py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-primary-foreground sm:text-3xl">
              Prêt à développer votre activité ?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-primary-foreground/90">
              Rejoignez notre réseau de revendeurs et accédez à une sélection premium de tissus africains traditionnels.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/inscription">
                <Button size="lg" variant="secondary">
                  Créer un Compte Revendeur
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 bg-transparent">
                  <Phone className="mr-2 h-4 w-4" />
                  Nous Contacter
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
