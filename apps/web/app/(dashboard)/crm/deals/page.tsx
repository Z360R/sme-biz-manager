import type { Metadata } from 'next'
import { Box, Typography } from '@mui/material'
import { DealKanban } from '@/components/crm/DealKanban'

export const metadata: Metadata = { title: 'Deals' }

export default function DealsPage() {
  return (
    <Box>
      <Typography variant="h5" fontWeight={700} gutterBottom>Deals Board</Typography>
      <DealKanban />
    </Box>
  )
}
