import axios from 'axios'

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

// Request interceptor (attach AT) and response interceptor (handle 401 + refresh)
// are added in Session 5 when the auth module is built.
