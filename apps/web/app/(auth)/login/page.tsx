'use client'

import {
  Box, Card, CardContent, TextField, Button, Typography,
  Stack, Alert, InputAdornment, IconButton,
} from '@mui/material'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import DashboardIcon from '@mui/icons-material/Dashboard'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema } from '@sme/shared'
import type { LoginDto } from '@sme/shared'
import { useLogin } from '@/hooks/useAuth'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const login = useLogin()
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<LoginDto>({
    resolver: zodResolver(loginSchema),
  })

  function onSubmit(data: LoginDto) {
    login.mutate(
      { email: data.email, password: data.password },
      { onSuccess: () => router.replace('/crm') }
    )
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'grey.50',
      }}
    >
      <Card sx={{ width: 400, boxShadow: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <DashboardIcon color="primary" sx={{ fontSize: 28 }} />
            <Typography variant="h6" fontWeight={700} color="primary">SME Manager</Typography>
          </Box>

          <Typography variant="h5" fontWeight={700} gutterBottom>Sign in</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Demo: admin@demo.com / Demo@1234
          </Typography>

          {login.isError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {(login.error as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Login failed'}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <Stack spacing={2}>
              <TextField
                label="Email"
                type="email"
                fullWidth
                required
                size="small"
                autoComplete="email"
                {...register('email')}
                error={!!errors.email}
                helperText={errors.email?.message}
              />
              <TextField
                label="Password"
                type={showPassword ? 'text' : 'password'}
                fullWidth
                required
                size="small"
                autoComplete="current-password"
                {...register('password')}
                error={!!errors.password}
                helperText={errors.password?.message}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setShowPassword((v) => !v)}>
                        {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={login.isPending}
              >
                {login.isPending ? 'Signing in…' : 'Sign in'}
              </Button>
            </Stack>
          </form>
        </CardContent>
      </Card>
    </Box>
  )
}
