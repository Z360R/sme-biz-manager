'use client'

import { Box, Typography, CircularProgress } from '@mui/material'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'
import { useInventoryStats } from '@/hooks/useProducts'

export function StockChart() {
  const { data: stats, isLoading } = useInventoryStats()

  if (isLoading) return <CircularProgress size={24} />

  const chartData = stats?.chart ?? []

  if (chartData.length === 0) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
        <Typography color="text.secondary">No stock movements in the last 7 days</Typography>
      </Box>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
        <Tooltip />
        <Legend wrapperStyle={{ fontSize: 13 }} />
        <Bar dataKey="stock_in" name="Stock In" fill="#2e7d32" radius={[3, 3, 0, 0]} />
        <Bar dataKey="stock_out" name="Stock Out" fill="#c62828" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
