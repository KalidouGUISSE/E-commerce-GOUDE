"use client"

import React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, Lock, Mail, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { useAuth } from "@/hooks/use-auth"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const { login, isLoading, error, user } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const authUser = await login({ email, password })
    if (authUser) {
      // Redirect based on user role
      if (authUser.role === "admin") {
        router.push("/tableau-de-bord")
      } else if (authUser.role === "reseller") {
        router.push("/revendeur")
      } else if (authUser.role === "artisan") {
        router.push("/artisans")
      } else {
        router.push("/")
      }
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Lock className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-2xl">Connexion Revendeur</CardTitle>
              <CardDescription>
                Connectez-vous pour accéder aux prix grossiste et passer commande
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email">Adresse email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="votre@email.com"
                      className="pl-10"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Mot de passe</Label>
                    <Link href="/mot-de-passe-oublie" className="text-sm text-primary hover:underline">
                      Mot de passe oublié ?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-10 pr-10"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      <span className="sr-only">{showPassword ? "Masquer" : "Afficher"} le mot de passe</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox id="remember" />
                  <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
                    Rester connecté
                  </Label>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Connexion en cours..." : "Se Connecter"}
                  {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Pas encore de compte ?{" "}
                  <Link href="/inscription" className="font-medium text-primary hover:underline">
                    Créer un compte revendeur
                  </Link>
                </p>
              </div>

              {/* Trust Signals */}
              <div className="mt-8 rounded-lg bg-muted p-4">
                <h4 className="text-sm font-medium text-foreground">Avantages Revendeur</h4>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Accès aux prix grossiste exclusifs
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Suivi de commandes en temps réel
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Historique et factures téléchargeables
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    Support prioritaire
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Help Link */}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Besoin d'aide ?{" "}
            <Link href="/contact" className="text-primary hover:underline">
              Contactez notre support
            </Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  )
}
