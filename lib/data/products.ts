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

export const products: Product[] = [
  {
    id: "1",
    name: "Pagne Manjak Traditionnel Indigo",
    type: "manjak",
    origin: "casamance",
    colors: ["indigo", "blanc"],
    unit: "piece",
    minQuantity: 10,
    artisanId: "art-1",
    artisanName: "Atelier Diatta",
    description: "Pagne manjak authentique tissé à la main selon les techniques traditionnelles de Casamance. Motifs géométriques classiques sur fond indigo profond.",
    specifications: {
      width: "120 cm",
      length: "180 cm",
      material: "100% Coton",
      technique: "Tissage traditionnel",
    },
    images: ["/images/products/manjak-1.jpg"],
    inStock: true,
    featured: true,
  },
  {
    id: "2",
    name: "Pagne Sérère Cérémonial",
    type: "serere",
    origin: "sine-saloum",
    colors: ["noir", "ocre", "blanc"],
    unit: "piece",
    minQuantity: 5,
    artisanId: "art-2",
    artisanName: "Coopérative Ndofane",
    description: "Pagne sérère de cérémonie avec motifs symboliques traditionnels. Utilisé pour les grandes occasions et événements culturels.",
    specifications: {
      width: "110 cm",
      length: "200 cm",
      material: "Coton et soie",
      technique: "Tissage sur métier traditionnel",
    },
    images: ["/images/products/serere-1.jpg"],
    inStock: true,
    featured: true,
  },
  {
    id: "3",
    name: "Thioup Dakarois Moderne",
    type: "thioup",
    origin: "dakar",
    colors: ["multicolore"],
    unit: "piece",
    minQuantity: 20,
    artisanId: "art-3",
    artisanName: "Maison Seck",
    description: "Thioup contemporain alliant motifs traditionnels et couleurs modernes. Parfait pour la mode urbaine.",
    specifications: {
      width: "100 cm",
      length: "150 cm",
      material: "100% Coton",
      technique: "Tissage semi-mécanisé",
    },
    images: ["/images/products/thioup-1.jpg"],
    inStock: true,
    featured: false,
  },
  {
    id: "4",
    name: "Kente Royal Ghana",
    type: "kente",
    origin: "ghana",
    colors: ["ocre", "rouge", "vert", "noir"],
    unit: "piece",
    minQuantity: 5,
    artisanId: "art-4",
    artisanName: "Atelier Ashanti",
    description: "Kente authentique du Ghana avec motifs royaux traditionnels. Chaque pièce raconte une histoire.",
    specifications: {
      width: "130 cm",
      length: "220 cm",
      material: "Soie et coton",
      technique: "Tissage manuel Ashanti",
    },
    images: ["/images/products/kente-1.jpg"],
    inStock: true,
    featured: true,
  },
  {
    id: "5",
    name: "Bogolan Authentique Mali",
    type: "bogolan",
    origin: "mali",
    colors: ["ocre", "noir", "blanc"],
    unit: "piece",
    minQuantity: 10,
    artisanId: "art-5",
    artisanName: "Groupement Ségou",
    description: "Bogolan traditionnel du Mali teint à la boue selon les méthodes ancestrales. Motifs symboliques Bambara.",
    specifications: {
      width: "150 cm",
      length: "200 cm",
      material: "100% Coton",
      technique: "Teinture à la boue fermentée",
    },
    images: ["/images/products/bogolan-1.jpg"],
    inStock: true,
    featured: false,
  },
  {
    id: "6",
    name: "Bazin Riche Brocart",
    type: "bazin",
    origin: "dakar",
    colors: ["blanc", "indigo"],
    unit: "bobine",
    minQuantity: 5,
    artisanId: "art-6",
    artisanName: "Teinturerie Ndiaye",
    description: "Bazin riche de qualité supérieure avec finition brocart. Idéal pour les tenues de cérémonie.",
    specifications: {
      width: "160 cm",
      length: "10 m par bobine",
      material: "100% Coton damassé",
      technique: "Teinture et lustrage artisanal",
    },
    images: ["/images/products/bazin-1.jpg"],
    inStock: true,
    featured: true,
  },
  {
    id: "7",
    name: "Pagne Manjak Festif",
    type: "manjak",
    origin: "casamance",
    colors: ["rouge", "ocre", "noir"],
    unit: "piece",
    minQuantity: 10,
    artisanId: "art-1",
    artisanName: "Atelier Diatta",
    description: "Pagne manjak aux couleurs vives pour les célébrations. Tissage serré de haute qualité.",
    specifications: {
      width: "120 cm",
      length: "180 cm",
      material: "100% Coton",
      technique: "Tissage traditionnel",
    },
    images: ["/images/products/manjak-2.jpg"],
    inStock: true,
    featured: false,
  },
  {
    id: "8",
    name: "Lot Thioup Assorti",
    type: "thioup",
    origin: "thies",
    colors: ["multicolore"],
    unit: "lot",
    minQuantity: 3,
    artisanId: "art-7",
    artisanName: "Atelier Thiès Textile",
    description: "Lot de 5 thioup assortis aux motifs variés. Parfait pour les revendeurs débutants.",
    specifications: {
      width: "100 cm",
      length: "150 cm",
      material: "100% Coton",
      technique: "Tissage semi-mécanisé",
    },
    images: ["/images/products/thioup-lot.jpg"],
    inStock: true,
    featured: false,
  },
]

export const artisans: Artisan[] = [
  {
    id: "art-1",
    name: "Atelier Diatta",
    location: "Ziguinchor",
    region: "Casamance",
    specialty: "Pagne Manjak",
    yearsExperience: 35,
    certified: true,
    bio: "Famille de tisserands depuis trois générations, l'Atelier Diatta perpétue les techniques ancestrales du tissage manjak.",
    productsCount: 45,
  },
  {
    id: "art-2",
    name: "Coopérative Ndofane",
    location: "Fatick",
    region: "Sine-Saloum",
    specialty: "Pagne Sérère",
    yearsExperience: 20,
    certified: true,
    bio: "Coopérative de 15 tisserandes préservant l'art du tissage sérère traditionnel.",
    productsCount: 32,
  },
  {
    id: "art-3",
    name: "Maison Seck",
    location: "Dakar",
    region: "Dakar",
    specialty: "Thioup",
    yearsExperience: 15,
    certified: true,
    bio: "Créateur de thioup contemporains alliant tradition et modernité pour le marché urbain.",
    productsCount: 28,
  },
  {
    id: "art-4",
    name: "Atelier Ashanti",
    location: "Kumasi",
    region: "Ghana",
    specialty: "Kente",
    yearsExperience: 40,
    certified: true,
    bio: "Maître tisserand kente perpétuant les motifs royaux traditionnels Ashanti.",
    productsCount: 22,
  },
  {
    id: "art-5",
    name: "Groupement Ségou",
    location: "Ségou",
    region: "Mali",
    specialty: "Bogolan",
    yearsExperience: 25,
    certified: true,
    bio: "Collectif d'artisans spécialisés dans la teinture bogolan selon les méthodes ancestrales Bambara.",
    productsCount: 38,
  },
]
