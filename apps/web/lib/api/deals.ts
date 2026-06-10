import { apiClient } from '@/lib/axios'
import type { Deal, DealActivity, CreateDealDto, UpdateDealDto, PaginatedData, ApiSuccess } from '@sme/shared'

export const dealsApi = {
  getAll: async (params: { page: number; pageSize: number; stage?: string; contactId?: number }) => {
    const { data } = await apiClient.get<ApiSuccess<PaginatedData<Deal>>>('/deals', { params })
    return data.data
  },

  getById: async (id: number) => {
    const { data } = await apiClient.get<ApiSuccess<Deal>>(`/deals/${id}`)
    return data.data
  },

  create: async (dto: CreateDealDto) => {
    const { data } = await apiClient.post<ApiSuccess<Deal>>('/deals', dto)
    return data.data
  },

  update: async (id: number, dto: UpdateDealDto) => {
    const { data } = await apiClient.put<ApiSuccess<Deal>>(`/deals/${id}`, dto)
    return data.data
  },

  remove: async (id: number) => {
    await apiClient.delete(`/deals/${id}`)
  },

  getActivities: async (id: number) => {
    const { data } = await apiClient.get<ApiSuccess<DealActivity[]>>(`/deals/${id}/activities`)
    return data.data
  },
}

export const crmApi = {
  getStats: async () => {
    const { data } = await apiClient.get<ApiSuccess<{
      contacts: { total: number }
      deals: { total: number; byStage: { lead: number; active: number; closed: number } }
    }>>('/crm/stats')
    return data.data
  },
}
