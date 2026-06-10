'use client'

import { Box } from '@mui/material'
import { Sidebar, SIDEBAR_WIDTH } from './Sidebar'
import type { ReactNode } from 'react'

export function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ml: `${SIDEBAR_WIDTH}px`,
          p: 3,
          bgcolor: 'grey.50',
          minHeight: '100vh',
        }}
      >
        {children}
      </Box>
    </Box>
  )
}
