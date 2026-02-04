/**
 * Stocks Revendeur - Page de gestion des stocks
 * 
 * Cette page permet de :
 * - Consulter l'inventaire des produits
 * - Filtrer par catégorie et statut de stock
 * - Rechercher par nom ou référence
 * - Modifier les produits
 * - Exporter en CSV
 */

'use client'

import React, { useState } from 'react'
import {
  Package,
  Search,
  Download,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Eye,
  Edit,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  DollarSign,
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
import { useResellerStocks, type ResellerStock } from '@/hooks/use-reseller-stocks'
import { cn, formatCurrency } from '@/lib/utils'

// Configuration des statuts avec couleurs
const STATUS_CONFIG = {
  in_stock: { label: 'En stock', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  low_stock: { label: 'Stock faible', color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle },
  out_of_stock: { label: 'Rupture', color: 'bg-red-100 text-red-800', icon: XCircle },
}

const CATEGORIES = [
  'Manjak',
  'Kente',
  'Thioup',
  'Bogolan',
  'Bazin',
  'Waxi',
  'Sérère',
]

// Composant StatCard
function StatCard({
  icon: Icon,
  label,
  value,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string | number
  description?: string
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

// Composant StockRow
function StockRow({
  stock,
  isSelected,
  onToggleSelect,
  onEdit,
}: {
  stock: ResellerStock
  isSelected: boolean
  onToggleSelect: (productId: string) => void
  onEdit: (product: ResellerStock) => void
}) {
  const status = STATUS_CONFIG[stock.status]
  const StatusIcon = status.icon

  const getMargin = () => {
    return ((stock.sellingPrice - stock.costPrice) / stock.costPrice * 100).toFixed(1)
  }

  return (
    <TableRow className={cn(isSelected && 'bg-muted/50')}>
      <TableCell className="w-[50px]">
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onToggleSelect(stock.id)}
        />
      </TableCell>
      <TableCell className="whitespace-nowrap">
        <div className="flex flex-col">
          <span className="font-medium">{stock.reference}</span>
          <span className="text-xs text-muted-foreground">{stock.name}</span>
        </div>
      </TableCell>
      <TableCell className="whitespace-nowrap">
        <Badge variant="outline">{stock.category}</Badge>
      </TableCell>
      <TableCell className="whitespace-nowrap text-right">
        {formatCurrency(stock.sellingPrice)}
      </TableCell>
      <TableCell className="whitespace-nowrap text-right">
        {formatCurrency(stock.costPrice)}
      </TableCell>
      <TableCell className="whitespace-nowrap text-right">
        <span className={cn(
          'font-medium',
          stock.status === 'out_of_stock' && 'text-red-600',
          stock.status === 'low_stock' && 'text-yellow-600'
        )}>
          {stock.quantity}
        </span>
        <span className="text-xs text-muted-foreground ml-1">/ {stock.alertThreshold}</span>
      </TableCell>
      <TableCell className="whitespace-nowrap text-right">
        <span className={cn(
          'font-medium',
          parseFloat(getMargin()) > 50 ? 'text-green-600' : parseFloat(getMargin()) > 30 ? 'text-blue-600' : 'text-gray-600'
        )}>
          {getMargin()}%
        </span>
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(stock)}>
              <Edit className="h-4 w-4 mr-2" />
              Modifier
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )
}

// Composant EditStockDialog
function EditStockDialog({
  stock,
  isOpen,
  onClose,
  onSave,
  isLoading,
}: {
  stock: ResellerStock | null
  isOpen: boolean
  onClose: () => void
  onSave: (data: Partial<ResellerStock>) => Promise<boolean>
  isLoading: boolean
}) {
  const { toast } = useToast()
  const [formData, setFormData] = useState<Partial<ResellerStock>>({
    name: stock?.name || '',
    reference: stock?.reference || '',
    category: stock?.category || '',
    description: stock?.description || '',
    sellingPrice: stock?.sellingPrice || 0,
    costPrice: stock?.costPrice || 0,
    quantity: stock?.quantity || 0,
    alertThreshold: stock?.alertThreshold || 10,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.sellingPrice === undefined || formData.costPrice === undefined) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs obligatoires.',
      })
      return
    }

    const success = await onSave(formData)
    if (success) {
      onClose()
    }
  }

  const handleChange = (field: keyof Partial<ResellerStock>, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{stock ? 'Modifier le produit' : 'Nouveau produit'}</DialogTitle>
          <DialogDescription>
            {stock ? 'Modifiez les informations du produit' : 'Ajoutez un nouveau produit à votre stock'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="grid gap-2">
              <Label htmlFor="name">Nom du produit *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Nom du produit"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="reference">Référence *</Label>
                <Input
                  id="reference"
                  value={formData.reference}
                  onChange={(e) => handleChange('reference', e.target.value)}
                  placeholder="REF-001"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Catégorie *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleChange('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Description du produit"
              />
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="costPrice">Prix de revient (CFA) *</Label>
                <Input
                  id="costPrice"
                  type="number"
                  value={formData.costPrice}
                  onChange={(e) => handleChange('costPrice', parseFloat(e.target.value) || 0)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="sellingPrice">Prix de vente (CFA) *</Label>
                <Input
                  id="sellingPrice"
                  type="number"
                  value={formData.sellingPrice}
                  onChange={(e) => handleChange('sellingPrice', parseFloat(e.target.value) || 0)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="quantity">Quantité *</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => handleChange('quantity', parseInt(e.target.value) || 0)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="alertThreshold">Seuil d'alerte *</Label>
                <Input
                  id="alertThreshold"
                  type="number"
                  value={formData.alertThreshold}
                  onChange={(e) => handleChange('alertThreshold', parseInt(e.target.value) || 0)}
                  required
                />
              </div>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Enregistrement...' : stock ? 'Mettre à jour' : 'Créer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Page principale
export default function StocksPage() {
  const { toast } = useToast()
  const {
    filters,
    updateFilters,
    resetFilters,
    goToPage,
    pagination,
    stocks,
    stats,
    categories,
    selectedProducts,
    toggleProductSelection,
    selectAllProducts,
    clearSelection,
    isEditDialogOpen,
    setIsEditDialogOpen,
    editingProduct,
    openEditDialog,
    openAddDialog,
    saveProduct,
    exportStocks,
  } = useResellerStocks()

  const [isLoading, setIsLoading] = useState(false)

  const handleSaveProduct = async (data: Partial<ResellerStock>) => {
    setIsLoading(true)
    try {
      const success = await saveProduct(data)
      if (success) {
        toast({
          title: 'Succès',
          description: 'Le produit a été mis à jour avec succès.',
        })
      }
      return success
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportCSV = () => {
    const headers = ['Référence', 'Nom', 'Catégorie', 'Prix vente', 'Prix revient', 'Quantité', 'Seuil', 'Statut']
    const rows = stocks.map(s => [
      s.reference,
      s.name,
      s.category,
      s.sellingPrice.toString(),
      s.costPrice.toString(),
      s.quantity.toString(),
      s.alertThreshold.toString(),
      STATUS_CONFIG[s.status].label,
    ])
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `stocks-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)

    toast({
      title: 'Export réussi',
      description: 'Le fichier CSV a été téléchargé.',
    })
  }

  const allSelected = stocks.length > 0 && selectedProducts.length === stocks.length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Stocks</h1>
          <p className="text-muted-foreground mt-1">
            Gérez votre inventaire de produits
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" />
            Exporter CSV
          </Button>
          <Button onClick={openAddDialog}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Ajouter un produit
          </Button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Package}
          label="Total produits"
          value={stats.totalProducts}
        />
        <StatCard
          icon={DollarSign}
          label="Valeur du stock"
          value={formatCurrency(stats.totalValue)}
          description="Au prix de revient"
        />
        <StatCard
          icon={XCircle}
          label="Rupture"
          value={stats.outOfStockCount}
          description="Produits en rupture"
        />
        <StatCard
          icon={AlertTriangle}
          label="Stock faible"
          value={stats.lowStockCount}
          description="Sous le seuil d'alerte"
        />
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="p-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {/* Recherche */}
            <div className="lg:col-span-2 space-y-1">
              <Label className="text-xs">Recherche</Label>
              <div className="flex gap-1">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Nom, référence..."
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

            {/* Catégorie */}
            <div className="space-y-1">
              <Label className="text-xs">Catégorie</Label>
              <Select
                value={filters.category || 'all'}
                onValueChange={(value) => updateFilters({ category: value === 'all' ? '' : value, page: 1 })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Toutes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                  <SelectItem value="in_stock">En stock</SelectItem>
                  <SelectItem value="low_stock">Stock faible</SelectItem>
                  <SelectItem value="out_of_stock">Rupture</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tri */}
            <div className="space-y-1">
              <Label className="text-xs">Trier par</Label>
              <Select
                value={filters.sortBy}
                onValueChange={(value) => updateFilters({ sortBy: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Nom</SelectItem>
                  <SelectItem value="reference">Référence</SelectItem>
                  <SelectItem value="quantity">Quantité</SelectItem>
                  <SelectItem value="sellingPrice">Prix</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions bulk */}
      {selectedProducts.length > 0 && (
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {selectedProducts.length} produit(s) sélectionné(s)
                </span>
                <Button variant="ghost" size="sm" onClick={clearSelection}>
                  <X className="h-4 w-4 mr-1" />
                  Effacer
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={handleExportCSV}>
                  <Download className="h-4 w-4 mr-1" />
                  Exporter
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
                    if (checked) selectAllProducts()
                    else clearSelection()
                  }}
                />
              </TableCell>
              <TableHead className="w-[180px]">Produit</TableHead>
              <TableHead className="w-[120px]">Catégorie</TableHead>
              <TableHead className="w-[100px] text-right">Prix vente</TableHead>
              <TableHead className="w-[100px] text-right">Prix coste</TableHead>
              <TableHead className="w-[100px] text-right">Stock</TableHead>
              <TableHead className="w-[80px] text-right">Marge</TableHead>
              <TableHead className="w-[130px]">Statut</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stocks.length > 0 ? (
              stocks.map((stock, idx) => (
                <StockRow
                  key={idx}
                  stock={stock}
                  isSelected={selectedProducts.includes(stock.id)}
                  onToggleSelect={toggleProductSelection}
                  onEdit={openEditDialog}
                />
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  Aucun produit trouvé
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

      {/* Dialog d'édition */}
      <EditStockDialog
        stock={editingProduct}
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSave={handleSaveProduct}
        isLoading={isLoading}
      />
    </div>
  )
}
