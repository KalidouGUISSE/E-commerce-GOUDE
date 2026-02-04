"use client"

import React, { useState, useEffect, useCallback } from "react"
import {
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  FileText,
  XCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Loader2,
  Calendar,
  DollarSign,
  Package,
  Truck,
  CheckCircle,
  Clock,
  X,
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
import { useToast } from "@/components/ui/use-toast"
import {
  useOrders,
  type OrderWithRelations,
  type OrderItemWithRelations,
  type OrderStatus,
} from "@/hooks/use-orders"
import { cn } from "@/lib/utils"

// Constants
const ITEMS_PER_PAGE = 10

type SortDirection = "asc" | "desc"
type SortField = "id" | "order_number" | "total_amount" | "status" | "created_at"

const ORDER_STATUSES: { value: OrderStatus; label: string; color: string }[] = [
  { value: "pending", label: "En attente", color: "bg-amber-100 text-amber-800" },
  { value: "confirmed", label: "Confirmée", color: "bg-blue-100 text-blue-800" },
  { value: "processing", label: "En préparation", color: "bg-purple-100 text-purple-800" },
  { value: "shipped", label: "Expédiée", color: "bg-indigo-100 text-indigo-800" },
  { value: "delivered", label: "Livrée", color: "bg-green-100 text-green-800" },
  { value: "cancelled", label: "Annulée", color: "bg-red-100 text-red-800" },
  { value: "refunded", label: "Remboursée", color: "bg-gray-100 text-gray-800" },
]

export default function OrdersManagementPage() {
  const {
    getOrders,
    getOrderById,
    getOrderItems,
    updateOrderStatus,
    cancelOrder,
    processRefund,
    getStatistics,
    exportToCSV,
    isLoading,
    paymentMethods,
  } = useOrders()
  const { toast } = useToast()

  // State
  const [orders, setOrders] = useState<OrderWithRelations[]>([])
  const [filteredOrders, setFilteredOrders] = useState<OrderWithRelations[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState<SortField>("created_at")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [showFilters, setShowFilters] = useState(false)

  // Filters state
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>("all")
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: "", end: "" })

  // Statistics
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    processingOrders: 0,
    shippedOrders: 0,
    deliveredOrders: 0,
    cancelledOrders: 0,
    todayRevenue: 0,
    weekRevenue: 0,
    monthRevenue: 0,
    averageOrderValue: 0,
  })

  // Dialog states
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)
  const [isRefundDialogOpen, setIsRefundDialogOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<OrderWithRelations | null>(null)
  const [orderItems, setOrderItems] = useState<OrderItemWithRelations[]>([])
  const [newStatus, setNewStatus] = useState<OrderStatus>("pending")
  const [cancelReason, setCancelReason] = useState("")
  const [refundReason, setRefundReason] = useState("")

  // Load orders
  const loadOrders = useCallback(async () => {
    const data = await getOrders()
    setOrders(data)
    setFilteredOrders(data)
  }, [getOrders])

  useEffect(() => {
    loadOrders()
  }, [loadOrders])

  // Load statistics
  useEffect(() => {
    const loadStats = async () => {
      const statistics = await getStatistics()
      setStats(statistics)
    }
    loadStats()
  }, [getStatistics])

  // Filter and sort orders
  useEffect(() => {
    let result = [...orders]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (order) =>
          order.order_number.toLowerCase().includes(query) ||
          order.customer_name.toLowerCase().includes(query) ||
          order.customer_email.toLowerCase().includes(query) ||
          order.reseller_company.toLowerCase().includes(query)
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((o) => o.status === statusFilter)
    }

    // Payment method filter
    if (paymentMethodFilter !== "all") {
      result = result.filter((o) => o.payment_status === paymentMethodFilter)
    }

    // Date range filter
    if (dateRange.start) {
      const startDate = new Date(dateRange.start)
      result = result.filter((o) => new Date(o.created_at) >= startDate)
    }
    if (dateRange.end) {
      const endDate = new Date(dateRange.end)
      result = result.filter((o) => new Date(o.created_at) <= endDate)
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

    setFilteredOrders(result)
    setCurrentPage(1)
  }, [orders, searchQuery, statusFilter, paymentMethodFilter, dateRange, sortField, sortDirection])

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + ITEMS_PER_PAGE)

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
    setStatusFilter("all")
    setPaymentMethodFilter("all")
    setDateRange({ start: "", end: "" })
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
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusConfig = ORDER_STATUSES.find((s) => s.value === status)
    return (
      <Badge className={cn(statusConfig?.color || "bg-gray-100")}>
        {statusConfig?.label || status}
      </Badge>
    )
  }

  // Handle view order
  const handleViewOrder = async (order: OrderWithRelations) => {
    setSelectedOrder(order)
    const items = await getOrderItems(order.id)
    setOrderItems(items)
    setIsViewDialogOpen(true)
  }

  // Handle status change
  const handleOpenStatusDialog = (order: OrderWithRelations) => {
    setSelectedOrder(order)
    setNewStatus(order.status as OrderStatus)
    setIsStatusDialogOpen(true)
  }

  const handleSubmitStatusChange = async () => {
    if (!selectedOrder) return

    const success = await updateOrderStatus(selectedOrder.id, newStatus)
    if (success) {
      setIsStatusDialogOpen(false)
      loadOrders()
    }
  }

  // Handle cancel order
  const handleOpenCancelDialog = (order: OrderWithRelations) => {
    setSelectedOrder(order)
    setCancelReason("")
    setIsCancelDialogOpen(true)
  }

  const handleSubmitCancel = async () => {
    if (!selectedOrder || !cancelReason.trim()) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez fournir un motif d'annulation",
      })
      return
    }

    const success = await cancelOrder(selectedOrder.id, cancelReason)
    if (success) {
      setIsCancelDialogOpen(false)
      loadOrders()
    }
  }

  // Handle refund
  const handleOpenRefundDialog = (order: OrderWithRelations) => {
    setSelectedOrder(order)
    setRefundReason("")
    setIsRefundDialogOpen(true)
  }

  const handleSubmitRefund = async () => {
    if (!selectedOrder || !refundReason.trim()) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez fournir un motif de remboursement",
      })
      return
    }

    const success = await processRefund(selectedOrder.id, refundReason)
    if (success) {
      setIsRefundDialogOpen(false)
      loadOrders()
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
          <h1 className="text-2xl font-bold">Gestion des Commandes</h1>
          <p className="text-muted-foreground">
            Suivez et gérez toutes les commandes de la plateforme
          </p>
        </div>
        <Button variant="outline" onClick={exportToCSV}>
          <Download className="mr-2 h-4 w-4" />
          Exporter CSV
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Commandes aujourd'hui"
          value={stats.totalOrders}
          icon={Package}
          color="bg-blue-100 text-blue-600"
        />
        <StatCard
          title="Revenus aujourd'hui"
          value={formatCurrency(stats.todayRevenue)}
          icon={DollarSign}
          color="bg-green-100 text-green-600"
        />
        <StatCard
          title="En attente"
          value={stats.pendingOrders}
          icon={Clock}
          color="bg-amber-100 text-amber-600"
          onClick={() => setStatusFilter("pending")}
        />
        <StatCard
          title="Livrées"
          value={stats.deliveredOrders}
          icon={CheckCircle}
          color="bg-green-100 text-green-600"
          onClick={() => setStatusFilter("delivered")}
        />
      </div>

      {/* Additional Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Revenus de la semaine"
          value={formatCurrency(stats.weekRevenue)}
          icon={Calendar}
          color="bg-purple-100 text-purple-600"
        />
        <StatCard
          title="Revenus du mois"
          value={formatCurrency(stats.monthRevenue)}
          icon={Calendar}
          color="bg-indigo-100 text-indigo-600"
        />
        <StatCard
          title="Panier moyen"
          value={formatCurrency(stats.averageOrderValue)}
          icon={DollarSign}
          color="bg-gray-100 text-gray-600"
        />
      </div>

      {/* Filters & Search */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Rechercher par numéro, client, email..."
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
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label>Statut</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les statuts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    {ORDER_STATUSES.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Mode de paiement</Label>
                <Select value={paymentMethodFilter} onValueChange={setPaymentMethodFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tous" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    {paymentMethods.map((method) => (
                      <SelectItem key={method.id} value={method.name}>
                        {method.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Date de début</Label>
                <Input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Date de fin</Label>
                <Input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button variant="ghost" onClick={resetFilters}>
                Réinitialiser les filtres
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader className="border-b">
          <CardTitle>
            Commandes ({filteredOrders.length})
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
                        onClick={() => handleSort("order_number")}
                        className="flex items-center gap-1 font-medium"
                      >
                        Commande
                        <ArrowUpDown className="h-3 w-3" />
                      </Button>
                    </th>
                    <th className="px-4 py-3 text-left">Client</th>
                    <th className="px-4 py-3 text-center">Articles</th>
                    <th className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSort("total_amount")}
                        className="flex items-center gap-1 font-medium"
                      >
                        Montant
                        <ArrowUpDown className="h-3 w-3" />
                      </Button>
                    </th>
                    <th className="px-4 py-3 text-center">Statut</th>
                    <th className="px-4 py-3 text-center">Paiement</th>
                    <th className="px-4 py-3 text-left">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSort("created_at")}
                        className="flex items-center gap-1 font-medium"
                      >
                        Date
                        <ArrowUpDown className="h-3 w-3" />
                      </Button>
                    </th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b transition-colors hover:bg-muted/50"
                    >
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium">{order.order_number}</p>
                          <p className="text-sm text-muted-foreground">
                            {order.reseller_company}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium">{order.customer_name}</p>
                          <p className="text-sm text-muted-foreground truncate max-w-[150px]">
                            {order.customer_email}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant="outline">{order.items_count}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        {formatCurrency(order.total_amount)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge
                          variant={
                            order.payment_status === "completed"
                              ? "default"
                              : order.payment_status === "pending"
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {order.payment_status === "completed" ? "Payé" : "En attente"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-sm">
                        {formatDate(order.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewOrder(order)}
                            className="h-8 w-8"
                            title="Voir détails"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenStatusDialog(order)}
                            className="h-8 w-8"
                            title="Modifier statut"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {order.status !== "cancelled" && order.status !== "refunded" && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleOpenCancelDialog(order)}
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                title="Annuler"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                              {order.payment_status === "completed" && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleOpenRefundDialog(order)}
                                  className="h-8 w-8"
                                  title="Rembourser"
                                >
                                  <RefreshCw className="h-4 w-4" />
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {paginatedOrders.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-muted-foreground">
                        Aucune commande trouvée
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
                Affichage de {startIndex + 1} à {Math.min(startIndex + ITEMS_PER_PAGE, filteredOrders.length)} sur {filteredOrders.length} commandes
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

      {/* View Order Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Détails de la commande {selectedOrder?.order_number}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <Tabs defaultValue="details" className="mt-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Détails</TabsTrigger>
                <TabsTrigger value="items">Articles</TabsTrigger>
                <TabsTrigger value="payment">Paiement</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Client</h4>
                    <p className="font-medium">{selectedOrder.customer_name}</p>
                    <p className="text-sm">{selectedOrder.customer_email}</p>
                    <p className="text-sm">{selectedOrder.customer_phone}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Société</h4>
                    <p className="font-medium">{selectedOrder.reseller_company}</p>
                  </div>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Statut</h4>
                    {getStatusBadge(selectedOrder.status)}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Date</h4>
                    <p>{formatDate(selectedOrder.created_at)}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Statut paiement</h4>
                    <Badge
                      variant={
                        selectedOrder.payment_status === "completed"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {selectedOrder.payment_status === "completed" ? "Payé" : "En attente"}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Livraison</h4>
                    <Badge variant="outline">{selectedOrder.delivery_status}</Badge>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="items" className="mt-4">
                <div className="space-y-3">
                  {orderItems.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div>
                        <p className="font-medium">{item.product_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.variant_info}
                        </p>
                      </div>
                      <p className="font-medium">
                        {formatCurrency(item.total_price)}
                      </p>
                    </div>
                  ))}
                </div>
                <Separator className="my-4" />
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>{formatCurrency(selectedOrder.total_amount)}</span>
                </div>
              </TabsContent>
              
              <TabsContent value="payment" className="mt-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Montant total</span>
                    <span className="font-medium">
                      {formatCurrency(selectedOrder.total_amount)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Statut paiement</span>
                    <Badge
                      variant={
                        selectedOrder.payment_status === "completed"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {selectedOrder.payment_status === "completed" ? "Payé" : "En attente"}
                    </Badge>
                  </div>
                  {selectedOrder.payment_date && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Date paiement</span>
                      <span>{formatDate(selectedOrder.payment_date)}</span>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Fermer
            </Button>
            <Button variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Générer facture
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Status Change Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le statut</DialogTitle>
            <DialogDescription>
              Command: {selectedOrder?.order_number}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nouveau statut</Label>
              <Select value={newStatus} onValueChange={(v) => setNewStatus(v as OrderStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ORDER_STATUSES.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSubmitStatusChange} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Order Dialog */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Annuler la commande</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir annuler la commande {selectedOrder?.order_number} ?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Motif d'annulation *</Label>
              <Textarea
                placeholder="Veuillez fournir le motif de l'annulation..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCancelDialogOpen(false)}>
              Retour
            </Button>
            <Button
              variant="destructive"
              onClick={handleSubmitCancel}
              disabled={isLoading || !cancelReason.trim()}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirmer l'annulation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Refund Dialog */}
      <Dialog open={isRefundDialogOpen} onOpenChange={setIsRefundDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Effectuer un remboursement</DialogTitle>
            <DialogDescription>
              Remboursement pour la commande {selectedOrder?.order_number}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="rounded-lg bg-muted p-3">
              <p className="text-sm text-muted-foreground">Montant à rembourser</p>
              <p className="text-xl font-bold">
                {selectedOrder && formatCurrency(selectedOrder.total_amount)}
              </p>
            </div>
            <div className="space-y-2">
              <Label>Motif du remboursement *</Label>
              <Textarea
                placeholder="Veuillez fournir le motif du remboursement..."
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRefundDialogOpen(false)}>
              Retour
            </Button>
            <Button
              variant="default"
              onClick={handleSubmitRefund}
              disabled={isLoading || !refundReason.trim()}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirmer le remboursement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
