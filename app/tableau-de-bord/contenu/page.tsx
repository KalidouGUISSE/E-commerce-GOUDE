"use client"

import React, { useState, useEffect, useCallback, useRef } from "react"
import {
  Search,
  Filter,
  Download,
  Plus,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Tag,
  Image,
  FileText,
  Video,
  Globe,
  MoreHorizontal,
  CheckCircle,
  Clock,
  Archive,
  Send,
  EyeOff,
  BarChart3,
  TrendingUp,
  MousePointer,
  Upload,
  X,
  File,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import {
  useContent,
  type Content,
  type ContentCategory,
} from "@/hooks/use-content"

// Constants
const ITEMS_PER_PAGE = 10

const CONTENT_TYPES = [
  { value: "all", label: "Tous types", icon: FileText },
  { value: "article", label: "Article", icon: FileText },
  { value: "image", label: "Image", icon: Image },
  { value: "video", label: "Vidéo", icon: Video },
  { value: "page", label: "Page", icon: Globe },
]

const STATUSES = [
  { value: "all", label: "Tous statuts" },
  { value: "published", label: "Publié", color: "bg-green-100 text-green-800" },
  { value: "draft", label: "Brouillon", color: "bg-gray-100 text-gray-800" },
  { value: "scheduled", label: "Planifié", color: "bg-blue-100 text-blue-800" },
  { value: "archived", label: "Archivé", color: "bg-amber-100 text-amber-800" },
]

export default function ContentManagementPage() {
  const {
    getContents,
    getCategories,
    createContent,
    updateContent,
    deleteContent,
    bulkAction,
    getStatistics,
    exportToCSV,
    isLoading,
  } = useContent()

  // State
  const [contents, setContents] = useState<Content[]>([])
  const [filteredContents, setFilteredContents] = useState<Content[]>([])
  const [categories, setCategories] = useState<ContentCategory[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)

  // Filters state
  const [contentTypeFilter, setContentTypeFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())

  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedContent, setSelectedContent] = useState<Content | null>(null)

  // Form state
  const [formData, setFormData] = useState<Partial<Content>>({
    title: "",
    slug: "",
    content_type: "article",
    category_id: 1,
    body: "",
    excerpt: "",
    tags: [],
    meta_title: "",
    meta_description: "",
    meta_keywords: "",
    status: "draft",
    scheduled_at: "",
  })
  const [newTag, setNewTag] = useState("")

  // Statistics
  const [stats, setStats] = useState({
    totalContent: 0,
    published: 0,
    drafts: 0,
    scheduled: 0,
    archived: 0,
    totalViews: 0,
    averageEngagement: 0,
  })

  // Drag & drop state
  const [isDragging, setIsDragging] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<string | null>(null)

  // Load contents
  const loadContents = useCallback(async () => {
    const data = await getContents()
    setContents(data)
  }, [getContents])

  useEffect(() => {
    loadContents()
  }, [loadContents])

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      const data = await getCategories()
      setCategories(data)
    }
    loadCategories()
  }, [getCategories])

  // Load statistics
  useEffect(() => {
    const loadStats = async () => {
      const statistics = await getStatistics()
      setStats(statistics)
    }
    loadStats()
  }, [getStatistics])

  // Filter and sort
  useEffect(() => {
    let result = [...contents]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(query) ||
          c.excerpt.toLowerCase().includes(query) ||
          c.tags.some((t) => t.toLowerCase().includes(query))
      )
    }

    // Content type filter
    if (contentTypeFilter !== "all") {
      result = result.filter((c) => c.content_type === contentTypeFilter)
    }

    // Category filter
    if (categoryFilter !== "all") {
      result = result.filter((c) => c.category_id === parseInt(categoryFilter))
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((c) => c.status === statusFilter)
    }

    setFilteredContents(result)
    setCurrentPage(1)
    setSelectedIds(new Set())
  }, [contents, searchQuery, contentTypeFilter, categoryFilter, statusFilter])

  // Pagination
  const totalPages = Math.ceil(filteredContents.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedContents = filteredContents.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  // Reset filters
  const resetFilters = () => {
    setContentTypeFilter("all")
    setCategoryFilter("all")
    setStatusFilter("all")
    setSearchQuery("")
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Get status badge
  const getStatusBadge = (status: Content["status"]) => {
    const statusConfig = STATUSES.find((s) => s.value === status)
    return (
      <Badge className={cn("capitalize", statusConfig?.color || "")}>
        {statusConfig?.label || status}
      </Badge>
    )
  }

  // Get type icon
  const getTypeIcon = (type: Content["content_type"]) => {
    const typeConfig = CONTENT_TYPES.find((t) => t.value === type)
    const Icon = typeConfig?.icon || File
    return <Icon className="h-4 w-4" />
  }

  // Handle selection
  const toggleSelection = (id: number) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedContents.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(paginatedContents.map((c) => c.id)))
    }
  }

  // Bulk actions
  const handleBulkPublish = () => {
    if (selectedIds.size > 0) {
      bulkAction(Array.from(selectedIds), "publish")
      loadContents()
    }
  }

  const handleBulkArchive = () => {
    if (selectedIds.size > 0) {
      bulkAction(Array.from(selectedIds), "archive")
      loadContents()
    }
  }

  const handleBulkDelete = () => {
    if (selectedIds.size > 0) {
      bulkAction(Array.from(selectedIds), "delete")
      loadContents()
    }
  }

  // Open create dialog
  const handleOpenCreateDialog = () => {
    setFormData({
      title: "",
      slug: "",
      content_type: "article",
      category_id: 1,
      body: "",
      excerpt: "",
      tags: [],
      meta_title: "",
      meta_description: "",
      meta_keywords: "",
      status: "draft",
      scheduled_at: "",
    })
    setUploadedFile(null)
    setIsCreateDialogOpen(true)
  }

  // Open edit dialog
  const handleOpenEditDialog = (content: Content) => {
    setFormData({
      ...content,
      tags: content.tags || [],
    })
    setSelectedContent(content)
    setIsEditDialogOpen(true)
  }

  // Open view dialog
  const handleOpenViewDialog = (content: Content) => {
    setSelectedContent(content)
    setIsViewDialogOpen(true)
  }

  // Open delete dialog
  const handleOpenDeleteDialog = (content: Content) => {
    setSelectedContent(content)
    setIsDeleteDialogOpen(true)
  }

  // Handle submit create
  const handleSubmitCreate = async () => {
    if (!formData.title) {
      return
    }
    await createContent(formData)
    setIsCreateDialogOpen(false)
    loadContents()
  }

  // Handle submit edit
  const handleSubmitEdit = async () => {
    if (!selectedContent) return
    await updateContent(selectedContent.id, formData)
    setIsEditDialogOpen(false)
    loadContents()
  }

  // Handle delete
  const handleDelete = async () => {
    if (!selectedContent) return
    await deleteContent(selectedContent.id)
    setIsDeleteDialogOpen(false)
    loadContents()
  }

  // Handle add tag
  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), newTag.trim()],
      })
      setNewTag("")
    }
  }

  // Handle remove tag
  const handleRemoveTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter((t) => t !== tag) || [],
    })
  }

  // Generate slug from title
  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title,
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
    })
  }

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) {
      // In a real app, upload to server and get URL
      setUploadedFile(URL.createObjectURL(file))
      setFormData({ ...formData, featured_image: file.name })
    }
  }

  // Stat card component
  const StatCard = ({
    title,
    value,
    icon: Icon,
    color,
  }: {
    title: string
    value: string | number
    icon: React.ElementType
    color: string
  }) => (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
          </div>
          <div className={cn("p-3 rounded-full", color)}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Gestion du Contenu</h1>
          <p className="text-muted-foreground">
            Gérez les articles, images, vidéos et pages
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="mr-2 h-4 w-4" />
            Exporter
          </Button>
          <Button onClick={handleOpenCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Nouveau contenu
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          title="Total Contenus"
          value={stats.totalContent}
          icon={FileText}
          color="bg-blue-100 text-blue-600"
        />
        <StatCard
          title="Publiés"
          value={stats.published}
          icon={CheckCircle}
          color="bg-green-100 text-green-600"
        />
        <StatCard
          title="Brouillons"
          value={stats.drafts}
          icon={Clock}
          color="bg-gray-100 text-gray-600"
        />
        <StatCard
          title="Total Vues"
          value={stats.totalViews.toLocaleString()}
          icon={Eye}
          color="bg-purple-100 text-purple-600"
        />
      </div>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <Card className="border-primary bg-primary/5">
          <CardContent className="py-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {selectedIds.size} élément(s) sélectionné(s)
              </span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={handleBulkPublish}>
                  <Send className="mr-1 h-3 w-3" />
                  Publier
                </Button>
                <Button size="sm" variant="outline" onClick={handleBulkArchive}>
                  <Archive className="mr-1 h-3 w-3" />
                  Archiver
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleBulkDelete}
                >
                  <Trash2 className="mr-1 h-3 w-3" />
                  Supprimer
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher par titre, extrait, tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="mr-2 h-4 w-4" />
              Filtres
            </Button>
          </div>
        </CardHeader>

        {showFilters && (
          <CardContent className="border-t pt-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Type de contenu</Label>
                <Select value={contentTypeFilter} onValueChange={setContentTypeFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CONTENT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          {type.icon && <type.icon className="h-4 w-4" />}
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Catégorie</Label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les catégories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={String(cat.id)}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: cat.color }}
                          />
                          {cat.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Statut</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button variant="ghost" onClick={resetFilters}>
                Réinitialiser
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Contents Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-3 w-12">
                      <Checkbox
                        checked={
                          selectedIds.size === paginatedContents.length &&
                          paginatedContents.length > 0
                        }
                        onCheckedChange={toggleSelectAll}
                      />
                    </th>
                    <th className="px-4 py-3 text-left">Titre</th>
                    <th className="px-4 py-3 text-center">Type</th>
                    <th className="px-4 py-3 text-center">Catégorie</th>
                    <th className="px-4 py-3 text-center">Statut</th>
                    <th className="px-4 py-3 text-center">Vues</th>
                    <th className="px-4 py-3 text-center">Engagement</th>
                    <th className="px-4 py-3 text-left">Créé le</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedContents.map((content) => (
                    <tr
                      key={content.id}
                      className="border-b transition-colors hover:bg-muted/50"
                    >
                      <td className="px-4 py-3">
                        <Checkbox
                          checked={selectedIds.has(content.id)}
                          onCheckedChange={() => toggleSelection(content.id)}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          <p className="font-medium line-clamp-1">{content.title}</p>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {content.excerpt}
                          </p>
                          {content.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {content.tags.slice(0, 3).map((tag) => (
                                <Badge
                                  key={tag}
                                  variant="secondary"
                                  className="text-xs px-1.5 py-0"
                                >
                                  {tag}
                                </Badge>
                              ))}
                              {content.tags.length > 3 && (
                                <Badge
                                  variant="outline"
                                  className="text-xs px-1.5 py-0"
                                >
                                  +{content.tags.length - 3}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center">{getTypeIcon(content.content_type)}</div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant="outline">
                          {content.category_name}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {getStatusBadge(content.status)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Eye className="h-3 w-3 text-muted-foreground" />
                          <span>{content.views.toLocaleString()}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <TrendingUp className="h-3 w-3 text-green-600" />
                          <span className="text-green-600 font-medium">
                            {content.engagement_score.toFixed(1)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-sm">
                        {formatDate(content.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenViewDialog(content)}
                            className="h-8 w-8"
                            title="Voir"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEditDialog(content)}
                            className="h-8 w-8"
                            title="Modifier"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDeleteDialog(content)}
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            title="Supprimer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {paginatedContents.length === 0 && (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-muted-foreground">
                        Aucun contenu trouvé
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t px-4 py-3">
              <p className="text-sm text-muted-foreground">
                Affichage de {startIndex + 1} à {Math.min(startIndex + ITEMS_PER_PAGE, filteredContents.length)} sur {filteredContents.length}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </Button>
                <span className="text-sm font-medium">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isCreateDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCreateDialogOpen(false)
          setIsEditDialogOpen(false)
        }
      }}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isCreateDialogOpen ? "Nouveau contenu" : "Modifier le contenu"}
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="general" className="mt-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="general">Général</TabsTrigger>
              <TabsTrigger value="content">Contenu</TabsTrigger>
              <TabsTrigger value="media">Médias</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
            </TabsList>

            {/* General Tab */}
            <TabsContent value="general" className="space-y-4 mt-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">Titre *</Label>
                  <Input
                    id="title"
                    value={formData.title || ""}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Titre du contenu"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={formData.slug || ""}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="url-du-contenu"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="type">Type de contenu</Label>
                  <Select
                    value={formData.content_type}
                    onValueChange={(value: Content["content_type"]) =>
                      setFormData({ ...formData, content_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                      <SelectContent>
                        {CONTENT_TYPES.slice(1).map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              {type.icon && <type.icon className="h-4 w-4" />}
                              {type.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Catégorie</Label>
                  <Select
                    value={String(formData.category_id)}
                    onValueChange={(value) =>
                      setFormData({ ...formData, category_id: parseInt(value) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={String(cat.id)}>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: cat.color }}
                            />
                            {cat.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt">Extrait</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt || ""}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  placeholder="Courte description..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags?.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => handleRemoveTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Ajouter un tag..."
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                  />
                  <Button type="button" variant="outline" onClick={handleAddTag}>
                    <Tag className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Content Tab */}
            <TabsContent value="content" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="body">Corps du contenu</Label>
                <Textarea
                  id="body"
                  value={formData.body || ""}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  placeholder="Rédigez votre contenu ici... (HTML supporté)"
                  rows={15}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Vous pouvez utiliser les balises HTML pour formater le contenu.
                </p>
              </div>
            </TabsContent>

            {/* Media Tab */}
            <TabsContent value="media" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Image à la une / Média</Label>
                <div
                  className={cn(
                    "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                    isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25",
                    uploadedFile ? "bg-green-50 border-green-200" : ""
                  )}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {uploadedFile ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-center gap-2 text-green-600">
                        <CheckCircle className="h-8 w-8" />
                        <span className="font-medium">Fichier uploadé avec succès</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{uploadedFile}</p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setUploadedFile(null)}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Supprimer
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground mb-2">
                        Glissez-déposez un fichier ou cliquez pour sélectionner
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Images (JPG, PNG, GIF), Vidéos (MP4, WebM)
                      </p>
                      <Button type="button" variant="outline" className="mt-4">
                        <Upload className="h-4 w-4 mr-2" />
                        Sélectionner un fichier
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* SEO Tab */}
            <TabsContent value="seo" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="meta_title">Titre SEO</Label>
                <Input
                  id="meta_title"
                  value={formData.meta_title || ""}
                  onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                  placeholder="Titre pour les moteurs de recherche"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="meta_description">Description SEO</Label>
                <Textarea
                  id="meta_description"
                  value={formData.meta_description || ""}
                  onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                  placeholder="Description pour les moteurs de recherche (150-160 caractères)"
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  {(formData.meta_description?.length || 0)}/160 caractères
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="meta_keywords">Mots-clés SEO</Label>
                <Input
                  id="meta_keywords"
                  value={formData.meta_keywords || ""}
                  onChange={(e) => setFormData({ ...formData, meta_keywords: e.target.value })}
                  placeholder="mot1, mot2, mot3"
                />
              </div>
            </TabsContent>
          </Tabs>

          <Separator />

          <div className="flex flex-col gap-4">
            <div className="space-y-2">
              <Label>Statut de publication</Label>
              <Select
                value={formData.status}
                onValueChange={(value: Content["status"]) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Brouillon
                    </div>
                  </SelectItem>
                  <SelectItem value="published">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Publié
                    </div>
                  </SelectItem>
                  <SelectItem value="scheduled">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Planifié
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.status === "scheduled" && (
              <div className="space-y-2">
                <Label htmlFor="scheduled_at">Date de publication planifiée</Label>
                <Input
                  id="scheduled_at"
                  type="datetime-local"
                  value={formData.scheduled_at || ""}
                  onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateDialogOpen(false)
                setIsEditDialogOpen(false)
              }}
            >
              Annuler
            </Button>
            <Button
              onClick={isCreateDialogOpen ? handleSubmitCreate : handleSubmitEdit}
              disabled={!formData.title || isLoading}
            >
              {isLoading && (
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              )}
              {isCreateDialogOpen ? "Créer" : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedContent?.title}</DialogTitle>
          </DialogHeader>

          {selectedContent && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {getTypeIcon(selectedContent.content_type)}
                <Badge variant="outline">{selectedContent.content_type}</Badge>
                {getStatusBadge(selectedContent.status)}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="text-muted-foreground">Catégorie</p>
                  <p className="font-medium">{selectedContent.category_name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Auteur</p>
                  <p className="font-medium">{selectedContent.author_name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Créé le</p>
                  <p className="font-medium">{formatDate(selectedContent.created_at)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Publié le</p>
                  <p className="font-medium">
                    {selectedContent.published_at
                      ? formatDate(selectedContent.published_at)
                      : "-"}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <p className="text-sm font-medium">Extrait</p>
                <p className="text-sm text-muted-foreground">{selectedContent.excerpt}</p>
              </div>

              <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="text-center">
                  <Eye className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
                  <p className="text-lg font-bold">{selectedContent.views.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Vues</p>
                </div>
                <div className="text-center">
                  <TrendingUp className="h-5 w-5 mx-auto text-green-600 mb-1" />
                  <p className="text-lg font-bold">{selectedContent.engagement_score.toFixed(1)}</p>
                  <p className="text-xs text-muted-foreground">Engagement</p>
                </div>
                <div className="text-center">
                  <MousePointer className="h-5 w-5 mx-auto text-blue-600 mb-1" />
                  <p className="text-lg font-bold">
                    {Math.round(selectedContent.engagement_score * 10)}%
                  </p>
                  <p className="text-xs text-muted-foreground">CTR</p>
                </div>
              </div>

              {selectedContent.tags.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Tags</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedContent.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer le contenu</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer "{selectedContent?.title}" ?
              Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isLoading}
            >
              {isLoading && (
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              )}
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
