"use client"

import { useState, useCallback } from "react"
import { useToast } from "@/components/ui/use-toast"
import {
  orders as ordersData,
  orderItems as orderItemsData,
  payments as paymentsData,
  deliveries as deliveriesData,
  resellers as resellersData,
  users as usersData,
  paymentMethods as paymentMethodsData,
} from "@/lib/data/index"
import type { Order, OrderItem, Payment, Delivery } from "@/lib/data/products"

// Extended types with relations
interface OrderWithRelations extends Order {
  reseller_name: string
  reseller_company: string
  customer_name: string
  customer_email: string
  customer_phone: string
  items_count: number
  payment_status: string
  delivery_status: string
  payment_date: string | null
}

interface OrderItemWithRelations extends OrderItem {
  product_name?: string
  variant_info?: string
}

interface OrderFilters {
  search?: string
  status?: string
  payment_method_id?: number
  start_date?: string
  end_date?: string
  min_amount?: number
  max_amount?: number
}

export type OrderStatus = "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded"

interface OrderStatistics {
  totalOrders: number
  pendingOrders: number
  processingOrders: number
  shippedOrders: number
  deliveredOrders: number
  cancelledOrders: number
  todayRevenue: number
  weekRevenue: number
  monthRevenue: number
  averageOrderValue: number
}

export function useOrders() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  // Get all orders with relations
  const getOrders = useCallback(async (): Promise<OrderWithRelations[]> => {
    setIsLoading(true)
    setError(null)
    
    try {
      await new Promise((resolve) => setTimeout(resolve, 300))

      const ordersList = ordersData || []
      const resellersList = resellersData || []
      const usersList = usersData || []
      const paymentsList = paymentsData || []
      const deliveriesList = deliveriesData || []

      const ordersWithRelations: OrderWithRelations[] = ordersList.map((order) => {
        const reseller = resellersList.find((r) => r.id === order.reseller_id)
        const user = usersList.find((u) => u.id === reseller?.user_id)
        const payment = paymentsList.find((p) => p.order_id === order.id)
        const delivery = deliveriesList.find((d) => d.order_id === order.id)

        const orderItemsList = orderItemsData?.filter((item) => item.order_id === order.id) || []

        return {
          ...order,
          reseller_name: user ? `${user.first_name} ${user.last_name}` : "Inconnu",
          reseller_company: reseller?.company_name || "N/A",
          customer_name: user ? `${user.first_name} ${user.last_name}` : "Inconnu",
          customer_email: user?.email || "N/A",
          customer_phone: user?.phone || "N/A",
          items_count: orderItemsList.length,
          payment_status: payment?.status || "pending",
          delivery_status: delivery?.status || "pending",
          payment_date: payment?.paid_at || null,
        }
      })

      return ordersWithRelations
    } catch {
      const errorMessage = "Erreur lors de la récupération des commandes"
      setError(errorMessage)
      toast({
        variant: "destructive",
        title: "Erreur",
        description: errorMessage,
      })
      return []
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  // Get order by ID
  const getOrderById = useCallback(async (id: number): Promise<OrderWithRelations | null> => {
    setIsLoading(true)
    setError(null)
    
    try {
      await new Promise((resolve) => setTimeout(resolve, 200))
      
      const ordersList = ordersData || []
      const order = ordersList.find((o: Order) => o.id === id)
      if (!order) return null

      const resellersList = resellersData || []
      const usersList = usersData || []
      const paymentsList = paymentsData || []
      const deliveriesList = deliveriesData || []
      const orderItemsList = orderItemsData || []

      const reseller = resellersList.find((r) => r.id === (order as Order).reseller_id)
      const user = usersList.find((u) => u.id === reseller?.user_id)
      const payment = paymentsList.find((p) => p.order_id === order.id)
      const delivery = deliveriesList.find((d) => d.order_id === order.id)
      const items = orderItemsList.filter((item: OrderItem) => item.order_id === order.id)

      return {
        ...order,
        reseller_name: user ? `${user.first_name} ${user.last_name}` : "Inconnu",
        reseller_company: reseller?.company_name || "N/A",
        customer_name: user ? `${user.first_name} ${user.last_name}` : "Inconnu",
        customer_email: user?.email || "N/A",
        customer_phone: user?.phone || "N/A",
        items_count: items.length,
        payment_status: payment?.status || "pending",
        delivery_status: delivery?.status || "pending",
        payment_date: payment?.paid_at || null,
      }
    } catch {
      setError("Erreur lors de la récupération de la commande")
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Get order items
  const getOrderItems = useCallback(async (orderId: number): Promise<OrderItemWithRelations[]> => {
    setIsLoading(true)
    setError(null)
    
    try {
      await new Promise((resolve) => setTimeout(resolve, 200))
      
      const orderItemsList = orderItemsData || []
      
      return orderItemsList
        .filter((item: OrderItem) => item.order_id === orderId)
        .map((item: OrderItem) => ({
          ...item,
          product_name: "Produit",
          variant_info: `${item.quantity} x ${item.unit_price.toLocaleString()} XOF`,
        }))
    } catch {
      setError("Erreur lors de la récupération des articles")
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Update order status
  const updateOrderStatus = useCallback(async (id: number, status: OrderStatus): Promise<boolean> => {
    setIsLoading(true)
    setError(null)
    
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))

      const ordersList = ordersData || []
      const order = ordersList.find((o: Order) => o.id === id)
      if (!order) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Commande non trouvée",
        })
        return false
      }

      toast({
        title: "Succès",
        description: `Le statut de la commande a été mis à jour vers "${status}"`,
      })
      
      return true
    } catch {
      const errorMessage = "Erreur lors de la mise à jour du statut"
      setError(errorMessage)
      toast({
        variant: "destructive",
        title: "Erreur",
        description: errorMessage,
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  // Cancel order
  const cancelOrder = useCallback(async (id: number, reason: string): Promise<boolean> => {
    setIsLoading(true)
    setError(null)
    
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))

      const ordersList = ordersData || []
      const order = ordersList.find((o: Order) => o.id === id)
      if (!order) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Commande non trouvée",
        })
        return false
      }

      toast({
        title: "Commande annulée",
        description: `La commande a été annulée. Motif: ${reason}`,
      })
      
      return true
    } catch {
      const errorMessage = "Erreur lors de l'annulation"
      setError(errorMessage)
      toast({
        variant: "destructive",
        title: "Erreur",
        description: errorMessage,
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  // Process refund
  const processRefund = useCallback(async (id: number, reason: string): Promise<boolean> => {
    setIsLoading(true)
    setError(null)
    
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))

      const ordersList = ordersData || []
      const order = ordersList.find((o: Order) => o.id === id)
      if (!order) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Commande non trouvée",
        })
        return false
      }

      toast({
        title: "Remboursement effectué",
        description: `Le remboursement a été traité.`,
      })
      
      return true
    } catch {
      const errorMessage = "Erreur lors du remboursement"
      setError(errorMessage)
      toast({
        variant: "destructive",
        title: "Erreur",
        description: errorMessage,
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  // Get statistics
  const getStatistics = useCallback(async (): Promise<OrderStatistics> => {
    const allOrders = await getOrders()
    const today = new Date()
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

    const totalOrders = allOrders.length
    const pendingOrders = allOrders.filter((o) => o.status === "pending").length
    const processingOrders = allOrders.filter((o) => o.status === "processing").length
    const shippedOrders = allOrders.filter((o) => o.status === "shipped").length
    const deliveredOrders = allOrders.filter((o) => o.status === "delivered").length
    const cancelledOrders = allOrders.filter((o) => o.status === "cancelled").length

    const todayRevenue = allOrders
      .filter((o) => new Date(o.created_at) >= today && o.status !== "cancelled")
      .reduce((sum, o) => sum + o.total_amount, 0)

    const weekRevenue = allOrders
      .filter((o) => new Date(o.created_at) >= weekAgo && o.status !== "cancelled")
      .reduce((sum, o) => sum + o.total_amount, 0)

    const monthRevenue = allOrders
      .filter((o) => new Date(o.created_at) >= monthAgo && o.status !== "cancelled")
      .reduce((sum, o) => sum + o.total_amount, 0)

    const averageOrderValue = totalOrders > 0
      ? allOrders
          .filter((o) => o.status !== "cancelled")
          .reduce((sum, o) => sum + o.total_amount, 0) / totalOrders
      : 0

    return {
      totalOrders,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      todayRevenue,
      weekRevenue,
      monthRevenue,
      averageOrderValue,
    }
  }, [getOrders])

  // Export orders to CSV
  const exportToCSV = useCallback(() => {
    const ordersList = ordersData || []
    
    const csvContent = [
      ["ID", "Numéro", "Client", "Email", "Téléphone", "Société", "Montant", "Statut", "Paiement", "Livraison", "Date"].join(","),
      ...ordersList.map((order: Order) => {
        const resellersList = resellersData || []
        const usersList = usersData || []
        const paymentsList = paymentsData || []
        
        const reseller = resellersList.find((r) => r.id === order.reseller_id)
        const user = usersList.find((u) => u.id === reseller?.user_id)
        const payment = paymentsList.find((p) => p.order_id === order.id)

        return [
          order.id,
          order.order_number,
          user ? `${user.first_name} ${user.last_name}` : "",
          user?.email || "",
          user?.phone || "",
          reseller?.company_name || "",
          order.total_amount,
          order.status,
          payment?.status || "pending",
          "delivered",
          new Date(order.created_at).toLocaleDateString("fr-FR"),
        ].join(",")
      }),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `commandes_export_${new Date().toISOString().split("T")[0]}.csv`
    link.click()

    toast({
      title: "Export réussi",
      description: "La liste des commandes a été exportée en CSV",
    })
  }, [toast])

  return {
    isLoading,
    error,
    getOrders,
    getOrderById,
    getOrderItems,
    updateOrderStatus,
    cancelOrder,
    processRefund,
    getStatistics,
    exportToCSV,
    paymentMethods: paymentMethodsData || [],
  }
}

// Export types
export type {
  OrderWithRelations,
  OrderItemWithRelations,
  OrderFilters,
  OrderStatistics,
}
