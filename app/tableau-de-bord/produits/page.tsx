"use client"

import React, { useState, useEffect, useCallback } from "react"
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Copy,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Loader2,
  Filter,
  Grid,
  List,
  Download,
  Upload,
  X,
  Box,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import {
  useProducts,
  type ProductWithRelations,
  type CreateProductData,
  type UpdateProductData,
  type ProductFilters,
} from "@/hooks/use-products"
import { cn } from "@/lib/utils"

// Constants
const ITEMS_PER_PAGE = 10

type SortDirection = "asc" | "desc"
type SortField = "id" | "name" | "category_name" | "product_type_name" | "min_price" | "created_at"

export default function ProductsManagementPage() {
  const {
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    duplicateProduct,
    getStatistics,
    exportToCSV,
    isLoading,
    categories,
    productTypes,
    artisans,
  } = useProducts()
  const { toast } = useToast()

  // State
  const [products, setProducts] = useState<ProductWithRelations[]>([])
  const [filteredProducts, setFilteredProducts] = useState<ProductWithRelations[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState<SortField>("created_at")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [viewMode, setViewMode] = useState<"table" | "cards">("table")
  const [showFilters, setShowFilters] = useState(false)

  // Filters state
  const [filters, setFilters] = useState<ProductFilters>({})

  // Statistics
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    outOfStockProducts: 0,
    totalVariants: 0,
    estimatedRevenue: 0,
  })

  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDuplicateDialogOpen, setIsDuplicateDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<ProductWithRelations | null>(null)

  // Form states
  const [formData, setFormData] = useState<CreateProductData>({
    name: "",
    description: "",
    product_type_id: 1,
    category_id: 1,
    artisan_id: 1,
    origin_region: "",
    is_active: true,
    variants: [],
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // Load products
  const loadProducts = useCallback(async () => {
    const data = await getProducts()
    setProducts(data)
    setFilteredProducts(data)
  }, [getProducts])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  // Load statistics
  useEffect(() => {
    const loadStats = async () => {
      const statistics = await getStatistics()
      setStats(statistics)
    }
    loadStats()
  }, [getStatistics])

  // Filter and sort products
  useEffect(() => {
    let result = [...products]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query) ||
          product.category_name.toLowerCase().includes(query) ||
          product.product_type_name.toLowerCase().includes(query) ||
          product.artisan_name.toLowerCase().includes(query)
      )
    }

    // Advanced filters
    if (filters.category_id) {
      result = result.filter((p) => p.category_id === filters.category_id)
    }
    if (filters.product_type_id) {
      result = result.filter((p) => p.product_type_id === filters.product_type_id)
    }
    if (filters.artisan_id) {
      result = result.filter((p) => p.artisan_id === filters.artisan_id)
    }
    if (filters.in_stock !== undefined) {
      result = result.filter((p) =>
        filters.in_stock ? p.total_stock > 0 : p.total_stock === 0
      )
    }
    if (filters.is_active !== undefined) {
      result = result.filter((p) => p.is_active === filters.is_active)
    }
    if (filters.min_price !== undefined) {
      result = result.filter((p) => p.min_price >= filters.min_price!)
    }
    if (filters.max_price !== undefined) {
      result = result.filter((p) => p.max_price <= filters.max_price!)
    }

    // Sort
    result.sort((a, b) => {
      let aValue: string | number = a[sortField]
      let bValue: string | number = b[sortField]

      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase()
        bValue = (bValue as string).toLowerCase()
      }

      if (sortDirection === "asc") {
        return aValue > bValue ? 1 : -1
      }
      return aValue < bValue ? 1 : -1
    })

    setFilteredProducts(result)
    setCurrentPage(1)
  }, [products, searchQuery, filters, sortField, sortDirection])

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  // Sorting handler
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  // Reset filters
  const resetFilters = () => {
    setFilters({})
    setSearchQuery("")
  }

  // Form validation
  const validateForm = (isEdit = false): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.name.trim()) {
      errors.name = "Le nom du produit est requis"
    }
    if (!formData.description.trim()) {
      errors.description = "La description est requise"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Form handlers
  const handleOpenAddDialog = () => {
    setFormData({
      name: "",
      description: "",
      product_type_id: 1,
      category_id: 1,
      artisan_id: 1,
      origin_region: "",
      is_active: true,
      variants: [],
    })
    setFormErrors({})
    setIsAddDialogOpen(true)
  }

  const handleOpenEditDialog = (product: ProductWithRelations) => {
    setSelectedProduct(product)
    setFormData({
      name: product.name,
      description: product.description,
      product_type_id: product.product_type_id,
      category_id: product.category_id,
      artisan_id: product.artisan_id,
      origin_region: product.origin_region,
      is_active: product.is_active,
      variants: [],
    })
    setFormErrors({})
    setIsEditDialogOpen(true)
  }

  const handleOpenDeleteDialog = (product: ProductWithRelations) => {
    setSelectedProduct(product)
    setIsDeleteDialogOpen(true)
  }

  const handleOpenDuplicateDialog = (product: ProductWithRelations) => {
    setSelectedProduct(product)
    setIsDuplicateDialogOpen(true)
  }

  const handleSubmitAdd = async () => {
    if (!validateForm(false)) return

    const success = await createProduct(formData)
    if (success) {
      setIsAddDialogOpen(false)
      loadProducts()
    }
  }

  const handleSubmitEdit = async () => {
    if (!selectedProduct || !validateForm(true)) return

    const updateData: UpdateProductData = {
      name: formData.name,
      description: formData.description,
      product_type_id: formData.product_type_id,
      category_id: formData.category_id,
      artisan_id: formData.artisan_id,
      origin_region: formData.origin_region,
      is_active: formData.is_active,
    }

    const success = await updateProduct(selectedProduct.id, updateData)
    if (success) {
      setIsEditDialogOpen(false)
      setSelectedProduct(null)
      loadProducts()
    }
  }

  const handleDelete = async () => {
    if (!selectedProduct) return

    const success = await deleteProduct(selectedProduct.id)
    if (success) {
      setIsDeleteDialogOpen(false)
      setSelectedProduct(null)
      loadProducts()
    }
  }

  const handleDuplicate = async () => {
    if (!selectedProduct) return

    const success = await duplicateProduct(selectedProduct.id)
    if (success) {
      setIsDuplicateDialogOpen(false)
      setSelectedProduct(null)
      loadProducts()
    }
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  // Stat card component
  const StatCard = ({
    title,
    value,
    suffix,
    onClick,
  }: {
    title: string
    value: number | string
    suffix?: string
    onClick?: () => void
  }) => (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-md",
        onClick && "hover:border-primary"
      )}
      onClick={onClick}
    >
      <CardContent className="pt-6">
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold mt-1">
          {typeof value === "number" ? value.toLocaleString() : value}
          {suffix && <span className="text-sm font-normal text-muted-foreground ml-1">{suffix}</span>}
        </p>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gestion des Produits</h1>
          <p className="text-muted-foreground">
            Gérez le catalogue de produits de la plateforme
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="mr-2 h-4 w-4" />
            Exporter CSV
          </Button>
          <Button onClick={handleOpenAddDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un produit
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Total Produits"
          value={stats.totalProducts}
          onClick={() => resetFilters()}
        />
        <StatCard
          title="Produits Actifs"
          value={stats.activeProducts}
          onClick={() => setFilters({ ...filters, is_active: true })}
        />
        <StatCard
          title="Rupture de Stock"
          value={stats.outOfStockProducts}
          onClick={() => setFilters({ ...filters, in_stock: false })}
        />
        <StatCard
          title="Total Variantes"
          value={stats.totalVariants}
        />
        <StatCard
          title="CA Estimé"
          value={formatCurrency(stats.estimatedRevenue)}
        />
      </div>

      {/* Filters & Search */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher un produit..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="mr-2 h-4 w-4" />
                Filtres
                {Object.keys(filters).length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {Object.keys(filters).length}
                  </Badge>
                )}
              </Button>
              {Object.keys(filters).length > 0 && (
                <Button variant="ghost" size="sm" onClick={resetFilters}>
                  Réinitialiser
                </Button>
              )}
              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === "table" ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("table")}
                  className="rounded-r-none"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "cards" ? "secondary" : "ghost"}
                  size="icon"
                  onClick={() => setViewMode("cards")}
                  className="rounded-l-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>

        {/* Advanced Filters */}
        {showFilters && (
          <CardContent className="border-t pt-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label>Catégorie</Label>
                <Select
                  value={filters.category_id?.toString() || "all"}
                  onValueChange={(value) =>
                    setFilters({
                      ...filters,
                      category_id: value === "all" ? undefined : parseInt(value),
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Toutes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Type de produit</Label>
                <Select
                  value={filters.product_type_id?.toString() || "all"}
                  onValueChange={(value) =>
                    setFilters({
                      ...filters,
                      product_type_id: value === "all" ? undefined : parseInt(value),
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tous" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    {productTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id.toString()}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Artisan</Label>
                <Select
                  value={filters.artisan_id?.toString() || "all"}
                  onValueChange={(value) =>
                    setFilters({
                      ...filters,
                      artisan_id: value === "all" ? undefined : parseInt(value),
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tous" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    {artisans.map((artisan) => (
                      <SelectItem key={artisan.id} value={artisan.id.toString()}>
                        {artisan.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Disponibilité</Label>
                <Select
                  value={
                    filters.in_stock === true
                      ? "in_stock"
                      : filters.in_stock === false
                      ? "out_of_stock"
                      : "all"
                  }
                  onValueChange={(value) =>
                    setFilters({
                      ...filters,
                      in_stock:
                        value === "all"
                          ? undefined
                          : value === "in_stock",
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tous" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="in_stock">En stock</SelectItem>
                    <SelectItem value="out_of_stock">Rupture</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Products Display */}
      <Card>
        <CardHeader className="border-b">
          <CardTitle>
            Produits ({filteredProducts.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : viewMode === "table" ? (
            /* Table View */
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-3 text-left">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSort("id")}
                        className="flex items-center gap-1 font-medium"
                      >
                        ID
                        <ArrowUpDown className="h-3 w-3" />
                      </Button>
                    </th>
                    <th className="px-4 py-3 text-left">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSort("name")}
                        className="flex items-center gap-1 font-medium"
                      >
                        Produit
                        <ArrowUpDown className="h-3 w-3" />
                      </Button>
                    </th>
                    <th className="px-4 py-3 text-left">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSort("category_name")}
                        className="flex items-center gap-1 font-medium"
                      >
                        Catégorie
                        <ArrowUpDown className="h-3 w-3" />
                      </Button>
                    </th>
                    <th className="px-4 py-3 text-left">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSort("product_type_name")}
                        className="flex items-center gap-1 font-medium"
                      >
                        Type
                        <ArrowUpDown className="h-3 w-3" />
                      </Button>
                    </th>
                    <th className="px-4 py-3 text-left">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSort("min_price")}
                        className="flex items-center gap-1 font-medium"
                      >
                        Prix
                        <ArrowUpDown className="h-3 w-3" />
                      </Button>
                    </th>
                    <th className="px-4 py-3 text-center">Stock</th>
                    <th className="px-4 py-3 text-center">Variantes</th>
                    <th className="px-4 py-3 text-left">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSort("created_at")}
                        className="flex items-center gap-1 font-medium"
                      >
                        Créé le
                        <ArrowUpDown className="h-3 w-3" />
                      </Button>
                    </th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedProducts.map((product) => (
                    <tr
                      key={product.id}
                      className="border-b transition-colors hover:bg-muted/50"
                    >
                      <td className="px-4 py-3 font-medium">#{product.id}</td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground truncate max-w-xs">
                            {product.artisan_name}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline">{product.category_name}</Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {product.product_type_name}
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium">
                            {formatCurrency(product.min_price)}
                          </p>
                          {product.max_price > product.min_price && (
                            <p className="text-xs text-muted-foreground">
                              jusqu'à {formatCurrency(product.max_price)}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge
                          variant={product.total_stock > 0 ? "default" : "destructive"}
                        >
                          {product.total_stock}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-center text-muted-foreground">
                        {product.variant_count}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-sm">
                        {formatDate(product.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEditDialog(product)}
                            className="h-8 w-8"
                            title="Modifier"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDuplicateDialog(product)}
                            className="h-8 w-8"
                            title="Dupliquer"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDeleteDialog(product)}
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            title="Supprimer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {paginatedProducts.length === 0 && (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-muted-foreground">
                        Aucun produit trouvé
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            /* Cards View */
            <div className="p-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {paginatedProducts.map((product) => (
                <Card key={product.id} className="overflow-hidden">
                  <div className="aspect-video bg-muted flex items-center justify-center">
                    <Box className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold line-clamp-1">{product.name}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {product.artisan_name}
                        </p>
                      </div>
                      <Badge variant={product.is_active ? "default" : "secondary"}>
                        {product.is_active ? "Actif" : "Inactif"}
                      </Badge>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {formatCurrency(product.min_price)}
                      </span>
                      <Badge variant="outline">{product.total_stock} en stock</Badge>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleOpenEditDialog(product)}
                      >
                        <Edit className="mr-1 h-3 w-3" />
                        Modifier
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleOpenDuplicateDialog(product)}
                      >
                        <Copy className="mr-1 h-3 w-3" />
                        Dupliquer
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {paginatedProducts.length === 0 && (
                <div className="col-span-full py-12 text-center text-muted-foreground">
                  Aucun produit trouvé
                </div>
              )}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t px-4 py-3">
              <p className="text-sm text-muted-foreground">
                Affichage de {startIndex + 1} à {Math.min(startIndex + ITEMS_PER_PAGE, filteredProducts.length)} sur {filteredProducts.length} produits
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium">
                  Page {currentPage} sur {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Product Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Ajouter un produit</DialogTitle>
            <DialogDescription>
              Créez un nouveau produit dans le catalogue
            </DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="general" className="mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="general">Informations générales</TabsTrigger>
              <TabsTrigger value="variants">Variantes</TabsTrigger>
            </TabsList>
            <TabsContent value="general" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom du produit *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className={cn(formErrors.name && "border-destructive")}
                />
                {formErrors.name && (
                  <p className="text-xs text-destructive">{formErrors.name}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className={cn(formErrors.description && "border-destructive")}
                />
                {formErrors.description && (
                  <p className="text-xs text-destructive">{formErrors.description}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Catégorie</Label>
                  <Select
                    value={formData.category_id.toString()}
                    onValueChange={(value) =>
                      setFormData({ ...formData, category_id: parseInt(value) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Type de produit</Label>
                  <Select
                    value={formData.product_type_id.toString()}
                    onValueChange={(value) =>
                      setFormData({ ...formData, product_type_id: parseInt(value) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {productTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id.toString()}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Artisan associé</Label>
                <Select
                  value={formData.artisan_id.toString()}
                  onValueChange={(value) =>
                    setFormData({ ...formData, artisan_id: parseInt(value) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {artisans.map((artisan) => (
                      <SelectItem key={artisan.id} value={artisan.id.toString()}>
                        {artisan.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
            <TabsContent value="variants" className="mt-4">
              <p className="text-sm text-muted-foreground">
                La gestion des variantes sera implémentée dans une version ultérieure.
              </p>
            </TabsContent>
          </Tabs>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSubmitAdd} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Créer le produit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Modifier le produit</DialogTitle>
            <DialogDescription>
              Mettez à jour les informations du produit
            </DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="general" className="mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="general">Informations générales</TabsTrigger>
              <TabsTrigger value="variants">Variantes</TabsTrigger>
            </TabsList>
            <TabsContent value="general" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="edit_name">Nom du produit *</Label>
                <Input
                  id="edit_name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className={cn(formErrors.name && "border-destructive")}
                />
                {formErrors.name && (
                  <p className="text-xs text-destructive">{formErrors.name}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_description">Description *</Label>
                <Textarea
                  id="edit_description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className={cn(formErrors.description && "border-destructive")}
                />
                {formErrors.description && (
                  <p className="text-xs text-destructive">{formErrors.description}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Catégorie</Label>
                  <Select
                    value={formData.category_id.toString()}
                    onValueChange={(value) =>
                      setFormData({ ...formData, category_id: parseInt(value) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id.toString()}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Type de produit</Label>
                  <Select
                    value={formData.product_type_id.toString()}
                    onValueChange={(value) =>
                      setFormData({ ...formData, product_type_id: parseInt(value) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {productTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id.toString()}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Artisan associé</Label>
                <Select
                  value={formData.artisan_id.toString()}
                  onValueChange={(value) =>
                    setFormData({ ...formData, artisan_id: parseInt(value) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {artisans.map((artisan) => (
                      <SelectItem key={artisan.id} value={artisan.id.toString()}>
                        {artisan.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="edit_is_active"
                  checked={formData.is_active}
                  onChange={(e) =>
                    setFormData({ ...formData, is_active: e.target.checked })
                  }
                  className="h-4 w-4"
                />
                <Label htmlFor="edit_is_active">Produit actif</Label>
              </div>
            </TabsContent>
            <TabsContent value="variants" className="mt-4">
              <p className="text-sm text-muted-foreground">
                La gestion des variantes sera implémentée dans une version ultérieure.
              </p>
            </TabsContent>
          </Tabs>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSubmitEdit} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer le produit{" "}
              <strong>{selectedProduct?.name}</strong> ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Duplicate Confirmation Dialog */}
      <Dialog open={isDuplicateDialogOpen} onOpenChange={setIsDuplicateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la duplication</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir dupliquer le produit{" "}
              <strong>{selectedProduct?.name}</strong> ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDuplicateDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleDuplicate} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Dupliquer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
