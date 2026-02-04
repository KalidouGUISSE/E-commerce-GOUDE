"use client"

import React from "react"
import Link from "next/link"
import {
  Package,
  Users,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Edit,
  Trash2,
  Plus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/hooks/use-auth"
import { users, orders, products, artisans } from "@/lib/data/index"

// Admin statistics
const stats = [
  {
    title: "Total Utilisateurs",
    value: users.length,
    change: "+12%",
    trend: "up",
    icon: Users,
    description: "dont 3 administrateurs",
  },
  {
    title: "Produits Actifs",
    value: products.filter((p) => p.is_active).length,
    change: "+5",
    trend: "up",
    icon: Package,
    description: "sur {products.length} total",
  },
  {
    title: "Commandes Totales",
    value: orders.length,
    change: "+23%",
    trend: "up",
    icon: ShoppingCart,
    description: "ce mois-ci",
  },
  {
    title: "Chiffre d'Affaires",
    value: "885K",
    suffix: "XOF",
    change: "+18%",
    trend: "up",
    icon: DollarSign,
    description: "sur les 30 derniers jours",
  },
]

// Recent orders for admin
const recentOrders = [
  {
    id: "CMD-2024-003",
    customer: "Jean Dupont",
    reseller: "Dupont Textiles",
    amount: 275000,
    status: "pending",
    date: "02 Fév 2025",
  },
  {
    id: "CMD-2024-002",
    customer: "Aïssa Diop",
    reseller: "Diop Fashion",
    amount: 450000,
    status: "processing",
    date: "01 Fév 2025",
  },
  {
    id: "CMD-2024-001",
    customer: "Mariama Sow",
    reseller: "Sow Couture",
    amount: 160000,
    status: "delivered",
    date: "30 Jan 2025",
  },
]

// Recent users
const recentUsers = users.slice(0, 5)

const getStatusBadge = (status: string) => {
  const variants: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800",
    processing: "bg-blue-100 text-blue-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  }
  const labels: Record<string, string> = {
    pending: "En attente",
    processing: "En traitement",
    delivered: "Livré",
    cancelled: "Annulé",
  }
  return (
    <Badge className={variants[status] || ""}>
      {labels[status] || status}
    </Badge>
  )
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    minimumFractionDigits: 0,
  }).format(amount)
}

export default function AdminDashboardPage() {
  const { user } = useAuth()

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tableau de Bord</h1>
          <p className="text-muted-foreground">
            Bienvenue, {user?.name}. Voici l'aperçu de votre plateforme.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/tableau-de-bord/utilisateurs">
            <Button variant="outline">
              <Users className="mr-2 h-4 w-4" />
              Gérer Utilisateurs
            </Button>
          </Link>
          <Link href="/catalogue">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter Produit
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <stat.icon className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stat.value}
                {stat.suffix && (
                  <span className="text-sm font-normal text-muted-foreground">
                    {" "}
                    {stat.suffix}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                {stat.trend === "up" ? (
                  <ArrowUpRight className="h-4 w-4 text-green-600" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-600" />
                )}
                <span
                  className={`text-xs font-medium ${
                    stat.trend === "up" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {stat.change}
                </span>
                <span className="text-xs text-muted-foreground">{stat.description}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Commandes Récentes</CardTitle>
              <CardDescription>Dernières commandes passées sur la plateforme</CardDescription>
            </div>
            <Link href="/tableau-de-bord/commandes">
              <Button variant="ghost" size="sm">
                Voir tout
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-accent/50"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <ShoppingCart className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{order.id}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.reseller} • {order.date}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(order.amount)}</p>
                      {getStatusBadge(order.status)}
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Actions Rapides</CardTitle>
            <CardDescription>Tâches administratives fréquentes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              <Link href="/tableau-de-bord/utilisateurs">
                <Button variant="outline" className="w-full justify-start bg-transparent h-auto py-3">
                  <Users className="mr-2 h-4 w-4" />
                  <div className="text-left">
                    <p className="font-medium">Utilisateurs</p>
                    <p className="text-xs text-muted-foreground">
                      Gérer les comptes admin
                    </p>
                  </div>
                </Button>
              </Link>
              <Link href="/tableau-de-bord/produits">
                <Button variant="outline" className="w-full justify-start bg-transparent h-auto py-3">
                  <Package className="mr-2 h-4 w-4" />
                  <div className="text-left">
                    <p className="font-medium">Produits</p>
                    <p className="text-xs text-muted-foreground">
                      Gérer le catalogue
                    </p>
                  </div>
                </Button>
              </Link>
              <Link href="/tableau-de-bord/artisans">
                <Button variant="outline" className="w-full justify-start bg-transparent h-auto py-3">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  <div className="text-left">
                    <p className="font-medium">Artisans</p>
                    <p className="text-xs text-muted-foreground">
                      Gérer les partenaires
                    </p>
                  </div>
                </Button>
              </Link>
              <Link href="/tableau-de-bord/parametres">
                <Button variant="outline" className="w-full justify-start bg-transparent h-auto py-3">
                  <DollarSign className="mr-2 h-4 w-4" />
                  <div className="text-left">
                    <p className="font-medium">Paramètres</p>
                    <p className="text-xs text-muted-foreground">
                      Configuration générale
                    </p>
                  </div>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Users */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Utilisateurs Récents</CardTitle>
            <CardDescription>Derniers comptes créés sur la plateforme</CardDescription>
          </div>
          <Link href="/tableau-de-bord/utilisateurs">
            <Button variant="ghost" size="sm">
              Gérer
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentUsers.map((u) => (
              <div
                key={u.id}
                className="flex items-center justify-between rounded-lg border border-border p-4"
              >
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src="/placeholder-user.jpg" alt={u.first_name} />
                    <AvatarFallback>
                      {getInitials(`${u.first_name} ${u.last_name}`)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {u.first_name} {u.last_name}
                    </p>
                    <p className="text-sm text-muted-foreground">{u.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant={u.role_id === 1 ? "default" : "secondary"}>
                    {u.role_id === 1 ? "Admin" : u.role_id === 2 ? "Revendeur" : "Artisan"}
                  </Badge>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Edit className="h-4 w-4" />
                    </Button>
                    {u.role_id === 1 && (
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
