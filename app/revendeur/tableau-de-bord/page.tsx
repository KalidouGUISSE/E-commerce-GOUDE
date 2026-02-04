/**
 * Revendeur Dashboard - Page tableau de bord du revendeur
 * 
 * Page d'accueil de l'espace revendeur avec :
 * - Statistiques principales
 * - Activité récente
 * - Commandes en attente
 * - Alertes de stock
 */

'use client'

import { useState, useEffect } from 'react'
import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  Users,
  Package,
  DollarSign,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useResellerSidebar } from '@/hooks/use-reseller-sidebar'

// Types pour les statistiques
interface StatCard {
  title: string
  value: string
  change: number
  changeLabel: string
  icon: string
  trend: 'up' | 'down' | 'neutral'
}

// Types pour les commandes récentes
interface RecentOrder {
  id: string
  customer: string
  date: string
  amount: string
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
}

// Données simulées
const STATS: StatCard[] = [
  {
    title: 'Chiffre d\'affaires',
    value: '2.456.789 CFA',
    change: 12.5,
    changeLabel: 'ce mois',
    icon: 'dollar',
    trend: 'up',
  },
  {
    title: 'Commandes',
    value: '156',
    change: 8.2,
    changeLabel: 'ce mois',
    icon: 'cart',
    trend: 'up',
  },
  {
    title: 'Clients actifs',
    value: '89',
    change: -2.4,
    changeLabel: 'vs mois dernier',
    icon: 'users',
    trend: 'down',
  },
  {
    title: 'Produits en stock',
    value: '342',
    change: 0,
    changeLabel: 'aujourd\'hui',
    icon: 'package',
    trend: 'neutral',
  },
]

const RECENT_ORDERS: RecentOrder[] = [
  {
    id: 'CMD-2024-001',
    customer: 'Aminata Fall',
    date: '04/02/2024',
    amount: '125.000 CFA',
    status: 'pending',
  },
  {
    id: 'CMD-2024-002',
    customer: 'Fatou Diop',
    date: '03/02/2024',
    amount: '89.500 CFA',
    status: 'processing',
  },
  {
    id: 'CMD-2024-003',
    customer: 'Mariama Sy',
    date: '03/02/2024',
    amount: '256.000 CFA',
    status: 'shipped',
  },
  {
    id: 'CMD-2024-004',
    customer: 'Ndèye Fatou',
    date: '02/02/2024',
    amount: '78.250 CFA',
    status: 'delivered',
  },
]

const LOW_STOCK_PRODUCTS = [
  { id: 1, name: 'Pagne Manjak - Rouge', current: 5, min: 20, price: '15.000 CFA' },
  { id: 2, name: 'Pagne Kente - Bleu', current: 3, min: 15, price: '22.000 CFA' },
  { id: 3, name: 'Pagne Bogolan - Marron', current: 8, min: 25, price: '18.500 CFA' },
]

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  dollar: DollarSign,
  cart: ShoppingCart,
  users: Users,
  package: Package,
}

// Composant StatCard
function StatCard({ stat }: { stat: StatCard }) {
  const Icon = ICONS[stat.icon]
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {stat.title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{stat.value}</div>
        <div className="flex items-center gap-1 mt-1">
          {stat.trend === 'up' && (
            <ArrowUpRight className="h-4 w-4 text-green-500" />
          )}
          {stat.trend === 'down' && (
            <ArrowDownRight className="h-4 w-4 text-red-500" />
          )}
          <span
            className={`text-xs ${
              stat.trend === 'up'
                ? 'text-green-500'
                : stat.trend === 'down'
                ? 'text-red-500'
                : 'text-muted-foreground'
            }`}
          >
            {stat.change > 0 ? '+' : ''}{stat.change}%
          </span>
          <span className="text-xs text-muted-foreground">{stat.changeLabel}</span>
        </div>
      </CardContent>
    </Card>
  )
}

// Composant StatusBadge
function StatusBadge({ status }: { status: RecentOrder['status'] }) {
  const statusConfig = {
    pending: { label: 'En attente', className: 'bg-yellow-100 text-yellow-800' },
    processing: { label: 'En traitement', className: 'bg-blue-100 text-blue-800' },
    shipped: { label: 'Expédié', className: 'bg-purple-100 text-purple-800' },
    delivered: { label: 'Livré', className: 'bg-green-100 text-green-800' },
    cancelled: { label: 'Annulé', className: 'bg-red-100 text-red-800' },
  }
  
  const config = statusConfig[status]
  
  return (
    <Badge variant="secondary" className={config.className}>
      {config.label}
    </Badge>
  )
}

export default function RevendeurDashboardPage() {
  const { reseller, levelInfo } = useResellerSidebar()
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    // Simuler un chargement
    const timer = setTimeout(() => setIsLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])
  
  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-muted rounded" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-lg" />
          ))}
        </div>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Bonjour, {reseller.name.split(' ')[0]}
          </h1>
          <p className="text-muted-foreground mt-1">
            Voici un aperçu de votre activité aujourd'hui
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className={levelInfo.bg}>
            <span className={levelInfo.color}>Niveau {levelInfo.label}</span>
          </Badge>
        </div>
      </div>
      
      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {STATS.map((stat, index) => (
          <StatCard key={index} stat={stat} />
        ))}
      </div>
      
      {/* Contenu principal */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Commandes récentes */}
        <Card>
          <CardHeader>
            <CardTitle>Commandes récentes</CardTitle>
            <CardDescription>
              Vos dernières commandes en attente de traitement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Commande</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {RECENT_ORDERS.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{order.customer}</TableCell>
                    <TableCell>{order.amount}</TableCell>
                    <TableCell>
                      <StatusBadge status={order.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Button variant="outline" className="w-full mt-4" asChild>
              <a href="/revendeur/commandes">Voir toutes les commandes</a>
            </Button>
          </CardContent>
        </Card>
        
        {/* Alertes stock */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Alertes de stock
            </CardTitle>
            <CardDescription>
              Produits nécessitant un réapprovisionnement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {LOW_STOCK_PRODUCTS.map((product) => (
                <div key={product.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.price}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-orange-500">
                        {product.current} en stock
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Minimum: {product.min}
                      </p>
                    </div>
                  </div>
                  <Progress
                    value={(product.current / product.min) * 100}
                    className="h-2"
                  />
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4" asChild>
              <a href="/revendeur/stocks">Gérer les stocks</a>
            </Button>
          </CardContent>
        </Card>
      </div>
      
      {/* Activité récente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Activité récente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { action: 'Nouvelle commande', detail: 'CMD-2024-001 de Aminata Fall', time: 'Il y a 5 minutes', type: 'order' },
              { action: 'Paiement reçu', detail: '125.000 CFA de Fatou Diop', time: 'Il y a 1 heure', type: 'payment' },
              { action: 'Nouveau client', detail: 'Mariama Sy s\'est inscrite', time: 'Il y a 2 heures', type: 'customer' },
              { action: 'Livraison effectuée', detail: 'Commande CMD-2024-000', time: 'Il y a 3 heures', type: 'delivery' },
            ].map((activity, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  {activity.type === 'order' && <ShoppingCart className="h-5 w-5 text-primary" />}
                  {activity.type === 'payment' && <DollarSign className="h-5 w-5 text-green-500" />}
                  {activity.type === 'customer' && <Users className="h-5 w-5 text-blue-500" />}
                  {activity.type === 'delivery' && <Package className="h-5 w-5 text-purple-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{activity.action}</p>
                  <p className="text-sm text-muted-foreground truncate">{activity.detail}</p>
                </div>
                <p className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
