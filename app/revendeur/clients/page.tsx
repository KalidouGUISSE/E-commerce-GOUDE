/**
 * Clients Revendeur - Page de gestion des clients
 * 
 * Cette page permet de :
 * - Consulter la liste des clients
 * - Rechercher et filtrer les clients
 * - Ajouter, modifier, supprimer des clients
 * - Voir les statistiques clients
 */

'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Download,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ShoppingCart,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  X,
  RefreshCw,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useToast } from '@/components/ui/use-toast'
import { useResellerClients, type ResellerClient, type ClientFormData } from '@/hooks/use-reseller-clients'
import { cn, formatCurrency } from '@/lib/utils'

// Composant StatCard
function StatCard({
  icon: Icon,
  label,
  value,
  description,
  trend,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string | number
  description?: string
  trend?: 'up' | 'down'
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  )
}

// Composant ClientRow
function ClientRow({
  client,
  onEdit,
  onDelete,
}: {
  client: ResellerClient
  onEdit: (client: ResellerClient) => void
  onDelete: (client: ResellerClient) => void
}) {
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  const statusConfig = {
    active: { label: 'Actif', className: 'bg-green-100 text-green-800' },
    inactive: { label: 'Inactif', className: 'bg-gray-100 text-gray-800' },
    pending: { label: 'En attente', className: 'bg-yellow-100 text-yellow-800' },
    blocked: { label: 'Bloqué', className: 'bg-red-100 text-red-800' },
  }

  const status = statusConfig[client.status]

  return (
    <TableRow>
      <TableCell className="whitespace-nowrap">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary/10 text-primary">
              {getInitials(client.firstName, client.lastName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">
              {client.firstName} {client.lastName}
            </p>
            <p className="text-sm text-muted-foreground">{client.reference}</p>
          </div>
        </div>
      </TableCell>
      <TableCell className="whitespace-nowrap">
        {client.companyName || '—'}
      </TableCell>
      <TableCell className="whitespace-nowrap">
        <div className="flex flex-col">
          <span className="text-sm">{client.email}</span>
          <span className="text-xs text-muted-foreground">{client.phone}</span>
        </div>
      </TableCell>
      <TableCell className="whitespace-nowrap">
        <div className="flex flex-col">
          <span className="text-sm">{client.city}</span>
          <span className="text-xs text-muted-foreground">{client.region}</span>
        </div>
      </TableCell>
      <TableCell className="whitespace-nowrap">
        <Badge className={cn(status.className)}>{status.label}</Badge>
      </TableCell>
      <TableCell className="whitespace-nowrap text-right">
        <div className="flex flex-col items-end">
          <span className="font-medium">{client.totalOrders}</span>
          <span className="text-xs text-muted-foreground">commandes</span>
        </div>
      </TableCell>
      <TableCell className="whitespace-nowrap text-right">
        {formatCurrency(client.totalSpent)}
      </TableCell>
      <TableCell className="whitespace-nowrap">
        {client.lastOrderDate ? (
          <span className="text-sm">{new Date(client.lastOrderDate).toLocaleDateString('fr-FR')}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell className="whitespace-nowrap">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(client)}>
              <Eye className="h-4 w-4 mr-2" />
              Voir détails
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(client)}>
              <Edit className="h-4 w-4 mr-2" />
              Modifier
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Mail className="h-4 w-4 mr-2" />
              Envoyer un email
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(client)} className="text-red-600">
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )
}

// Composant ClientFormDialog
function ClientFormDialog({
  isOpen,
  onClose,
  client,
  onSave,
  isLoading,
}: {
  isOpen: boolean
  onClose: () => void
  client: ResellerClient | null
  onSave: (data: ClientFormData) => Promise<boolean>
  isLoading: boolean
}) {
  const { toast } = useToast()
  const [formData, setFormData] = useState<ClientFormData>({
    firstName: client?.firstName || '',
    lastName: client?.lastName || '',
    companyName: client?.companyName || '',
    email: client?.email || '',
    phone: client?.phone || '',
    address: client?.address || '',
    city: client?.city || '',
    region: client?.region || '',
    notes: client?.notes || '',
    tags: client?.tags || [],
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs obligatoires',
      })
      return
    }

    const success = await onSave(formData)
    if (success) {
      onClose()
    }
  }

  const handleChange = (field: keyof ClientFormData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{client ? 'Modifier le client' : 'Nouveau client'}</DialogTitle>
          <DialogDescription>
            {client
              ? 'Modifiez les informations du client ci-dessous'
              : 'Remplissez les informations pour ajouter un nouveau client'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
            {/* Informations personnelles */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm text-muted-foreground">Informations personnelles</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Prénom *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleChange('firstName', e.target.value)}
                    placeholder="Prénom"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Nom *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleChange('lastName', e.target.value)}
                    placeholder="Nom"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="companyName">Entreprise</Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => handleChange('companyName', e.target.value)}
                  placeholder="Nom de l'entreprise (optionnel)"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="email@exemple.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="+221 XX XXX XX XX"
                    required
                  />
                </div>
              </div>
            </div>
            
            <Separator />
            
            {/* Adresse */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm text-muted-foreground">Adresse</h4>
              <div className="space-y-2">
                <Label htmlFor="address">Adresse</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  placeholder="Adresse postale"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">Ville</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    placeholder="Ville"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="region">Région</Label>
                  <Select
                    value={formData.region}
                    onValueChange={(value) => handleChange('region', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Dakar">Dakar</SelectItem>
                      <SelectItem value="Thiès">Thiès</SelectItem>
                      <SelectItem value="Saint-Louis">Saint-Louis</SelectItem>
                      <SelectItem value="Kaolack">Kaolack</SelectItem>
                      <SelectItem value="Ziguinchor">Ziguinchor</SelectItem>
                      <SelectItem value="Tambacounda">Tambacounda</SelectItem>
                      <SelectItem value="Louga">Louga</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <Separator />
            
            {/* Notes */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm text-muted-foreground">Notes</h4>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes additionnelles</Label>
                <Input
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  placeholder="Notes sur le client"
                />
              </div>
            </div>
          </div>
          
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Enregistrement...' : client ? 'Mettre à jour' : 'Créer le client'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Page principale
export default function ClientsPage() {
  const {
    filters,
    updateFilters,
    resetFilters,
    goToPage,
    pagination,
    clients,
    stats,
    regions,
    selectedClient,
    isFormOpen,
    setIsFormOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    openAddForm,
    openEditForm,
    openDeleteDialog,
    saveClient,
    deleteClient,
    exportClients,
  } = useResellerClients()

  const [isLoading, setIsLoading] = useState(false)

  const handleSaveClient = async (data: ClientFormData) => {
    setIsLoading(true)
    try {
      const success = await saveClient(data)
      if (success) {
        // Show success toast (would need toast hook here)
        console.log('Client saved successfully')
      }
      return success
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteClient = async () => {
    setIsLoading(true)
    try {
      const success = await deleteClient()
      if (success) {
        console.log('Client deleted successfully')
      }
      return success
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground mt-1">
            Gérez vos clients et suivez leur activité
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => exportClients('csv')}>
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          <Button onClick={openAddForm}>
            <UserPlus className="h-4 w-4 mr-2" />
            Nouveau client
          </Button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Users}
          label="Total clients"
          value={stats.totalClients}
          description={`${stats.activeClients} actifs`}
        />
        <StatCard
          icon={Users}
          label="Nouveaux ce mois"
          value={stats.newThisMonth}
          description="Nouvelles inscriptions"
        />
        <StatCard
          icon={DollarSign}
          label="Revenus clients"
          value={formatCurrency(stats.totalRevenue)}
          description={`CA total généré`}
        />
        <StatCard
          icon={ShoppingCart}
          label="Panier moyen"
          value={formatCurrency(stats.averageClientValue)}
          description="Valeur moyenne par client"
        />
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="p-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {/* Recherche */}
            <div className="space-y-1 lg:col-span-2">
              <Label className="text-xs">Recherche</Label>
              <div className="flex gap-1">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Nom, email, référence..."
                    value={filters.search}
                    onChange={(e) => updateFilters({ search: e.target.value, page: 1 })}
                    className="pl-8"
                  />
                </div>
                {filters.search && (
                  <Button variant="ghost" size="icon" onClick={resetFilters}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Statut */}
            <div className="space-y-1">
              <Label className="text-xs">Statut</Label>
              <Select
                value={filters.status || 'all'}
                onValueChange={(value) => updateFilters({ status: value === 'all' ? '' : value, page: 1 })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tous" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="active">Actif</SelectItem>
                  <SelectItem value="inactive">Inactif</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="blocked">Bloqué</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Région */}
            <div className="space-y-1">
              <Label className="text-xs">Région</Label>
              <Select
                value={filters.region || 'all'}
                onValueChange={(value) => updateFilters({ region: value === 'all' ? '' : value, page: 1 })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Toutes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  {regions.map((region) => (
                    <SelectItem key={region} value={region}>
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tri */}
            <div className="space-y-1">
              <Label className="text-xs">Trier par</Label>
              <Select
                value={filters.sortBy}
                onValueChange={(value) => updateFilters({ sortBy: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lastOrderDate">Dernière commande</SelectItem>
                  <SelectItem value="registrationDate">Date d'inscription</SelectItem>
                  <SelectItem value="name">Nom</SelectItem>
                  <SelectItem value="totalSpent">Total dépensé</SelectItem>
                  <SelectItem value="totalOrders">Nombre de commandes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tableau */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Client</TableHead>
              <TableHead>Entreprise</TableHead>
              <TableHead className="w-[200px]">Contact</TableHead>
              <TableHead className="w-[150px]">Localisation</TableHead>
              <TableHead className="w-[100px]">Statut</TableHead>
              <TableHead className="w-[100px] text-right">Commandes</TableHead>
              <TableHead className="w-[120px] text-right">Total</TableHead>
              <TableHead className="w-[120px]">Dernière commande</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.length > 0 ? (
              clients.map((client, idx) => (
                <ClientRow
                  key={idx}
                  client={client}
                  onEdit={openEditForm}
                  onDelete={openDeleteDialog}
                />
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  Aucun client trouvé
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Label className="text-xs">Afficher</Label>
          <Select
            value={filters.limit.toString()}
            onValueChange={(value) => updateFilters({ limit: parseInt(value), page: 1 })}
          >
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {pagination.start + 1}-{pagination.end} sur {pagination.total}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => goToPage(pagination.page - 1)}
            disabled={pagination.page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => goToPage(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Dialog formulaire client */}
      <ClientFormDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        client={selectedClient}
        onSave={handleSaveClient}
        isLoading={isLoading}
      />

      {/* Dialog de confirmation de suppression */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer ce client ? Cette action est irréversible et
              toutes les données associées seront perdues.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteClient}
              className="bg-red-600 hover:bg-red-700"
              disabled={isLoading}
            >
              {isLoading ? 'Suppression...' : 'Supprimer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
