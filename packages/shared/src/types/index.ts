export type UserRole = 'admin' | 'staff'

export interface User {
  id: number
  email: string
  role: UserRole
  createdAt: string
  updatedAt: string
}

export interface Contact {
  id: number
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  company: string | null
  createdBy: number | null
  deletedAt: string | null
  createdAt: string
  updatedAt: string
}

export type DealStage = 'lead' | 'active' | 'closed'

export interface Deal {
  id: number
  title: string
  contactId: number
  stage: DealStage
  value: number
  notes: string | null
  createdBy: number | null
  createdAt: string
  updatedAt: string
}

export interface DealActivity {
  id: number
  dealId: number
  userId: number | null
  action: string
  createdAt: string
}

export interface ContactNote {
  id: number
  contactId: number
  userId: number | null
  content: string
  createdAt: string
  updatedAt: string
}

export interface Product {
  id: number
  sku: string
  name: string
  category: string
  unitPrice: number
  stockQty: number
  lowStockThreshold: number
  deletedAt: string | null
  createdAt: string
  updatedAt: string
}

export type StockMovementType = 'stock_in' | 'stock_out'

export interface StockMovement {
  id: number
  productId: number
  type: StockMovementType
  qty: number
  reason: string
  userId: number | null
  createdAt: string
}

export type OrderStatus = 'pending' | 'fulfilled' | 'cancelled'

export interface Order {
  id: number
  contactId: number
  status: OrderStatus
  total: number
  createdBy: number | null
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  id: number
  orderId: number
  productId: number
  qty: number
  unitPrice: number
  subtotal: number
}

export interface OrderStatusHistory {
  id: number
  orderId: number
  status: OrderStatus
  changedBy: number | null
  changedAt: string
}

export interface ApiSuccess<T> {
  success: true
  data: T
}

export interface ApiError {
  success: false
  error: string
  code: string
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError

export interface PaginatedData<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
