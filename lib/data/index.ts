import db from './db.json'

// Export all tables from the database
export const roles = db.roles
export const users = db.users
export const resellers = db.resellers
export const artisans = db.artisans
export const productTypes = db.product_types
export const categories = db.categories
export const products = db.products
export const productVariants = db.product_variants
export const units = db.units
export const prices = db.prices
export const stocks = db.stocks
export const orders = db.orders
export const orderItems = db.order_items
export const paymentMethods = db.payment_methods
export const payments = db.payments
export const deliveries = db.deliveries
export const invoices = db.invoices

// Home page data
export const features = db.features
export const homeCategories = db.home_categories
export const stats = db.stats
export const howItWorks = db.howItWorks

// Types
export type { User, Role, Reseller, Artisan } from './products'

// Helper to get users with their role names
export function getUsersWithRoles() {
  return users.map(user => ({
    ...user,
    role_name: roles.find(r => r.id === user.role_id)?.name || 'unknown',
  }))
}
