"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { Filter, X, Lock, ChevronDown, Grid3X3, List } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { products, productTypes, productOrigins, productColors, productUnits } from "@/lib/data/products"

type ViewMode = "grid" | "list"

interface Filters {
  types: string[]
  origins: string[]
  colors: string[]
  units: string[]
  inStock: boolean
}

function FilterSection({ 
  title, 
  options, 
  selected, 
  onChange 
}: { 
  title: string
  options: { value: string; label: string }[]
  selected: string[]
  onChange: (values: string[]) => void
}) {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex w-full items-center justify-between py-2">
        <span className="text-sm font-medium text-foreground">{title}</span>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-2 pb-4">
        {options.map((option) => (
          <div key={option.value} className="flex items-center gap-2">
            <Checkbox
              id={`${title}-${option.value}`}
              checked={selected.includes(option.value)}
              onCheckedChange={(checked) => {
                if (checked) {
                  onChange([...selected, option.value])
                } else {
                  onChange(selected.filter((v) => v !== option.value))
                }
              }}
            />
            <Label
              htmlFor={`${title}-${option.value}`}
              className="text-sm text-muted-foreground cursor-pointer"
            >
              {option.label}
            </Label>
          </div>
        ))}
      </CollapsibleContent>
    </Collapsible>
  )
}

function FiltersPanel({ 
  filters, 
  onFiltersChange,
  onClear
}: { 
  filters: Filters
  onFiltersChange: (filters: Filters) => void
  onClear: () => void
}) {
  const activeFiltersCount = 
    filters.types.length + 
    filters.origins.length + 
    filters.colors.length + 
    filters.units.length +
    (filters.inStock ? 1 : 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Filtres</h3>
        {activeFiltersCount > 0 && (
          <Button variant="ghost" size="sm" onClick={onClear} className="h-auto p-0 text-sm text-muted-foreground">
            Effacer ({activeFiltersCount})
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2 pb-2 border-b border-border">
        <Checkbox
          id="in-stock"
          checked={filters.inStock}
          onCheckedChange={(checked) => 
            onFiltersChange({ ...filters, inStock: checked as boolean })
          }
        />
        <Label htmlFor="in-stock" className="text-sm cursor-pointer">
          En stock uniquement
        </Label>
      </div>

      <FilterSection
        title="Type de Tissu"
        options={productTypes}
        selected={filters.types}
        onChange={(types) => onFiltersChange({ ...filters, types })}
      />

      <FilterSection
        title="Origine"
        options={productOrigins}
        selected={filters.origins}
        onChange={(origins) => onFiltersChange({ ...filters, origins })}
      />

      <FilterSection
        title="Couleur"
        options={productColors}
        selected={filters.colors}
        onChange={(colors) => onFiltersChange({ ...filters, colors })}
      />

      <FilterSection
        title="Unité de Vente"
        options={productUnits}
        selected={filters.units}
        onChange={(units) => onFiltersChange({ ...filters, units })}
      />
    </div>
  )
}

function ProductCard({ product, viewMode }: { product: typeof products[0]; viewMode: ViewMode }) {
  const typeLabel = productTypes.find(t => t.value === product.type)?.label || product.type
  const originLabel = productOrigins.find(o => o.value === product.origin)?.label || product.origin
  const unitLabel = productUnits.find(u => u.value === product.unit)?.label || product.unit

  const imageSrc = product.images[0] || "/placeholder.jpg"

  if (viewMode === "list") {
    return (
      <Link href={`/catalogue/${product.id}`}>
        <Card className="group transition-shadow hover:shadow-md">
          <CardContent className="flex gap-4 p-4">
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md bg-muted">
              <Image
                src={imageSrc}
                alt={product.name}
                fill
                className="object-cover"
                sizes="96px"
              />
              {!product.inStock && (
                <div className="absolute inset-0 flex items-center justify-center bg-foreground/60">
                  <span className="text-xs font-medium text-background">Rupture</span>
                </div>
              )}
            </div>
            <div className="flex flex-1 flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-foreground group-hover:text-primary line-clamp-1">
                    {product.name}
                  </h3>
                  {product.featured && (
                    <Badge variant="secondary" className="shrink-0">Vedette</Badge>
                  )}
                </div>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
                  {typeLabel} - {originLabel}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Lock className="h-3 w-3" />
                  <span>Prix réservé aux revendeurs</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  Min. {product.minQuantity} {unitLabel}(s)
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    )
  }

  return (
    <Link href={`/catalogue/${product.id}`}>
      <Card className="group h-full overflow-hidden transition-shadow hover:shadow-md">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <Image
            src={imageSrc}
            alt={product.name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {!product.inStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-foreground/60">
              <span className="text-sm font-medium text-background">Rupture de stock</span>
            </div>
          )}
          {product.featured && (
            <Badge className="absolute top-2 right-2" variant="secondary">Vedette</Badge>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-foreground group-hover:text-primary line-clamp-2">
            {product.name}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {typeLabel} - {originLabel}
          </p>
          <div className="mt-3 flex items-center gap-1 text-sm text-muted-foreground">
            <Lock className="h-3 w-3" />
            <span>Prix réservé aux revendeurs</span>
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-border pt-3">
            <span className="text-xs text-muted-foreground">
              Min. {product.minQuantity} {unitLabel}(s)
            </span>
            <span className="text-xs font-medium text-secondary">
              {product.artisanName}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

export default function CataloguePage() {
  const [filters, setFilters] = useState<Filters>({
    types: [],
    origins: [],
    colors: [],
    units: [],
    inStock: false,
  })
  const [sortBy, setSortBy] = useState("featured")
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const clearFilters = () => {
    setFilters({
      types: [],
      origins: [],
      colors: [],
      units: [],
      inStock: false,
    })
  }

  const filteredProducts = useMemo(() => {
    let result = [...products]

    // Apply filters
    if (filters.types.length > 0) {
      result = result.filter((p) => filters.types.includes(p.type))
    }
    if (filters.origins.length > 0) {
      result = result.filter((p) => filters.origins.includes(p.origin))
    }
    if (filters.colors.length > 0) {
      result = result.filter((p) => p.colors.some((c) => filters.colors.includes(c)))
    }
    if (filters.units.length > 0) {
      result = result.filter((p) => filters.units.includes(p.unit))
    }
    if (filters.inStock) {
      result = result.filter((p) => p.inStock)
    }

    // Apply sorting
    switch (sortBy) {
      case "featured":
        result.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
        break
      case "name-asc":
        result.sort((a, b) => a.name.localeCompare(b.name))
        break
      case "name-desc":
        result.sort((a, b) => b.name.localeCompare(a.name))
        break
      case "min-qty-asc":
        result.sort((a, b) => a.minQuantity - b.minQuantity)
        break
      case "min-qty-desc":
        result.sort((a, b) => b.minQuantity - a.minQuantity)
        break
    }

    return result
  }, [filters, sortBy])

  const activeFiltersCount = 
    filters.types.length + 
    filters.origins.length + 
    filters.colors.length + 
    filters.units.length +
    (filters.inStock ? 1 : 0)

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Page Header */}
        <section className="border-b border-border bg-card py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
              Catalogue Produits
            </h1>
            <p className="mt-2 text-muted-foreground">
              Découvrez notre sélection de tissus africains traditionnels authentiques
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            {/* Desktop Filters Sidebar */}
            <aside className="hidden w-64 shrink-0 lg:block">
              <div className="sticky top-24">
                <FiltersPanel
                  filters={filters}
                  onFiltersChange={setFilters}
                  onClear={clearFilters}
                />
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1">
              {/* Toolbar */}
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  {/* Mobile Filter Button */}
                  <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="sm" className="lg:hidden bg-transparent">
                        <Filter className="mr-2 h-4 w-4" />
                        Filtres
                        {activeFiltersCount > 0 && (
                          <Badge variant="secondary" className="ml-2">
                            {activeFiltersCount}
                          </Badge>
                        )}
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-[300px] bg-card">
                      <SheetHeader>
                        <SheetTitle>Filtres</SheetTitle>
                      </SheetHeader>
                      <div className="mt-6">
                        <FiltersPanel
                          filters={filters}
                          onFiltersChange={setFilters}
                          onClear={clearFilters}
                        />
                      </div>
                    </SheetContent>
                  </Sheet>

                  <span className="text-sm text-muted-foreground">
                    {filteredProducts.length} produit(s)
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {/* View Mode Toggle */}
                  <div className="hidden items-center gap-1 rounded-md border border-border p-1 sm:flex">
                    <Button
                      variant={viewMode === "grid" ? "secondary" : "ghost"}
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setViewMode("grid")}
                    >
                      <Grid3X3 className="h-4 w-4" />
                      <span className="sr-only">Vue grille</span>
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "secondary" : "ghost"}
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setViewMode("list")}
                    >
                      <List className="h-4 w-4" />
                      <span className="sr-only">Vue liste</span>
                    </Button>
                  </div>

                  {/* Sort Select */}
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Trier par" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="featured">Produits vedettes</SelectItem>
                      <SelectItem value="name-asc">Nom (A-Z)</SelectItem>
                      <SelectItem value="name-desc">Nom (Z-A)</SelectItem>
                      <SelectItem value="min-qty-asc">Quantité min. (croissant)</SelectItem>
                      <SelectItem value="min-qty-desc">Quantité min. (décroissant)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Active Filters Tags */}
              {activeFiltersCount > 0 && (
                <div className="mb-6 flex flex-wrap items-center gap-2">
                  <span className="text-sm text-muted-foreground">Filtres actifs:</span>
                  {filters.types.map((type) => (
                    <Badge key={type} variant="outline" className="gap-1">
                      {productTypes.find(t => t.value === type)?.label}
                      <button
                        onClick={() => setFilters({ ...filters, types: filters.types.filter(t => t !== type) })}
                        className="ml-1"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                  {filters.origins.map((origin) => (
                    <Badge key={origin} variant="outline" className="gap-1">
                      {productOrigins.find(o => o.value === origin)?.label}
                      <button
                        onClick={() => setFilters({ ...filters, origins: filters.origins.filter(o => o !== origin) })}
                        className="ml-1"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                  {filters.colors.map((color) => (
                    <Badge key={color} variant="outline" className="gap-1">
                      {productColors.find(c => c.value === color)?.label}
                      <button
                        onClick={() => setFilters({ ...filters, colors: filters.colors.filter(c => c !== color) })}
                        className="ml-1"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                  {filters.inStock && (
                    <Badge variant="outline" className="gap-1">
                      En stock
                      <button
                        onClick={() => setFilters({ ...filters, inStock: false })}
                        className="ml-1"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                </div>
              )}

              {/* Products Grid/List */}
              {filteredProducts.length > 0 ? (
                <div className={
                  viewMode === "grid"
                    ? "grid gap-6 sm:grid-cols-2 xl:grid-cols-3"
                    : "space-y-4"
                }>
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} viewMode={viewMode} />
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <p className="text-lg font-medium text-foreground">Aucun produit trouvé</p>
                  <p className="mt-2 text-muted-foreground">
                    Essayez de modifier vos filtres de recherche
                  </p>
                  <Button variant="outline" className="mt-4 bg-transparent" onClick={clearFilters}>
                    Effacer tous les filtres
                  </Button>
                </div>
              )}

              {/* B2B Notice */}
              <div className="mt-12 rounded-lg bg-muted p-6">
                <div className="flex items-start gap-4">
                  <Lock className="mt-0.5 h-5 w-5 text-muted-foreground" />
                  <div>
                    <h3 className="font-semibold text-foreground">Accès Revendeur Requis</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Les prix et les options de commande sont réservés aux revendeurs enregistrés. 
                      Créez votre compte professionnel pour accéder à toutes les informations.
                    </p>
                    <div className="mt-4 flex gap-3">
                      <Link href="/inscription">
                        <Button size="sm">Devenir Revendeur</Button>
                      </Link>
                      <Link href="/connexion">
                        <Button variant="outline" size="sm">Se Connecter</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
