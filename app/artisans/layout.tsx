/**
 * Layout pour la section Artisan
 * Route: /artisans/*
 * 
 * Ce layout intègre :
 * - La sidebar ArtisanSidebar
 * - Le contenu des pages enfants
 */

import { ArtisanSidebar } from '@/components/layout/artisan-sidebar'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'

export default function ArtisansLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen w-full">
      {/* Sidebar Artisan */}
      <ArtisanSidebar />
      
      {/* Contenu principal avec inset pour compenser la sidebar */}
      <SidebarInset className="flex-1">
        {children}
      </SidebarInset>
    </div>
  )
}
