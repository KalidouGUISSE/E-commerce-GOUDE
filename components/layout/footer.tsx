import Link from "next/link"
import { Phone, Mail, MapPin } from "lucide-react"

const footerLinks = {
  plateforme: [
    { name: "Catalogue", href: "/catalogue" },
    { name: "Devenir Revendeur", href: "/inscription" },
    { name: "Comment Commander", href: "/comment-commander" },
    { name: "Modes de Paiement", href: "/paiements" },
  ],
  entreprise: [
    { name: "À Propos", href: "/a-propos" },
    { name: "Nos Artisans", href: "/artisans" },
    { name: "Certifications", href: "/certifications" },
    { name: "Presse", href: "/presse" },
  ],
  support: [
    { name: "Contact", href: "/contact" },
    { name: "FAQ", href: "/faq" },
    { name: "Livraison", href: "/livraison" },
    { name: "Retours", href: "/retours" },
  ],
  legal: [
    { name: "Mentions Légales", href: "/mentions-legales" },
    { name: "CGV", href: "/cgv" },
    { name: "Confidentialité", href: "/confidentialite" },
  ],
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand Column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded bg-primary">
                <span className="text-lg font-bold text-primary-foreground">PT</span>
              </div>
              <span className="text-lg font-semibold text-foreground">Pagne Tissé</span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Plateforme B2B de distribution de tissus africains traditionnels. 
              Connectant artisans et revendeurs depuis le Sénégal.
            </p>
            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>+221 33 XXX XX XX</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>contact@pagnetisse.sn</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>Dakar, Sénégal</span>
              </div>
            </div>
          </div>

          {/* Links Columns */}
          <div>
            <h3 className="text-sm font-semibold text-foreground">Plateforme</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.plateforme.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground">Entreprise</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.entreprise.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground">Support</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground">Légal</h3>
            <ul className="mt-4 space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Pagne Tissé Distribution. Tous droits réservés.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground">Paiements acceptés:</span>
            <div className="flex items-center gap-2">
              <div className="rounded bg-secondary/20 px-2 py-1 text-xs font-medium text-secondary">
                Orange Money
              </div>
              <div className="rounded bg-secondary/20 px-2 py-1 text-xs font-medium text-secondary">
                Wave
              </div>
              <div className="rounded bg-primary/20 px-2 py-1 text-xs font-medium text-primary">
                Virement
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
