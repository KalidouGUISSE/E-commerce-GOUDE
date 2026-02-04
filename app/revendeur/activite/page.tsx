/**
 * Activité Revendeur - Page tableau de bord d'activité
 * 
 * Cette page affiche :
 * - KPIs avec tendances
 * - Graphiques (CA, catégories, statuts)
 * - Historique d'activité paginé
 * - Alertes contextuelles
 * - Objectifs commerciaux
 */

'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  ShoppingCart,
  Target,
  AlertTriangle,
  Bell,
  Download,
  Calendar,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Eye,
  Download as DownloadIcon,
  Mail,
  Clock,
  FileText,
  CreditCard,
  UserPlus,
  Settings,
  CheckCircle,
  X,
  BarChart3,
  PieChart,
  RefreshCw,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useResellerActivity } from '@/hooks/use-reseller-activity'
import { cn } from '@/lib/utils'

// Mapping des icônes
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  'trending-up': TrendingUp,
  'dollar': DollarSign,
  'users': Users,
  'shopping-cart': ShoppingCart,
  'target': Target,
  'eye': Eye,
  'download': DownloadIcon,
  'mail': Mail,
  'file': FileText,
  'credit-card': CreditCard,
  'user-plus': UserPlus,
  'settings': Settings,
}

// Composant KPICard
function KPICard({ kpi }: { kpi: ReturnType<typeof useResellerActivity>['kpis'][0] }) {
  const Icon = ICON_MAP[kpi.icon] || TrendingUp
  const isPositive = kpi.trend === 'up' && kpi.id !== 'customers' || kpi.id === 'customers' && kpi.trend === 'down'
  
  const formatValue = (val: number | string) => {
    if (typeof val === 'number') {
      if (kpi.id === 'revenue' || kpi.id === 'conversion') {
        return val.toLocaleString() + (kpi.unit === 'CFA' ? ' CFA' : '%')
      }
      return val.toLocaleString()
    }
    return val
  }
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {kpi.label}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatValue(kpi.value)}</div>
        <div className="flex items-center gap-2 mt-1">
          {kpi.trend !== 'neutral' && (
            <>
              {isPositive ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <span
                className={cn(
                  'text-sm',
                  isPositive ? 'text-green-600' : 'text-red-600'
                )}
              >
                {isPositive ? '+' : ''}{kpi.changePercent.toFixed(1)}%
              </span>
            </>
          )}
          <span className="text-sm text-muted-foreground">vs mois dernier</span>
        </div>
      </CardContent>
    </Card>
  )
}

// Composant AlertBanner
function AlertBanner({ 
  alerts, 
  onDismiss 
}: { 
  alerts: ReturnType<typeof useResellerActivity>['alerts']
  onDismiss: (id: string) => void
}) {
  const unreadAlerts = alerts.filter(a => !a.isRead)
  
  if (unreadAlerts.length === 0) return null
  
  return (
    <div className="space-y-2 mb-6">
      {unreadAlerts.slice(0, 3).map((alert) => (
        <div
          key={alert.id}
          className={cn(
            'flex items-center justify-between p-4 rounded-lg border-l-4',
            alert.type === 'warning' && 'bg-yellow-50 border-yellow-500',
            alert.type === 'info' && 'bg-blue-50 border-blue-500',
            alert.type === 'error' && 'bg-red-50 border-red-500',
            alert.type === 'success' && 'bg-green-50 border-green-500'
          )}
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className={cn(
              'h-5 w-5',
              alert.type === 'warning' && 'text-yellow-500',
              alert.type === 'info' && 'text-blue-500',
              alert.type === 'error' && 'text-red-500',
              alert.type === 'success' && 'text-green-500'
            )} />
            <div>
              <p className="font-medium">{alert.title}</p>
              <p className="text-sm text-muted-foreground">{alert.message}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={alert.href}>Voir</Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDismiss(alert.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}

// Composant ObjectiveCard
function ObjectiveCard({ objective }: { 
  objective: ReturnType<typeof useResellerActivity>['objectives'][0] 
}) {
  const progress = Math.min((objective.currentValue / objective.targetValue) * 100, 100)
  const remaining = objective.targetValue - objective.currentValue
  
  const statusConfig = {
    on_track: { color: 'text-green-600', bg: 'bg-green-100', label: 'En bonne voie' },
    at_risk: { color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'À risque' },
    behind: { color: 'text-red-600', bg: 'bg-red-100', label: 'En retard' },
  }
  
  const status = statusConfig[objective.status]
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{objective.label}</CardTitle>
          <Badge className={cn(status.bg, status.color)}>{status.label}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-2xl font-bold">
              {objective.currentValue.toLocaleString()} {objective.unit}
            </p>
            <p className="text-xs text-muted-foreground">
              Objectif: {objective.targetValue.toLocaleString()} {objective.unit}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">{progress.toFixed(1)}%</p>
            <p className="text-xs text-muted-foreground">
              {remaining > 0 ? `${remaining.toLocaleString()} ${objective.unit} restant` : 'Objectif atteint'}
            </p>
          </div>
        </div>
        <Progress value={progress} className="h-2" />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Mois {objective.period === 'monthly' ? 'en cours' : 'Q1 2024'}</span>
          <span className={cn(
            objective.changePercent >= 0 ? 'text-green-600' : 'text-red-600'
          )}>
            {objective.changePercent >= 0 ? '+' : ''}{objective.changePercent}% vs période précédente
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

// Composant ActivityRow
function ActivityRow({ activity }: { 
  activity: ReturnType<typeof useResellerActivity>['activities'][0] 
}) {
  const typeConfig = {
    order: { icon: ShoppingCart, color: 'text-blue-500', bg: 'bg-blue-100' },
    quote: { icon: FileText, color: 'text-purple-500', bg: 'bg-purple-100' },
    payment: { icon: CreditCard, color: 'text-green-500', bg: 'bg-green-100' },
    registration: { icon: UserPlus, color: 'text-orange-500', bg: 'bg-orange-100' },
    account_update: { icon: Settings, color: 'text-gray-500', bg: 'bg-gray-100' },
  }
  
  const config = typeConfig[activity.type]
  const Icon = config.icon
  
  return (
    <TableRow>
      <TableCell className="whitespace-nowrap">
        <div className="flex flex-col">
          <span className="font-medium">{activity.date}</span>
          <span className="text-xs text-muted-foreground">{activity.time}</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <div className={cn('p-2 rounded-full', config.bg)}>
            <Icon className={cn('h-4 w-4', config.color)} />
          </div>
          <div>
            <p className="font-medium capitalize">{activity.type.replace('_', ' ')}</p>
            <p className="text-sm text-muted-foreground">{activity.description}</p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div>
          <p className="font-medium">{activity.user}</p>
          <p className="text-xs text-muted-foreground">{activity.userRef}</p>
        </div>
      </TableCell>
      <TableCell>
        <Badge variant={activity.status.includes('En attente') ? 'secondary' : activity.status.includes('Annulé') ? 'destructive' : 'default'}>
          {activity.status}
        </Badge>
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {activity.actions.map((action, idx) => (
              <DropdownMenuItem key={idx}>
                <Link href={action.href} className="flex items-center gap-2">
                  {action.icon === 'eye' && <Eye className="h-4 w-4" />}
                  {action.icon === 'download' && <DownloadIcon className="h-4 w-4" />}
                  {action.icon === 'mail' && <Mail className="h-4 w-4" />}
                  {action.icon === 'file' && <FileText className="h-4 w-4" />}
                  {action.icon === 'send' && <DownloadIcon className="h-4 w-4" />}
                  {action.icon === 'user' && <UserPlus className="h-4 w-4" />}
                  {action.icon === 'bell' && <Bell className="h-4 w-4" />}
                  {action.icon === 'history' && <Clock className="h-4 w-4" />}
                  {action.label}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )
}

// Composant ChartsSection
function ChartsSection({ 
  revenueChart, 
  categoryChart, 
  orderStatusChart 
}: { 
  revenueChart: ReturnType<typeof useResellerActivity>['revenueChart']
  categoryChart: ReturnType<typeof useResellerActivity>['categoryChart']
  orderStatusChart: ReturnType<typeof useResellerActivity>['orderStatusChart']
}) {
  const maxRevenue = Math.max(...revenueChart.map(d => d.value))
  
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Graphique CA */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Évolution du chiffre d'affaires</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Mensuel</Button>
              <Button variant="ghost" size="sm">Hebdomadaire</Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-end gap-2">
            {revenueChart.map((point, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                <div 
                  className="w-full bg-primary rounded-t transition-all duration-300 hover:bg-primary/80"
                  style={{ height: `${(point.value / maxRevenue) * 100}%` }}
                />
                <span className="text-xs text-muted-foreground">{point.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Catégories et Statuts */}
      <div className="space-y-6">
        {/* Catégories */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Ventes par catégorie</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {categoryChart.map((cat, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span>{cat.category}</span>
                  <span className="font-medium">{cat.value.toLocaleString()} CFA</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{ 
                      width: `${(cat.value / categoryChart[0].value) * 100}%`,
                      backgroundColor: cat.color 
                    }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        
        {/* Statut commandes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Répartition des commandes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {orderStatusChart.map((status, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: status.color }}
                    />
                    <span>{status.status}</span>
                  </div>
                  <span className="font-medium">{status.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Page principale
export default function ActivitePage() {
  const {
    filters,
    updateFilters,
    resetFilters,
    goToPage,
    pagination,
    kpis,
    revenueChart,
    categoryChart,
    orderStatusChart,
    activities,
    alerts,
    unreadAlerts,
    dismissAlert,
    objectives,
    exportData,
  } = useResellerActivity()
  
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Activité</h1>
          <p className="text-muted-foreground mt-1">
            Suivez votre performance commerciale
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setIsExportDialogOpen(true)}>
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </div>
      </div>
      
      {/* Alertes */}
      <AlertBanner alerts={alerts} onDismiss={dismissAlert} />
      
      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi, idx) => (
          <KPICard key={idx} kpi={kpi} />
        ))}
      </div>
      
      {/* Graphiques */}
      <ChartsSection 
        revenueChart={revenueChart}
        categoryChart={categoryChart}
        orderStatusChart={orderStatusChart}
      />
      
      {/* Objectifs et Historique */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Objectifs */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-lg font-semibold">Objectifs commerciaux</h2>
          {objectives.map((objective, idx) => (
            <ObjectiveCard key={idx} objective={objective} />
          ))}
          <Button variant="outline" className="w-full" asChild>
            <Link href="/revendeur/objectifs">
              <Target className="h-4 w-4 mr-2" />
              Gérer les objectifs
            </Link>
          </Button>
        </div>
        
        {/* Historique */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Historique d'activité</h2>
            <Badge variant="secondary">
              {pagination.total} activités
            </Badge>
          </div>
          
          {/* Filtres */}
          <Card>
            <CardContent className="p-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <div className="space-y-1">
                  <Label className="text-xs">Type</Label>
                  <Select
                    value={filters.type || 'all'}
                    onValueChange={(value) => updateFilters({ type: value === 'all' ? '' : value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tous types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous types</SelectItem>
                      <SelectItem value="order">Commande</SelectItem>
                      <SelectItem value="quote">Devis</SelectItem>
                      <SelectItem value="payment">Paiement</SelectItem>
                      <SelectItem value="registration">Inscription</SelectItem>
                      <SelectItem value="account_update">Mise à jour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-1">
                  <Label className="text-xs">Statut</Label>
                  <Select
                    value={filters.status || 'all'}
                    onValueChange={(value) => updateFilters({ status: value === 'all' ? '' : value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tous statuts" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous statuts</SelectItem>
                      <SelectItem value="En attente">En attente</SelectItem>
                      <SelectItem value="Validée">Validée</SelectItem>
                      <SelectItem value="Livrée">Livrée</SelectItem>
                      <SelectItem value="Annulée">Annulée</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-1">
                  <Label className="text-xs">Date début</Label>
                  <Input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => updateFilters({ startDate: e.target.value })}
                  />
                </div>
                
                <div className="space-y-1">
                  <Label className="text-xs">Date fin</Label>
                  <Input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => updateFilters({ endDate: e.target.value })}
                  />
                </div>
                
                <div className="space-y-1">
                  <Label className="text-xs">Recherche</Label>
                  <div className="flex gap-1">
                    <Input
                      placeholder="Description..."
                      value={filters.search}
                      onChange={(e) => updateFilters({ search: e.target.value })}
                    />
                    {filters.search && (
                      <Button variant="ghost" size="icon" onClick={resetFilters}>
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Tableau */}
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activities.length > 0 ? (
                  activities.map((activity, idx) => (
                    <ActivityRow key={idx} activity={activity} />
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Aucune activité trouvée
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
          
          {/* Pagination */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Label className="text-xs">Afficher</Label>
              <Select
                value={filters.limit.toString()}
                onValueChange={(value) => updateFilters({ limit: parseInt(value), page: 1 })}
              >
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {pagination.start + 1}-{pagination.end} sur {pagination.total}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => goToPage(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => goToPage(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Dialog Export */}
      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Exporter les données</DialogTitle>
            <DialogDescription>
              Choisissez le format d'export pour votre rapport d'activité
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Button 
              variant="outline" 
              className="justify-start" 
              onClick={() => {
                exportData('csv')
                setIsExportDialogOpen(false)
              }}
            >
              <FileText className="h-4 w-4 mr-2" />
              Exporter en CSV
            </Button>
            <Button 
              variant="outline" 
              className="justify-start"
              onClick={() => {
                exportData('pdf')
                setIsExportDialogOpen(false)
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Exporter en PDF
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
