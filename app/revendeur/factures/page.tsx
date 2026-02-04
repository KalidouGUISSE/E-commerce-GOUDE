/**
 * Page des factures
 * Route: /revendeur/factures
 * 
 * Fonctionnalités:
 * - Liste des factures avec pagination
 * - Filtres par statut, période, type
 * - Prévisualisation PDF
 * - Envoi par email
 * - Téléchargement PDF
 */

'use client'

import { useState } from 'react'
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Mail, 
  FileText,
  DollarSign,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Loader2
} from 'lucide-react'
import { useResellerInvoices, Invoice } from '@/hooks/use-reseller-invoices'
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils'
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
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'

export default function ResellerInvoicesPage() {
  const {
    filters,
    updateFilters,
    resetFilters,
    goToPage,
    pagination,
    invoices,
    stats,
    selectedInvoices,
    toggleInvoiceSelection,
    selectAllInvoices,
    clearSelection,
    isPreviewModalOpen,
    setIsPreviewModalOpen,
    isSendModalOpen,
    setIsSendModalOpen,
    selectedInvoice,
    emailRecipient,
    setEmailRecipient,
    openPreviewModal,
    closePreviewModal,
    openSendModal,
    closeSendModal,
    downloadPDF,
    sendByEmail,
    exportInvoices,
  } = useResellerInvoices()

  const [localSearch, setLocalSearch] = useState('')
  const [isExporting, setIsExporting] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSearch = (value: string) => {
    setLocalSearch(value)
    updateFilters({ search: value, page: 1 })
  }

  const handleStatusChange = (value: string) => {
    const statuses = value === 'all' ? [] : [value]
    updateFilters({ status: statuses, page: 1 })
  }

  const handlePeriodChange = (value: string) => {
    updateFilters({ period: value, page: 1 })
  }

  const handleExport = async () => {
    setIsExporting(true)
    try {
      await exportInvoices('pdf')
      setFeedbackMessage({ type: 'success', text: 'Export réussi' })
    } catch {
      setFeedbackMessage({ type: 'error', text: 'Erreur lors de l\'export' })
    }
    setIsExporting(false)
    setTimeout(() => setFeedbackMessage(null), 3000)
  }

  const handleSendEmail = async () => {
    setIsSending(true)
    try {
      await sendByEmail()
      setFeedbackMessage({ type: 'success', text: 'Facture envoyée avec succès' })
      closeSendModal()
    } catch {
      setFeedbackMessage({ type: 'error', text: 'Erreur lors de l\'envoi' })
    }
    setIsSending(false)
    setTimeout(() => setFeedbackMessage(null), 3000)
  }

  const handleDownload = async (invoiceId: string) => {
    await downloadPDF(invoiceId)
    setFeedbackMessage({ type: 'success', text: 'Téléchargement started' })
    setTimeout(() => setFeedbackMessage(null), 3000)
  }

  // Statut badge component
  const StatusBadge = ({ status }: { status: Invoice['status'] }) => {
    const variants = {
      paid: 'bg-green-100 text-green-800 border-green-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      overdue: 'bg-red-100 text-red-800 border-red-200',
      cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
    } as const

    const labels = {
      paid: 'Payée',
      pending: 'En attente',
      overdue: 'En retard',
      cancelled: 'Annulée',
    }

    const icons = {
      paid: <CheckCircle2 className="w-3 h-3 mr-1" />,
      pending: <Clock className="w-3 h-3 mr-1" />,
      overdue: <AlertCircle className="w-3 h-3 mr-1" />,
      cancelled: <XCircle className="w-3 h-3 mr-1" />,
    }

    return (
      <Badge className={`${variants[status]} border flex items-center w-fit`}>
        {icons[status]}
        {labels[status]}
      </Badge>
    )
  }

  // Vérifier si la facture est en retard
  const isOverdue = (invoice: Invoice) => {
    if (invoice.status === 'paid' || invoice.status === 'cancelled') return false
    return new Date(invoice.dueDate) < new Date()
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Feedback Message */}
      {feedbackMessage && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-top-2 ${
          feedbackMessage.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {feedbackMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          {feedbackMessage.text}
        </div>
      )}

      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Factures</h1>
          <p className="text-muted-foreground">
            Gérez vos factures et documents de paiement
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Exporter
          </Button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Émis</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalInvoices}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Montant Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalAmount)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Payé</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.paidAmount)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Attente</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{formatCurrency(stats.pendingAmount)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Retard</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(stats.overdueAmount)}</div>
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
                placeholder="Rechercher par facture, commande, client..."
                value={localSearch}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filters.period} onValueChange={handlePeriodChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Période" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes périodes</SelectItem>
                <SelectItem value="today">Aujourd'hui</SelectItem>
                <SelectItem value="week">Cette semaine</SelectItem>
                <SelectItem value="month">Ce mois</SelectItem>
                <SelectItem value="year">Cette année</SelectItem>
              </SelectContent>
            </Select>
            <Select 
              value={filters.status.length > 0 ? filters.status[0] : 'all'} 
              onValueChange={handleStatusChange}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous statuts</SelectItem>
                <SelectItem value="paid">Payées</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="overdue">En retard</SelectItem>
                <SelectItem value="cancelled">Annulées</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.documentType}
              onValueChange={(value) => updateFilters({ documentType: value, page: 1 })}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous types</SelectItem>
                <SelectItem value="invoices">Factures</SelectItem>
                <SelectItem value="credit_notes">Avoirs</SelectItem>
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
      {selectedInvoices.length > 0 && (
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedInvoices.length === invoices.length}
                  onCheckedChange={() => {
                    if (selectedInvoices.length === invoices.length) {
                      clearSelection()
                    } else {
                      selectAllInvoices()
                    }
                  }}
                />
                <span className="text-sm font-medium">
                  {selectedInvoices.length} facture(s) sélectionnée(s)
                </span>
              </div>
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" />
                Exporter la sélection
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Liste des factures */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des Factures</CardTitle>
          <CardDescription>
            {invoices.length} facture(s) trouvée(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={invoices.length > 0 && selectedInvoices.length === invoices.length}
                      onCheckedChange={() => {
                        if (selectedInvoices.length === invoices.length) {
                          clearSelection()
                        } else {
                          selectAllInvoices()
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead>Facture</TableHead>
                  <TableHead>Émission</TableHead>
                  <TableHead>Échéance</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead className="text-right">Montant</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      Aucune facture trouvée
                    </TableCell>
                  </TableRow>
                ) : (
                  invoices.map((invoice) => {
                    const overdue = isOverdue(invoice)
                    
                    return (
                      <TableRow key={invoice.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedInvoices.includes(invoice.id)}
                            onCheckedChange={() => toggleInvoiceSelection(invoice.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{invoice.invoiceNumber}</div>
                          <div className="text-xs text-muted-foreground">
                            Cmd: {invoice.orderNumber}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{formatDate(invoice.issueDate)}</div>
                        </TableCell>
                        <TableCell>
                          <div className={`text-sm ${overdue ? 'text-red-600 font-medium' : ''}`}>
                            {formatDate(invoice.dueDate)}
                            {overdue && (
                              <AlertCircle className="w-3 h-3 inline ml-1 text-red-500" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{invoice.clientName}</div>
                          <div className="text-xs text-muted-foreground">{invoice.clientEmail}</div>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(invoice.totalAmount)}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={invoice.status} />
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => openPreviewModal(invoice)}
                              title="Aperçu"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleDownload(invoice.id)}
                              title="Télécharger"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => openSendModal(invoice)}
                              title="Envoyer par email"
                            >
                              <Mail className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {invoices.length > 0 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Affichage de {pagination.start + 1} à {pagination.end} sur {pagination.total} résultats
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(pagination.page - 1)}
                  disabled={pagination.page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Précédent
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={pagination.page === page ? 'default' : 'outline'}
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => goToPage(page)}
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
                >
                  Suivant
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de prévisualisation */}
      <Dialog open={isPreviewModalOpen} onOpenChange={setIsPreviewModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Aperçu de la Facture</DialogTitle>
            <DialogDescription>
              {selectedInvoice?.invoiceNumber}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            {selectedInvoice && (
              <div className="space-y-6 p-4 bg-white border rounded-lg">
                {/* En-tête facture */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">FACTURE</h2>
                    <div className="text-muted-foreground">{selectedInvoice.invoiceNumber}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">Pagne Tissé Distribution</div>
                    <div className="text-sm text-muted-foreground">
                      Dakar, Sénégal
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Dates et client */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">Dates</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Émission:</span>
                        <span>{formatDate(selectedInvoice.issueDate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Échéance:</span>
                        <span>{formatDate(selectedInvoice.dueDate)}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Client</h4>
                    <div className="space-y-1 text-sm">
                      <div className="font-medium">{selectedInvoice.clientName}</div>
                      <div>{selectedInvoice.clientEmail}</div>
                      <div className="text-muted-foreground">
                        {selectedInvoice.clientAddress.street}<br />
                        {selectedInvoice.clientAddress.postalCode} {selectedInvoice.clientAddress.city}<br />
                        {selectedInvoice.clientAddress.country}
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Articles */}
                <div>
                  <h4 className="font-medium mb-2">Articles</h4>
                  <div className="space-y-2">
                    {selectedInvoice.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div>
                          <div className="font-medium">{item.description}</div>
                          <div className="text-xs text-muted-foreground">
                            {item.quantity} × {formatCurrency(item.unitPrice)}
                          </div>
                        </div>
                        <div className="font-medium">
                          {formatCurrency(item.totalPrice)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Totaux */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Sous-total</span>
                    <span>{formatCurrency(selectedInvoice.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>TVA ({selectedInvoice.taxRate}%)</span>
                    <span>{formatCurrency(selectedInvoice.taxAmount)}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total</span>
                    <span>{formatCurrency(selectedInvoice.totalAmount)}</span>
                  </div>
                </div>

                {/* Statut de paiement */}
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Statut de paiement</div>
                      <StatusBadge status={selectedInvoice.status} />
                    </div>
                    {selectedInvoice.paymentMethod && (
                      <div className="text-sm text-right">
                        <div className="text-muted-foreground">Mode:</div>
                        <div>{selectedInvoice.paymentMethod}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={closePreviewModal}>
              Fermer
            </Button>
            {selectedInvoice && (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => openSendModal(selectedInvoice)}>
                  <Mail className="mr-2 h-4 w-4" />
                  Envoyer
                </Button>
                <Button onClick={() => handleDownload(selectedInvoice.id)}>
                  <Download className="mr-2 h-4 w-4" />
                  Télécharger PDF
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal d'envoi par email */}
      <Dialog open={isSendModalOpen} onOpenChange={setIsSendModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Envoyer la Facture</DialogTitle>
            <DialogDescription>
              Envoyer la facture {selectedInvoice?.invoiceNumber} par email
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="recipient">Destinataire</Label>
              <Input
                id="recipient"
                type="email"
                value={emailRecipient}
                onChange={(e) => setEmailRecipient(e.target.value)}
                placeholder="email@exemple.com"
              />
            </div>
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-sm">
                <div className="font-medium mb-2">Facture à envoyer:</div>
                <div>{selectedInvoice?.invoiceNumber}</div>
                <div className="text-muted-foreground">
                  Montant: {selectedInvoice && formatCurrency(selectedInvoice.totalAmount)}
                </div>
                <div className="text-muted-foreground">
                  Client: {selectedInvoice?.clientName}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeSendModal} disabled={isSending}>
              Annuler
            </Button>
            <Button onClick={handleSendEmail} disabled={isSending || !emailRecipient}>
              {isSending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Mail className="mr-2 h-4 w-4" />
              )}
              Envoyer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
