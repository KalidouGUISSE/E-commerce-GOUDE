/**
 * Reseller Sidebar - Composant de navigation latérale pour les revendeurs
 * 
 * Composant complet avec :
 * - Section utilisateur (nom, avatar, statut, niveau)
 * - Navigation hiérarchique par catégories
 * - Mode compact et mobile
 * - Animations fluides
 * - Notifications dynamiques
 * - Persistance via localStorage
 */

'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  Package,
  User,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Bell,
  Settings,
  LogOut,
  TrendingUp,
  Clock,
  FileText,
  MessageSquare,
  RotateCcw,
  PackagePlus,
  Menu,
  X,
  Circle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'

// Types pour le revendeur
export interface ResellerUser {
  id: string
  name: string
  email: string
  avatar: string
  level: 'bronze' | 'argent' | 'or' | 'platine'
  status: 'active' | 'inactive' | 'pending'
  connectionStatus: 'online' | 'offline' | 'away'
}

// Types pour les notifications
export interface NotificationCount {
  orders: number
  messages: number
  stocks: number
  returns: number
  total: number
}

// Types pour les éléments de menu
export interface MenuItemData {
  id: string
  label: string
  icon: string
  href?: string
  badge?: number
  description?: string
}

export interface MenuCategoryData {
  id: string
  title: string
  icon: string
  items: MenuItemData[]
}

export interface ResellerSidebarState {
  isOpen: boolean
  isMobile: boolean
  isCompact: boolean
  isOpenMobile: boolean
  expandedCategories: string[]
  currentPath: string
}

// État par défaut
const DEFAULT_RESELLER: ResellerUser = {
  id: 'r001',
  name: 'Marie Diop',
  email: 'marie.diop@email.com',
  avatar: '/placeholder-user.jpg',
  level: 'or',
  status: 'active',
  connectionStatus: 'online',
}

const DEFAULT_NOTIFICATIONS: NotificationCount = {
  orders: 5,
  messages: 3,
  stocks: 8,
  returns: 2,
  total: 18,
}

// Hook principal du sidebar revendeur
export function useResellerSidebar() {
  // État de l'utilisateur revendeur
  const [reseller, setReseller] = useState<ResellerUser>(DEFAULT_RESELLER)
  
  // État des notifications
  const [notifications, setNotifications] = useState<NotificationCount>(DEFAULT_NOTIFICATIONS)
  
  // État du sidebar
  const [state, setSidebarState] = useState<ResellerSidebarState>({
    isOpen: true,
    isMobile: false,
    isCompact: false,
    isOpenMobile: false,
    expandedCategories: ['dashboard'],
    currentPath: '/revendeur',
  })

  // Vérifier si mobile
  useEffect(() => {
    const checkMobile = () => {
      setSidebarState(prev => ({ ...prev, isMobile: window.innerWidth < 1024 }))
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Persistance de l'état du sidebar
  useEffect(() => {
    const savedState = localStorage.getItem('resellerSidebarState')
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState)
        setSidebarState(prev => ({
          ...prev,
          isOpen: parsed.isOpen ?? true,
          isCompact: parsed.isCompact ?? false,
        }))
      } catch {
        // Erreur de parsing, on garde l'état par défaut
      }
    }
  }, [])

  // Sauvegarder l'état quand il change
  useEffect(() => {
    localStorage.setItem('resellerSidebarState', JSON.stringify({
      isOpen: state.isOpen,
      isCompact: state.isCompact,
    }))
  }, [state.isOpen, state.isCompact])

  // Toggle du sidebar
  const toggleSidebar = useCallback(() => {
    setSidebarState(prev => ({ ...prev, isOpen: !prev.isOpen }))
  }, [])

  // Toggle du mode compact
  const toggleCompact = useCallback(() => {
    setSidebarState(prev => ({ ...prev, isCompact: !prev.isCompact }))
  }, [])

  // Toggle d'une catégorie
  const toggleCategory = useCallback((categoryId: string) => {
    setSidebarState(prev => ({
      ...prev,
      expandedCategories: prev.expandedCategories.includes(categoryId)
        ? prev.expandedCategories.filter(id => id !== categoryId)
        : [...prev.expandedCategories, categoryId],
    }))
  }, [])

  // Toggle du mobile
  const toggleMobile = useCallback((open?: boolean) => {
    setSidebarState(prev => ({ 
      ...prev, 
      isOpenMobile: open ?? !prev.isOpenMobile 
    }))
  }, [])

  // Mettre à jour le chemin actuel
  const setCurrentPath = useCallback((path: string) => {
    setSidebarState(prev => ({ ...prev, currentPath: path }))
  }, [])

  // Mettre à jour les notifications
  const updateNotifications = useCallback((update: Partial<NotificationCount>) => {
    setNotifications(prev => ({
      ...prev,
      ...update,
      total: Object.values({ ...prev, ...update }).reduce(
        (sum, val) => typeof val === 'number' ? sum + val : sum, 
        0
      ),
    }))
  }, [])

  // Calculer le niveau de résidence
  const levelInfo = React.useMemo(() => ({
    bronze: { color: 'text-orange-700', bg: 'bg-orange-100', label: 'Bronze' },
    argent: { color: 'text-gray-600', bg: 'bg-gray-200', label: 'Argent' },
    or: { color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Or' },
    platine: { color: 'text-purple-600', bg: 'bg-purple-100', label: 'Platine' },
  }[reseller.level]), [reseller.level])

  return {
    reseller,
    setReseller,
    notifications,
    setNotifications,
    state,
    toggleSidebar,
    toggleCompact,
    toggleCategory,
    toggleMobile,
    setCurrentPath,
    updateNotifications,
    levelInfo,
  }
}

// Données du menu revendeur
const MENU_CATEGORIES: MenuCategoryData[] = [
  {
    id: 'dashboard',
    title: 'Tableau de bord',
    icon: 'LayoutDashboard',
    items: [
      {
        id: 'overview',
        label: 'Vue d\'ensemble',
        icon: 'TrendingUp',
        href: '/revendeur/tableau-de-bord',
        badge: 0,
        description: 'Statistiques principales',
      },
      {
        id: 'activity',
        label: 'Activité récente',
        icon: 'Clock',
        href: '/revendeur/activite',
        badge: 0,
        description: 'Historique des actions',
      },
    ],
  },
  {
    id: 'customers',
    title: 'Gestion des clients',
    icon: 'Users',
    items: [
      {
        id: 'customers-list',
        label: 'Liste des clients',
        icon: 'Users',
        href: '/revendeur/clients',
        badge: 0,
        description: 'Gérer vos clients',
      },
      {
        id: 'customers-add',
        label: 'Ajouter un client',
        icon: 'User',
        href: '/revendeur/clients/ajouter',
        badge: 0,
        description: 'Nouveau client',
      },
    ],
  },
  {
    id: 'orders',
    title: 'Gestion des commandes',
    icon: 'ShoppingCart',
    items: [
      {
        id: 'orders-list',
        label: 'Toutes les commandes',
        icon: 'ShoppingCart',
        href: '/revendeur/commandes',
        badge: 5,
        description: 'Suivi des commandes',
      },
      {
        id: 'orders-pending',
        label: 'En attente',
        icon: 'Clock',
        href: '/revendeur/commandes/en-attente',
        badge: 3,
        description: 'Commandes en cours',
      },
      {
        id: 'orders-history',
        label: 'Historique',
        icon: 'FileText',
        href: '/revendeur/commandes/historique',
        badge: 0,
        description: 'Historique complet',
      },
      {
        id: 'orders-invoices',
        label: 'Factures',
        icon: 'FileText',
        href: '/revendeur/factures',
        badge: 2,
        description: 'Documents financiers',
      },
    ],
  },
  {
    id: 'products',
    title: 'Gestion des produits',
    icon: 'Package',
    items: [
      {
        id: 'products-catalog',
        label: 'Catalogue',
        icon: 'Package',
        href: '/revendeur/produits',
        badge: 0,
        description: 'Produits disponibles',
      },
      {
        id: 'products-stocks',
        label: 'Gestion des stocks',
        icon: 'PackagePlus',
        href: '/revendeur/stocks',
        badge: 8,
        description: 'Alertes stock',
      },
      {
        id: 'products-prices',
        label: 'Mes tarifs',
        icon: 'TrendingUp',
        href: '/revendeur/tarifs',
        badge: 0,
        description: 'Prix personnalisés',
      },
    ],
  },
  {
    id: 'account',
    title: 'Mon compte',
    icon: 'User',
    items: [
      {
        id: 'account-profile',
        label: 'Informations',
        icon: 'User',
        href: '/revendeur/compte',
        badge: 0,
        description: 'Profil revendeur',
      },
      {
        id: 'account-security',
        label: 'Sécurité',
        icon: 'Settings',
        href: '/revendeur/compte/securite',
        badge: 0,
        description: 'Mot de passe, 2FA',
      },
      {
        id: 'account-preferences',
        label: 'Préférences',
        icon: 'Settings',
        href: '/revendeur/compte/preferences',
        badge: 0,
        description: 'Paramètres',
      },
    ],
  },
  {
    id: 'support',
    title: 'Support et aide',
    icon: 'HelpCircle',
    items: [
      {
        id: 'support-docs',
        label: 'Documentation',
        icon: 'FileText',
        href: '/revendeur/documentation',
        badge: 0,
        description: 'Guides et tutoriels',
      },
      {
        id: 'support-tickets',
        label: 'Mes tickets',
        icon: 'MessageSquare',
        href: '/revendeur/tickets',
        badge: 3,
        description: 'Support technique',
      },
      {
        id: 'support-returns',
        label: 'Retours',
        icon: 'RotateCcw',
        href: '/revendeur/retours',
        badge: 2,
        description: 'Demandes de retour',
      },
      {
        id: 'support-contact',
        label: 'Nous contacter',
        icon: 'HelpCircle',
        href: '/revendeur/contact',
        badge: 0,
        description: 'Équipe support',
      },
    ],
  },
]

// Mapping des icônes
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Users,
  ShoppingCart,
  Package,
  User,
  HelpCircle,
  TrendingUp,
  Clock,
  FileText,
  MessageSquare,
  RotateCcw,
  PackagePlus,
  Settings,
  Bell,
}

// Composant Badge de notification
function NotificationBadge({ count }: { count: number }) {
  if (count <= 0) return null
  
  return (
    <Badge 
      variant="destructive" 
      className="h-5 min-w-5 text-xs px-1.5 rounded-full"
    >
      {count > 99 ? '99+' : count}
    </Badge>
  )
}

// Composant élément de menu
interface MenuItemProps {
  item: MenuItemData
  isActive: boolean
  isCompact: boolean
  onClick?: () => void
}

function MenuItem({ item, isActive, isCompact, onClick }: MenuItemProps) {
  const Icon = ICON_MAP[item.icon] || Package
  
  if (isCompact) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <Link
            href={item.href || '#'}
            onClick={onClick}
            className={cn(
              'flex items-center justify-center w-full h-12 rounded-lg transition-all duration-200',
              'hover:bg-accent hover:text-accent-foreground',
              isActive && 'bg-primary/10 text-primary',
            )}
          >
            <div className="relative">
              <Icon className="h-5 w-5" />
              {item.badge && item.badge > 0 && (
                <span className="absolute -top-1.5 -right-1.5 h-4 min-w-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center px-1">
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              )}
            </div>
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right">
          {item.label}
          {item.badge && item.badge > 0 && ` (${item.badge})`}
        </TooltipContent>
      </Tooltip>
    )
  }
  
  return (
    <Link
      href={item.href || '#'}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
        'hover:bg-accent hover:text-accent-foreground group',
        isActive && 'bg-primary/10 text-primary font-medium',
      )}
    >
      <Icon className="h-5 w-5 shrink-0" />
      <span className="flex-1 truncate">{item.label}</span>
      {item.badge && item.badge > 0 && (
        <NotificationBadge count={item.badge} />
      )}
    </Link>
  )
}

// Composant catégorie de menu
interface MenuCategoryProps {
  category: MenuCategoryData
  isExpanded: boolean
  isCompact: boolean
  onToggle: () => void
  currentPath: string
}

function MenuCategory({ 
  category, 
  isExpanded, 
  isCompact, 
  onToggle,
  currentPath,
}: MenuCategoryProps) {
  const Icon = ICON_MAP[category.icon] || Package
  const hasActiveItems = category.items.some(
    item => item.href && currentPath.startsWith(item.href)
  )
  
  if (isCompact) {
    return (
      <div className="flex flex-col items-center py-2">
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <Link
              href={category.items[0]?.href || '#'}
              className={cn(
                'flex items-center justify-center w-full h-10 rounded-lg transition-all duration-200',
                'hover:bg-accent',
                hasActiveItems && 'bg-primary/10 text-primary',
              )}
            >
              <Icon className="h-5 w-5" />
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">
            {category.title}
          </TooltipContent>
        </Tooltip>
      </div>
    )
  }
  
  return (
    <div className="mb-2">
      <button
        onClick={onToggle}
        className={cn(
          'flex items-center justify-between w-full px-3 py-2 rounded-lg',
          'text-sm font-medium text-muted-foreground',
          'hover:bg-accent hover:text-accent-foreground transition-all duration-200',
        )}
      >
        <div className="flex items-center gap-3">
          <Icon className="h-4 w-4" />
          <span>{category.title}</span>
        </div>
        <ChevronRight
          className={cn(
            'h-4 w-4 transition-transform duration-200',
            isExpanded && 'rotate-90'
          )}
        />
      </button>
      
      <div
        className={cn(
          'overflow-hidden transition-all duration-200 ease-in-out',
          isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0',
        )}
      >
        <div className="mt-1 space-y-0.5 pl-7">
          {category.items.map((item) => (
            <MenuItem
              key={item.id}
              item={item}
              isActive={currentPath === item.href}
              isCompact={false}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// Section utilisateur du sidebar
interface UserSectionProps {
  reseller: ResellerUser
  levelInfo: { color: string; bg: string; label: string }
  isCompact: boolean
  isOpen: boolean
}

function UserSection({ reseller, levelInfo, isCompact, isOpen }: UserSectionProps) {
  if (isCompact) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <Link
            href="/revendeur/compte"
            className="flex items-center justify-center py-4"
          >
            <div className="relative">
              <Avatar className="h-9 w-9">
                <AvatarImage src={reseller.avatar} alt={reseller.name} />
                <AvatarFallback>
                  {reseller.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div 
                className={cn(
                  'absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background',
                  reseller.connectionStatus === 'online' && 'bg-green-500',
                  reseller.connectionStatus === 'away' && 'bg-yellow-500',
                  reseller.connectionStatus === 'offline' && 'bg-gray-400',
                )}
              />
            </div>
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right">
          <div className="text-right">
            <p className="font-medium">{reseller.name}</p>
            <p className="text-xs text-muted-foreground">{levelInfo.label}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    )
  }
  
  if (!isOpen) return null
  
  return (
    <div className="p-4 border-b">
      <Link
        href="/revendeur/compte"
        className="flex items-center gap-3 hover:opacity-80 transition-opacity"
      >
        <div className="relative">
          <Avatar className="h-10 w-10">
            <AvatarImage src={reseller.avatar} alt={reseller.name} />
            <AvatarFallback>
              {reseller.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div 
            className={cn(
              'absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background',
              reseller.connectionStatus === 'online' && 'bg-green-500',
              reseller.connectionStatus === 'away' && 'bg-yellow-500',
              reseller.connectionStatus === 'offline' && 'bg-gray-400',
            )}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{reseller.name}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Badge variant="secondary" className={cn('text-xs', levelInfo.bg, levelInfo.color)}>
              {levelInfo.label}
            </Badge>
          </div>
        </div>
      </Link>
    </div>
  )
}

// Indicateur de version
function VersionIndicator() {
  const [hasUpdate, setHasUpdate] = useState(false)
  
  useEffect(() => {
    // Simuler une vérification de version
    setHasUpdate(false) // Mettre à false en production
  }, [])
  
  if (!hasUpdate) return null
  
  return (
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>
        <div className="absolute bottom-2 right-2">
          <Badge variant="outline" className="text-xs cursor-help">
            v2.0
          </Badge>
        </div>
      </TooltipTrigger>
      <TooltipContent side="right">
        Nouvelle version disponible !
      </TooltipContent>
    </Tooltip>
  )
}

// Composant principal du sidebar revendeur
interface ResellerSidebarProps {
  className?: string
}

export function ResellerSidebar({ className }: ResellerSidebarProps) {
  const pathname = usePathname()
  const {
    reseller,
    notifications,
    state,
    toggleSidebar,
    toggleCompact,
    toggleCategory,
    toggleMobile,
    levelInfo,
  } = useResellerSidebar()
  
  const { isOpen, isMobile, isCompact, isOpenMobile, expandedCategories, currentPath } = state
  
  // Calculer le total des notifications
  const totalNotifications = notifications.orders + notifications.messages + 
                            notifications.stocks + notifications.returns
  
  // SIDEBAR PRINCIPAL
  const SidebarContent = () => (
    <div className={cn(
      'flex flex-col h-full bg-background border-r transition-all duration-200',
      isCompact ? 'w-16' : 'w-64',
      className,
    )}>
      {/* Header */}
      <div className={cn(
        'flex items-center gap-2 p-4 border-b',
        isCompact ? 'justify-center' : 'justify-between'
      )}>
        {!isCompact && (
          <Link href="/revendeur" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Package className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-semibold">Pagne Tissé</span>
          </Link>
        )}
        
        {isCompact && (
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <Package className="h-5 w-5 text-primary-foreground" />
          </div>
        )}
      </div>
      
      {/* Section Utilisateur */}
      <UserSection 
        reseller={reseller}
        levelInfo={levelInfo}
        isCompact={isCompact}
        isOpen={isOpen}
      />
      
      {/* Actions rapides */}
      {isOpen && !isCompact && (
        <div className="p-3 border-b">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="flex-1" asChild>
              <Link href="/revendeur/commandes/nouvelle">
                <ShoppingCart className="h-4 w-4 mr-1" />
                Nouvelle commande
              </Link>
            </Button>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" className="shrink-0 relative">
                  <Bell className="h-4 w-4" />
                  {totalNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
                      {totalNotifications > 9 ? '9+' : totalNotifications}
                    </span>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                Notifications ({totalNotifications})
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      )}
      
      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-2">
        {isCompact ? (
          // Mode compact : afficher toutes les icônes directement
          <div className="space-y-1 px-1">
            {MENU_CATEGORIES.map((category) => (
              <MenuCategory
                key={category.id}
                category={category}
                isExpanded={expandedCategories.includes(category.id)}
                isCompact={true}
                onToggle={() => toggleCategory(category.id)}
                currentPath={currentPath}
              />
            ))}
          </div>
        ) : (
          // Mode étendu : catégories avec accordéon
          <div className="space-y-1 px-2">
            {MENU_CATEGORIES.map((category) => (
              <MenuCategory
                key={category.id}
                category={category}
                isExpanded={expandedCategories.includes(category.id)}
                isCompact={false}
                onToggle={() => toggleCategory(category.id)}
                currentPath={currentPath}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className={cn(
        'p-2 border-t',
        isCompact ? 'flex flex-col' : ''
      )}>
        {isCompact ? (
          <>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="w-full h-10" asChild>
                  <Link href="/revendeur/compte/preferences">
                    <Settings className="h-5 w-5" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Paramètres</TooltipContent>
            </Tooltip>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="w-full h-10 text-red-500 hover:text-red-600 hover:bg-red-50">
                  <LogOut className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Déconnexion</TooltipContent>
            </Tooltip>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="flex-1 justify-start" asChild>
              <Link href="/revendeur/compte/preferences">
                <Settings className="h-4 w-4 mr-2" />
                Paramètres
              </Link>
            </Button>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={toggleCompact}
                  className="shrink-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                Réduire le menu
              </TooltipContent>
            </Tooltip>
          </div>
        )}
      </div>
      
      <VersionIndicator />
    </div>
  )
  
  // Rendu mobile : Sheet (drawer)
  if (isMobile) {
    return (
      <>
        {/* Bouton hamburger pour mobile */}
        <Button
          variant="outline"
          size="icon"
          className="fixed top-4 left-4 z-50 lg:hidden"
          onClick={() => toggleMobile(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        {/* Sheet mobile */}
        <Sheet open={isOpenMobile} onOpenChange={toggleMobile}>
          <SheetContent side="left" className="w-72 p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Menu revendeur</SheetTitle>
              <SheetDescription>Navigation principale du revendeur</SheetDescription>
            </SheetHeader>
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </>
    )
  }
  
  // Rendu desktop
  return <SidebarContent />
}

// Indicateur de statut de connexion
export function ConnectionStatus({ status }: { status: ResellerUser['connectionStatus'] }) {
  const statusConfig = {
    online: { color: 'bg-green-500', label: 'En ligne' },
    away: { color: 'bg-yellow-500', label: 'Absent' },
    offline: { color: 'bg-gray-400', label: 'Hors ligne' },
  }
  
  const config = statusConfig[status]
  
  return (
    <div className="flex items-center gap-1.5">
      <div className={cn('h-2 w-2 rounded-full', config.color)} />
      <span className="text-xs text-muted-foreground">{config.label}</span>
    </div>
  )
}

export default ResellerSidebar
