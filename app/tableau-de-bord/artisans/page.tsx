"use client"

import React, { useState, useEffect, useCallback } from "react"
import {
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  PauseCircle,
  PlayCircle,
  FileText,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Loader2,
  User,
  Mail,
  Phone,
  MapPin,
  Star,
  Calendar,
  Users,
  Award,
  DollarSign,
  Clock,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast"
import {
  useArtisans,
  type ArtisanWithRelations,
} from "@/hooks/use-artisans"
import { cn } from "@/lib/utils"

// Constants
const ITEMS_PER_PAGE = 10

type SortDirection = "asc" | "desc"
type SortField = "id" | "name" | "rating" | "created_at"

const VERIFICATION_STATUSES = [
  { value: "all", label: "Tous" },
  { value: "verified", label: "Vérifié" },
  { value: "pending", label: "En attente" },
  { value: "suspended", label: "Suspendu" },
]

export default function ArtisansManagementPage() {
  const {
    getArtisans,
    verifyArtisan,
    rejectArtisan,
    suspendArtisan,
    reactivateArtisan,
    getStatistics,
    exportToCSV,
    isLoading,
  } = useArtisans()
  const { toast } = useToast()

  // State
  const [artisans, setArtisans] = useState<ArtisanWithRelations[]>([])
  const [filteredArtisans, setFilteredArtisans] = useState<ArtisanWithRelations[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState<SortField>("created_at")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [showFilters, setShowFilters] = useState(false)

  // Filters state
  const [verificationFilter, setVerificationFilter] = useState<string>("all")
  const [activeFilter, setActiveFilter] = useState<string>("all")
  const [minRating, setMinRating] = useState<string>("all")

  // Statistics
  const [stats, setStats] = useState({
    totalArtisans: 0,
    pendingVerification: 0,
    activeArtisans: 0,
    newThisMonth: 0,
    averageRating: 0,
  })

  // Dialog states
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [isSuspendDialogOpen, setIsSuspendDialogOpen] = useState(false)
  const [selectedArtisan, setSelectedArtisan] = useState<ArtisanWithRelations | null>(null)
  const [rejectReason, setRejectReason] = useState("")
  const [suspendReason, setSuspendReason] = useState("")

  // Load artisans
  const loadArtisans = useCallback(async () => {
    const data = await getArtisans()
    setArtisans(data)
    setFilteredArtisans(data)
  }, [getArtisans])

  useEffect(() => {
    loadArtisans()
  }, [loadArtisans])

  // Load statistics
  useEffect(() => {
    const loadStats = async () => {
      const statistics = await getStatistics()
      setStats(statistics)
    }
    loadStats()
  }, [getStatistics])

  // Filter and sort artisans
  useEffect(() => {
    let result = [...artisans]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (artisan) =>
          artisan.name.toLowerCase().includes(query) ||
          artisan.user_email?.toLowerCase().includes(query) ||
          artisan.region.toLowerCase().includes(query) ||
          artisan.village.toLowerCase().includes(query)
      )
    }

    // Verification filter
    if (verificationFilter !== "all") {
      if (verificationFilter === "verified") {
        result = result.filter((a) => a.is_verified)
      } else if (verificationFilter === "pending") {
        result = result.filter((a) => !a.is_verified && a.is_active)
      }
    }

    // Active filter
    if (activeFilter !== "all") {
      result = result.filter((a) =>
        activeFilter === "active" ? a.is_active : !a.is_active
      )
    }

    // Rating filter
    if (minRating !== "all") {
      const minRatingNum = parseInt(minRating)
      result = result.filter((a) => (a.rating || 0) >= minRatingNum)
    }

    // Sort
    result.sort((a, b) => {
      let aValue: string | number = a[sortField]
      let bValue: string | number = b[sortField]

      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase()
        bValue = (bValue as string).toLowerCase()
      }

      if (sortDirection === "asc") {
        return aValue > bValue ? 1 : -1
      }
      return aValue < bValue ? 1 : -1
    })

    setFilteredArtisans(result)
    setCurrentPage(1)
  }, [artisans, searchQuery, verificationFilter, activeFilter, minRating, sortField, sortDirection])

  // Pagination
  const totalPages = Math.ceil(filteredArtisans.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedArtisans = filteredArtisans.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  // Sorting handler
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  // Reset filters
  const resetFilters = () => {
    setVerificationFilter("all")
    setActiveFilter("all")
    setMinRating("all")
    setSearchQuery("")
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  // Get initials
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  // Handle view artisan
  const handleViewArtisan = (artisan: ArtisanWithRelations) => {
    setSelectedArtisan(artisan)
    setIsViewDialogOpen(true)
  }

  // Handle verify
  const handleVerify = async (artisan: ArtisanWithRelations) => {
    const success = await verifyArtisan(artisan.id)
    if (success) {
      loadArtisans()
    }
  }

  // Handle reject
  const handleOpenRejectDialog = (artisan: ArtisanWithRelations) => {
    setSelectedArtisan(artisan)
    setRejectReason("")
    setIsRejectDialogOpen(true)
  }

  const handleSubmitReject = async () => {
    if (!selectedArtisan || !rejectReason.trim()) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez fournir un motif de rejet",
      })
      return
    }

    const success = await rejectArtisan(selectedArtisan.id, rejectReason)
    if (success) {
      setIsRejectDialogOpen(false)
      loadArtisans()
    }
  }

  // Handle suspend
  const handleOpenSuspendDialog = (artisan: ArtisanWithRelations) => {
    setSelectedArtisan(artisan)
    setSuspendReason("")
    setIsSuspendDialogOpen(true)
  }

  const handleSubmitSuspend = async () => {
    if (!selectedArtisan || !suspendReason.trim()) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez fournir un motif de suspension",
      })
      return
    }

    const success = await suspendArtisan(selectedArtisan.id, suspendReason)
    if (success) {
      setIsSuspendDialogOpen(false)
      loadArtisans()
    }
  }

  // Handle reactivate
  const handleReactivate = async (artisan: ArtisanWithRelations) => {
    const success = await reactivateArtisan(artisan.id)
    if (success) {
      loadArtisans()
    }
  }

  // Stat card component
  const StatCard = ({
    title,
    value,
    icon: Icon,
    color,
    onClick,
  }: {
    title: string
    value: string | number
    icon: React.ElementType
    color: string
    onClick?: () => void
  }) => (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:shadow-md",
        onClick && "hover:border-primary"
      )}
      onClick={onClick}
    >
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
          <h1 className="text-2xl font-bold">Gestion des Artisans</h1>
          <p className="text-muted-foreground">
            Gérez les artisans inscrits sur la plateforme
          </p>
        </div>
        <Button variant="outline" onClick={exportToCSV}>
          <Download className="mr-2 h-4 w-4" />
          Exporter CSV
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Total Artisans"
          value={stats.totalArtisans}
          icon={Users}
          color="bg-blue-100 text-blue-600"
        />
        <StatCard
          title="En attente"
          value={stats.pendingVerification}
          icon={Clock}
          color="bg-amber-100 text-amber-600"
          onClick={() => setVerificationFilter("pending")}
        />
        <StatCard
          title="Actifs"
          value={stats.activeArtisans}
          icon={CheckCircle}
          color="bg-green-100 text-green-600"
          onClick={() => setActiveFilter("active")}
        />
        <StatCard
          title="Nouveaux ce mois"
          value={stats.newThisMonth}
          icon={Calendar}
          color="bg-purple-100 text-purple-600"
        />
        <StatCard
          title="Note moyenne"
          value={stats.averageRating.toFixed(1)}
          icon={Star}
          color="bg-yellow-100 text-yellow-600"
        />
      </div>

      {/* Filters & Search */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom, email, ville..."
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

        {/* Advanced Filters */}
        {showFilters && (
          <CardContent className="border-t pt-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Statut vérification</Label>
                <Select value={verificationFilter} onValueChange={setVerificationFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {VERIFICATION_STATUSES.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Statut du compte</Label>
                <Select value={activeFilter} onValueChange={setActiveFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="active">Actif</SelectItem>
                    <SelectItem value="inactive">Inactif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Note minimale</Label>
                <Select value={minRating} onValueChange={setMinRating}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes</SelectItem>
                    <SelectItem value="5">5 étoiles</SelectItem>
                    <SelectItem value="4">4+ étoiles</SelectItem>
                    <SelectItem value="3">3+ étoiles</SelectItem>
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

      {/* Artisans Table */}
      <Card>
        <CardHeader className="border-b">
          <CardTitle>
            Artisans ({filteredArtisans.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-3 text-left">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSort("id")}
                        className="flex items-center gap-1 font-medium"
                      >
                        ID
                        <ArrowUpDown className="h-3 w-3" />
                      </Button>
                    </th>
                    <th className="px-4 py-3 text-left">Artisan</th>
                    <th className="px-4 py-3 text-left">Contact</th>
                    <th className="px-4 py-3 text-left">Localisation</th>
                    <th className="px-4 py-3 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSort("rating")}
                        className="flex items-center gap-1 font-medium"
                      >
                        Note
                        <ArrowUpDown className="h-3 w-3" />
                      </Button>
                    </th>
                    <th className="px-4 py-3 text-center">Vérification</th>
                    <th className="px-4 py-3 text-center">Commandes</th>
                    <th className="px-4 py-3 text-left">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSort("created_at")}
                        className="flex items-center gap-1 font-medium"
                      >
                        Inscrit le
                        <ArrowUpDown className="h-3 w-3" />
                      </Button>
                    </th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedArtisans.map((artisan) => (
                    <tr
                      key={artisan.id}
                      className="border-b transition-colors hover:bg-muted/50"
                    >
                      <td className="px-4 py-3 font-medium">#{artisan.id}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src="/placeholder-user.jpg" />
                            <AvatarFallback>
                              {getInitials(artisan.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{artisan.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {artisan.speciality}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          <p className="text-sm flex items-center gap-1">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            {artisan.user_email}
                          </p>
                          <p className="text-sm flex items-center gap-1">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            {artisan.user_phone}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          {artisan.village}, {artisan.region}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{artisan.rating.toFixed(1)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge
                          variant={artisan.is_verified ? "default" : "secondary"}
                        >
                          {artisan.is_verified ? "Vérifié" : "En attente"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant="outline">{artisan.orders_count}</Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-sm">
                        {formatDate(artisan.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewArtisan(artisan)}
                            className="h-8 w-8"
                            title="Voir profil"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {!artisan.is_verified && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleVerify(artisan)}
                              className="h-8 w-8 text-green-600 hover:text-green-700"
                              title="Valider"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                          {!artisan.is_verified && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenRejectDialog(artisan)}
                              className="h-8 w-8 text-red-600 hover:text-red-700"
                              title="Rejeter"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          )}
                          {artisan.is_active ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenSuspendDialog(artisan)}
                              className="h-8 w-8 text-amber-600 hover:text-amber-700"
                              title="Suspendre"
                            >
                              <PauseCircle className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleReactivate(artisan)}
                              className="h-8 w-8 text-green-600 hover:text-green-700"
                              title="Réactiver"
                            >
                              <PlayCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {paginatedArtisans.length === 0 && (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-muted-foreground">
                        Aucun artisan trouvé
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
                Affichage de {startIndex + 1} à {Math.min(startIndex + ITEMS_PER_PAGE, filteredArtisans.length)} sur {filteredArtisans.length} artisans
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium">
                  Page {currentPage} sur {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Artisan Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Profil de l'artisan</DialogTitle>
          </DialogHeader>
          {selectedArtisan && (
            <Tabs defaultValue="info" className="mt-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="info">Informations</TabsTrigger>
                <TabsTrigger value="stats">Statistiques</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
              </TabsList>
              
              <TabsContent value="info" className="space-y-4 mt-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src="/placeholder-user.jpg" />
                    <AvatarFallback>
                      {getInitials(selectedArtisan.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold">{selectedArtisan.name}</h3>
                    <p className="text-muted-foreground">{selectedArtisan.speciality}</p>
                    <Badge variant={selectedArtisan.is_verified ? "default" : "secondary"}>
                      {selectedArtisan.is_verified ? "Vérifié" : "En attente"}
                    </Badge>
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Mail className="h-3 w-3" /> Email
                    </p>
                    <p className="font-medium">{selectedArtisan.user_email}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Phone className="h-3 w-3" /> Téléphone
                    </p>
                    <p className="font-medium">{selectedArtisan.user_phone}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> Localisation
                    </p>
                    <p className="font-medium">{selectedArtisan.village}, {selectedArtisan.region}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> Inscrit le
                    </p>
                    <p className="font-medium">{formatDate(selectedArtisan.created_at)}</p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="stats" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-muted p-4">
                    <div className="flex items-center gap-2">
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      <span className="text-2xl font-bold">{selectedArtisan.rating.toFixed(1)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Note moyenne</p>
                  </div>
                  <div className="rounded-lg bg-muted p-4">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      <span className="text-2xl font-bold">{selectedArtisan.orders_count}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Commandes réalisées</p>
                  </div>
                  <div className="rounded-lg bg-muted p-4 col-span-2">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      <span className="text-2xl font-bold">
                        {formatCurrency(selectedArtisan.total_revenue)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">Chiffre d'affaires généré</p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="documents" className="mt-4">
                <p className="text-sm text-muted-foreground">
                  Les documents justificatifs seront affichés ici.
                </p>
              </TabsContent>
            </Tabs>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeter la vérification</DialogTitle>
            <DialogDescription>
              Artisan : {selectedArtisan?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Motif du rejet *</Label>
              <Textarea
                placeholder="Veuillez fournir le motif du rejet..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleSubmitReject}
              disabled={isLoading || !rejectReason.trim()}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirmer le rejet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suspend Dialog */}
      <Dialog open={isSuspendDialogOpen} onOpenChange={setIsSuspendDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspendre l'artisan</DialogTitle>
            <DialogDescription>
              Artisan : {selectedArtisan?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Motif de la suspension *</Label>
              <Textarea
                placeholder="Veuillez fournir le motif de la suspension..."
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSuspendDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleSubmitSuspend}
              disabled={isLoading || !suspendReason.trim()}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirmer la suspension
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}


