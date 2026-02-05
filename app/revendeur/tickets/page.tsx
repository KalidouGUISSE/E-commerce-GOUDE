/**
 * Page des tickets de support
 * Route: /revendeur/tickets
 * 
 * Fonctionnalités:
 * - Liste des tickets avec pagination
 * - Filtres par statut, priorité, catégorie
 * - Recherche
 * - Actions en lot
 */

'use client'

import { useState } from 'react'
import { 
  Search, 
  Filter, 
  Plus, 
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  MessageCircle,
  CheckSquare,
  Loader2,
  Check
} from 'lucide-react'
import { useResellerTickets, SupportTicket } from '@/hooks/use-reseller-tickets'
import { formatDateTime } from '@/lib/utils'
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
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'

export default function ResellerTicketsPage() {
  const {
    filters,
    updateFilters,
    resetFilters,
    tickets,
    pagination,
    stats,
    selectedTickets,
    toggleSelection,
    selectAll,
    clearSelection,
    isCreateModalOpen,
    setIsCreateModalOpen,
    isDetailModalOpen,
    setIsDetailModalOpen,
    selectedTicket,
    openDetail,
    isLoading,
    feedback,
    createTicket,
    updateTicketStatus,
  } = useResellerTickets()

  const [localSearch, setLocalSearch] = useState('')
  const [newTicket, setNewTicket] = useState<{
    subject: string
    category: string
    priority: 'low' | 'medium' | 'high' | 'urgent'
    description: string
  }>({
    subject: '',
    category: '',
    priority: 'medium',
    description: '',
  })
  const [replyContent, setReplyContent] = useState('')

  const handleSearch = (value: string) => {
    setLocalSearch(value)
    updateFilters({ search: value, page: 1 })
  }

  const handleCreateTicket = async () => {
    await createTicket(newTicket)
    setNewTicket({ subject: '', category: '', priority: 'medium', description: '' })
  }

  const handleStatusChange = async (status: SupportTicket['status']) => {
    if (selectedTicket) {
      await updateTicketStatus(selectedTicket.id, status)
    }
  }

  const getStatusBadge = (status: SupportTicket['status']) => {
    const variants: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
      open: 'default',
      in_progress: 'secondary',
      resolved: 'outline',
      closed: 'destructive',
    }
    const labels: Record<string, string> = {
      open: 'Ouvert',
      in_progress: 'En cours',
      resolved: 'Résolu',
      closed: 'Fermé',
    }
    return <Badge variant={variants[status]}>{labels[status]}</Badge>
  }

  const getPriorityBadge = (priority: SupportTicket['priority']) => {
    const variants: Record<string, 'default' | 'destructive' | 'outline' | 'secondary'> = {
      low: 'outline',
      medium: 'secondary',
      high: 'default',
      urgent: 'destructive',
    }
    const labels: Record<string, string> = {
      low: 'Basse',
      medium: 'Moyenne',
      high: 'Haute',
      urgent: 'Urgente',
    }
    return <Badge variant={variants[priority]}>{labels[priority]}</Badge>
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Feedback Toast */}
      {feedback && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-top-2 ${
          feedback.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          <Check className="w-5 h-5" />
          {feedback.message}
        </div>
      )}

      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tickets de Support</h1>
          <p className="text-muted-foreground">
            Gérez vos demandes de support
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau ticket
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ouverts</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.open}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En cours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgress}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Résolus</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.resolved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fermés</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.closed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par ID, sujet, client..."
                value={localSearch}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={filters.status.length > 0 ? filters.status[0] : 'all'}
              onValueChange={(value) => updateFilters({ status: value === 'all' ? [] : [value], page: 1 })}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous statuts</SelectItem>
                <SelectItem value="open">Ouvert</SelectItem>
                <SelectItem value="in_progress">En cours</SelectItem>
                <SelectItem value="resolved">Résolu</SelectItem>
                <SelectItem value="closed">Fermé</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.priority.length > 0 ? filters.priority[0] : 'all'}
              onValueChange={(value) => updateFilters({ priority: value === 'all' ? [] : [value], page: 1 })}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Priorité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes priorités</SelectItem>
                <SelectItem value="urgent">Urgente</SelectItem>
                <SelectItem value="high">Haute</SelectItem>
                <SelectItem value="medium">Moyenne</SelectItem>
                <SelectItem value="low">Basse</SelectItem>
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
      {selectedTickets.length > 0 && (
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedTickets.length === tickets.length}
                  onCheckedChange={() => {
                    if (selectedTickets.length === tickets.length) {
                      clearSelection()
                    } else {
                      selectAll()
                    }
                  }}
                />
                <span className="text-sm font-medium">
                  {selectedTickets.length} ticket(s) sélectionné(s)
                </span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={clearSelection}>
                  Annuler
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Liste des tickets */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Tickets</CardTitle>
          <CardDescription>
            {tickets.length} ticket(s) trouvé(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={tickets.length > 0 && selectedTickets.length === tickets.length}
                      onCheckedChange={() => {
                        if (selectedTickets.length === tickets.length) {
                          clearSelection()
                        } else {
                          selectAll()
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead>Ticket</TableHead>
                  <TableHead>Sujet</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Priorité</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Créé</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      Aucun ticket trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  tickets.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedTickets.includes(ticket.id)}
                          onCheckedChange={() => toggleSelection(ticket.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{ticket.ticketNumber}</div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[200px] truncate">{ticket.subject}</div>
                      </TableCell>
                      <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                      <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                      <TableCell>
                        <div>{ticket.clientName}</div>
                        <div className="text-xs text-muted-foreground">{ticket.clientEmail}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{formatDateTime(ticket.createdAt)}</div>
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => openDetail(ticket)}
                        >
                          Voir
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Page {pagination.page} sur {pagination.totalPages}
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
        </CardContent>
      </Card>

      {/* Dialog de création */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Créer un ticket</DialogTitle>
            <DialogDescription>
              Décrivez votre problème et notre équipe vous répondra sous 24h
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Sujet</Label>
              <Input
                id="subject"
                placeholder="Résumé de votre demande"
                value={newTicket.subject}
                onChange={(e) => setNewTicket(prev => ({ ...prev, subject: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Catégorie</Label>
                <Select
                  value={newTicket.category}
                  onValueChange={(value) => setNewTicket(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technical">Technique</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                    <SelectItem value="billing">Facturation</SelectItem>
                    <SelectItem value="other">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Priorité</Label>
                <Select
                  value={newTicket.priority}
                  onValueChange={(value) => setNewTicket(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Basse</SelectItem>
                    <SelectItem value="medium">Moyenne</SelectItem>
                    <SelectItem value="high">Haute</SelectItem>
                    <SelectItem value="urgent">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Décrivez votre problème en détail..."
                rows={5}
                value={newTicket.description}
                onChange={(e) => setNewTicket(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleCreateTicket}
              disabled={!newTicket.subject || !newTicket.category || !newTicket.description || isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              Créer le ticket
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de détail */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{selectedTicket?.ticketNumber}</DialogTitle>
            <DialogDescription>{selectedTicket?.subject}</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            {selectedTicket && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  {getStatusBadge(selectedTicket.status)}
                  {getPriorityBadge(selectedTicket.priority)}
                  <span className="text-sm text-muted-foreground">
                    {selectedTicket.category}
                  </span>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-sm p-3 bg-muted rounded-lg">
                    {selectedTicket.description}
                  </p>
                </div>

                <Separator />

                {/* Messages */}
                <div>
                  <h4 className="font-medium mb-4">Conversation</h4>
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xs font-medium">
                          {selectedTicket.clientName.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{selectedTicket.clientName}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatDateTime(selectedTicket.createdAt)}
                          </span>
                        </div>
                        <div className="p-3 bg-muted rounded-lg">
                          {selectedTicket.description}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Réponse */}
                <div className="space-y-2">
                  <Label>Répondre</Label>
                  <Textarea
                    placeholder="Écrivez votre réponse..."
                    rows={3}
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                  />
                </div>
              </div>
            )}
          </ScrollArea>
          <DialogFooter>
            <div className="flex gap-2 w-full justify-between">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleStatusChange('in_progress')}>
                  En cours
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleStatusChange('resolved')}>
                  Résoudre
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleStatusChange('closed')}>
                  Fermer
                </Button>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>
                  Fermer
                </Button>
                <Button>Envoyer</Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
