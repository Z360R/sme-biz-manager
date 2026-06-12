import { apiClient } from '@/lib/axios'
import type { ApiSuccess, PaginatedData } from '@sme/shared'
import type { CreateOrderDto } from '@sme/shared'

export interface OrderSummary {
  id: number
  contactId: number
  contactName: string
  status: 'pending' | 'fulfilled' | 'cancelled'
  total: number
  createdBy: number | null
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  id: number
  productId: number
  productName: string
  productSku: string
  qty: number
  unitPrice: number
  subtotal: number
}

export interface OrderWithDetails extends OrderSummary {
  contactEmail: string | null
  contactCompany: string | null
  items: OrderItem[]
  statusHistory: Array<{
    id: number
    orderId: number
    status: string
    changedBy: number | null
    changedAt: string
  }>
}

export interface OrderStats {
  totalOrders: number
  pendingCount: number
  fulfilledCount: number
  cancelledCount: number
  totalRevenue: number
}

export const ordersApi = {
  getAll: async (params: { page: number; pageSize: number; status?: string }) => {
    const { data } = await apiClient.get<ApiSuccess<PaginatedData<OrderSummary>>>('/orders', { params })
    return data.data
  },

  getById: async (id: number) => {
    const { data } = await apiClient.get<ApiSuccess<OrderWithDetails>>(`/orders/${id}`)
    return data.data
  },

  create: async (dto: CreateOrderDto) => {
    const { data } = await apiClient.post<ApiSuccess<OrderWithDetails>>('/orders', dto)
    return data.data
  },

  updateStatus: async (id: number, status: 'fulfilled' | 'cancelled') => {
    const { data } = await apiClient.put<ApiSuccess<OrderWithDetails>>(`/orders/${id}/status`, { status })
    return data.data
  },

  getStats: async () => {
    const { data } = await apiClient.get<ApiSuccess<OrderStats>>('/orders/stats')
    return data.data
  },
}
