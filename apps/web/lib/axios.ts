import axios from 'axios'
import type { User } from '@sme/shared'
import { useAuthStore } from '@/store/authStore'

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

// Attach AT to every outgoing request
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// On 401: attempt silent refresh → replay request; on failure → redirect to login
let isRefreshing = false
let subscribers: ((token: string) => void)[] = []

function addSubscriber(cb: (token: string) => void) {
  subscribers.push(cb)
}

function notifySubscribers(token: string) {
  subscribers.forEach((cb) => cb(token))
  subscribers = []
}

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config

    // Skip if this is already a retry or a refresh request itself
    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise((resolve) => {
        addSubscriber((token) => {
          original.headers.Authorization = `Bearer ${token}`
          resolve(apiClient(original))
        })
      })
    }

    original._retry = true
    isRefreshing = true

    try {
      const { data } = await apiClient.post<{ success: true; data: { accessToken: string; user: unknown } }>(
        '/auth/refresh'
      )
      const newToken = data.data.accessToken
      useAuthStore.getState().setAuth(newToken, data.data.user as User)
      notifySubscribers(newToken)
      original.headers.Authorization = `Bearer ${newToken}`
      return apiClient(original)
    } catch {
      useAuthStore.getState().clearAuth()
      if (typeof window !== 'undefined') window.location.href = '/login'
      return Promise.reject(error)
    } finally {
      isRefreshing = false
    }
  }
)
