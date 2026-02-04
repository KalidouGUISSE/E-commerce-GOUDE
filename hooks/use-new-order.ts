/**
 * useNewOrder Hook - Gestion de la création d'une nouvelle commande revendeur
 * 
 * Ce hook gère :
 * - Sélection de produits avec catalogue
 * - Gestion du panier
 * - Calcul des remises et marges
 * - Validation multi-étapes
 * - Adresses de livraison
 * - Modes de livraison
 */

'use client'

import { useState, useCallback, useMemo } from 'react'

// Types pour les produits
export interface Product {
  id: string
  name: string
  description: string
  category: string
  image: string
  publicPrice: number
  resellerPrice: number
  stock: number
  minStock: number
  artisan: string
  origin: string
}

// Types pour le panier
export interface CartItem {
  productId: string
  product: Product
  quantity: number
  unitPrice: number
  discount: number
  totalPrice: number
}

// Types pour les adresses
export interface Address {
  id: string
  label: string
  recipient: string
  phone: string
  street: string
  city: string
  region: string
  isDefault: boolean
}

// Types pour les modes de livraison
export interface DeliveryMode {
  id: string
  name: string
  description: string
  price: number
  delay: string
  carrier: string
}

// Types pour les promotions
export interface Promotion {
  id: string
  code: string
  label: string
  type: 'percentage' | 'fixed'
  value: number
  minOrder: number
  maxDiscount: number
  applicableProducts?: string[]
  validUntil: string
}

// Types pour les étapes
export type OrderStep = 'products' | 'customer' | 'delivery' | 'summary' | 'confirmation'

// Types pour l'état de la commande
export interface OrderState {
  step: OrderStep
  cart: CartItem[]
  selectedCustomerId: string
  selectedAddressId: string
  selectedDeliveryId: string
  promoCode: string
  appliedPromo: Promotion | null
  comments: string
  isLoading: boolean
  isSubmitting: boolean
  error: string | null
}

// Produits mockés du catalogue
const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p001',
    name: 'Pagne Manjak - Rouge Tradition',
    description: 'Pagne traditionnel manjak tissé à la main avec des motifs géométriques anciens. Teint avec des pigments naturels.',
    category: 'Manjak',
    image: '/placeholder.jpg',
    publicPrice: 25000,
    resellerPrice: 17500,
    stock: 45,
    minStock: 20,
    artisan: 'Coumba Diatta',
    origin: 'Sénégal',
  },
  {
    id: 'p002',
    name: 'Pagne Kente - Bleu Royal',
    description: 'Magnifique pagne kete avec des fils dorés tissés artisanalement. Très prisé pour les cérémonies.',
    category: 'Kente',
    image: '/placeholder.jpg',
    publicPrice: 35000,
    resellerPrice: 24500,
    stock: 28,
    minStock: 15,
    artisan: 'Aminata Kouyaté',
    origin: 'Ghana',
  },
  {
    id: 'p003',
    name: 'Pagne Bogolan - Marron Naturel',
    description: 'Pagne bogolan Faso exécuté selon les techniques traditionnelles maliennes.',
    category: 'Bogolan',
    image: '/placeholder.jpg',
    publicPrice: 18000,
    resellerPrice: 12600,
    stock: 52,
    minStock: 25,
    artisan: 'Mamadou Traoré',
    origin: 'Mali',
  },
  {
    id: 'p004',
    name: 'Pagne Thioup - Blanc Écru',
    description: 'Pagne thioup de la Casamance avec des bordures décoratives.',
    category: 'Thioup',
    image: '/placeholder.jpg',
    publicPrice: 15000,
    resellerPrice: 10500,
    stock: 35,
    minStock: 20,
    artisan: 'Adama Sarr',
    origin: 'Sénégal',
  },
  {
    id: 'p005',
    name: 'Pagne Sérère - Vert Mandinka',
    description: 'Pagne sérère authentique avec des motifs géométriques traditionnels.',
    category: 'Sérère',
    image: '/placeholder.jpg',
    publicPrice: 20000,
    resellerPrice: 14000,
    stock: 18,
    minStock: 10,
    artisan: 'Coumba Diatta',
    origin: 'Sénégal',
  },
  {
    id: 'p006',
    name: 'Pagne Bazin - Brodé Or',
    description: 'Superbe pagne bazin avec broderies dorées élaborées.',
    category: 'Bazin',
    image: '/placeholder.jpg',
    publicPrice: 45000,
    resellerPrice: 31500,
    stock: 12,
    minStock: 8,
    artisan: 'Fatou Bamba',
    origin: 'Sénégal',
  },
  {
    id: 'p007',
    name: 'Pagne Holonda - Vert Émeraude',
    description: 'Tissu holonda de qualité supérieure avec des reflets soyeux.',
    category: 'Holonda',
    image: '/placeholder.jpg',
    publicPrice: 22000,
    resellerPrice: 15400,
    stock: 8,
    minStock: 15,
    artisan: 'Mamadou Diop',
    origin: 'Sénégal',
  },
  {
    id: 'p008',
    name: 'Pagne Waxi - Rouge Vif',
    description: 'Tissu wax hollandais authentique avec des motifs classiques.',
    category: 'Waxi',
    image: '/placeholder.jpg',
    publicPrice: 12000,
    resellerPrice: 8400,
    stock: 65,
    minStock: 30,
    artisan: 'Multiple',
    origin: 'Nigeria',
  },
]

// Adresses mockées
const MOCK_ADDRESSES: Address[] = [
  {
    id: 'a001',
    label: 'Dakar - Point de collecte',
    recipient: 'Marie Diop',
    phone: '+221 77 123 45 67',
    street: 'Rue 10, Point E',
    city: 'Dakar',
    region: 'Dakar',
    isDefault: true,
  },
  {
    id: 'a002',
    label: 'Thiès - Entrepôt',
    recipient: 'Marie Diop',
    phone: '+221 77 123 45 67',
    street: 'Avenue Cheikh Anta Diop',
    city: 'Thiès',
    region: 'Thiès',
    isDefault: false,
  },
]

// Modes de livraison
const DELIVERY_MODES: DeliveryMode[] = [
  {
    id: 'd001',
    name: 'Retrait au dépôt',
    description: 'Retrait gratuit à notre dépôt de Dakar',
    price: 0,
    delay: '24h',
    carrier: 'Interne',
  },
  {
    id: 'd002',
    name: 'Livraison standard',
    description: 'Livraison par notre équipe',
    price: 2500,
    delay: '48-72h',
    carrier: 'Pagne Tissé',
  },
  {
    id: 'd003',
    name: 'Livraison express',
    description: 'Livraison en 24h par coursier',
    price: 5000,
    delay: '24h',
    carrier: 'Pagne Tissé Express',
  },
  {
    id: 'd004',
    name: 'Transport interurbain',
    description: 'Via gare routières vers les régions',
    price: 1500,
    delay: '3-5 jours',
    carrier: 'STN',
  },
]

// Promotions actives
const MOCK_PROMOTIONS: Promotion[] = [
  {
    id: 'promo1',
    code: 'BIENVENUE10',
    label: '10% sur première commande',
    type: 'percentage',
    value: 10,
    minOrder: 50000,
    maxDiscount: 10000,
    validUntil: '2024-12-31',
  },
  {
    id: 'promo2',
    code: 'MARIAGE20',
    label: '20% sur pagne mariée',
    type: 'percentage',
    value: 20,
    minOrder: 100000,
    maxDiscount: 25000,
    applicableProducts: ['p001', 'p002', 'p006'],
    validUntil: '2024-06-30',
  },
  {
    id: 'promo3',
    code: 'SOLDE5000',
    label: '5000 CFA de réduction',
    type: 'fixed',
    value: 5000,
    minOrder: 75000,
    maxDiscount: 5000,
    validUntil: '2024-03-31',
  },
]

// Clients récents
const MOCK_RECENT_CUSTOMERS = [
  { id: 'c001', name: 'Aminata Fall', phone: '+221 77 987 65 43', ordersCount: 12, lastOrder: '2024-02-01' },
  { id: 'c002', name: 'Fatou Diop', phone: '+221 76 555 44 33', ordersCount: 8, lastOrder: '2024-01-28' },
  { id: 'c003', name: 'Mariama Sy', phone: '+221 70 111 22 33', ordersCount: 5, lastOrder: '2024-02-03' },
]

// Hook principal
export function useNewOrder() {
  const [state, setState] = useState<OrderState>({
    step: 'products',
    cart: [],
    selectedCustomerId: '',
    selectedAddressId: 'a001',
    selectedDeliveryId: 'd002',
    promoCode: '',
    appliedPromo: null,
    comments: '',
    isLoading: false,
    isSubmitting: false,
    error: null,
  })

  // Produits disponibles
  const products = useMemo(() => MOCK_PRODUCTS, [])
  
  // Adresses disponibles
  const addresses = useMemo(() => MOCK_ADDRESSES, [])
  
  // Modes de livraison
  const deliveryModes = useMemo(() => DELIVERY_MODES, [])
  
  // Promotions disponibles
  const promotions = useMemo(() => MOCK_PROMOTIONS, [])
  
  // Clients récents
  const recentCustomers = useMemo(() => MOCK_RECENT_CUSTOMERS, [])

  // Calculs du panier
  const cartCalculations = useMemo(() => {
    const subtotal = state.cart.reduce((sum, item) => sum + item.totalPrice, 0)
    const resellerDiscount = state.cart.reduce((sum, item) => {
      const publicPrice = item.product.publicPrice * item.quantity
      return sum + (publicPrice - item.totalPrice)
    }, 0)
    const promoDiscount = state.appliedPromo
      ? state.appliedPromo.type === 'percentage'
        ? Math.min(subtotal * (state.appliedPromo.value / 100), state.appliedPromo.maxDiscount)
        : state.appliedPromo.value
      : 0
    const deliveryPrice = deliveryModes.find(d => d.id === state.selectedDeliveryId)?.price ?? 0
    const total = subtotal - promoDiscount + deliveryPrice
    const margin = state.cart.reduce((sum, item) => {
      const resellerMargin = (item.product.resellerPrice - item.product.publicPrice * 0.7) * item.quantity
      return sum + Math.max(resellerMargin, 0)
    }, 0)

    return {
      subtotal,
      resellerDiscount,
      promoDiscount,
      deliveryPrice,
      total,
      margin,
      itemCount: state.cart.reduce((sum, item) => sum + item.quantity, 0),
    }
  }, [state.cart, state.appliedPromo, state.selectedDeliveryId, deliveryModes])

  // Ajouter un produit au panier
  const addToCart = useCallback((product: Product, quantity: number = 1) => {
    setState(prev => {
      const existingIndex = prev.cart.findIndex(item => item.productId === product.id)
      
      if (existingIndex >= 0) {
        const newCart = [...prev.cart]
        const newQuantity = newCart[existingIndex].quantity + quantity
        const discount = prev.appliedPromo
          ? (newCart[existingIndex].unitPrice * quantity) * (prev.appliedPromo.value / 100)
          : 0
        newCart[existingIndex] = {
          ...newCart[existingIndex],
          quantity: newQuantity,
          discount: newCart[existingIndex].discount + discount,
          totalPrice: (newCart[existingIndex].unitPrice * quantity) - discount,
        }
        return { ...prev, cart: newCart }
      }
      
      const discount = prev.appliedPromo
        ? (product.resellerPrice * quantity) * (prev.appliedPromo.value / 100)
        : 0
      
      const newItem: CartItem = {
        productId: product.id,
        product,
        quantity,
        unitPrice: product.resellerPrice,
        discount,
        totalPrice: (product.resellerPrice * quantity) - discount,
      }
      
      return { ...prev, cart: [...prev.cart, newItem] }
    })
  }, [])

  // Modifier la quantité
  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(productId)
      return
    }
    
    setState(prev => {
      const newCart = prev.cart.map(item => {
        if (item.productId === productId) {
          const discount = prev.appliedPromo
            ? (item.unitPrice * quantity) * (prev.appliedPromo.value / 100)
            : 0
          return {
            ...item,
            quantity,
            discount,
            totalPrice: (item.unitPrice * quantity) - discount,
          }
        }
        return item
      })
      return { ...prev, cart: newCart }
    })
  }, [])

  // Supprimer du panier
  const removeFromCart = useCallback((productId: string) => {
    setState(prev => ({
      ...prev,
      cart: prev.cart.filter(item => item.productId !== productId),
    }))
  }, [])

  // Vider le panier
  const clearCart = useCallback(() => {
    setState(prev => ({ ...prev, cart: [], appliedPromo: null, promoCode: '' }))
  }, [])

  // Appliquer un code promo
  const applyPromoCode = useCallback((code: string) => {
    const promo = promotions.find(p => p.code.toLowerCase() === code.toLowerCase())
    
    if (promo) {
      if (cartCalculations.subtotal >= promo.minOrder) {
        setState(prev => ({
          ...prev,
          promoCode: code,
          appliedPromo: promo,
        }))
        return { success: true, message: `Code appliqué: ${promo.label}` }
      }
      return { success: false, message: `Commander au moins ${promo.minOrder.toLocaleString()} CFA` }
    }
    
    return { success: false, message: 'Code promo invalide' }
  }, [promotions, cartCalculations.subtotal])

  // Retirer le code promo
  const removePromoCode = useCallback(() => {
    setState(prev => ({
      ...prev,
      promoCode: '',
      appliedPromo: null,
    }))
  }, [])

  // Navigation entre les étapes
  const goToStep = useCallback((step: OrderStep) => {
    setState(prev => ({ ...prev, step }))
  }, [])

  // Sélectionner un client
  const selectCustomer = useCallback((customerId: string) => {
    setState(prev => ({ ...prev, selectedCustomerId: customerId }))
  }, [])

  // Sélectionner une adresse
  const selectAddress = useCallback((addressId: string) => {
    setState(prev => ({ ...prev, selectedAddressId: addressId }))
  }, [])

  // Sélectionner un mode de livraison
  const selectDelivery = useCallback((deliveryId: string) => {
    setState(prev => ({ ...prev, selectedDeliveryId: deliveryId }))
  }, [])

  // Ajouter un commentaire
  const setComments = useCallback((comments: string) => {
    setState(prev => ({ ...prev, comments }))
  }, [])

  // Valider et passer à l'étape suivante
  const validateStep = useCallback(() => {
    switch (state.step) {
      case 'products':
        if (state.cart.length === 0) {
          return { valid: false, message: 'Le panier est vide' }
        }
        return { valid: true }
      case 'customer':
        if (!state.selectedCustomerId) {
          return { valid: false, message: 'Sélectionnez un client' }
        }
        return { valid: true }
      case 'delivery':
        if (!state.selectedAddressId) {
          return { valid: false, message: 'Sélectionnez une adresse de livraison' }
        }
        return { valid: true }
      default:
        return { valid: true }
    }
  }, [state.step, state.cart.length, state.selectedCustomerId, state.selectedAddressId])

  // Soumettre la commande
  const submitOrder = useCallback(async () => {
    setState(prev => ({ ...prev, isSubmitting: true, error: null }))
    
    try {
      // Simuler l'API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Succès
      setState(prev => ({
        ...prev,
        step: 'confirmation',
        isSubmitting: false,
      }))
      
      return { success: true, orderId: `CMD-${Date.now()}` }
    } catch {
      setState(prev => ({
        ...prev,
        isSubmitting: false,
        error: 'Erreur lors de la soumission de la commande',
      }))
      return { success: false, error: 'Erreur lors de la soumission' }
    }
  }, [])

  return {
    state,
    products,
    addresses,
    deliveryModes,
    promotions,
    recentCustomers,
    cartCalculations,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    applyPromoCode,
    removePromoCode,
    goToStep,
    selectCustomer,
    selectAddress,
    selectDelivery,
    setComments,
    validateStep,
    submitOrder,
  }
}

export default useNewOrder
