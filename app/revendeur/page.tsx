/**
 * Revendeur Index - Page de redirection
 * 
 * Cette page redirige automatiquement vers le tableau de bord revendeur
 */

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'

export default function ResellerIndexPage() {
  const router = useRouter()
  const { user, isInitialized } = useAuth()

  useEffect(() => {
    if (isInitialized) {
      // Redirect to dashboard
      router.replace('/revendeur/tableau-de-bord')
    }
  }, [isInitialized, router])

  // Show loading while checking auth
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Redirection vers votre espace...</p>
      </div>
    </div>
  )
}
