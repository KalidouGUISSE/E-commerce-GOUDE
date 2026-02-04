export interface Product {
  id: string
  name: string
  type: string
  origin: string
  colors: string[]
  unit: "piece" | "paire" | "lot" | "bobine"
  minQuantity: number
  artisanId: string
  artisanName: string
  description: string
  specifications: {
    width?: string
    length?: string
    material?: string
    technique?: string
  }
  images: string[]
  inStock: boolean
  featured: boolean
}

export interface Artisan {
  id: string
  name: string
  location: string
  region: string
  specialty: string
  yearsExperience: number
  certified: boolean
  bio: string
  productsCount: number
}

import db from './db.json'

export const products = db.products as unknown as Product[]
export const artisans = db.artisans as unknown as Artisan[]
export const productTypes = [
  { value: "manjak", label: "Pagne Manjak" },
  { value: "serere", label: "Pagne Sérère" },
  { value: "thioup", label: "Thioup" },
  { value: "kente", label: "Kente" },
  { value: "bogolan", label: "Bogolan" },
  { value: "bazin", label: "Bazin" },
]

export const productOrigins = [
  { value: "casamance", label: "Casamance" },
  { value: "sine-saloum", label: "Sine-Saloum" },
  { value: "dakar", label: "Dakar" },
  { value: "thies", label: "Thiès" },
  { value: "saint-louis", label: "Saint-Louis" },
  { value: "ghana", label: "Ghana" },
  { value: "mali", label: "Mali" },
]

export const productColors = [
  { value: "indigo", label: "Indigo" },
  { value: "noir", label: "Noir" },
  { value: "blanc", label: "Blanc" },
  { value: "ocre", label: "Ocre" },
  { value: "rouge", label: "Rouge" },
  { value: "vert", label: "Vert" },
  { value: "multicolore", label: "Multicolore" },
]

export const productUnits = [
  { value: "piece", label: "Pièce" },
  { value: "paire", label: "Paire" },
  { value: "lot", label: "Lot" },
  { value: "bobine", label: "Bobine/Rouleau" },
]
