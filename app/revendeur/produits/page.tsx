/**
 * Produits Revendeur - Page de gestion des produits
 * 
 * Cette page permet de :
 * - Consulter la liste des produits
 * - Filtrer par catégorie et statut
 * - Rechercher par nom ou référence
 * - CRUD (Créer, Modifier, Supprimer)
 * - Actions bulk
 * - Export CSV
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
  Trash2,
  EyeOff,
  Plus,
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
import { useResellerProducts, type ResellerProduct } from '@/hooks/use-reseller-products'
import { cn, formatCurrency } from '@/lib/utils'

// Configuration des statuts de stock
const STOCK_STATUS_CONFIG = {
  in_stock: { label: 'En stock', color: 'bg-green-100 text-green-800' },
  low_stock: { label: 'Stock faible', color: 'bg-yellow-100 text-yellow-800' },
  out_of_stock: { label: 'Rupture', color: 'bg-red-100 text-red-800' },
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

// Déterminer le statut de stock
const getStockStatus = (stock: number, minStock: number): keyof typeof STOCK_STATUS_CONFIG => {
  if (stock === 0) return 'out_of_stock'
  if (stock < minStock) return 'low_stock'
  return 'in_stock'
}

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

// Composant ProductRow
function ProductRow({
  product,
  isSelected,
  onToggleSelect,
  onEdit,
  onView,
  onDelete,
  onToggleStatus,
}: {
  product: ResellerProduct
  isSelected: boolean
  onToggleSelect: (productId: string) => void
  onEdit: (product: ResellerProduct) => void
  onView: (product: ResellerProduct) => void
  onDelete: (product: ResellerProduct) => void
  onToggleStatus: (product: ResellerProduct) => void
}) {
  const stockStatus = getStockStatus(product.stock, product.minStock)
  const statusConfig = STOCK_STATUS_CONFIG[stockStatus]

  return (
    <TableRow className={cn(!product.isActive && 'opacity-50', isSelected && 'bg-muted/50')}>
      <TableCell className="w-[50px]">
        <Checkbox
          checked={isSelected}
          onCheckedChange={() => onToggleSelect(product.id)}
        />
      </TableCell>
      <TableCell className="w-[80px]">
        <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center">
          <Package className="h-6 w-6 text-muted-foreground" />
        </div>
      </TableCell>
      <TableCell className="whitespace-nowrap">
        <div className="flex flex-col">
          <span className="font-medium">{product.name}</span>
          <span className="text-xs text-muted-foreground">{product.reference}</span>
        </div>
      </TableCell>
      <TableCell className="whitespace-nowrap">
        <Badge variant="outline">{product.category}</Badge>
      </TableCell>
      <TableCell className="whitespace-nowrap text-right font-medium">
        {formatCurrency(product.price)}
      </TableCell>
      <TableCell className="whitespace-nowrap">
        <div className="flex flex-col">
          <span className={cn(
            'font-medium',
            stockStatus === 'out_of_stock' && 'text-red-600',
            stockStatus === 'low_stock' && 'text-yellow-600'
          )}>
            {product.stock}
          </span>
          <span className="text-xs text-muted-foreground">Min: {product.minStock}</span>
        </div>
      </TableCell>
      <TableCell className="whitespace-nowrap">
        <Badge className={cn(statusConfig.color)}>{statusConfig.label}</Badge>
      </TableCell>
      <TableCell className="whitespace-nowrap">
        <Badge variant={product.isActive ? 'default' : 'secondary'}>
          {product.isActive ? 'Actif' : 'Inactif'}
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
            <DropdownMenuItem onClick={() => onView(product)}>
              <Eye className="h-4 w-4 mr-2" />
              Voir détails
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(product)}>
              <Edit className="h-4 w-4 mr-2" />
              Modifier
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onToggleStatus(product)}>
              {product.isActive ? (
                <>
                  <EyeOff className="h-4 w-4 mr-2" />
                  Désactiver
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  Activer
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onDelete(product)} className="text-red-600">
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )
}

// Composant ProductDialog
function ProductDialog({
  product,
  isOpen,
  onClose,
  onSave,
  isLoading,
}: {
  product: ResellerProduct | null
  isOpen: boolean
  onClose: () => void
  onSave: (data: Partial<ResellerProduct>) => Promise<boolean>
  isLoading: boolean
}) {
  const { toast } = useToast()
  const [formData, setFormData] = useState<Partial<ResellerProduct>>({
    name: product?.name || '',
    reference: product?.reference || '',
    description: product?.description || '',
    category: product?.category || '',
    price: product?.price || 0,
    stock: product?.stock || 0,
    minStock: product?.minStock || 10,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.reference || !formData.category || !formData.price) {
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

  const handleChange = (field: keyof Partial<ResellerProduct>, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{product ? 'Modifier le produit' : 'Nouveau produit'}</DialogTitle>
          <DialogDescription>
            {product ? 'Modifiez les informations du produit' : 'Ajoutez un nouveau produit'}
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
                <Label htmlFor="price">Prix (CFA) *</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="stock">Stock initial</Label>
                <Input
                  id="stock"
                  type="number"
                  value={formData.stock}
                  onChange={(e) => handleChange('stock', parseInt(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="minStock">Stock minimum</Label>
              <Input
                id="minStock"
                type="number"
                value={formData.minStock}
                onChange={(e) => handleChange('minStock', parseInt(e.target.value) || 10)}
              />
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Enregistrement...' : product ? 'Mettre à jour' : 'Créer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Page principale
export default function ProduitsPage() {
  const { toast } = useToast()
  const {
    filters,
    updateFilters,
    resetFilters,
    goToPage,
    pagination,
    products,
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
    deleteProduct,
    toggleProductStatus,
    bulkDelete,
    exportProducts,
  } = useResellerProducts()

  const [isLoading, setIsLoading] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<ResellerProduct | null>(null)

  const handleSaveProduct = async (data: Partial<ResellerProduct>) => {
    setIsLoading(true)
    try {
      const success = await saveProduct(data)
      if (success) {
        toast({
          title: 'Succès',
          description: editingProduct ? 'Le produit a été modifié.' : 'Le produit a été créé.',
        })
      }
      return success
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteProduct = async () => {
    if (!productToDelete) return
    
    setIsLoading(true)
    try {
      const success = await deleteProduct(productToDelete.id)
      if (success) {
        toast({
          title: 'Succès',
          description: 'Le produit a été supprimé.',
        })
      }
      setDeleteConfirmOpen(false)
      setProductToDelete(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) return
    
    setIsLoading(true)
    try {
      const success = await bulkDelete(selectedProducts)
      if (success) {
        toast({
          title: 'Succès',
          description: `${selectedProducts.length} produit(s) supprimé(s).`,
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportCSV = () => {
    const headers = ['Référence', 'Nom', 'Catégorie', 'Prix', 'Stock', 'Stock Min', 'Statut', 'Actif']
    const rows = products.map(p => [
      p.reference,
      p.name,
      p.category,
      p.price.toString(),
      p.stock.toString(),
      p.minStock.toString(),
      STOCK_STATUS_CONFIG[getStockStatus(p.stock, p.minStock)].label,
      p.isActive ? 'Oui' : 'Non',
    ])
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `produits-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)

    toast({
      title: 'Export réussi',
      description: 'Le fichier CSV a été téléchargé.',
    })
  }

  const allSelected = products.length > 0 && selectedProducts.length === products.length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Produits</h1>
          <p className="text-muted-foreground mt-1">
            Gérez votre catalogue de produits
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" />
            Exporter CSV
          </Button>
          <Button onClick={openAddDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau produit
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
          icon={Package}
          label="Produits actifs"
          value={stats.activeProducts}
        />
        <StatCard
          icon={EyeOff}
          label="Produits inactifs"
          value={stats.inactiveProducts}
        />
        <StatCard
          icon={Package}
          label="Valeur totale"
          value={formatCurrency(stats.totalValue)}
          description="Basé sur le stock"
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
                  <SelectItem value="active">Actif</SelectItem>
                  <SelectItem value="inactive">Inactif</SelectItem>
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
                  <SelectItem value="price">Prix</SelectItem>
                  <SelectItem value="stock">Stock</SelectItem>
                  <SelectItem value="createdAt">Date création</SelectItem>
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
                <Button size="sm" variant="outline" onClick={handleBulkDelete} className="text-red-600">
                  <Trash2 className="h-4 w-4 mr-1" />
                  Supprimer
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
              <TableCell className="w-[80px]">Image</TableCell>
              <TableHead className="w-[250px]">Produit</TableHead>
              <TableHead className="w-[120px]">Catégorie</TableHead>
              <TableHead className="w-[100px] text-right">Prix</TableHead>
              <TableHead className="w-[100px]">Stock</TableHead>
              <TableHead className="w-[120px]">Disponibilité</TableHead>
              <TableHead className="w-[100px]">Statut</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length > 0 ? (
              products.map((product, idx) => (
                <ProductRow
                  key={idx}
                  product={product}
                  isSelected={selectedProducts.includes(product.id)}
                  onToggleSelect={toggleProductSelection}
                  onEdit={openEditDialog}
                  onView={openEditDialog}
                  onDelete={(p) => {
                    setProductToDelete(p)
                    setDeleteConfirmOpen(true)
                  }}
                  onToggleStatus={toggleProductStatus}
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

      {/* Dialog d'édition/création */}
      <ProductDialog
        product={editingProduct}
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSave={handleSaveProduct}
        isLoading={isLoading}
      />

      {/* Dialog de confirmation de suppression */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDeleteProduct} disabled={isLoading}>
              {isLoading ? 'Suppression...' : 'Supprimer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
