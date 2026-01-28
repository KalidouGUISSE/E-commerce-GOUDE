"use client"

import { useState } from "react"
import Link from "next/link"
import { 
  Package, 
  FileText, 
  Clock, 
  CheckCircle2, 
  Truck, 
  AlertCircle,
  Download,
  Eye,
  User,
  Settings,
  LogOut,
  ShoppingCart,
  TrendingUp,
  Calendar
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

// Demo data
const userInfo = {
  name: "Mamadou Diallo",
  business: "Boutique Teranga Textiles",
  email: "mamadou@teranga.sn",
  phone: "+221 77 123 45 67",
  region: "Dakar",
  memberSince: "Janvier 2024",
  status: "verified",
}

const stats = [
  { label: "Commandes", value: "12", icon: Package, change: "+3 ce mois" },
  { label: "Total Achats", value: "2.4M", suffix: "FCFA", icon: TrendingUp, change: "+15%" },
  { label: "Factures", value: "8", icon: FileText, change: "2 en attente" },
]

const recentOrders = [
  {
    id: "CMD-2024-0042",
    date: "15 Jan 2024",
    items: 3,
    total: 275000,
    status: "delivered",
    statusLabel: "Livré",
  },
  {
    id: "CMD-2024-0041",
    date: "10 Jan 2024",
    items: 5,
    total: 450000,
    status: "shipped",
    statusLabel: "En transit",
  },
  {
    id: "CMD-2024-0040",
    date: "5 Jan 2024",
    items: 2,
    total: 180000,
    status: "processing",
    statusLabel: "En préparation",
  },
  {
    id: "CMD-2024-0039",
    date: "28 Dec 2023",
    items: 4,
    total: 320000,
    status: "delivered",
    statusLabel: "Livré",
  },
]

const invoices = [
  {
    id: "FAC-2024-0042",
    orderId: "CMD-2024-0042",
    date: "15 Jan 2024",
    amount: 275000,
    status: "paid",
    statusLabel: "Payée",
  },
  {
    id: "FAC-2024-0041",
    orderId: "CMD-2024-0041",
    date: "10 Jan 2024",
    amount: 450000,
    status: "pending",
    statusLabel: "En attente",
  },
  {
    id: "FAC-2024-0040",
    orderId: "CMD-2024-0040",
    date: "5 Jan 2024",
    amount: 180000,
    status: "paid",
    statusLabel: "Payée",
  },
]

const getStatusIcon = (status: string) => {
  switch (status) {
    case "delivered":
      return <CheckCircle2 className="h-4 w-4 text-green-600" />
    case "shipped":
      return <Truck className="h-4 w-4 text-blue-600" />
    case "processing":
      return <Clock className="h-4 w-4 text-amber-600" />
    default:
      return <AlertCircle className="h-4 w-4 text-muted-foreground" />
  }
}

const getStatusBadge = (status: string, label: string) => {
  const variants: Record<string, string> = {
    delivered: "bg-green-100 text-green-800 hover:bg-green-100",
    shipped: "bg-blue-100 text-blue-800 hover:bg-blue-100",
    processing: "bg-amber-100 text-amber-800 hover:bg-amber-100",
    paid: "bg-green-100 text-green-800 hover:bg-green-100",
    pending: "bg-amber-100 text-amber-800 hover:bg-amber-100",
  }
  return <Badge className={variants[status] || ""}>{label}</Badge>
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 bg-muted/30">
        {/* Dashboard Header */}
        <section className="border-b border-border bg-card py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground">Tableau de Bord</h1>
                <p className="mt-1 text-muted-foreground">
                  Bienvenue, {userInfo.name}
                </p>
              </div>
              <div className="flex gap-3">
                <Link href="/catalogue">
                  <Button>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Nouvelle Commande
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Stats Cards */}
          <div className="grid gap-4 sm:grid-cols-3">
            {stats.map((stat) => (
              <Card key={stat.label}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="mt-1 text-2xl font-bold text-foreground">
                        {stat.value}
                        {stat.suffix && <span className="text-base font-normal text-muted-foreground"> {stat.suffix}</span>}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">{stat.change}</p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <stat.icon className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
            <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-none">
              <TabsTrigger value="overview">Aperçu</TabsTrigger>
              <TabsTrigger value="orders">Commandes</TabsTrigger>
              <TabsTrigger value="invoices">Factures</TabsTrigger>
              <TabsTrigger value="profile">Profil</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-6 space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Recent Orders */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Commandes Récentes</CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => setActiveTab("orders")}>
                      Voir tout
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {recentOrders.slice(0, 3).map((order) => (
                      <div key={order.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(order.status)}
                          <div>
                            <p className="font-medium text-foreground">{order.id}</p>
                            <p className="text-sm text-muted-foreground">{order.date}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{order.total.toLocaleString()} FCFA</p>
                          {getStatusBadge(order.status, order.statusLabel)}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Actions Rapides</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-3 sm:grid-cols-2">
                    <Link href="/catalogue">
                      <Button variant="outline" className="w-full justify-start bg-transparent">
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Catalogue
                      </Button>
                    </Link>
                    <Link href="/contact">
                      <Button variant="outline" className="w-full justify-start bg-transparent">
                        <FileText className="mr-2 h-4 w-4" />
                        Demander un Devis
                      </Button>
                    </Link>
                    <Button variant="outline" className="w-full justify-start bg-transparent" onClick={() => setActiveTab("invoices")}>
                      <Download className="mr-2 h-4 w-4" />
                      Télécharger Factures
                    </Button>
                    <Button variant="outline" className="w-full justify-start bg-transparent" onClick={() => setActiveTab("profile")}>
                      <Settings className="mr-2 h-4 w-4" />
                      Paramètres
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Account Status */}
              <Card className="border-green-200 bg-green-50">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-900">Compte Vérifié</h3>
                    <p className="text-sm text-green-700">
                      Votre compte revendeur est actif. Vous avez accès à tous les prix grossiste et pouvez passer commande.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Orders Tab */}
            <TabsContent value="orders" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Historique des Commandes</CardTitle>
                  <CardDescription>Consultez et suivez toutes vos commandes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentOrders.map((order) => (
                      <div key={order.id} className="flex flex-col gap-4 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-4">
                          {getStatusIcon(order.status)}
                          <div>
                            <p className="font-medium text-foreground">{order.id}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {order.date}
                              <span>•</span>
                              {order.items} articles
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between gap-4 sm:justify-end">
                          <div className="text-right">
                            <p className="font-semibold">{order.total.toLocaleString()} FCFA</p>
                            {getStatusBadge(order.status, order.statusLabel)}
                          </div>
                          <Button variant="outline" size="sm">
                            <Eye className="mr-2 h-4 w-4" />
                            Détails
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Invoices Tab */}
            <TabsContent value="invoices" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Factures</CardTitle>
                  <CardDescription>Téléchargez vos factures et justificatifs</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {invoices.map((invoice) => (
                      <div key={invoice.id} className="flex flex-col gap-4 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-medium text-foreground">{invoice.id}</p>
                          <p className="text-sm text-muted-foreground">
                            Commande: {invoice.orderId} • {invoice.date}
                          </p>
                        </div>
                        <div className="flex items-center justify-between gap-4 sm:justify-end">
                          <div className="text-right">
                            <p className="font-semibold">{invoice.amount.toLocaleString()} FCFA</p>
                            {getStatusBadge(invoice.status, invoice.statusLabel)}
                          </div>
                          <Button variant="outline" size="sm">
                            <Download className="mr-2 h-4 w-4" />
                            PDF
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Profile Tab */}
            <TabsContent value="profile" className="mt-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Informations du Compte</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                        <User className="h-8 w-8 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{userInfo.name}</p>
                        <p className="text-sm text-muted-foreground">{userInfo.business}</p>
                        <Badge className="mt-1 bg-green-100 text-green-800 hover:bg-green-100">
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          Vérifié
                        </Badge>
                      </div>
                    </div>
                    <Separator />
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Email</span>
                        <span className="text-foreground">{userInfo.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Téléphone</span>
                        <span className="text-foreground">{userInfo.phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Région</span>
                        <span className="text-foreground">{userInfo.region}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Membre depuis</span>
                        <span className="text-foreground">{userInfo.memberSince}</span>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full bg-transparent">
                      <Settings className="mr-2 h-4 w-4" />
                      Modifier le Profil
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Sécurité</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      Changer le mot de passe
                    </Button>
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      Modifier l'email
                    </Button>
                    <Button variant="outline" className="w-full justify-start bg-transparent">
                      Modifier le téléphone
                    </Button>
                    <Separator />
                    <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive bg-transparent">
                      <LogOut className="mr-2 h-4 w-4" />
                      Se Déconnecter
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  )
}
