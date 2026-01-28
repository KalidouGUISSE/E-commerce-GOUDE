import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

export default function LegalPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Page Header */}
        <section className="border-b border-border bg-card py-8">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <Link href="/">
              <Button variant="ghost" size="sm" className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour à l'accueil
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
              Mentions Légales
            </h1>
            <p className="mt-2 text-muted-foreground">
              Dernière mise à jour : Janvier 2024
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="prose prose-slate max-w-none">
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-foreground">1. Éditeur du Site</h2>
              <div className="mt-4 space-y-2 text-muted-foreground">
                <p><strong className="text-foreground">Raison sociale :</strong> Pagne Tissé Distribution SARL</p>
                <p><strong className="text-foreground">Siège social :</strong> Dakar, Sénégal</p>
                <p><strong className="text-foreground">NINEA :</strong> XXXXXXXXXX</p>
                <p><strong className="text-foreground">Capital social :</strong> X XXX XXX FCFA</p>
                <p><strong className="text-foreground">Directeur de publication :</strong> [Nom du directeur]</p>
                <p><strong className="text-foreground">Contact :</strong> contact@pagnetisse.sn</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-foreground">2. Hébergement</h2>
              <div className="mt-4 space-y-2 text-muted-foreground">
                <p><strong className="text-foreground">Hébergeur :</strong> Vercel Inc.</p>
                <p><strong className="text-foreground">Adresse :</strong> 340 S Lemon Ave #4133, Walnut, CA 91789, USA</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-foreground">3. Propriété Intellectuelle</h2>
              <p className="mt-4 text-muted-foreground">
                L'ensemble du contenu de ce site (textes, images, logos, vidéos, éléments graphiques) 
                est protégé par le droit d'auteur et reste la propriété exclusive de Pagne Tissé Distribution 
                ou de ses partenaires. Toute reproduction, représentation, modification ou exploitation 
                non autorisée est strictement interdite.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-foreground">4. Données Personnelles</h2>
              <p className="mt-4 text-muted-foreground">
                Les informations personnelles collectées sur ce site sont destinées à Pagne Tissé Distribution 
                et sont utilisées pour la gestion des commandes, la relation client et l'amélioration de nos services. 
                Conformément à la loi sénégalaise sur la protection des données personnelles, vous disposez 
                d'un droit d'accès, de rectification et de suppression de vos données.
              </p>
              <p className="mt-4 text-muted-foreground">
                Pour exercer ces droits, contactez-nous à : privacy@pagnetisse.sn
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-foreground">5. Cookies</h2>
              <p className="mt-4 text-muted-foreground">
                Ce site utilise des cookies pour améliorer l'expérience utilisateur et analyser le trafic. 
                En continuant votre navigation, vous acceptez l'utilisation de ces cookies. 
                Vous pouvez configurer votre navigateur pour refuser les cookies.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-foreground">6. Limitation de Responsabilité</h2>
              <p className="mt-4 text-muted-foreground">
                Pagne Tissé Distribution s'efforce d'assurer l'exactitude des informations présentées 
                sur ce site, mais ne peut garantir leur exhaustivité. L'entreprise ne saurait être tenue 
                responsable des erreurs, omissions ou résultats qui pourraient être obtenus par un mauvais 
                usage de ces informations.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-foreground">7. Droit Applicable</h2>
              <p className="mt-4 text-muted-foreground">
                Les présentes mentions légales sont soumises au droit sénégalais. 
                En cas de litige, les tribunaux de Dakar seront seuls compétents.
              </p>
            </section>
          </div>

          {/* Related Links */}
          <div className="mt-12 rounded-lg border border-border bg-muted p-6">
            <h3 className="font-semibold text-foreground">Documents Connexes</h3>
            <div className="mt-4 flex flex-wrap gap-4">
              <Link href="/cgv">
                <Button variant="outline" size="sm">Conditions Générales de Vente</Button>
              </Link>
              <Link href="/confidentialite">
                <Button variant="outline" size="sm">Politique de Confidentialité</Button>
              </Link>
              <Link href="/livraison">
                <Button variant="outline" size="sm">Politique de Livraison</Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
