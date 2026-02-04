// Types based on ERD diagram

export interface Role {
  id: number
  name: string
  description: string
}

export interface User {
  id: number
  role_id: number
  first_name: string
  last_name: string
  email: string
  phone: string
  password_hash: string
  language: string
  is_active: boolean
  created_at: string
}

export interface Reseller {
  id: number
  user_id: number
  company_name: string
  country: string
  city: string
  address: string
  verified: boolean
  is_international: boolean
  created_at: string
}

export interface Artisan {
  id: number
  user_id: number
  name: string
  region: string
  village: string
  speciality: string
  rating: number
  is_active: boolean
  created_at: string
}

export interface ProductType {
  id: number
  name: string
}

export interface Category {
  id: number
  name: string
  parent_id: number | null
}

export interface Product {
  id: number
  product_type_id: number
  category_id: number
  artisan_id: number
  name: string
  slug: string
  description: string
  origin_region: string
  is_active: boolean
  created_at: string
}

export interface ProductVariant {
  id: number
  product_id: number
  color: string
  pattern: string
  length_cm: number
  width_cm: number
  density: string
  created_at: string
}

export interface Unit {
  id: number
  name: string
  multiplier: number
}

export interface Price {
  id: number
  product_variant_id: number
  unit_id: number
  price_type: string
  amount: number
  currency: string
  min_quantity: number
  created_at: string
}

export interface Stock {
  id: number
  product_variant_id: number
  unit_id: number
  artisan_id: number
  quantity_available: number
  updated_at: string
}

export interface Order {
  id: number
  reseller_id: number
  order_number: string
  status: string
  total_amount: number
  currency: string
  created_at: string
}

export interface OrderItem {
  id: number
  order_id: number
  product_variant_id: number
  unit_id: number
  quantity: number
  unit_price: number
  total_price: number
}

export interface PaymentMethod {
  id: number
  name: string
}

export interface Payment {
  id: number
  order_id: number
  payment_method_id: number
  reference: string
  amount: number
  status: string
  paid_at: string | null
}

export interface Delivery {
  id: number
  order_id: number
  delivery_type: string
  carrier: string
  tracking_number: string
  status: string
  estimated_date: string
}

export interface Invoice {
  id: number
  order_id: number
  invoice_number: string
  issued_at: string
  total_amount: number
  currency: string
}

// Reference data (static)
export const productTypesData = [
  { value: "tissu", label: "Tissu" },
  { value: "pagne", label: "Pagne" },
  { value: "accessoire", label: "Accessoire" },
]

export const productCategoriesData = [
  { value: "manjak", label: "Pagne Manjak" },
  { value: "serere", label: "Pagne Sérère" },
  { value: "thioup", label: "Thioup" },
  { value: "kente", label: "Kente" },
  { value: "bogolan", label: "Bogolan" },
  { value: "bazin", label: "Bazin" },
]

export const productColorsData = [
  { value: "indigo", label: "Indigo" },
  { value: "noir", label: "Noir" },
  { value: "blanc", label: "Blanc" },
  { value: "ocre", label: "Ocre" },
  { value: "rouge", label: "Rouge" },
  { value: "vert", label: "Vert" },
  { value: "multicolore", label: "Multicolore" },
]

export const productUnitsData = [
  { value: "piece", label: "Pièce", multiplier: 1 },
  { value: "paire", label: "Paire", multiplier: 2 },
  { value: "lot", label: "Lot", multiplier: 5 },
  { value: "bobine", label: "Bobine", multiplier: 10 },
]

export const orderStatusesData = [
  { value: "pending", label: "En attente" },
  { value: "confirmed", label: "Confirmé" },
  { value: "processing", label: "En traitement" },
  { value: "shipped", label: "Expédié" },
  { value: "delivered", label: "Livré" },
  { value: "cancelled", label: "Annulé" },
]

export const paymentStatusesData = [
  { value: "pending", label: "En attente" },
  { value: "completed", label: "Complété" },
  { value: "failed", label: "Échoué" },
  { value: "refunded", label: "Remboursé" },
]

// Data from db.json (for backwards compatibility)
import dbData from './db.json'

export const products = dbData.products
export const artisans = dbData.artisans
export const productTypes = dbData.product_types
export const categories = dbData.categories
export const productOrigins = [
  { value: "casamance", label: "Casamance" },
  { value: "sine-saloum", label: "Sine-Saloum" },
  { value: "dakar", label: "Dakar" },
  { value: "thies", label: "Thiès" },
  { value: "ghana", label: "Ghana" },
  { value: "mali", label: "Mali" },
]
export const productColors = productColorsData
export const productUnits = productUnitsData
