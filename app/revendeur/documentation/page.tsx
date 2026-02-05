/**
 * Page de documentation
 * Route: /revendeur/documentation
 * 
 * Fonctionnalités:
 * - Navigation par catégories
 * - Barre de recherche
 * - Table des matières interactive
 * - Articles formatés
 * - Tags et niveau de difficulté
 */

'use client'

import { useState, useEffect } from 'react'
import { 
  Search, 
  BookOpen, 
  ChevronRight, 
  Clock, 
  Eye, 
  Tag,
  ArrowLeft,
  FileText,
  Calendar,
  Loader2
} from 'lucide-react'
import { useResellerDocumentation, DocumentationArticle, DocumentationCategory } from '@/hooks/use-reseller-documentation'
import { formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'

// Icônes pour les catégories
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Rocket: <BookOpen className="w-5 h-5" />,
  ShoppingCart: <BookOpen className="w-5 h-5" />,
  CreditCard: <BookOpen className="w-5 h-5" />,
  Code: <BookOpen className="w-5 h-5" />,
  HelpCircle: <BookOpen className="w-5 h-5" />,
}

export default function ResellerDocumentationPage() {
  const {
    filters,
    updateFilters,
    search,
    clearSearch,
    articles,
    selectedArticle,
    setSelectedArticle,
    selectArticle,
    categories,
    allTags,
    recentArticles,
    popularArticles,
    recentSearches,
  } = useResellerDocumentation()

  const [localSearch, setLocalSearch] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSearch = (value: string) => {
    setLocalSearch(value)
    if (value.length >= 2) {
      setIsLoading(true)
      search(value)
      setTimeout(() => setIsLoading(false), 300)
    } else if (value.length === 0) {
      clearSearch()
    }
  }

  const handleCategoryClick = (categoryId: string) => {
    updateFilters({ category: filters.category === categoryId ? '' : categoryId })
  }

  const handleTagClick = (tag: string) => {
    updateFilters({ tag: filters.tag === tag ? '' : tag })
  }

  const handleArticleClick = (article: DocumentationArticle) => {
    selectArticle(article)
  }

  const handleBack = () => {
    setSelectedArticle(null)
  }

  const getDifficultyBadge = (difficulty: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'outline'> = {
      beginner: 'default',
      intermediate: 'secondary',
      advanced: 'outline',
    }
    const labels: Record<string, string> = {
      beginner: 'Débutant',
      intermediate: 'Intermédiaire',
      advanced: 'Avancé',
    }
    return (
      <Badge variant={variants[difficulty] || 'outline'} className="text-xs">
        {labels[difficulty] || difficulty}
      </Badge>
    )
  }

  // Extraire la table des matières d'un article
  const getTableOfContents = (content: string) => {
    const headings = content.match(/^#{1,3}\s+.+$/gm) || []
    return headings.map(h => {
      const level = h.match(/^#+/)?.[0].length || 1
      const title = h.replace(/^#+\s+/, '')
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      return { level, title, slug }
    })
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Contenu principal */}
        <div className="flex-1">
          {selectedArticle ? (
            /* Article détaillé */
            <div className="space-y-4">
              <Button variant="ghost" onClick={handleBack} className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour à la documentation
              </Button>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{selectedArticle.category}</Badge>
                  {getDifficultyBadge(selectedArticle.difficulty)}
                </div>
                <h1 className="text-3xl font-bold">{selectedArticle.title}</h1>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Mis à jour le {formatDate(selectedArticle.lastUpdated)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {selectedArticle.views} vues
                  </span>
                </div>
              </div>

              <Separator />

              {/* Contenu de l'article */}
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap">
                  {selectedArticle.content}
                </div>
              </div>

              <Separator />

              {/* Tags */}
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-muted-foreground" />
                {selectedArticle.tags.map(tag => (
                  <Badge 
                    key={tag} 
                    variant="outline" 
                    className="cursor-pointer hover:bg-muted"
                    onClick={() => handleTagClick(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          ) : (
            /* Liste des articles */
            <div className="space-y-6">
              {/* Barre de recherche */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher dans la documentation..."
                  value={localSearch}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
                {isLoading && (
                  <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin" />
                )}
              </div>

              {/* Recherches récentes */}
              {!filters.search && recentSearches.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Recherches récentes</h3>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((search, idx) => (
                      <Badge 
                        key={idx} 
                        variant="outline" 
                        className="cursor-pointer hover:bg-muted"
                        onClick={() => handleSearch(search)}
                      >
                        {search}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Résultats de recherche */}
              {filters.search ? (
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    {articles.length} résultat(s) pour "{filters.search}"
                  </div>
                  <div className="grid gap-4">
                    {articles.map(article => (
                      <Card 
                        key={article.id} 
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => handleArticleClick(article)}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{article.title}</CardTitle>
                            {getDifficultyBadge(article.difficulty)}
                          </div>
                          <CardDescription>{article.excerpt}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-2">
                            <Tag className="w-4 h-4 text-muted-foreground" />
                            {article.tags.slice(0, 3).map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                /* Catégories */
                <div className="space-y-6">
                  {categories.map(category => (
                    <div key={category.id} className="space-y-4">
                      <div 
                        className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-2 rounded-lg"
                        onClick={() => handleCategoryClick(category.id)}
                      >
                        {CATEGORY_ICONS[category.icon] || <BookOpen className="w-5 h-5" />}
                        <h2 className="text-xl font-semibold">{category.name}</h2>
                        <Badge variant="outline">{category.articleCount}</Badge>
                        <ChevronRight className={`ml-auto h-4 w-4 transition-transform ${
                          filters.category === category.id ? 'rotate-90' : ''
                        }`} />
                      </div>
                      
                      {(filters.category === '' || filters.category === category.id) && (
                        <div className="grid gap-3 pl-9">
                          {articles.filter(a => a.category === category.id).map(article => (
                            <div 
                              key={article.id}
                              className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                              onClick={() => handleArticleClick(article)}
                            >
                              <FileText className="w-5 h-5 text-muted-foreground mt-0.5" />
                              <div className="flex-1">
                                <div className="font-medium">{article.title}</div>
                                <div className="text-sm text-muted-foreground line-clamp-1">
                                  {article.excerpt}
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  {getDifficultyBadge(article.difficulty)}
                                  <span className="text-xs text-muted-foreground">
                                    Mis à jour le {formatDate(article.lastUpdated)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-80">
          <ScrollArea className="h-[calc(100vh-8rem)]">
            <div className="space-y-6">
              {/* Catégories */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Catégories</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {categories.map(category => (
                    <div 
                      key={category.id}
                      className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                        filters.category === category.id ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                      }`}
                      onClick={() => handleCategoryClick(category.id)}
                    >
                      {CATEGORY_ICONS[category.icon] || <BookOpen className="w-4 h-4" />}
                      <span className="flex-1 text-sm">{category.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {category.articleCount}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Difficulté */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Niveau</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {['beginner', 'intermediate', 'advanced'].map(difficulty => (
                    <div 
                      key={difficulty}
                      className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                        filters.difficulty === difficulty ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                      }`}
                      onClick={() => updateFilters({ 
                        difficulty: filters.difficulty === difficulty ? '' : difficulty 
                      })}
                    >
                      {getDifficultyBadge(difficulty)}
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Articles populaires */}
              {!selectedArticle && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Articles populaires</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {popularArticles.map(article => (
                      <div 
                        key={article.id}
                        className="flex items-start gap-2 p-2 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                        onClick={() => handleArticleClick(article)}
                      >
                        <Eye className="w-4 h-4 text-muted-foreground mt-0.5" />
                        <div>
                          <div className="text-sm font-medium line-clamp-1">{article.title}</div>
                          <div className="text-xs text-muted-foreground">{article.views} vues</div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Tags populaires */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Tags populaires</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {allTags.map(tag => (
                      <Badge 
                        key={tag} 
                        variant={filters.tag === tag ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => handleTagClick(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Dernières mises à jour */}
              {!selectedArticle && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Dernières mises à jour</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {recentArticles.map(article => (
                      <div 
                        key={article.id}
                        className="flex items-start gap-2 p-2 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                        onClick={() => handleArticleClick(article)}
                      >
                        <Clock className="w-4 h-4 text-muted-foreground mt-0.5" />
                        <div>
                          <div className="text-sm font-medium line-clamp-1">{article.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatDate(article.lastUpdated)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}
