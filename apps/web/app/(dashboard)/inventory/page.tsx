'use client'

import { Box, Card, CardContent, Typography, Grid, Button, CircularProgress } from '@mui/material'
import InventoryIcon from '@mui/icons-material/Inventory'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import Link from 'next/link'
import { useInventoryStats } from '@/hooks/useProducts'
import { StockChart } from '@/components/inventory/StockChart'

function StatCard({ label, value, icon, color }: {
  label: string
  value: number | string
  icon: React.ReactNode
  color: string
}) {
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h4" fontWeight={700}>{value}</Typography>
            <Typography variant="body2" color="text.secondary">{label}</Typography>
          </Box>
          <Box sx={{ color, opacity: 0.8 }}>{icon}</Box>
        </Box>
      </CardContent>
    </Card>
  )
}

export default function InventoryDashboardPage() {
  const { data: stats, isLoading } = useInventoryStats()

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>Inventory Dashboard</Typography>
        <Button variant="contained" component={Link} href="/inventory/products">
          Manage Products
        </Button>
      </Box>

      {isLoading ? (
        <CircularProgress />
      ) : (
        <>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={4}>
              <StatCard
                label="Total Products"
                value={stats?.totalProducts ?? 0}
                icon={<InventoryIcon sx={{ fontSize: 40 }} />}
                color="#1976d2"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <StatCard
                label="Total Stock Value"
                value={`$${(stats?.totalStockValue ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                icon={<AttachMoneyIcon sx={{ fontSize: 40 }} />}
                color="#2e7d32"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <StatCard
                label="Low Stock Items"
                value={stats?.lowStockCount ?? 0}
                icon={<WarningAmberIcon sx={{ fontSize: 40 }} />}
                color="#ed6c02"
              />
            </Grid>
          </Grid>

          <Card>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                Stock Movements — Last 7 Days
              </Typography>
              <StockChart />
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  )
}
