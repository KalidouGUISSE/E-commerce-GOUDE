/**
 * Page des commandes en attente
 * Route: /revendeur/commandes/en-attente
 * 
 * Fonctionnalités:
 * - Liste des commandes en attente de validation
 * - Affichage des détails de chaque commande
 * - Validation/Refus de commandes
 * - Actions en lot
 * - Recherche et filtres
 */

'use client'

import { useState } from 'react'
import { 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ChevronLeft, 
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Eye,
  Check,
  X,
  Package,
  User,
  Calendar,
  DollarSign,
  Loader2
} from 'lucide-react'
import { useResellerPendingOrders, PendingOrder } from '@/hooks/use-reseller-pending-orders'
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
import { Textarea } from '@/components/ui/textarea'

export default function ResellerPendingOrdersPage() {
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
    isApproveDialogOpen,
    setIsApproveDialogOpen,
    isRejectDialogOpen,
    setIsRejectDialogOpen,
    approvingOrder,
    rejectingOrder,
    rejectReason,
    setRejectReason,
    openApproveDialog,
    openRejectDialog,
    approveOrder,
    rejectOrder,
    approveSelectedOrders,
    rejectSelectedOrders,
  } = useResellerPendingOrders()

  const [localSearch, setLocalSearch] = useState('')
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSearch = (value: string) => {
    setLocalSearch(value)
    updateFilters({ search: value, page: 1 })
  }

  const handleSort = (column: string) => {
    const newOrder = filters.sortBy === column && filters.sortOrder === 'asc' ? 'desc' : 'asc'
    updateFilters({ sortBy: column, sortOrder: newOrder })
  }

  const handleApprove = async () => {
    setIsLoading(true)
    try {
      await approveOrder()
      setFeedbackMessage({ type: 'success', text: 'Commande approuvée avec succès' })
    } catch {
      setFeedbackMessage({ type: 'error', text: 'Erreur lors de l\'approbation' })
    }
    setIsLoading(false)
    setTimeout(() => setFeedbackMessage(null), 3000)
  }

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      setFeedbackMessage({ type: 'error', text: 'Veuillez fournir un motif de refus' })
      return
    }
    setIsLoading(true)
    try {
      await rejectOrder()
      setFeedbackMessage({ type: 'success', text: 'Commande refusée' })
    } catch {
      setFeedbackMessage({ type: 'error', text: 'Erreur lors du refus' })
    }
    setIsLoading(false)
    setTimeout(() => setFeedbackMessage(null), 3000)
  }

  const toggleExpanded = (orderId: string) => {
    setExpandedOrder(prev => prev === orderId ? null : orderId)
  }

  // Statut badge component
  const StatusBadge = ({ status }: { status: PendingOrder['status'] }) => {
    const variants = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      approved: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
    } as const

    const labels = {
      pending: 'En attente',
      approved: 'Approuvée',
      rejected: 'Refusée',
    }

    const icons = {
      pending: <Clock className="w-3 h-3 mr-1" />,
      approved: <CheckCircle2 className="w-3 h-3 mr-1" />,
      rejected: <XCircle className="w-3 h-3 mr-1" />,
    }

    return (
      <Badge className={`${variants[status]} border flex items-center w-fit`}>
        {icons[status]}
        {labels[status]}
      </Badge>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Feedback Message */}
      {feedbackMessage && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-top-2 ${
          feedbackMessage.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {feedbackMessage.type === 'success' ? (
            <Check className="w-5 h-5" />
          ) : (
            <X className="w-5 h-5" />
          )}
          {feedbackMessage.text}
        </div>
      )}

      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Commandes en Attente</h1>
          <p className="text-muted-foreground">
            Gérez les commandes en attente de validation pour votre compte revendeur
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-lg px-4 py-2">
            <Clock className="w-4 h-4 mr-2" />
            {stats.totalPending} en attente
          </Badge>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Attente</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approuvées</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalApproved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Refusées</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRejected}</div>
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
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par commande, client..."
                value={localSearch}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => updateFilters({ dateFrom: e.target.value })}
              className="w-[180px]"
              placeholder="Date de début"
            />
            <Input
              type="date"
              value={filters.dateTo}
              onChange={(e) => updateFilters({ dateTo: e.target.value })}
              className="w-[180px]"
              placeholder="Date de fin"
            />
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
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={approveSelectedOrders}>
                  <Check className="mr-2 h-4 w-4" />
                  Tout approuver
                </Button>
                <Button variant="outline" size="sm" onClick={rejectSelectedOrders}>
                  <X className="mr-2 h-4 w-4" />
                  Tout refuser
                </Button>
                <Button variant="outline" size="sm" onClick={clearSelection}>
                  Annuler
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Liste des commandes */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Commandes</CardTitle>
          <CardDescription>
            Commandes en attente de validation ({orders.length} total)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Aucune commande en attente</p>
              </div>
            ) : (
              orders.map((order) => (
                <div 
                  key={order.id} 
                  className={`border rounded-lg overflow-hidden transition-all ${
                    expandedOrder === order.id ? 'ring-2 ring-primary' : ''
                  }`}
                >
                  {/* Ligne principale */}
                  <div className="p-4 flex items-center justify-between hover:bg-muted/50">
                    <div className="flex items-center gap-4">
                      <Checkbox
                        checked={selectedOrders.includes(order.id)}
                        onCheckedChange={() => toggleOrderSelection(order.id)}
                      />
                      <div className="flex flex-col gap-1">
                        <div className="font-medium">{order.orderNumber}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {order.clientName}
                        </div>
                      </div>
                    </div>
                    
                    <div className="hidden md:flex items-center gap-6">
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(order.date)}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">{formatCurrency(order.totalAmount)}</div>
                        <div className="text-xs text-muted-foreground">
                          {order.products.length} produit(s)
                        </div>
                      </div>
                      <StatusBadge status={order.status} />
                    </div>

                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => toggleExpanded(order.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {order.status === 'pending' && (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-green-600 hover:bg-green-50"
                            onClick={() => openApproveDialog(order)}
                          >
                            <Check className="w-3 h-3 mr-1" />
                            Approuver
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => openRejectDialog(order)}
                          >
                            <X className="w-3 h-3 mr-1" />
                            Refuser
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Détails développés */}
                  {expandedOrder === order.id && (
                    <div className="border-t bg-muted/30 p-4">
                      <div className="grid md:grid-cols-2 gap-6">
                        {/* Informations client */}
                        <div>
                          <h4 className="font-medium mb-3">Informations Client</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Nom:</span>
                              <span>{order.clientName}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Email:</span>
                              <span>{order.clientEmail}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Date commande:</span>
                              <span>{formatDateTime(order.date)}</span>
                            </div>
                            {order.notes && (
                              <div className="mt-3 pt-3 border-t">
                                <span className="text-muted-foreground block mb-1">Notes:</span>
                                <p className="italic">{order.notes}</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Produits commandés */}
                        <div>
                          <h4 className="font-medium mb-3">Produits Commandés</h4>
                          <div className="space-y-2">
                            {order.products.map((product, idx) => (
                              <div key={idx} className="flex items-center justify-between p-2 bg-background rounded text-sm">
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
                            <div className="flex justify-between font-bold">
                              <span>Total</span>
                              <span>{formatCurrency(order.totalAmount)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {orders.length > 0 && (
            <div className="flex items-center justify-between mt-6">
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

      {/* Dialog d'approbation */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approuver la Commande</DialogTitle>
            <DialogDescription>
              Vous êtes sur le point d'approuver la commande {approvingOrder?.orderNumber}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {approvingOrder && (
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Client:</span>
                  <span className="font-medium">{approvingOrder.clientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Montant:</span>
                  <span className="font-medium">{formatCurrency(approvingOrder.totalAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Produits:</span>
                  <span className="font-medium">{approvingOrder.products.length}</span>
                </div>
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              Cette action approuvera la commande et informera le client de la validation.
              Êtes-vous sûr de vouloir continuer ?
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApproveDialogOpen(false)} disabled={isLoading}>
              Annuler
            </Button>
            <Button onClick={handleApprove} disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Check className="mr-2 h-4 w-4" />
              )}
              Approuver
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de rejet */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Refuser la Commande</DialogTitle>
            <DialogDescription>
              Vous êtes sur le point de refuser la commande {rejectingOrder?.orderNumber}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {rejectingOrder && (
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Client:</span>
                  <span className="font-medium">{rejectingOrder.clientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Montant:</span>
                  <span className="font-medium">{formatCurrency(rejectingOrder.totalAmount)}</span>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="reason">Motif du refus</Label>
              <Textarea
                id="reason"
                placeholder="Veuillez indiquer la raison du refus..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)} disabled={isLoading}>
              Annuler
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleReject} 
              disabled={isLoading || !rejectReason.trim()}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <X className="mr-2 h-4 w-4" />
              )}
              Refuser
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
