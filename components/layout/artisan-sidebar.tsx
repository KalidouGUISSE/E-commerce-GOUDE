/**
 * Artisan Sidebar - Composant de navigation latérale pour les artisans
 * 
 * Composant complet avec :
 * - Section utilisateur (nom, avatar, spécialisation, certification)
 * - Navigation hiérarchique par catégories spécifiques aux artisans
 * - Mode compact et mobile
 * - Animations fluides avec React.memo
 * - Notifications dynamiques
 * - Persistance via localStorage
 * - Accessibilité ARIA
 */

'use client'

import React, { useState, useEffect, useCallback, memo } from 'react'
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
  Award,
  Star,
  CheckCircle,
  DollarSign,
  ShoppingBag,
  BarChart3,
  Mail,
  Phone,
  MapPin,
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
import { useArtisanSidebar, ArtisanUser, ArtisanNotificationCount, ArtisanMenuItem, ArtisanMenuCategory } from '@/hooks/use-artisan-sidebar'

// Types pour le composant
interface ArtisanSidebarProps {
  className?: string
}

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
  Award,
  Star,
  CheckCircle,
  DollarSign,
  ShoppingBag,
  BarChart3,
  Mail,
  Phone,
  MapPin,
}

// Données du menu artisan
const ARTISAN_MENU_CATEGORIES: ArtisanMenuCategory[] = [
  {
    id: 'dashboard',
    title: 'Tableau de bord',
    icon: 'LayoutDashboard',
    items: [
      {
        id: 'overview',
        label: 'Vue d\'ensemble',
        icon: 'BarChart3',
        href: '/artisans',
        badge: 0,
        description: 'Statistiques et aperçu',
      },
      {
        id: 'performance',
        label: 'Mes performances',
        icon: 'TrendingUp',
        href: '/artisans/performance',
        badge: 0,
        description: 'Analyses et métriques',
      },
    ],
  },
  {
    id: 'artisans',
    title: 'Mes Artisans',
    icon: 'Users',
    items: [
      {
        id: 'artisans-list',
        label: 'Tous mes artisans',
        icon: 'Users',
        href: '/artisans/liste',
        badge: 0,
        description: 'Gérer mes artisans',
      },
      {
        id: 'artisans-add',
        label: 'Ajouter un artisan',
        icon: 'User',
        href: '/artisans/ajouter',
        badge: 0,
        description: 'Nouveau partenariat',
      },
      {
        id: 'artisans-collaboration',
        label: 'Collaborations',
        icon: 'CheckCircle',
        href: '/artisans/collaborations',
        badge: 0,
        description: 'Suivi des collaborations',
      },
    ],
  },
  {
    id: 'catalog',
    title: 'Catalogue Produits',
    icon: 'ShoppingBag',
    items: [
      {
        id: 'catalog-all',
        label: 'Tous les produits',
        icon: 'Package',
        href: '/artisans/catalogue',
        badge: 0,
        description: 'Produits disponibles',
      },
      {
        id: 'catalog-add',
        label: 'Ajouter un produit',
        icon: 'PackagePlus',
        href: '/artisans/produits/ajouter',
        badge: 0,
        description: 'Nouveau produit',
      },
      {
        id: 'catalog-inventory',
        label: 'Inventaire',
        icon: 'Package',
        href: '/artisans/inventaire',
        badge: 1,
        description: 'Gestion du stock',
      },
    ],
  },
  {
    id: 'orders',
    title: 'Commandes & Devis',
    icon: 'ShoppingCart',
    items: [
      {
        id: 'orders-quotes',
        label: 'Demandes de devis',
        icon: 'FileText',
        href: '/artisans/devis',
        badge: 2,
        description: 'Nouvelles demandes',
      },
      {
        id: 'orders-pending',
        label: 'Commandes en cours',
        icon: 'Clock',
        href: '/artisans/commandes/en-cours',
        badge: 3,
        description: 'Suivi des commandes',
      },
      {
        id: 'orders-completed',
        label: 'Commandes livrées',
        icon: 'CheckCircle',
        href: '/artisans/commandes/livrees',
        badge: 0,
        description: 'Historique',
      },
      {
        id: 'orders-payments',
        label: 'Paiements',
        icon: 'DollarSign',
        href: '/artisans/paiements',
        badge: 0,
        description: 'Suivi des règlements',
      },
    ],
  },
  {
    id: 'communication',
    title: 'Communication',
    icon: 'MessageSquare',
    items: [
      {
        id: 'comm-messages',
        label: 'Messages',
        icon: 'MessageSquare',
        href: '/artisans/messages',
        badge: 5,
        description: 'Boîte de réception',
      },
      {
        id: 'comm-notifications',
        label: 'Notifications',
        icon: 'Bell',
        href: '/artisans/notifications',
        badge: 11,
        description: 'Alertes et mises à jour',
      },
      {
        id: 'comm-reviews',
        label: 'Avis clients',
        icon: 'Star',
        href: '/artisans/avis',
        badge: 0,
        description: 'Évaluations et retours',
      },
    ],
  },
  {
    id: 'account',
    title: 'Mon Compte',
    icon: 'User',
    items: [
      {
        id: 'account-profile',
        label: 'Mon profil',
        icon: 'User',
        href: '/artisans/profil',
        badge: 0,
        description: 'Informations personnelles',
      },
      {
        id: 'account-earnings',
        label: 'Mes revenus',
        icon: 'DollarSign',
        href: '/artisans/revenus',
        badge: 0,
        description: 'Statistiques financières',
      },
      {
        id: 'account-settings',
        label: 'Paramètres',
        icon: 'Settings',
        href: '/artisans/parametres',
        badge: 0,
        description: 'Configuration',
      },
    ],
  },
  {
    id: 'support',
    title: 'Support',
    icon: 'HelpCircle',
    items: [
      {
        id: 'support-docs',
        label: 'Documentation',
        icon: 'FileText',
        href: '/artisans/aide',
        badge: 0,
        description: 'Guides et tutoriels',
      },
      {
        id: 'support-contact',
        label: 'Nous contacter',
        icon: 'HelpCircle',
        href: '/artisans/contact',
        badge: 0,
        description: 'Équipe support',
      },
    ],
  },
]

// Badge de notification optimisé avec React.memo
const NotificationBadge = memo(function NotificationBadge({ count }: { count: number }) {
  if (count <= 0) return null
  
  return (
    <Badge 
      variant="destructive" 
      className="h-5 min-w-5 text-xs px-1.5 rounded-full"
    >
      {count > 99 ? '99+' : count}
    </Badge>
  )
})

// Élément de menu optimisé avec React.memo
const MenuItem = memo(function MenuItem({ 
  item, 
  isActive, 
  isCompact 
}: { 
  item: ArtisanMenuItem
  isActive: boolean
  isCompact: boolean
}) {
  const Icon = ICON_MAP[item.icon] || Package
  
  if (isCompact) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <Link
            href={item.href || '#'}
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
})

// Catégorie de menu optimisée avec React.memo
const MenuCategory = memo(function MenuCategory({ 
  category, 
  isExpanded, 
  isCompact, 
  onToggle,
  currentPath,
}: { 
  category: ArtisanMenuCategory
  isExpanded: boolean
  isCompact: boolean
  onToggle: () => void
  currentPath: string
}) {
  const Icon = ICON_MAP[category.icon] || Users
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
          isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0',
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
})

// Section utilisateur optimisée avec React.memo
const UserSection = memo(function UserSection({ 
  artisan, 
  certificationInfo, 
  isCompact, 
  isOpen 
}: { 
  artisan: ArtisanUser
  certificationInfo: { color: string; bg: string; label: string }
  isCompact: boolean
  isOpen: boolean
}) {
  const CertificationIcon = ICON_MAP[certificationInfo.icon] || Award
  
  if (isCompact) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <Link
            href="/artisans/profil"
            className="flex items-center justify-center py-4"
          >
            <div className="relative">
              <Avatar className="h-9 w-9">
                <AvatarImage src={artisan.avatar} alt={artisan.name} />
                <AvatarFallback>
                  {artisan.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div 
                className={cn(
                  'absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background',
                  artisan.connectionStatus === 'online' && 'bg-green-500',
                  artisan.connectionStatus === 'away' && 'bg-yellow-500',
                  artisan.connectionStatus === 'offline' && 'bg-gray-400',
                )}
              />
            </div>
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right">
          <div className="text-right">
            <p className="font-medium">{artisan.name}</p>
            <p className="text-xs text-muted-foreground">{certificationInfo.label}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    )
  }
  
  if (!isOpen) return null
  
  return (
    <div className="p-4 border-b">
      <Link
        href="/artisans/profil"
        className="flex items-center gap-3 hover:opacity-80 transition-opacity"
      >
        <div className="relative">
          <Avatar className="h-10 w-10">
            <AvatarImage src={artisan.avatar} alt={artisan.name} />
            <AvatarFallback>
              {artisan.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div 
            className={cn(
              'absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background',
              artisan.connectionStatus === 'online' && 'bg-green-500',
              artisan.connectionStatus === 'away' && 'bg-yellow-500',
              artisan.connectionStatus === 'offline' && 'bg-gray-400',
            )}
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{artisan.name}</p>
          <p className="text-xs text-muted-foreground truncate">{artisan.specialty}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Badge variant="secondary" className={cn('text-xs', certificationInfo.bg, certificationInfo.color)}>
              <CertificationIcon className="h-3 w-3 mr-1" />
              {certificationInfo.label}
            </Badge>
          </div>
        </div>
      </Link>
    </div>
  )
})

// Indicateur de version
function VersionIndicator() {
  const [hasUpdate, setHasUpdate] = useState(false)
  
  useEffect(() => {
    setHasUpdate(false)
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

// Composant principal du sidebar artisan
export const ArtisanSidebar = memo(function ArtisanSidebar({ className }: ArtisanSidebarProps) {
  const pathname = usePathname()
  const {
    artisan,
    notifications,
    state,
    toggleSidebar,
    toggleCompact,
    toggleCategory,
    toggleMobile,
    certificationInfo,
  } = useArtisanSidebar()
  
  const { isOpen, isMobile, isCompact, isOpenMobile, expandedCategories, currentPath } = state
  
  // Calculer le total des notifications
  const totalNotifications = notifications.messages + notifications.quotes + 
                            notifications.products + notifications.orders
  
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
          <Link href="/artisans" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Award className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-semibold">Pagne Tissé</span>
          </Link>
        )}
        
        {isCompact && (
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <Award className="h-5 w-5 text-primary-foreground" />
          </div>
        )}
      </div>
      
      {/* Section Utilisateur */}
      <UserSection 
        artisan={artisan}
        certificationInfo={certificationInfo}
        isCompact={isCompact}
        isOpen={isOpen}
      />
      
      {/* Actions rapides */}
      {isOpen && !isCompact && (
        <div className="p-3 border-b">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="flex-1" asChild>
              <Link href="/artisans/produits/ajouter">
                <PackagePlus className="h-4 w-4 mr-1" />
                Nouveau produit
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
            {ARTISAN_MENU_CATEGORIES.map((category) => (
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
            {ARTISAN_MENU_CATEGORIES.map((category) => (
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
                  <Link href="/artisans/parametres">
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
              <Link href="/artisans/parametres">
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
              <SheetTitle>Menu artisan</SheetTitle>
              <SheetDescription>Navigation principale de l'artisan</SheetDescription>
            </SheetHeader>
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </>
    )
  }
  
  // Rendu desktop
  return <SidebarContent />
})

// Indicateur de statut de connexion
export function ArtisanConnectionStatus({ status }: { status: ArtisanUser['connectionStatus'] }) {
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

export default ArtisanSidebar
