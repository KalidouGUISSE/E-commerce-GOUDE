/**
 * Page de gestion des tarifs revendeur
 * Route: /revendeur/tarifs
 * 
 * Fonctionnalités:
 * - Liste des tarifs avec pagination
 * - Filtres par catégorie, statut, tier
 * - Recherche par nom produit
 * - Édition des tarifs
 * - Application de marge
 * - Export CSV
 */

'use client'

import { useState } from 'react'
import { 
  Search, 
  Filter, 
  Download, 
  Edit2, 
  Trash2, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Calendar,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  MoreHorizontal
} from 'lucide-react'
import { useResellerPricing, ResellerPricing, PricingTier } from '@/hooks/use-reseller-pricing'
import { formatCurrency, formatDate } from '@/lib/utils'
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

export default function ResellerPricingPage() {
  const {
    filters,
    updateFilters,
    resetFilters,
    goToPage,
    pagination,
    pricing,
    stats,
    categories,
    tiers,
    selectedPricing,
    togglePricingSelection,
    selectAllPricing,
    clearSelection,
    isEditDialogOpen,
    setIsEditDialogOpen,
    editingPricing,
    openEditDialog,
    savePricing,
    calculateMargin,
    applyMargin,
    exportPricing,
  } = useResellerPricing()

  const [localSearch, setLocalSearch] = useState('')
  const [isApplyMarginOpen, setIsApplyMarginOpen] = useState(false)
  const [marginPercentage, setMarginPercentage] = useState<number>(0)

  const handleSearch = (value: string) => {
    setLocalSearch(value)
    updateFilters({ search: value, page: 1 })
  }

  const handleSort = (column: string) => {
    const newOrder = filters.sortBy === column && filters.sortOrder === 'asc' ? 'desc' : 'asc'
    updateFilters({ sortBy: column, sortOrder: newOrder })
  }

  const handleApplyMargin = async () => {
    await applyMargin(marginPercentage)
    setIsApplyMarginOpen(false)
    setMarginPercentage(0)
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion des Tarifs</h1>
          <p className="text-muted-foreground">
            Gérez vos tarifs, marges et niveaux de prix pour vos clients
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => exportPricing('csv')}>
            <Download className="mr-2 h-4 w-4" />
            Exporter CSV
          </Button>
          <Button onClick={() => {
            setEditingPricing(null)
            setIsEditDialogOpen(true)
          }}>
            <TrendingUp className="mr-2 h-4 w-4" />
            Nouveau Tarif
          </Button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tarifs</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPricing}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activePricing} actifs
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Marge Moyenne</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.averageMargin)}</div>
            <p className="text-xs text-muted-foreground">
              Total: {formatCurrency(stats.totalMargin)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tarifs Expirés</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.expiredPricing}</div>
            <p className="text-xs text-muted-foreground">
              À mettre à jour
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expirent Bientôt</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.expiringSoonPricing}</div>
            <p className="text-xs text-muted-foreground">
              Dans les 30 jours
            </p>
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
                placeholder="Rechercher un produit..."
                value={localSearch}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select
              value={filters.category}
              onValueChange={(value) => updateFilters({ category: value, page: 1 })}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les catégories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filters.tier}
              onValueChange={(value) => updateFilters({ tier: value, page: 1 })}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Niveau de prix" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les niveaux</SelectItem>
                {tiers.map((tier) => (
                  <SelectItem key={tier.id} value={tier.id}>{tier.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filters.status}
              onValueChange={(value) => updateFilters({ status: value, page: 1 })}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="active">Actifs</SelectItem>
                <SelectItem value="expiring">Expirent bientôt</SelectItem>
                <SelectItem value="expired">Expirés</SelectItem>
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
      {selectedPricing.length > 0 && (
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedPricing.length === pricing.length}
                  onCheckedChange={() => {
                    if (selectedPricing.length === pricing.length) {
                      clearSelection()
                    } else {
                      selectAllPricing()
                    }
                  }}
                />
                <span className="text-sm font-medium">
                  {selectedPricing.length} élément(s) sélectionné(s)
                </span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setIsApplyMarginOpen(true)}>
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Appliquer une marge
                </Button>
                <Button variant="outline" size="sm" onClick={() => exportPricing('csv')}>
                  <Download className="mr-2 h-4 w-4" />
                  Exporter la sélection
                </Button>
                <Button variant="outline" size="sm" onClick={clearSelection}>
                  Annuler la sélection
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tableau des tarifs */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Tarifs</CardTitle>
          <CardDescription>
            Gérez vos tarifs pour chaque produit et niveau de prix
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={pricing.length > 0 && selectedPricing.length === pricing.length}
                      onCheckedChange={() => {
                        if (selectedPricing.length === pricing.length) {
                          clearSelection()
                        } else {
                          selectAllPricing()
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('productName')}
                  >
                    <div className="flex items-center gap-1">
                      Produit
                      {filters.sortBy === 'productName' && (
                        filters.sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Niveau</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50 text-right"
                    onClick={() => handleSort('basePrice')}
                  >
                    <div className="flex items-center justify-end gap-1">
                      Prix Base
                      {filters.sortBy === 'basePrice' && (
                        filters.sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50 text-right"
                    onClick={() => handleSort('resellerPrice')}
                  >
                    <div className="flex items-center justify-end gap-1">
                      Prix Revendeur
                      {filters.sortBy === 'resellerPrice' && (
                        filters.sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50 text-right"
                    onClick={() => handleSort('margin')}
                  >
                    <div className="flex items-center justify-end gap-1">
                      Marge
                      {filters.sortBy === 'margin' && (
                        filters.sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead>Validité</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pricing.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center">
                      Aucun tarif trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  pricing.map((item) => {
                    const isExpired = new Date(item.validTo) < new Date()
                    const isExpiringSoon = !isExpired && 
                      new Date(item.validTo) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                    
                    return (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedPricing.includes(item.id)}
                            onCheckedChange={() => togglePricingSelection(item.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{item.productName}</div>
                            <div className="text-xs text-muted-foreground">{item.reference}</div>
                          </div>
                        </TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.tierName}</Badge>
                        </TableCell>
                        <TableCell className="text-right">{formatCurrency(item.basePrice)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.resellerPrice)}</TableCell>
                        <TableCell className="text-right">
                          <div>
                            <div className="font-medium">{formatCurrency(item.margin)}</div>
                            <div className="text-xs text-muted-foreground">{item.marginPercentage.toFixed(1)}%</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <div className="text-xs">
                              Du {formatDate(item.validFrom)}
                            </div>
                            <div className="text-xs">
                              Au {formatDate(item.validTo)}
                            </div>
                            {isExpired && (
                              <Badge variant="destructive" className="w-fit text-[10px]">Expiré</Badge>
                            )}
                            {isExpiringSoon && (
                              <Badge variant="outline" className="w-fit bg-yellow-50 text-yellow-700 border-yellow-200 text-[10px]">
                                Expire bientôt
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" onClick={() => openEditDialog(item)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
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
        </CardContent>
      </Card>

      {/* Dialog d'édition de tarif */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingPricing ? 'Modifier le Tarif' : 'Nouveau Tarif'}
            </DialogTitle>
            <DialogDescription>
              {editingPricing 
                ? `Modifier le tarif pour ${editingPricing.productName}`
                : 'Créer un nouveau tarif pour un produit'}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-4 p-1">
              <div className="space-y-2">
                <Label htmlFor="product">Produit</Label>
                <Select defaultValue={editingPricing?.productId || ''}>
                  <SelectTrigger id="product">
                    <SelectValue placeholder="Sélectionner un produit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="prod001">Pagne Manjak Rouge Premium</SelectItem>
                    <SelectItem value="prod002">Pagne Kente Or Royal</SelectItem>
                    <SelectItem value="prod003">Pagne Thioup Bleu Ciel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tier">Niveau de Prix</Label>
                <Select defaultValue={editingPricing?.tierId || ''}>
                  <SelectTrigger id="tier">
                    <SelectValue placeholder="Sélectionner un niveau" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiers.map((tier) => (
                      <SelectItem key={tier.id} value={tier.id}>
                        {tier.name} ({tier.minQuantity}-{tier.maxQuantity === 999999 ? '∞' : tier.maxQuantity} pièces)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="basePrice">Prix Base (FCFA)</Label>
                  <Input
                    id="basePrice"
                    type="number"
                    defaultValue={editingPricing?.basePrice || 0}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="resellerPrice">Prix Revendeur (FCFA)</Label>
                  <Input
                    id="resellerPrice"
                    type="number"
                    defaultValue={editingPricing?.resellerPrice || 0}
                  />
                </div>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex justify-between text-sm">
                  <span>Marge:</span>
                  <span className="font-medium">
                    {formatCurrency((editingPricing?.margin || 0))}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Pourcentage:</span>
                  <span className="font-medium">
                    {(editingPricing?.marginPercentage || 0).toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="validFrom">Valide du</Label>
                  <Input
                    id="validFrom"
                    type="date"
                    defaultValue={editingPricing?.validFrom || ''}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="validTo">Valide jusqu'au</Label>
                  <Input
                    id="validTo"
                    type="date"
                    defaultValue={editingPricing?.validTo || ''}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="isActive" defaultChecked={editingPricing?.isActive ?? true} />
                <Label htmlFor="isActive">Tarif actif</Label>
              </div>
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={() => savePricing({})}>
              {editingPricing ? 'Enregistrer' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog d'application de marge */}
      <Dialog open={isApplyMarginOpen} onOpenChange={setIsApplyMarginOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Appliquer une Marge</DialogTitle>
            <DialogDescription>
              Appliquer un pourcentage de marge à {selectedPricing.length} tarif(s) sélectionné(s)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="margin">Pourcentage de Marge (%)</Label>
              <Input
                id="margin"
                type="number"
                value={marginPercentage}
                onChange={(e) => setMarginPercentage(Number(e.target.value))}
                placeholder="Ex: 50"
              />
              <p className="text-xs text-muted-foreground">
                La marge sera calculée sur le prix base de chaque produit
              </p>
            </div>
            <Separator />
            <div className="p-3 bg-muted rounded-lg space-y-2">
              <div className="text-sm">
                <span className="text-muted-foreground">Tarifs sélectionnés: </span>
                <span className="font-medium">{selectedPricing.length}</span>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Marge à appliquer: </span>
                <span className="font-medium">{marginPercentage}%</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApplyMarginOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleApplyMargin} disabled={marginPercentage <= 0}>
              <TrendingUp className="mr-2 h-4 w-4" />
              Appliquer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
