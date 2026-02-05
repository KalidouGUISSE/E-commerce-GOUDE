/**
 * useResellerDocumentation Hook - Gestion de la documentation
 * 
 * Ce hook gère :
 * - Articles de documentation
 * - Catégories et tags
 * - Recherche
 * - Table des matières
 */

'use client'

import { useState, useCallback, useMemo } from 'react'

// Types pour les articles
export interface DocumentationArticle {
  id: string
  title: string
  slug: string
  category: string
  content: string
  excerpt: string
  tags: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  author: string
  createdAt: string
  updatedAt: string
  views: number
  lastUpdated: string
}

export interface DocumentationCategory {
  id: string
  name: string
  slug: string
  icon: string
  description: string
  articleCount: number
}

export interface DocumentationFilters {
  search: string
  category: string
  tag: string
  difficulty: string
}

// Catégories de documentation
const CATEGORIES: DocumentationCategory[] = [
  { id: 'getting-started', name: 'Guide de démarrage', slug: 'getting-started', icon: 'Rocket', description: 'Premiers pas sur la plateforme', articleCount: 5 },
  { id: 'orders', name: 'Gestion des commandes', slug: 'orders', icon: 'ShoppingCart', description: 'Tout sur les commandes', articleCount: 8 },
  { id: 'billing', name: 'Facturation', slug: 'billing', icon: 'CreditCard', description: 'Paiements et factures', articleCount: 6 },
  { id: 'api', name: 'API & Intégrations', slug: 'api', icon: 'Code', description: 'Documentation technique', articleCount: 12 },
  { id: 'faq', name: 'FAQ', slug: 'faq', icon: 'HelpCircle', description: 'Questions fréquentes', articleCount: 15 },
]

// Articles mockés
const ARTICLES: DocumentationArticle[] = [
  {
    id: '1',
    title: 'Guide de démarrage rapide',
    slug: 'guide-demarrage-rapide',
    category: 'getting-started',
    content: `# Guide de démarrage rapide\n\nBienvenue sur la plateforme Pagne Tissé Distribution...\n\n## Création de compte\n\nPour commencer, vous devez...\n\n## Configuration du profil\n\nEnsuite, configurez votre...`,
    excerpt: 'Apprenez à créer votre compte et configurer votre profil revendeur en quelques minutes.',
    tags: ['débutant', 'compte', 'configuration'],
    difficulty: 'beginner',
    author: 'Équipe Support',
    createdAt: '2024-01-01T10:00:00Z',
    updatedAt: '2024-02-01T14:30:00Z',
    views: 1250,
    lastUpdated: '2024-02-01',
  },
  {
    id: '2',
    title: 'Gestion des commandes',
    slug: 'gestion-commandes',
    category: 'orders',
    content: `# Gestion des commandes\n\nCe guide couvre...\n\n## Validation des commandes\n\n## Suivi des livraisons`,
    excerpt: 'Apprenez à valider, suivre et gérer les commandes de vos clients.',
    tags: ['commandes', 'livraison', 'suivi'],
    difficulty: 'intermediate',
    author: 'Équipe Support',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-02-10T09:00:00Z',
    views: 890,
    lastUpdated: '2024-02-10',
  },
  {
    id: '3',
    title: 'API de gestion des produits',
    slug: 'api-produits',
    category: 'api',
    content: `# API de gestion des produits\n\n## Endpoints disponibles\n\n### GET /products\n\nRécupérer la liste des produits...`,
    excerpt: 'Documentation complète de l\'API pour gérer vos produits programmatiquement.',
    tags: ['api', 'produits', 'développement'],
    difficulty: 'advanced',
    author: 'Équipe Technique',
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-02-15T16:45:00Z',
    views: 456,
    lastUpdated: '2024-02-15',
  },
  {
    id: '4',
    title: 'Questions fréquentes sur la facturation',
    slug: 'faq-facturation',
    category: 'faq',
    content: `# Questions fréquentes sur la facturation\n\n## Comment obtenir une facture ?\n\nPour obtenir votre facture...`,
    excerpt: 'Trouvez les réponses aux questions les plus fréquentes sur la facturation.',
    tags: ['faq', 'facturation', 'paiement'],
    difficulty: 'beginner',
    author: 'Équipe Support',
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-02-05T11:20:00Z',
    views: 2100,
    lastUpdated: '2024-02-05',
  },
  {
    id: '5',
    title: 'Intégration avec Shopify',
    slug: 'integration-shopify',
    category: 'api',
    content: `# Intégration avec Shopify\n\n## Prérequis\n\nPour connecter votre boutique Shopify...`,
    excerpt: 'Guide étape par étape pour intégrer votre boutique Shopify.',
    tags: ['api', 'shopify', 'intégration'],
    difficulty: 'advanced',
    author: 'Équipe Technique',
    createdAt: '2024-01-25T10:00:00Z',
    updatedAt: '2024-02-12T14:00:00Z',
    views: 320,
    lastUpdated: '2024-02-12',
  },
]

// Hook principal
export function useResellerDocumentation() {
  const [filters, setFilters] = useState<DocumentationFilters>({
    search: '',
    category: '',
    tag: '',
    difficulty: '',
  })
  
  const [selectedArticle, setSelectedArticle] = useState<DocumentationArticle | null>(null)
  const [recentSearches, setRecentSearches] = useState<string[]>([])

  // Articles filtrés
  const articles = useMemo(() => {
    let filtered = [...ARTICLES]
    
    // Recherche
    if (filters.search) {
      const search = filters.search.toLowerCase()
      filtered = filtered.filter(article => 
        article.title.toLowerCase().includes(search) ||
        article.content.toLowerCase().includes(search) ||
        article.tags.some(tag => tag.toLowerCase().includes(search))
      )
    }
    
    // Filtre par catégorie
    if (filters.category) {
      filtered = filtered.filter(article => article.category === filters.category)
    }
    
    // Filtre par tag
    if (filters.tag) {
      filtered = filtered.filter(article => article.tags.includes(filters.tag))
    }
    
    // Filtre par difficulté
    if (filters.difficulty) {
      filtered = filtered.filter(article => article.difficulty === filters.difficulty)
    }
    
    return filtered
  }, [filters.search, filters.category, filters.tag, filters.difficulty])

  // Tous les tags
  const allTags = useMemo(() => {
    const tags = new Set<string>()
    ARTICLES.forEach(article => {
      article.tags.forEach(tag => tags.add(tag))
    })
    return Array.from(tags).sort()
  }, [])

  // Articles récents
  const recentArticles = useMemo(() => {
    return [...ARTICLES]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5)
  }, [])

  // Articles populaires
  const popularArticles = useMemo(() => {
    return [...ARTICLES]
      .sort((a, b) => b.views - a.views)
      .slice(0, 5)
  }, [])

  // Catégories avec articles
  const categoriesWithCount = useMemo(() => {
    return CATEGORIES.map(cat => ({
      ...cat,
      articleCount: ARTICLES.filter(a => a.category === cat.id).length,
    }))
  }, [])

  // Mettre à jour les filtres
  const updateFilters = useCallback((updates: Partial<DocumentationFilters>) => {
    setFilters(prev => ({ ...prev, ...updates }))
  }, [])

  // Recherche
  const search = useCallback((query: string) => {
    if (query.trim()) {
      setRecentSearches(prev => [query, ...prev.filter(s => s !== query)].slice(0, 5))
    }
    updateFilters({ search: query })
  }, [updateFilters])

  // Sélectionner un article
  const selectArticle = useCallback((article: DocumentationArticle) => {
    setSelectedArticle(article)
  }, [])

  // Effacer la recherche
  const clearSearch = useCallback(() => {
    updateFilters({ search: '' })
  }, [updateFilters])

  return {
    filters,
    updateFilters,
    search,
    clearSearch,
    articles,
    selectedArticle,
    setSelectedArticle,
    selectArticle,
    categories: categoriesWithCount,
    allTags,
    recentArticles,
    popularArticles,
    recentSearches,
  }
}

export default useResellerDocumentation
