"use client"

import { useState, useCallback } from "react"
import { useToast } from "@/components/ui/use-toast"
import {
  products as productsData,
  productVariants as productVariantsData,
  categories,
  productTypes,
  artisans,
  units,
} from "@/lib/data/index"
import type { Product, ProductVariant } from "@/lib/data/products"

// Extended types with relations
interface ProductWithRelations extends Product {
  category_name: string
  product_type_name: string
  artisan_name: string
  total_stock: number
  min_price: number
  max_price: number
  variant_count: number
}

interface ProductVariantWithRelations {
  id: number
  product_id: number
  color: string
  pattern: string
  length_cm: number
  width_cm: number
  density: string
  created_at: string
  unit_name: string
  price_amount?: number
  stock_quantity?: number
}

interface CreateProductData {
  name: string
  description: string
  product_type_id: number
  category_id: number
  artisan_id: number
  origin_region: string
  is_active: boolean
  variants: CreateVariantData[]
}

interface CreateVariantData {
  color?: string
  pattern?: string
  length_cm?: number
  width_cm?: number
  density?: string
  unit_id: number
  price_amount: number
  stock_quantity: number
}

interface UpdateProductData extends Partial<CreateProductData> {}

interface ProductFilters {
  search?: string
  category_id?: number
  product_type_id?: number
  artisan_id?: number
  min_price?: number
  max_price?: number
  in_stock?: boolean
  is_active?: boolean
}

export function useProducts() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  // Get all products with relations
  const getProducts = useCallback(async (): Promise<ProductWithRelations[]> => {
    setIsLoading(true)
    setError(null)
    
    try {
      await new Promise((resolve) => setTimeout(resolve, 300))

      const productsList = productsData || []
      const productVariantsList = productVariantsData || []

      const productsWithRelations: ProductWithRelations[] = productsList.map((product) => {
        const productVariantsForProduct = productVariantsList.filter((v: ProductVariant) => v.product_id === product.id)

        const category = categories.find((c) => c.id === product.category_id)
        const productType = productTypes.find((t) => t.id === product.product_type_id)
        const artisan = artisans.find((a) => a.id === product.artisan_id)

        return {
          ...product,
          category_name: category?.name || "Non catégorisé",
          product_type_name: productType?.name || "Non défini",
          artisan_name: artisan?.name || "Non attribué",
          total_stock: productVariantsForProduct.length,
          min_price: 15000,
          max_price: 25000,
          variant_count: productVariantsForProduct.length,
        }
      })

      return productsWithRelations
    } catch {
      const errorMessage = "Erreur lors de la récupération des produits"
      setError(errorMessage)
      toast({
        variant: "destructive",
        title: "Erreur",
        description: errorMessage,
      })
      return []
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  // Get product by ID
  const getProductById = useCallback(async (id: number): Promise<ProductWithRelations | null> => {
    setIsLoading(true)
    setError(null)
    
    try {
      await new Promise((resolve) => setTimeout(resolve, 200))
      
      const productsList = productsData || []
      const product = productsList.find((p: Product) => p.id === id)
      if (!product) return null

      const productVariantsList = productVariantsData || []
      const productVariantsForProduct = productVariantsList.filter((v: ProductVariant) => v.product_id === id)
      const category = categories.find((c) => c.id === product.category_id)
      const productType = productTypes.find((t) => t.id === product.product_type_id)
      const artisan = artisans.find((a) => a.id === product.artisan_id)

      return {
        ...product,
        category_name: category?.name || "Non catégorisé",
        product_type_name: productType?.name || "Non défini",
        artisan_name: artisan?.name || "Non attribué",
        total_stock: productVariantsForProduct.length,
        min_price: 15000,
        max_price: 25000,
        variant_count: productVariantsForProduct.length,
      }
    } catch {
      setError("Erreur lors de la récupération du produit")
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Get variants for a product
  const getProductVariants = useCallback(async (productId: number): Promise<ProductVariantWithRelations[]> => {
    setIsLoading(true)
    setError(null)
    
    try {
      await new Promise((resolve) => setTimeout(resolve, 200))
      
      const productVariantsList = productVariantsData || []
      
      const variants: ProductVariantWithRelations[] = productVariantsList
        .filter((v: ProductVariant) => v.product_id === productId)
        .map((v: ProductVariant) => {
          return {
            ...v,
            unit_name: "Pièce",
            price_amount: 15000,
            stock_quantity: 50,
          }
        })

      return variants
    } catch {
      setError("Erreur lors de la récupération des variantes")
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Create a new product
  const createProduct = useCallback(async (data: CreateProductData): Promise<boolean> => {
    setIsLoading(true)
    setError(null)
    
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))

      toast({
        title: "Succès",
        description: `Le produit "${data.name}" a été créé avec succès`,
      })
      
      return true
    } catch {
      const errorMessage = "Erreur lors de la création du produit"
      setError(errorMessage)
      toast({
        variant: "destructive",
        title: "Erreur",
        description: errorMessage,
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  // Update an existing product
  const updateProduct = useCallback(async (id: number, data: UpdateProductData): Promise<boolean> => {
    setIsLoading(true)
    setError(null)
    
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))

      const productsList = productsData || []
      const product = productsList.find((p: Product) => p.id === id)
      if (!product) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Produit non trouvé",
        })
        return false
      }

      toast({
        title: "Succès",
        description: `Le produit a été mis à jour`,
      })
      
      return true
    } catch {
      const errorMessage = "Erreur lors de la mise à jour du produit"
      setError(errorMessage)
      toast({
        variant: "destructive",
        title: "Erreur",
        description: errorMessage,
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  // Delete a product
  const deleteProduct = useCallback(async (id: number): Promise<boolean> => {
    setIsLoading(true)
    setError(null)
    
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))

      const productsList = productsData || []
      const product = productsList.find((p: Product) => p.id === id)
      if (!product) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Produit non trouvé",
        })
        return false
      }

      toast({
        title: "Succès",
        description: `Le produit "${product.name}" a été supprimé`,
      })
      
      return true
    } catch {
      const errorMessage = "Erreur lors de la suppression du produit"
      setError(errorMessage)
      toast({
        variant: "destructive",
        title: "Erreur",
        description: errorMessage,
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  // Duplicate a product
  const duplicateProduct = useCallback(async (id: number): Promise<boolean> => {
    setIsLoading(true)
    setError(null)
    
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))

      const productsList = productsData || []
      const product = productsList.find((p: Product) => p.id === id)
      if (!product) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Produit non trouvé",
        })
        return false
      }

      toast({
        title: "Succès",
        description: `Le produit "${product.name}" a été dupliqué`,
      })
      
      return true
    } catch {
      const errorMessage = "Erreur lors de la duplication du produit"
      setError(errorMessage)
      toast({
        variant: "destructive",
        title: "Erreur",
        description: errorMessage,
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  // Get statistics
  const getStatistics = useCallback(async () => {
    const allProducts = await getProducts()
    
    const totalProducts = allProducts.length
    const activeProducts = allProducts.filter((p) => p.is_active).length
    const outOfStockProducts = allProducts.filter((p) => p.total_stock === 0).length
    const totalVariants = allProducts.reduce((sum, p) => sum + p.variant_count, 0)
    const estimatedRevenue = allProducts.reduce((sum, p) => sum + p.min_price * p.total_stock, 0)

    return {
      totalProducts,
      activeProducts,
      outOfStockProducts,
      totalVariants,
      estimatedRevenue,
    }
  }, [getProducts])

  // Export products to CSV
  const exportToCSV = useCallback(() => {
    const productsList = productsData || []
    const productVariantsList = productVariantsData || []
    
    const csvContent = [
      ["ID", "Nom", "Catégorie", "Type", "Artisan", "Prix min", "Prix max", "Stock total", "Variantes", "Actif", "Créé le"].join(","),
      ...productsList.map((product: Product) => {
        const category = categories.find((c) => c.id === product.category_id)
        const productType = productTypes.find((t) => t.id === product.product_type_id)
        const artisan = artisans.find((a) => a.id === product.artisan_id)
        const variantCount = productVariantsList.filter((v: ProductVariant) => v.product_id === product.id).length
        return [
          product.id,
          `"${product.name}"`,
          category?.name || "",
          productType?.name || "",
          artisan?.name || "",
          15000,
          25000,
          variantCount,
          variantCount,
          product.is_active ? "Oui" : "Non",
          new Date(product.created_at).toLocaleDateString("fr-FR"),
        ].join(",")
      }),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `produits_export_${new Date().toISOString().split("T")[0]}.csv`
    link.click()

    toast({
      title: "Export réussi",
      description: "La liste des produits a été exportée en CSV",
    })
  }, [toast])

  return {
    isLoading,
    error,
    getProducts,
    getProductById,
    getProductVariants,
    createProduct,
    updateProduct,
    deleteProduct,
    duplicateProduct,
    getStatistics,
    exportToCSV,
    categories,
    productTypes,
    artisans,
    units,
  }
}

// Export types for use in components
export type {
  ProductWithRelations,
  ProductVariantWithRelations,
  CreateProductData,
  CreateVariantData,
  UpdateProductData,
  ProductFilters,
}
