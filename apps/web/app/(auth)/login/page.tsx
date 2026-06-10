import type { Metadata } from 'next'
import { Box, Typography } from '@mui/material'

export const metadata: Metadata = { title: 'Sign In' }

export default function LoginPage() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Typography variant="h5" color="text.secondary">
        Login form — Session 5
      </Typography>
    </Box>
  )
}
