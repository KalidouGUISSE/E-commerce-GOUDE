/**
 * Commandes Revendeur - Page de gestion des commandes
 * 
 * Cette page permet de :
 * - Consulter la liste des commandes paginée
 * - Filtrer par statut (en attente, en cours, livrée, annulée)
 * - Rechercher par nom de client ou numéro de commande
 * - Afficher les détails de chaque commande
 * - Mettre à jour le statut des commandes
 * - Actions bulk pour modifier plusieurs statuts
 * - Exporter en CSV
 */

'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  ShoppingCart,
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Eye,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Package,
  RefreshCw,
  X,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/components/ui/use-toast'
import { useResellerOrders, type ResellerOrder } from '@/hooks/use-reseller-orders'
import { cn, formatCurrency } from '@/lib/utils'

// Configuration des statuts avec couleurs
const STATUS_CONFIG = {
  pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: Clock },
  processing: { label: 'En cours', color: 'bg-blue-100 text-blue-800 border-blue-300', icon: RefreshCw },
  shipped: { label: 'Expédiée', color: 'bg-purple-100 text-purple-800 border-purple-300', icon: Truck },
  delivered: { label: 'Livrée', color: 'bg-green-100 text-green-800 border-green-300', icon: CheckCircle },
  cancelled: { label: 'Annulée', color: 'bg-red-100 text-red-800 border-red-300', icon: XCircle },
}

const PAYMENT_STATUS_CONFIG = {
  pending: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
  paid: { label: 'Payée', color: 'bg-green-100 text-green-800' },
  refunded: { label: 'Remboursée', color: 'bg-gray-100 text-gray-800' },
}

// Composant StatCard
function StatCard({
  icon: Icon,
  label,
  value,
  description,
  trend,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string | number
  description?: string
  trend?: 'up' | 'down'
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  )
}

// Composant OrderRow
function OrderRow({
  order,
  isSelected,
  onToggleSelect,
  onUpdateStatus,
  onViewDetails,
}: {
  order: ResellerOrder
  isSelected: boolean
  onToggleSelect: (orderId: string) => void
  onUpdateStatus: (order: ResellerOrder) => void
  onViewDetails: (order: ResellerOrder) => void
}) {
  const status = STATUS_CONFIG[order.status]
  const StatusIcon = status.icon

  return (
    <TableRow className={cn(isSelected && 'bg-muted/50')}>
      <TableCell className="w-[50px]">
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onToggleSelect(order.id)}
        />
      </TableCell>
      <TableCell className="whitespace-nowrap">
        <div className="flex flex-col">
          <span className="font-medium">{order.orderNumber}</span>
          <span className="text-xs text-muted-foreground">
            {new Date(order.createdAt).toLocaleDateString('fr-FR')}
          </span>
        </div>
      </TableCell>
      <TableCell className="whitespace-nowrap">
        <div className="flex flex-col">
          <span className="font-medium">{order.customerName}</span>
          <span className="text-xs text-muted-foreground">{order.customerRef}</span>
        </div>
      </TableCell>
      <TableCell className="whitespace-nowrap">
        <div className="flex flex-col">
          <span className="text-sm">{order.products.length} produit(s)</span>
          <span className="text-xs text-muted-foreground">
            {order.products.reduce((sum, p) => sum + p.quantity, 0)} articles
          </span>
        </div>
      </TableCell>
      <TableCell className="whitespace-nowrap text-right font-medium">
        {formatCurrency(order.total)}
      </TableCell>
      <TableCell className="whitespace-nowrap">
        <div className="flex items-center gap-2">
          <div className={cn('p-1 rounded-full', status.color.split(' ')[0])}>
            <StatusIcon className={cn('h-3 w-3', status.color.split(' ')[1])} />
          </div>
          <Badge className={cn(status.color, 'border')}>{status.label}</Badge>
        </div>
      </TableCell>
      <TableCell className="whitespace-nowrap">
        <Badge className={cn(PAYMENT_STATUS_CONFIG[order.paymentStatus].color)}>
          {PAYMENT_STATUS_CONFIG[order.paymentStatus].label}
        </Badge>
      </TableCell>
      <TableCell className="whitespace-nowrap">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onViewDetails(order)}>
              <Eye className="h-4 w-4 mr-2" />
              Voir détails
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onUpdateStatus(order)}>
              <Clock className="h-4 w-4 mr-2" />
              Changer le statut
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )
}

// Composant OrderDetailsDialog
function OrderDetailsDialog({
  order,
  isOpen,
  onClose,
}: {
  order: ResellerOrder | null
  isOpen: boolean
  onClose: () => void
}) {
  if (!order) return null

  const status = STATUS_CONFIG[order.status]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <ShoppingCart className="h-5 w-5" />
            Commande {order.orderNumber}
          </DialogTitle>
          <DialogDescription>
            Passée le {new Date(order.createdAt).toLocaleDateString('fr-FR')} à{' '}
            {new Date(order.createdAt).toLocaleTimeString('fr-FR')}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Statut */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge className={cn(status.color, 'border')}>{status.label}</Badge>
              <Badge className={cn(PAYMENT_STATUS_CONFIG[order.paymentStatus].color)}>
                {PAYMENT_STATUS_CONFIG[order.paymentStatus].label}
              </Badge>
            </div>
            <span className="font-bold text-lg">{formatCurrency(order.total)}</span>
          </div>

          <Separator />

          {/* Client */}
          <div>
            <h4 className="font-medium mb-2">Informations client</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Nom:</span>{' '}
                <span className="font-medium">{order.customerName}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Référence:</span>{' '}
                <span className="font-medium">{order.customerRef}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Email:</span>{' '}
                <span>{order.customerEmail}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Téléphone:</span>{' '}
                <span>{order.customerPhone}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Adresse de livraison */}
          <div>
            <h4 className="font-medium mb-2">Adresse de livraison</h4>
            <p className="text-sm">
              {order.shippingAddress}, {order.shippingCity} ({order.shippingRegion})
            </p>
          </div>

          <Separator />

          {/* Produits */}
          <div>
            <h4 className="font-medium mb-2">Produits commandés</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produit</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead className="text-center">Qté</TableHead>
                  <TableHead className="text-right">Prix unitaire</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{product.category}</Badge>
                    </TableCell>
                    <TableCell className="text-center">{product.quantity}</TableCell>
                    <TableCell className="text-right">{formatCurrency(product.unitPrice)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(product.totalPrice)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <Separator />

          {/* Totaux */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Sous-total</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Frais de livraison</span>
              <span>{formatCurrency(order.shippingCost)}</span>
            </div>
            {order.tax > 0 && (
              <div className="flex justify-between text-sm">
                <span>Taxes</span>
                <span>{formatCurrency(order.tax)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg pt-2 border-t">
              <span>Total</span>
              <span>{formatCurrency(order.total)}</span>
            </div>
          </div>

          {order.notes && (
            <>
              <Separator />
              <div>
                <h4 className="font-medium mb-2">Notes</h4>
                <p className="text-sm text-muted-foreground">{order.notes}</p>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Page principale
export default function CommandesPage() {
  const { toast } = useToast()
  const {
    filters,
    updateFilters,
    resetFilters,
    goToPage,
    pagination,
    orders,
    stats,
    selectedOrders,
    toggleOrderSelection,
    selectAllOrders,
    clearSelection,
    isStatusDialogOpen,
    setIsStatusDialogOpen,
    newStatus,
    openStatusDialog,
    updateOrderStatus,
    exportOrders,
  } = useResellerOrders()

  const [orderDetails, setOrderDetails] = useState<ResellerOrder | null>(null)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleViewDetails = (order: ResellerOrder) => {
    setOrderDetails(order)
    setIsDetailsDialogOpen(true)
  }

  const handleUpdateStatus = (order: ResellerOrder) => {
    openStatusDialog(order.status === 'pending' ? 'processing' : 'delivered')
  }

  const handleBulkUpdateStatus = async () => {
    if (!newStatus || selectedOrders.length === 0) return

    setIsLoading(true)
    try {
      const success = await updateOrderStatus(selectedOrders, newStatus)
      if (success) {
        toast({
          title: 'Statut mis à jour',
          description: `${selectedOrders.length} commande(s) mise(s) à jour vers "${STATUS_CONFIG[newStatus].label}".`,
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportCSV = () => {
    // Generate CSV
    const headers = ['Numéro', 'Client', 'Email', 'Téléphone', 'Statut', 'Paiement', 'Total', 'Date']
    const rows = orders.map(o => [
      o.orderNumber,
      o.customerName,
      o.customerEmail,
      o.customerPhone,
      STATUS_CONFIG[o.status].label,
      PAYMENT_STATUS_CONFIG[o.paymentStatus].label,
      o.total.toString(),
      new Date(o.createdAt).toLocaleDateString('fr-FR'),
    ])
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `commandes-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)

    toast({
      title: 'Export réussi',
      description: 'Le fichier CSV a été téléchargé.',
    })
  }

  const allSelected = orders.length > 0 && selectedOrders.length === orders.length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Commandes</h1>
          <p className="text-muted-foreground mt-1">
            Gérez les commandes de vos clients
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" />
            Exporter CSV
          </Button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={ShoppingCart}
          label="Total commandes"
          value={stats.totalOrders}
        />
        <StatCard
          icon={Clock}
          label="En attente"
          value={stats.pendingCount}
          description="Commandes en attente"
        />
        <StatCard
          icon={Truck}
          label="En cours"
          value={stats.processingCount + stats.shippedCount}
          description="En traitement ou expédition"
        />
        <StatCard
          icon={CheckCircle}
          label="Montant total"
          value={formatCurrency(stats.totalAmount)}
          description={`PAN: ${formatCurrency(stats.averageOrderValue)}`}
        />
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="p-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
            {/* Recherche */}
            <div className="lg:col-span-2 space-y-1">
              <Label className="text-xs">Recherche</Label>
              <div className="flex gap-1">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="N° commande, client..."
                    value={filters.search}
                    onChange={(e) => updateFilters({ search: e.target.value, page: 1 })}
                    className="pl-8"
                  />
                </div>
                {filters.search && (
                  <Button variant="ghost" size="icon" onClick={resetFilters}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Statut */}
            <div className="space-y-1">
              <Label className="text-xs">Statut</Label>
              <Select
                value={filters.status || 'all'}
                onValueChange={(value) => updateFilters({ status: value === 'all' ? '' : value, page: 1 })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tous" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="processing">En cours</SelectItem>
                  <SelectItem value="shipped">Expédiée</SelectItem>
                  <SelectItem value="delivered">Livrée</SelectItem>
                  <SelectItem value="cancelled">Annulée</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Paiement */}
            <div className="space-y-1">
              <Label className="text-xs">Paiement</Label>
              <Select
                value={filters.paymentStatus || 'all'}
                onValueChange={(value) => updateFilters({ paymentStatus: value === 'all' ? '' : value, page: 1 })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tous" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="paid">Payée</SelectItem>
                  <SelectItem value="refunded">Remboursée</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date de */}
            <div className="space-y-1">
              <Label className="text-xs">Du</Label>
              <Input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => updateFilters({ dateFrom: e.target.value, page: 1 })}
              />
            </div>

            {/* Date à */}
            <div className="space-y-1">
              <Label className="text-xs">Au</Label>
              <Input
                type="date"
                value={filters.dateTo}
                onChange={(e) => updateFilters({ dateTo: e.target.value, page: 1 })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions bulk */}
      {selectedOrders.length > 0 && (
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {selectedOrders.length} commande(s) sélectionnée(s)
                </span>
                <Button variant="ghost" size="sm" onClick={clearSelection}>
                  <X className="h-4 w-4 mr-1" />
                  Effacer
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Modifier le statut:</span>
                <Button size="sm" variant="outline" onClick={() => openStatusDialog('processing')}>
                  <Clock className="h-4 w-4 mr-1" />
                  En cours
                </Button>
                <Button size="sm" variant="outline" onClick={() => openStatusDialog('shipped')}>
                  <Truck className="h-4 w-4 mr-1" />
                  Expédiée
                </Button>
                <Button size="sm" variant="outline" onClick={() => openStatusDialog('delivered')}>
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Livrée
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tableau */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell className="w-[50px]">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={(checked) => {
                    if (checked) selectAllOrders()
                    else clearSelection()
                  }}
                />
              </TableCell>
              <TableHead className="w-[140px]">Commande</TableHead>
              <TableHead className="w-[180px]">Client</TableHead>
              <TableHead className="w-[120px]">Produits</TableHead>
              <TableHead className="w-[120px] text-right">Total</TableHead>
              <TableHead className="w-[130px]">Statut</TableHead>
              <TableHead className="w-[100px]">Paiement</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length > 0 ? (
              orders.map((order, idx) => (
                <OrderRow
                  key={idx}
                  order={order}
                  isSelected={selectedOrders.includes(order.id)}
                  onToggleSelect={toggleOrderSelection}
                  onUpdateStatus={handleUpdateStatus}
                  onViewDetails={handleViewDetails}
                />
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  Aucune commande trouvée
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

      {/* Dialog détails commande */}
      <OrderDetailsDialog
        order={orderDetails}
        isOpen={isDetailsDialogOpen}
        onClose={() => setIsDetailsDialogOpen(false)}
      />

      {/* Dialog confirmation changement de statut */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer le changement de statut</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir changer le statut de {selectedOrders.length} commande(s) vers «{' '}
              {newStatus ? STATUS_CONFIG[newStatus]?.label : ''} » ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleBulkUpdateStatus} disabled={isLoading}>
              {isLoading ? 'Mise à jour...' : 'Confirmer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
