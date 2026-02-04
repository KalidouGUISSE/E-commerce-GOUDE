/**
 * Page d'historique des commandes
 * Route: /revendeur/commandes/historique
 * 
 * Fonctionnalités:
 * - Liste des commandes validées/livrées
 * - Filtres par période, statut, montant
 * - Recherche avancée
 * - Détails, export PDF, suivi
 */

'use client'

import { useState } from 'react'
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Package, 
  Truck, 
  Calendar,
  DollarSign,
  TrendingUp,
  RotateCcw,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Loader2
} from 'lucide-react'
import { useResellerOrdersHistory, OrderHistory } from '@/hooks/use-reseller-orders-history'
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'

// Composant Timeline
function OrderTimeline({ order }: { order: OrderHistory }) {
  const steps = [
    { status: 'processing', label: 'Commande passée', date: order.createdAt, icon: Package },
    { status: 'shipped', label: 'Expédiée', date: order.updatedAt, icon: Truck },
    { status: 'delivered', label: 'Livrée', date: order.status === 'delivered' ? order.updatedAt : null, icon: Eye },
  ]

  const getStepStatus = (stepStatus: string) => {
    const statusOrder = ['processing', 'shipped', 'delivered']
    const currentIndex = statusOrder.indexOf(order.deliveryStatus)
    const stepIndex = statusOrder.indexOf(stepStatus)
    
    if (stepIndex <= currentIndex) return 'completed'
    return 'pending'
  }

  return (
    <div className="space-y-4">
      {steps.map((step, index) => {
        const status = getStepStatus(step.status)
        const Icon = step.icon
        
        return (
          <div key={step.status} className="flex items-start gap-4">
            <div className={`flex flex-col items-center`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                status === 'completed' 
                  ? 'bg-green-100 text-green-600' 
                  : 'bg-muted text-muted-foreground'
              }`}>
                <Icon className="w-5 h-5" />
              </div>
              {index < steps.length - 1 && (
                <div className={`w-0.5 h-12 ${
                  status === 'completed' ? 'bg-green-200' : 'bg-muted'
                }`} />
              )}
            </div>
            <div className="flex-1 pb-4">
              <div className="font-medium">{step.label}</div>
              {step.date && status === 'completed' && (
                <div className="text-sm text-muted-foreground">
                  {formatDateTime(step.date)}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function ResellerOrdersHistoryPage() {
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
    isDetailModalOpen,
    setIsDetailModalOpen,
    selectedOrder,
    openDetailModal,
    closeDetailModal,
    downloadPDF,
    trackDelivery,
    exportOrders,
  } = useResellerOrdersHistory()

  const [localSearch, setLocalSearch] = useState('')
  const [isExporting, setIsExporting] = useState(false)

  const handleSearch = (value: string) => {
    setLocalSearch(value)
    updateFilters({ search: value, page: 1 })
  }

  const handlePeriodChange = (value: string) => {
    updateFilters({ period: value, page: 1 })
  }

  const handleStatusChange = (value: string) => {
    const statuses = value === 'all' ? [] : [value]
    updateFilters({ status: statuses, page: 1 })
  }

  const handleExport = async () => {
    setIsExporting(true)
    await exportOrders('pdf')
    setIsExporting(false)
  }

  // Statut badge component
  const StatusBadge = ({ status }: { status: OrderHistory['status'] }) => {
    const variants = {
      delivered: 'bg-green-100 text-green-800 border-green-200',
      in_transit: 'bg-blue-100 text-blue-800 border-blue-200',
      returned: 'bg-orange-100 text-orange-800 border-orange-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
    } as const

    const labels = {
      delivered: 'Livrée',
      in_transit: 'En transit',
      returned: 'Retournée',
      cancelled: 'Annulée',
    }

    return (
      <Badge className={`${variants[status]} border flex items-center w-fit`}>
        {labels[status]}
      </Badge>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Historique des Commandes</h1>
          <p className="text-muted-foreground">
            Consultez l'historique de vos commandes validées et livrées
          </p>
        </div>
        <Button onClick={handleExport} disabled={isExporting}>
          {isExporting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          Exporter PDF
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Commandes</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Montant Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalAmount)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux Livraison</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.deliveryRate.toFixed(1)}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Retours</CardTitle>
            <RotateCcw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.returnsCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par commande, client, produit..."
                value={localSearch}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filters.period} onValueChange={handlePeriodChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Période" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes périodes</SelectItem>
                <SelectItem value="today">Aujourd'hui</SelectItem>
                <SelectItem value="week">Cette semaine</SelectItem>
                <SelectItem value="month">Ce mois</SelectItem>
                <SelectItem value="year">Cette année</SelectItem>
              </SelectContent>
            </Select>
            <Select 
              value={filters.status.length > 0 ? filters.status[0] : 'all'} 
              onValueChange={handleStatusChange}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous statuts</SelectItem>
                <SelectItem value="delivered">Livrées</SelectItem>
                <SelectItem value="in_transit">En transit</SelectItem>
                <SelectItem value="returned">Retournées</SelectItem>
                <SelectItem value="cancelled">Annulées</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={resetFilters}>
              <Filter className="mr-2 h-4 w-4" />
              Réinitialiser
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Actions de groupe */}
      {selectedOrders.length > 0 && (
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedOrders.length === orders.length}
                  onCheckedChange={() => {
                    if (selectedOrders.length === orders.length) {
                      clearSelection()
                    } else {
                      selectAllOrders()
                    }
                  }}
                />
                <span className="text-sm font-medium">
                  {selectedOrders.length} commande(s) sélectionnée(s)
                </span>
              </div>
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" />
                Exporter la sélection
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Liste des commandes */}
      <Card>
        <CardHeader>
          <CardTitle>Historique des Commandes</CardTitle>
          <CardDescription>
            {orders.length} commande(s) trouvée(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={orders.length > 0 && selectedOrders.length === orders.length}
                      onCheckedChange={() => {
                        if (selectedOrders.length === orders.length) {
                          clearSelection()
                        } else {
                          selectAllOrders()
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead>Commande</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead className="text-right">Montant</TableHead>
                  <TableHead>Articles</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      Aucune commande trouvée
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedOrders.includes(order.id)}
                          onCheckedChange={() => toggleOrderSelection(order.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{order.orderNumber}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{formatDate(order.date)}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{order.clientName}</div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(order.totalAmount)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{order.products.length} article(s)</Badge>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={order.status} />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => openDetailModal(order)}
                            title="Voir les détails"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => downloadPDF(order.id)}
                            title="Télécharger PDF"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          {order.carrierUrl && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => trackDelivery(order.id)}
                              title="Suivre la livraison"
                            >
                              <Truck className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {orders.length > 0 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Affichage de {pagination.start + 1} à {pagination.end} sur {pagination.total} résultats
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Précédent
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={pagination.page === page ? 'default' : 'outline'}
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => goToPage(page)}
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                >
                  Suivant
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de détails */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Détails de la Commande</DialogTitle>
            <DialogDescription>
              {selectedOrder?.orderNumber}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            {selectedOrder && (
              <div className="space-y-6">
                {/* Statut */}
                <div className="flex items-center justify-between">
                  <StatusBadge status={selectedOrder.status} />
                  <div className="text-sm text-muted-foreground">
                    Date: {formatDateTime(selectedOrder.date)}
                  </div>
                </div>

                <Separator />

                {/* Client */}
                <div>
                  <h4 className="font-medium mb-2">Informations Client</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Nom:</span>
                      <span className="ml-2">{selectedOrder.clientName}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Email:</span>
                      <span className="ml-2">{selectedOrder.clientEmail}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Téléphone:</span>
                      <span className="ml-2">{selectedOrder.clientPhone}</span>
                    </div>
                  </div>
                </div>

                {/* Adresse de livraison */}
                <div>
                  <h4 className="font-medium mb-2">Adresse de livraison</h4>
                  <div className="text-sm">
                    <div>{selectedOrder.deliveryAddress.street}</div>
                    <div>{selectedOrder.deliveryAddress.postalCode} {selectedOrder.deliveryAddress.city}</div>
                    <div>{selectedOrder.deliveryAddress.country}</div>
                  </div>
                </div>

                {/* Suivi */}
                {selectedOrder.trackingNumber && (
                  <div>
                    <h4 className="font-medium mb-2">Suivi de livraison</h4>
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <div className="text-sm font-medium">{selectedOrder.carrier}</div>
                        <div className="text-xs text-muted-foreground">
                          {selectedOrder.trackingNumber}
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => trackDelivery(selectedOrder.id)}
                      >
                        <Truck className="mr-2 h-4 w-4" />
                        Suivre
                      </Button>
                    </div>
                  </div>
                )}

                {/* Timeline */}
                <div>
                  <h4 className="font-medium mb-4">État de la commande</h4>
                  <OrderTimeline order={selectedOrder} />
                </div>

                {/* Produits */}
                <div>
                  <h4 className="font-medium mb-2">Produits commandés</h4>
                  <div className="space-y-2">
                    {selectedOrder.products.map((product, idx) => (
                      <div 
                        key={idx} 
                        className="flex items-center justify-between p-3 bg-muted rounded-lg"
                      >
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-xs text-muted-foreground">
                            Réf: {product.reference} × {product.quantity}
                          </div>
                        </div>
                        <div className="font-medium">
                          {formatCurrency(product.totalPrice)}
                        </div>
                      </div>
                    ))}
                    <Separator />
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Sous-total</span>
                        <span>{formatCurrency(selectedOrder.subtotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Frais de livraison</span>
                        <span>{formatCurrency(selectedOrder.shippingCost)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span>{formatCurrency(selectedOrder.totalAmount)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {selectedOrder.notes && (
                  <div>
                    <h4 className="font-medium mb-2">Notes</h4>
                    <p className="text-sm p-3 bg-muted rounded-lg">
                      {selectedOrder.notes}
                    </p>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={closeDetailModal}>
              Fermer
            </Button>
            {selectedOrder && (
              <Button onClick={() => downloadPDF(selectedOrder.id)}>
                <Download className="mr-2 h-4 w-4" />
                Télécharger PDF
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
