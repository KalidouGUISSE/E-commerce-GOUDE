/**
 * Page de gestion des artisans partenaires
 * Route: /artisans
 * 
 * Fonctionnalités:
 * - Dashboard avec statistiques clés
 * - Liste paginée avec tri et filtres avancés
 * - Recherche avec debounce
 * - CRUD complet (ajout, édition, suppression)
 * - Actions en lot (export, suppression multiple)
 * - Système de tags/catégories
 * - Indicateurs visuels du statut de collaboration
 */

'use client'

import { useState } from 'react'
import { 
  Search, 
  Filter, 
  Plus, 
  ChevronLeft,
  ChevronRight,
  Edit,
  Trash2,
  Eye,
  Download,
  Users,
  UserPlus,
  UserMinus,
  Star,
  MapPin,
  Phone,
  Mail,
  Package,
  Calendar,
  Tag,
  X,
  Loader2,
  Check,
  TrendingUp,
  Award,
  Clock
} from 'lucide-react'
import { useArtisans, Artisan, ArtisanFormData } from '@/hooks/use-artisans'
import { formatDate, formatDateTime } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer'

export default function ArtisansPage() {
  const {
    filters,
    updateFilters,
    resetFilters,
    artisans,
    pagination,
    stats,
    selectedArtisans,
    toggleSelection,
    selectAll,
    clearSelection,
    isCreateModalOpen,
    setIsCreateModalOpen,
    isEditModalOpen,
    setIsEditModalOpen,
    isDetailDrawerOpen,
    setIsDetailDrawerOpen,
    selectedArtisan,
    openDetail,
    openEdit,
    isLoading,
    feedback,
    createArtisan,
    updateArtisan,
    deleteArtisan,
    deleteSelectedArtisans,
    bulkExport,
  } = useArtisans()

  const [localSearch, setLocalSearch] = useState('')
  const [newTag, setNewTag] = useState('')
  const [formData, setFormData] = useState<ArtisanFormData>({
    name: '',
    email: '',
    phone: '',
    specialty: '',
    region: '',
    village: '',
    address: '',
    notes: '',
    tags: [],
  })

  // Handlers
  const handleSearch = (value: string) => {
    setLocalSearch(value)
    updateFilters({ search: value, page: 1 })
  }

  const handleCreateArtisan = async () => {
    await createArtisan(formData)
    setFormData({
      name: '',
      email: '',
      phone: '',
      specialty: '',
      region: '',
      village: '',
      address: '',
      notes: '',
      tags: [],
    })
  }

  const handleEditArtisan = async () => {
    if (selectedArtisan) {
      await updateArtisan(selectedArtisan.id, formData)
    }
  }

  const openEditWithData = (artisan: Artisan) => {
    setFormData({
      name: artisan.name,
      email: artisan.email,
      phone: artisan.phone,
      specialty: artisan.specialty,
      region: artisan.region,
      village: artisan.village,
      address: artisan.address,
      notes: artisan.notes,
      tags: artisan.tags,
    })
    openEdit(artisan)
  }

  const addTag = () => {
    if (newTag && !formData.tags.includes(newTag)) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, newTag] }))
      setNewTag('')
    }
  }

  const removeTag = (tag: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }))
  }

  // Badges helpers
  const getStatusBadge = (status: Artisan['status']) => {
    const variants: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
      active: 'default',
      pending: 'secondary',
      inactive: 'outline',
    }
    const labels: Record<string, string> = {
      active: 'Actif',
      pending: 'En attente',
      inactive: 'Inactif',
    }
    return <Badge variant={variants[status]}>{labels[status]}</Badge>
  }

  const getCollaborationBadge = (status: Artisan['collaborationStatus']) => {
    const variants: Record<string, 'default' | 'secondary' | 'outline' | 'destructive' | 'warning'> = {
      new: 'warning',
      active: 'default',
      paused: 'secondary',
      ended: 'destructive',
    }
    const labels: Record<string, string> = {
      new: 'Nouveau',
      active: 'En cours',
      paused: 'En pause',
      ended: 'Terminé',
    }
    return <Badge variant={variants[status] as 'default' | 'secondary' | 'outline' | 'destructive' || 'outline'}>{labels[status]}</Badge>
  }

  const getRatingStars = (rating: number) => {
    if (rating === 0) return <span className="text-muted-foreground text-sm">Non évalué</span>
    return (
      <div className="flex items-center gap-1">
        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        <span className="font-medium">{rating.toFixed(1)}</span>
      </div>
    )
  }

  // Régions pour les filtres
  const regions = ['Casamance', 'Sine-Saloum', 'Dakar', 'Thies', 'Kolda', 'Saint-Louis', 'Fatick', 'Kaolack']

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Feedback Toast */}
      {feedback && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-top-2 ${
          feedback.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          <Check className="w-5 h-5" />
          {feedback.message}
        </div>
      )}

      <div className="container mx-auto py-6 space-y-6">
        {/* En-tête */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Mes Artisans Partenaires</h1>
            <p className="text-muted-foreground">
              Gérez votre réseau d'artisans et suivez vos collaborations
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={bulkExport} disabled={selectedArtisans.length === 0}>
              <Download className="mr-2 h-4 w-4" />
              Exporter ({selectedArtisans.length})
            </Button>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter un artisan
            </Button>
          </div>
        </div>

        {/* Dashboard Stats */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Artisans</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Actifs</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En attente</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactifs</CardTitle>
              <UserMinus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">{stats.inactive}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Nouveautés (mois)</CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.newThisMonth}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filtres et Recherche */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par nom, email, spécialité, village, tags..."
                  value={localSearch}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select
                value={filters.status.length > 0 ? filters.status[0] : 'all'}
                onValueChange={(value) => updateFilters({ status: value === 'all' ? [] : [value], page: 1 })}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous statuts</SelectItem>
                  <SelectItem value="active">Actif</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="inactive">Inactif</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={filters.collaborationStatus.length > 0 ? filters.collaborationStatus[0] : 'all'}
                onValueChange={(value) => updateFilters({ collaborationStatus: value === 'all' ? [] : [value], page: 1 })}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Collaboration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  <SelectItem value="new">Nouveau</SelectItem>
                  <SelectItem value="active">En cours</SelectItem>
                  <SelectItem value="paused">En pause</SelectItem>
                  <SelectItem value="ended">Terminé</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={filters.region || 'all'}
                onValueChange={(value) => updateFilters({ region: value === 'all' ? '' : value, page: 1 })}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Région" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes régions</SelectItem>
                  {regions.map(r => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={resetFilters}>
                <Filter className="mr-2 h-4 w-4" />
                Réinitialiser
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Actions de groupe */}
        {selectedArtisans.length > 0 && (
          <Card className="bg-primary/5 border-primary">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedArtisans.length === artisans.length}
                    onCheckedChange={() => {
                      if (selectedArtisans.length === artisans.length) {
                        clearSelection()
                      } else {
                        selectAll()
                      }
                    }}
                  />
                  <span className="text-sm font-medium">
                    {selectedArtisans.length} artisan(s) sélectionné(s)
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={clearSelection}>
                    Annuler
                  </Button>
                  <Button variant="destructive" size="sm" onClick={deleteSelectedArtisans}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Supprimer
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Liste des artisans - Vue Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {artisans.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="py-12 text-center">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Aucun artisan trouvé</h3>
                <p className="text-muted-foreground mt-1">
                  Aucune artisan ne correspond à vos critères de recherche
                </p>
              </CardContent>
            </Card>
          ) : (
            artisans.map((artisan) => (
              <Card key={artisan.id} className="group hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={selectedArtisans.includes(artisan.id)}
                        onCheckedChange={() => toggleSelection(artisan.id)}
                      />
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-lg font-semibold text-primary">
                          {artisan.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold">{artisan.name}</h3>
                        <p className="text-sm text-muted-foreground">{artisan.specialty}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {getStatusBadge(artisan.status)}
                      {getCollaborationBadge(artisan.collaborationStatus)}
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{artisan.village}, {artisan.region}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span>{artisan.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span className="truncate">{artisan.email}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-4 pt-4 border-t">
                    {getRatingStars(artisan.rating)}
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Package className="h-4 w-4" />
                      <span>{artisan.productsCount} produits</span>
                    </div>
                  </div>

                  {/* Tags */}
                  {artisan.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {artisan.tags.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                      {artisan.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{artisan.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <span className="text-xs text-muted-foreground">
                      Dernière interaction: {formatDate(artisan.lastInteraction)}
                    </span>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openDetail(artisan)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openEditWithData(artisan)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteArtisan(artisan.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Page {pagination.page} sur {pagination.totalPages} ({pagination.total} résultat(s))
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateFilters({ page: pagination.page - 1 })}
                disabled={pagination.page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Précédent
              </Button>
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  let pageNum: number
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1
                  } else if (pagination.page <= 3) {
                    pageNum = i + 1
                  } else if (pagination.page >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + i
                  } else {
                    pageNum = pagination.page - 2 + i
                  }
                  return (
                    <Button
                      key={pageNum}
                      variant={pagination.page === pageNum ? 'default' : 'outline'}
                      size="sm"
                      className="w-8"
                      onClick={() => updateFilters({ page: pageNum })}
                    >
                      {pageNum}
                    </Button>
                  )
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateFilters({ page: pagination.page + 1 })}
                disabled={pagination.page === pagination.totalPages}
              >
                Suivant
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Dialog de création */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Ajouter un nouvel artisan</DialogTitle>
            <DialogDescription>
              Remplissez les informations pour ajouter un artisan à votre réseau
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom de l'artisan *</Label>
                  <Input
                    id="name"
                    placeholder="Nom complet ou atelier"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialty">Spécialisation *</Label>
                  <Input
                    id="specialty"
                    placeholder="Ex: Tissage Manjak"
                    value={formData.specialty}
                    onChange={(e) => setFormData(prev => ({ ...prev, specialty: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@exemple.sn"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone *</Label>
                  <Input
                    id="phone"
                    placeholder="+221 XX XXX XX XX"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Région</Label>
                  <Select
                    value={formData.region}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, region: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      {regions.map(r => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="village">Village/Ville</Label>
                  <Input
                    id="village"
                    placeholder="Village ou ville"
                    value={formData.village}
                    onChange={(e) => setFormData(prev => ({ ...prev, village: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Adresse complète</Label>
                <Input
                  id="address"
                  placeholder="Adresse exacte"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Tags/Catégories</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Ajouter un tag..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" variant="outline" onClick={addTag}>
                    <Tag className="h-4 w-4" />
                  </Button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                        {tag}
                        <X className="h-3 w-3 ml-1" />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes personnelles</Label>
                <Textarea
                  id="notes"
                  placeholder="Notes sur l'artisan, particularités, historique..."
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleCreateArtisan}
              disabled={!formData.name || !formData.email || !formData.phone || !formData.specialty || isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              Ajouter l'artisan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog d'édition */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Modifier l'artisan</DialogTitle>
            <DialogDescription>
              Mettez à jour les informations de l'artisan
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Nom de l'artisan *</Label>
                  <Input
                    id="edit-name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-specialty">Spécialisation *</Label>
                  <Input
                    id="edit-specialty"
                    value={formData.specialty}
                    onChange={(e) => setFormData(prev => ({ ...prev, specialty: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email *</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-phone">Téléphone *</Label>
                  <Input
                    id="edit-phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Région</Label>
                  <Select
                    value={formData.region}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, region: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {regions.map(r => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-village">Village/Ville</Label>
                  <Input
                    id="edit-village"
                    value={formData.village}
                    onChange={(e) => setFormData(prev => ({ ...prev, village: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-address">Adresse complète</Label>
                <Input
                  id="edit-address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Tags/Catégories</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Ajouter un tag..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  />
                  <Button type="button" variant="outline" onClick={addTag}>
                    <Tag className="h-4 w-4" />
                  </Button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                        {tag}
                        <X className="h-3 w-3 ml-1" />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-notes">Notes personnelles</Label>
                <Textarea
                  id="edit-notes"
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleEditArtisan}
              disabled={!formData.name || !formData.email || !formData.phone || !formData.specialty || isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Check className="mr-2 h-4 w-4" />
              )}
              Enregistrer les modifications
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Drawer de détail */}
      <Drawer open={isDetailDrawerOpen} onOpenChange={setIsDetailDrawerOpen}>
        <DrawerContent className="max-w-lg">
          <DrawerHeader>
            <DrawerTitle>{selectedArtisan?.name}</DrawerTitle>
          </DrawerHeader>
          {selectedArtisan && (
            <ScrollArea className="max-h-[calc(100vh-200px)] pr-4">
              <div className="space-y-6 px-6 pb-6">
                {/* Statut */}
                <div className="flex items-center gap-2">
                  {getStatusBadge(selectedArtisan.status)}
                  {getCollaborationBadge(selectedArtisan.collaborationStatus)}
                </div>

                {/* Note */}
                <div className="flex items-center gap-2">
                  {getRatingStars(selectedArtisan.rating)}
                </div>

                <Separator />

                {/* Contact */}
                <div className="space-y-3">
                  <h4 className="font-medium">Coordonnées</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedArtisan.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedArtisan.phone}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <div>{selectedArtisan.address}</div>
                        <div className="text-muted-foreground">{selectedArtisan.village}, {selectedArtisan.region}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Spécialité et produits */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Spécialisation</h4>
                    <p>{selectedArtisan.specialty}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Produits</h4>
                    <p>{selectedArtisan.productsCount}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Commandes</h4>
                    <p>{selectedArtisan.totalOrders}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm text-muted-foreground">Membre depuis</h4>
                    <p>{formatDate(selectedArtisan.createdAt)}</p>
                  </div>
                </div>

                <Separator />

                {/* Tags */}
                {selectedArtisan.tags.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedArtisan.tags.map(tag => (
                        <Badge key={tag} variant="secondary">
                          <Tag className="h-3 w-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {selectedArtisan.notes && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-medium mb-2">Notes</h4>
                      <p className="text-sm text-muted-foreground p-3 bg-muted rounded-lg">
                        {selectedArtisan.notes}
                      </p>
                    </div>
                  </>
                )}

                {/* Documents */}
                {selectedArtisan.documents.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-medium mb-2">Documents</h4>
                      <div className="space-y-2">
                        {selectedArtisan.documents.map(doc => (
                          <div key={doc} className="flex items-center gap-2 text-sm p-2 bg-muted rounded">
                            <Award className="h-4 w-4" />
                            <span className="flex-1 truncate">{doc}</span>
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Activité */}
                <Separator />
                <div>
                  <h4 className="font-medium mb-2">Activité</h4>
                  <div className="text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Dernière interaction: {formatDateTime(selectedArtisan.lastInteraction)}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="h-4 w-4" />
                      <span>Mis à jour: {formatDateTime(selectedArtisan.updatedAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => {
                setIsDetailDrawerOpen(false)
                if (selectedArtisan) {
                  openEditWithData(selectedArtisan)
                }
              }}>
                <Edit className="mr-2 h-4 w-4" />
                Modifier
              </Button>
              <Button variant="outline" className="flex-1">
                <Mail className="mr-2 h-4 w-4" />
                Contacter
              </Button>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  )
}
