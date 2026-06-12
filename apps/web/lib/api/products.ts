import { apiClient } from '@/lib/axios'
import type {
  Product, StockMovement,
  CreateProductDto, UpdateProductDto,
  PaginatedData, ApiSuccess,
} from '@sme/shared'
import type { StockMovementDto } from '@sme/shared'

export interface InventoryStats {
  totalProducts: number
  totalStockValue: number
  lowStockCount: number
  chart: { date: string; stock_in: number; stock_out: number }[]
}

type MovementBody = Omit<StockMovementDto, 'productId'>

export const productsApi = {
  getAll: async (params: { page: number; pageSize: number; search?: string; category?: string }) => {
    const { data } = await apiClient.get<ApiSuccess<PaginatedData<Product>>>('/products', { params })
    return data.data
  },

  getById: async (id: number) => {
    const { data } = await apiClient.get<ApiSuccess<Product>>(`/products/${id}`)
    return data.data
  },

  create: async (dto: CreateProductDto) => {
    const { data } = await apiClient.post<ApiSuccess<Product>>('/products', dto)
    return data.data
  },

  update: async (id: number, dto: UpdateProductDto) => {
    const { data } = await apiClient.put<ApiSuccess<Product>>(`/products/${id}`, dto)
    return data.data
  },

  remove: async (id: number) => {
    await apiClient.delete(`/products/${id}`)
  },

  getCategories: async () => {
    const { data } = await apiClient.get<ApiSuccess<string[]>>('/products/categories')
    return data.data
  },

  getMovements: async (productId: number) => {
    const { data } = await apiClient.get<ApiSuccess<StockMovement[]>>(`/products/${productId}/movements`)
    return data.data
  },

  createMovement: async (productId: number, dto: MovementBody) => {
    const { data } = await apiClient.post<ApiSuccess<StockMovement>>(`/products/${productId}/movements`, dto)
    return data.data
  },

  getInventoryStats: async () => {
    const { data } = await apiClient.get<ApiSuccess<InventoryStats>>('/inventory/stats')
    return data.data
  },
}
