/**
 * Revendeur Layout - Layout principal pour l'espace revendeur
 * 
 * Ce layout intègre le sidebar revendeur avec toutes les pages
 * de l'espace revendeur.
 */

import { ResellerSidebar } from '@/components/layout/reseller-sidebar'
import { Toaster } from '@/components/ui/sonner'

interface RevendeurLayoutProps {
  children: React.ReactNode
}

export default function RevendeurLayout({ children }: RevendeurLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar revendeur */}
      <ResellerSidebar />
      
      {/* Contenu principal */}
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto py-6 px-4 lg:px-8">
          {children}
        </div>
      </main>
      
      {/* Toaster pour les notifications */}
      <Toaster />
    </div>
  )
}
