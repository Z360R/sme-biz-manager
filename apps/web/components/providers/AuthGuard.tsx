'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Box, CircularProgress } from '@mui/material'
import { authApi } from '@/lib/api/auth'
import { useAuthStore } from '@/store/authStore'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const [checking, setChecking] = useState(true)
  const { accessToken, setAuth, clearAuth } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (accessToken) {
      setChecking(false)
      return
    }

    authApi
      .refresh()
      .then(({ accessToken: token, user }) => {
        setAuth(token, user)
        setChecking(false)
      })
      .catch(() => {
        clearAuth()
        router.replace('/login')
      })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (checking) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  return <>{children}</>
}
