import { apiClient } from '@/lib/axios'
import type { User, ApiSuccess } from '@sme/shared'

export interface LoginResponse {
  accessToken: string
  user: User
}

export const authApi = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const { data } = await apiClient.post<ApiSuccess<LoginResponse>>('/auth/login', { email, password })
    return data.data
  },

  refresh: async (): Promise<LoginResponse> => {
    const { data } = await apiClient.post<ApiSuccess<LoginResponse>>('/auth/refresh')
    return data.data
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout')
  },

  me: async (): Promise<User> => {
    const { data } = await apiClient.get<ApiSuccess<User>>('/auth/me')
    return data.data
  },
}
