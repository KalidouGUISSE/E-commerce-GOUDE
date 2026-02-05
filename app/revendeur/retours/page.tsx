/**
 * Page des retours et remboursements
 * Route: /revendeur/retours
 * 
 * Fonctionnalités:
 * - Liste des demandes de retour avec pagination
 * - Filtres par statut, raison, date
 * - Recherche
 * - Suivi des remboursements
 */

'use client'

import { useState } from 'react'
import { 
  Search, 
  Filter, 
  Plus, 
  ChevronLeft,
  ChevronRight,
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  RefreshCw,
  DollarSign,
  Eye,
  Loader2,
  Check
} from 'lucide-react'
import { useResellerReturns, ReturnRequest } from '@/hooks/use-reseller-returns'
import { formatCurrency } from '@/lib/utils'
import { formatDateTime } from '@/lib/utils'
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
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'

export default function ResellerReturnsPage() {
  const {
    filters,
    updateFilters,
    resetFilters,
    returns,
    pagination,
    stats,
    selectedReturns,
    toggleSelection,
    selectAll,
    clearSelection,
    isCreateModalOpen,
    setIsCreateModalOpen,
    isDetailModalOpen,
    setIsDetailModalOpen,
    selectedReturn,
    openDetail,
    isLoading,
    feedback,
    createReturn,
    updateReturnStatus,
    processRefund,
  } = useResellerReturns()

  const [localSearch, setLocalSearch] = useState('')

  const handleSearch = (value: string) => {
    setLocalSearch(value)
    updateFilters({ search: value, page: 1 })
  }

  const getStatusBadge = (status: ReturnRequest['status']) => {
    const variants: Record<string, 'default' | 'secondary' | 'outline' | 'destructive' | 'warning'> = {
      pending: 'warning',
      approved: 'default',
      rejected: 'destructive',
      in_transit: 'secondary',
      received: 'outline',
      refunded: 'default',
    }
    const labels: Record<string, string> = {
      pending: 'En attente',
      approved: 'Approuvé',
      rejected: 'Rejeté',
      in_transit: 'En transit',
      received: 'Reçu',
      refunded: 'Remboursé',
    }
    const icons: Record<string, React.ReactNode> = {
      pending: <Clock className="w-3 h-3 mr-1" />,
      approved: <CheckCircle2 className="w-3 h-3 mr-1" />,
      rejected: <XCircle className="w-3 h-3 mr-1" />,
      in_transit: <Truck className="w-3 h-3 mr-1" />,
      received: <Package className="w-3 h-3 mr-1" />,
      refunded: <DollarSign className="w-3 h-3 mr-1" />,
    }
    return (
      <Badge variant={variants[status] as 'default' | 'secondary' | 'outline' | 'destructive' || 'outline'}>
        {icons[status]}
        {labels[status]}
      </Badge>
    )
  }

  const getReasonBadge = (reason: ReturnRequest['reason']) => {
    const labels: Record<string, string> = {
      defective: 'Défectueux',
      wrong_item: 'Mauvais article',
      not_satisfied: 'Non satisfait',
      other: 'Autre',
    }
    return labels[reason] || reason
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Feedback Toast */}
      {feedback && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-top-2 ${
          feedback.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          <Check className="w-5 h-5" />
          {feedback.message}
        </div>
      )}

      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Retours et Remboursements</h1>
          <p className="text-muted-foreground">
            Gérez vos demandes de retour et suivez les remboursements
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle demande
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En attente</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En transit</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inTransit}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remboursés</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.refunded}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Montant remboursé</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRefundAmount)}</div>
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
                placeholder="Rechercher par numéro de retour, commande..."
                value={localSearch}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={filters.status.length > 0 ? filters.status[0] : 'all'}
              onValueChange={(value) => updateFilters({ status: value === 'all' ? [] : [value], page: 1 })}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous statuts</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="approved">Approuvé</SelectItem>
                <SelectItem value="rejected">Rejeté</SelectItem>
                <SelectItem value="in_transit">En transit</SelectItem>
                <SelectItem value="received">Reçu</SelectItem>
                <SelectItem value="refunded">Remboursé</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.reason.length > 0 ? filters.reason[0] : 'all'}
              onValueChange={(value) => updateFilters({ reason: value === 'all' ? [] : [value], page: 1 })}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Raison" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes raisons</SelectItem>
                <SelectItem value="defective">Défectueux</SelectItem>
                <SelectItem value="wrong_item">Mauvais article</SelectItem>
                <SelectItem value="not_satisfied">Non satisfait</SelectItem>
                <SelectItem value="other">Autre</SelectItem>
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
      {selectedReturns.length > 0 && (
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedReturns.length === returns.length}
                  onCheckedChange={() => {
                    if (selectedReturns.length === returns.length) {
                      clearSelection()
                    } else {
                      selectAll()
                    }
                  }}
                />
                <span className="text-sm font-medium">
                  {selectedReturns.length} demande(s) sélectionnée(s)
                </span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={clearSelection}>
                  Annuler
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Liste des retours */}
      <Card>
        <CardHeader>
          <CardTitle>Demandes de Retour</CardTitle>
          <CardDescription>
            {returns.length} demande(s) trouvée(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={returns.length > 0 && selectedReturns.length === returns.length}
                      onCheckedChange={() => {
                        if (selectedReturns.length === returns.length) {
                          clearSelection()
                        } else {
                          selectAll()
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead>Retour</TableHead>
                  <TableHead>Commande</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Raison</TableHead>
                  <TableHead>Articles</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Créé</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {returns.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center">
                      Aucune demande de retour trouvée
                    </TableCell>
                  </TableRow>
                ) : (
                  returns.map((ret) => (
                    <TableRow key={ret.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedReturns.includes(ret.id)}
                          onCheckedChange={() => toggleSelection(ret.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{ret.returnNumber}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{ret.orderNumber}</div>
                      </TableCell>
                      <TableCell>{getStatusBadge(ret.status)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{getReasonBadge(ret.reason)}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{ret.items.length} article(s)</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{formatCurrency(ret.totalRefund)}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{formatDateTime(ret.createdAt)}</div>
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => openDetail(ret)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Page {pagination.page} sur {pagination.totalPages}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateFilters({ page: pagination.page - 1 })}
                disabled={pagination.page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Précédent
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateFilters({ page: pagination.page + 1 })}
                disabled={pagination.page === pagination.totalPages}
              >
                Suivant
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de création */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nouvelle demande de retour</DialogTitle>
            <DialogDescription>
              Remplissez le formulaire pour créer une demande de retour
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="orderNumber">Numéro de commande</Label>
              <Input
                id="orderNumber"
                placeholder="CMD-2024-XXX"
              />
            </div>
            <div className="space-y-2">
              <Label>Raison du retour</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="defective">Article défectueux</SelectItem>
                  <SelectItem value="wrong_item">Mauvais article reçu</SelectItem>
                  <SelectItem value="not_satisfied">Non satisfait du produit</SelectItem>
                  <SelectItem value="other">Autre raison</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Description détaillée</Label>
              <Textarea
                id="reason"
                placeholder="Décrivez la raison du retour en détail..."
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label>Méthode de remboursement préférée</Label>
              <Select defaultValue="original">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="original">Remboursement sur le moyen de paiement original</SelectItem>
                  <SelectItem value="store_credit">Avoir sur le compte</SelectItem>
                  <SelectItem value="bank_transfer">Virement bancaire</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Annuler
            </Button>
            <Button disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              Créer la demande
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de détail */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{selectedReturn?.returnNumber}</DialogTitle>
            <DialogDescription>
              Demande de retour pour la commande {selectedReturn?.orderNumber}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            {selectedReturn && (
              <div className="space-y-4">
                {/* Statut et raison */}
                <div className="flex items-center gap-4">
                  {getStatusBadge(selectedReturn.status)}
                  <Badge variant="outline">{getReasonBadge(selectedReturn.reason)}</Badge>
                </div>
                
                <Separator />

                {/* Articles retournés */}
                <div>
                  <h4 className="font-medium mb-2">Articles retournés</h4>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Article</TableHead>
                          <TableHead>SKU</TableHead>
                          <TableHead>Qty</TableHead>
                          <TableHead>Prix</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedReturn.items.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>{item.productName}</TableCell>
                            <TableCell className="text-muted-foreground">{item.sku}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="flex justify-end mt-2">
                    <div className="font-bold">Total: {formatCurrency(selectedReturn.totalRefund)}</div>
                  </div>
                </div>

                <Separator />

                {/* Détails du remboursement */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-1">Méthode de remboursement</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedReturn.refundMethod === 'original' ? 'Paiement original' :
                       selectedReturn.refundMethod === 'store_credit' ? 'Avoir' : 'Virement bancaire'}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Date de création</h4>
                    <p className="text-sm text-muted-foreground">{formatDateTime(selectedReturn.createdAt)}</p>
                  </div>
                </div>

                {/* Notes */}
                {selectedReturn.notes && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-medium mb-2">Notes</h4>
                      <p className="text-sm p-3 bg-muted rounded-lg">{selectedReturn.notes}</p>
                    </div>
                  </>
                )}
              </div>
            )}
          </ScrollArea>
          <DialogFooter>
            <div className="flex gap-2 w-full justify-between">
              <div className="flex gap-2">
                {selectedReturn?.status === 'pending' && (
                  <>
                    <Button variant="outline" size="sm" onClick={() => selectedReturn && updateReturnStatus(selectedReturn.id, 'approved')}>
                      Approuver
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => selectedReturn && updateReturnStatus(selectedReturn.id, 'rejected')}>
                      Rejeter
                    </Button>
                  </>
                )}
                {selectedReturn?.status === 'received' && (
                  <Button size="sm" onClick={() => selectedReturn && processRefund(selectedReturn.id, 'original')}>
                    <DollarSign className="mr-2 h-4 w-4" />
                    Rembourser
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>
                  Fermer
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
