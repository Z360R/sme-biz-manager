'use client'

import { Box, Typography } from '@mui/material'
import { ProductsTable } from '@/components/inventory/ProductsTable'

export default function ProductsPage() {
  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>Products</Typography>
      <ProductsTable />
    </Box>
  )
}
