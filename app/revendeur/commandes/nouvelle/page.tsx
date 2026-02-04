/**
 * Nouvelle Commande Revendeur - Page complète de création de commande
 * 
 * Cette page permet aux revendeurs de créer une nouvelle commande avec :
 * - Sélection de produits par catalogue
 * - Gestion du panier avec suggestions intelligentes
 * - Calcul automatique des remises et marges
 * - Validation multi-étapes
 * - Choix de livraison et адresses
 * - Résumé final avant confirmation
 */

'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ShoppingCart,
  Package,
  User,
  Truck,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Plus,
  Minus,
  Trash2,
  Search,
  Filter,
  AlertTriangle,
  Check,
  X,
  CreditCard,
  MapPin,
  Gift,
  MessageSquare,
  Info,
  RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useNewOrder } from '@/hooks/use-new-order'
import { cn } from '@/lib/utils'

// Composant StepIndicator
function StepIndicator({ 
  currentStep, 
  steps 
}: { 
  currentStep: string
  steps: { id: string; label: string }[]
}) {
  const currentIndex = steps.findIndex(s => s.id === currentStep)
  
  return (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <div className="flex flex-col items-center">
            <div
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center font-medium transition-all duration-200',
                index < currentIndex && 'bg-green-500 text-white',
                index === currentIndex && 'bg-primary text-primary-foreground',
                index > currentIndex && 'bg-muted text-muted-foreground'
              )}
            >
              {index < currentIndex ? (
                <Check className="w-5 h-5" />
              ) : (
                index + 1
              )}
            </div>
            <span className={cn(
              'text-xs mt-2',
              index === currentIndex && 'font-medium',
              index < currentIndex && 'text-green-500',
              index > currentIndex && 'text-muted-foreground'
            )}>
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={cn(
                'w-16 h-1 mx-2 rounded transition-colors duration-200',
                index < currentIndex ? 'bg-green-500' : 'bg-muted'
              )}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  )
}

// Composant ProductCard
function ProductCard({ 
  product, 
  onAddToCart 
}: { 
  product: ReturnType<typeof useNewOrder>['products'][0]
  onAddToCart: (product: ReturnType<typeof useNewOrder>['products'][0]) => void
}) {
  const [quantity, setQuantity] = useState(1)
  const [showDetails, setShowDetails] = useState(false)
  
  const stockStatus = product.stock <= product.minStock 
    ? 'low' 
    : product.stock <= product.minStock * 2 
      ? 'medium' 
      : 'good'

  const margin = product.publicPrice - product.resellerPrice
  const marginPercent = Math.round((margin / product.publicPrice) * 100)
  
  return (
    <Card className="overflow-hidden group hover:shadow-lg transition-shadow duration-200">
      <div className="relative aspect-[4/3] bg-muted">
        <div className="absolute inset-0 flex items-center justify-center">
          <Package className="w-16 h-16 text-muted-foreground/30" />
        </div>
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          <Badge variant="secondary">{product.category}</Badge>
          {stockStatus === 'low' && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Stock bas
            </Badge>
          )}
        </div>
        
        {/* Marge bénéficiaire */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="absolute top-2 right-2">
              <Badge className={cn(
                'cursor-help',
                marginPercent >= 30 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              )}>
                -{marginPercent}%
              </Badge>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Prix public: {product.publicPrice.toLocaleString()} CFA</p>
            <p>Votre prix: {product.resellerPrice.toLocaleString()} CFA</p>
            <p>Marge: {margin.toLocaleString()} CFA</p>
          </TooltipContent>
        </Tooltip>
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-semibold line-clamp-1">{product.name}</h3>
        <p className="text-sm text-muted-foreground mt-1">{product.artisan}</p>
        
        <div className="flex items-end justify-between mt-3">
          <div>
            <p className="text-lg font-bold text-primary">{product.resellerPrice.toLocaleString()} CFA</p>
            <p className="text-xs text-muted-foreground">
              Réf: {product.publicPrice.toLocaleString()} CFA
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {product.stock > 0 ? (
              <>
                <div className="flex items-center border rounded-md">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-8 text-center text-sm">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    onAddToCart({ ...product })
                    setQuantity(1)
                  }}
                  disabled={product.stock < quantity}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Ajouter
                </Button>
              </>
            ) : (
              <Badge variant="outline" className="text-red-500">Rupture</Badge>
            )}
          </div>
        </div>
        
        {/* Détails expandables */}
        <Button
          variant="ghost"
          size="sm"
          className="w-full mt-2 text-muted-foreground"
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? 'Masquer' : 'Voir'} les détails
        </Button>
        
        {showDetails && (
          <div className="mt-3 p-3 bg-muted rounded-lg text-sm space-y-1">
            <p className="text-muted-foreground">{product.description}</p>
            <p className="text-xs">
              <span className="font-medium">Origine:</span> {product.origin}
            </p>
            <p className="text-xs">
              <span className="font-medium">Stock disponible:</span> {product.stock} unités
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Composant CartItemRow
function CartItemRow({ 
  item,
  onUpdate,
  onRemove
}: { 
  item: ReturnType<typeof useNewOrder>['state']['cart'][0]
  onUpdate: (id: string, qty: number) => void
  onRemove: (id: string) => void
}) {
  const margin = (item.product.publicPrice - item.product.resellerPrice) * item.quantity
  
  return (
    <div className="flex items-center gap-4 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
      <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
        <Package className="w-6 h-6 text-muted-foreground" />
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{item.product.name}</p>
        <p className="text-sm text-muted-foreground">
          {item.product.publicPrice.toLocaleString()} CFA → {item.unitPrice.toLocaleString()} CFA
        </p>
        {item.discount > 0 && (
          <Badge variant="secondary" className="text-xs mt-1">
            -{item.discount.toLocaleString()} CFA (remise)
          </Badge>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onUpdate(item.productId, item.quantity - 1)}
        >
          <Minus className="w-4 h-4" />
        </Button>
        <span className="w-8 text-center font-medium">{item.quantity}</span>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onUpdate(item.productId, item.quantity + 1)}
          disabled={item.quantity >= item.product.stock}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="text-right min-w-[100px]">
        <p className="font-medium">{item.totalPrice.toLocaleString()} CFA</p>
        <p className="text-xs text-green-600">Marge: {margin.toLocaleString()} CFA</p>
      </div>
      
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
        onClick={() => onRemove(item.productId)}
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  )
}

// Page principale
export default function NouvelleCommandePage() {
  const router = useRouter()
  const {
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
  } = useNewOrder()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [promoInput, setPromoInput] = useState('')
  const [promoMessage, setPromoMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  
  const steps = [
    { id: 'products', label: 'Produits' },
    { id: 'customer', label: 'Client' },
    { id: 'delivery', label: 'Livraison' },
    { id: 'summary', label: 'Résumé' },
    { id: 'confirmation', label: 'Confirmation' },
  ]
  
  // Filtrer les produits
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         p.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = !selectedCategory || p.category === selectedCategory
    return matchesSearch && matchesCategory
  })
  
  // Catégories uniques
  const categories = [...new Set(products.map(p => p.category))]
  
  // Gérer l'application du code promo
  const handleApplyPromo = () => {
    const result = applyPromoCode(promoInput)
    if (result.success) {
      setPromoMessage({ type: 'success', text: result.message })
    } else {
      setPromoMessage({ type: 'error', text: result.message })
    }
    setPromoInput('')
  }
  
  // Étape : Produits
  const StepProducts = () => (
    <div className="space-y-6">
      {/* Barre de recherche et filtres */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un produit..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={selectedCategory === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(null)}
          >
            Tous
          </Button>
          {categories.map(cat => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>
      </div>
      
      {/* Grille de produits */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredProducts.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={addToCart}
          />
        ))}
      </div>
      
      {filteredProducts.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Aucun produit trouvé</p>
        </div>
      )}
    </div>
  )
  
  // Étape : Client
  const StepCustomer = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Sélectionner un client</h2>
        <Button variant="outline" size="sm">
          <User className="w-4 h-4 mr-2" />
          Nouveau client
        </Button>
      </div>
      
      {/* Clients récents */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {recentCustomers.map(customer => (
          <Card
            key={customer.id}
            className={cn(
              'cursor-pointer transition-all duration-200',
              state.selectedCustomerId === customer.id 
                ? 'ring-2 ring-primary' 
                : 'hover:shadow-md'
            )}
            onClick={() => selectCustomer(customer.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium">{customer.name}</p>
                  <p className="text-sm text-muted-foreground">{customer.phone}</p>
                </div>
                {state.selectedCustomerId === customer.id && (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                )}
              </div>
              <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                <span>{customer.ordersCount} commandes</span>
                <span>•</span>
                <span>Dernière: {customer.lastOrder}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
  
  // Étape : Livraison
  const StepDelivery = () => (
    <div className="space-y-6">
      {/* Adresses mémorisées */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Adresse de livraison</h2>
          <Button variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle adresse
          </Button>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2">
          {addresses.map(address => (
            <Card
              key={address.id}
              className={cn(
                'cursor-pointer transition-all duration-200',
                state.selectedAddressId === address.id 
                  ? 'ring-2 ring-primary' 
                  : 'hover:shadow-md'
              )}
              onClick={() => selectAddress(address.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 mt-1 text-muted-foreground" />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{address.label}</p>
                        {address.isDefault && (
                          <Badge variant="secondary" className="text-xs">Par défaut</Badge>
                        )}
                      </div>
                      <p className="text-sm">{address.recipient}</p>
                      <p className="text-sm text-muted-foreground">{address.street}</p>
                      <p className="text-sm text-muted-foreground">
                        {address.city}, {address.region}
                      </p>
                      <p className="text-sm mt-1">{address.phone}</p>
                    </div>
                  </div>
                  {state.selectedAddressId === address.id && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      <Separator />
      
      {/* Modes de livraison */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Mode de livraison</h2>
        <RadioGroup
          value={state.selectedDeliveryId}
          onValueChange={selectDelivery}
          className="grid gap-4 md:grid-cols-2"
        >
          {deliveryModes.map(mode => (
            <Card
              key={mode.id}
              className={cn(
                'cursor-pointer transition-all duration-200',
                state.selectedDeliveryId === mode.id 
                  ? 'ring-2 ring-primary' 
                  : ''
              )}
              onClick={() => selectDelivery(mode.id)}
            >
              <CardContent className="p-4">
                <RadioGroupItem value={mode.id} id={mode.id} className="sr-only" />
                <Label htmlFor={mode.id} className="cursor-pointer">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-muted-foreground" />
                        <p className="font-medium">{mode.name}</p>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{mode.description}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Délai: {mode.delay} • {mode.carrier}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {mode.price === 0 ? 'Gratuit' : `${mode.price.toLocaleString()} CFA`}
                      </p>
                    </div>
                  </div>
                </Label>
              </CardContent>
            </Card>
          ))}
        </RadioGroup>
      </div>
    </div>
  )
  
  // Étape : Résumé
  const StepSummary = () => (
    <div className="space-y-6">
      {/* Articles commandés */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Articles commandés</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {state.cart.map(item => (
            <CartItemRow
              key={item.productId}
              item={item}
              onUpdate={updateQuantity}
              onRemove={removeFromCart}
            />
          ))}
        </CardContent>
      </Card>
      
      {/* Code promo */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Gift className="w-5 h-5" />
            Code promotionnel
          </CardTitle>
        </CardHeader>
        <CardContent>
          {state.appliedPromo ? (
            <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
                <div>
                  <p className="font-medium text-green-800">{state.appliedPromo.code}</p>
                  <p className="text-sm text-green-600">{state.appliedPromo.label}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={removePromoCode}
                className="text-green-600 hover:text-green-700"
              >
                Retirer
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Input
                placeholder="Code promo"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleApplyPromo()}
              />
              <Button onClick={handleApplyPromo}>Appliquer</Button>
            </div>
          )}
          {promoMessage && (
            <p className={cn(
              'text-sm mt-2',
              promoMessage.type === 'success' ? 'text-green-600' : 'text-red-600'
            )}>
              {promoMessage.text}
            </p>
          )}
        </CardContent>
      </Card>
      
      {/* Commentaires */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Commentaires et instructions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Instructions spéciales pour la commande..."
            value={state.comments}
            onChange={(e) => setComments(e.target.value)}
            rows={3}
          />
        </CardContent>
      </Card>
      
      {/* Synthèse des coûts */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Récapitulatif de la commande</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Sous-total ({cartCalculations.itemCount} articles)</span>
            <span>{cartCalculations.subtotal.toLocaleString()} CFA</span>
          </div>
          {cartCalculations.resellerDiscount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Remise revendeur</span>
              <span>-{cartCalculations.resellerDiscount.toLocaleString()} CFA</span>
            </div>
          )}
          {cartCalculations.promoDiscount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Code promo</span>
              <span>-{cartCalculations.promoDiscount.toLocaleString()} CFA</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Livraison</span>
            <span>
              {cartCalculations.deliveryPrice === 0 
                ? 'Gratuit' 
                : `${cartCalculations.deliveryPrice.toLocaleString()} CFA`
              }
            </span>
          </div>
          <Separator />
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>{cartCalculations.total.toLocaleString()} CFA</span>
          </div>
          <div className="flex justify-between text-sm text-green-600">
            <span>Votre marge bénéficiaires</span>
            <span>{cartCalculations.margin.toLocaleString()} CFA</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
  
  // Étape : Confirmation
  const StepConfirmation = () => (
    <div className="text-center py-12">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="w-10 h-10 text-green-500" />
      </div>
      <h2 className="text-2xl font-bold mb-2">Commande confirmée !</h2>
      <p className="text-muted-foreground mb-6">
        Votre commande a été enregistrée avec succès.
      </p>
      <div className="bg-muted rounded-lg p-6 max-w-md mx-auto mb-6">
        <p className="text-sm text-muted-foreground mb-2">Numéro de commande</p>
        <p className="text-2xl font-bold">CMD-{Date.now()}</p>
      </div>
      <p className="text-sm text-muted-foreground mb-8">
        Un email de confirmation a été envoyé avec les détails de votre commande.
      </p>
      <div className="flex justify-center gap-4">
        <Button variant="outline" onClick={() => router.push('/revendeur/commandes')}>
          Voir mes commandes
        </Button>
        <Button onClick={() => {
          clearCart()
          goToStep('products')
        }}>
          Nouvelle commande
        </Button>
      </div>
    </div>
  )
  
  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Nouvelle commande</h1>
            <p className="text-muted-foreground mt-1">
              Créez une nouvelle commande pour un client
            </p>
          </div>
          
          {/* Indicateur du panier */}
          {state.step !== 'confirmation' && (
            <div className="flex items-center gap-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg">
                    <ShoppingCart className="w-5 h-5" />
                    <span className="font-medium">{cartCalculations.itemCount} articles</span>
                    <Badge variant="secondary">
                      {cartCalculations.total.toLocaleString()} CFA
                    </Badge>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Panier: {cartCalculations.itemCount} articles</p>
                  <p>Total: {cartCalculations.total.toLocaleString()} CFA</p>
                </TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>
        
        {/* Indicateur d'étapes */}
        {state.step !== 'confirmation' && (
          <StepIndicator currentStep={state.step} steps={steps} />
        )}
        
        {/* Contenu selon l'étape */}
        {state.step === 'products' && <StepProducts />}
        {state.step === 'customer' && <StepCustomer />}
        {state.step === 'delivery' && <StepDelivery />}
        {state.step === 'summary' && <StepSummary />}
        {state.step === 'confirmation' && <StepConfirmation />}
        
        {/* Navigation entre les étapes */}
        {state.step !== 'confirmation' && (
          <div className="flex items-center justify-between pt-6 border-t">
            <div>
              {state.step !== 'products' && (
                <Button
                  variant="outline"
                  onClick={() => {
                    const currentIndex = steps.findIndex(s => s.id === state.step)
                    goToStep(steps[currentIndex - 1].id as any)
                  }}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Précédent
                </Button>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {state.step !== 'summary' ? (
                <Button
                  onClick={() => {
                    const validation = validateStep()
                    if (validation.valid) {
                      const currentIndex = steps.findIndex(s => s.id === state.step)
                      goToStep(steps[currentIndex + 1].id as any)
                    }
                  }}
                >
                  Suivant
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={submitOrder}
                  disabled={state.isSubmitting}
                >
                  {state.isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Traitement...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Confirmer la commande
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        )}
        
        {/* Message d'erreur */}
        {state.error && (
          <div className="fixed bottom-4 right-4 bg-red-100 border border-red-200 text-red-800 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            {state.error}
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}
