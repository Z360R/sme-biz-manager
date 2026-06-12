'use client'

import { Box, Typography, Grid, Card, CardContent, CircularProgress } from '@mui/material'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import PendingIcon from '@mui/icons-material/Pending'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import { useOrderStats } from '@/hooks/useOrders'
import { OrdersTable } from '@/components/orders/OrdersTable'

function StatCard({ label, value, icon, color }: {
  label: string; value: number | string; icon: React.ReactNode; color: string
}) {
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h5" fontWeight={700}>{value}</Typography>
            <Typography variant="body2" color="text.secondary">{label}</Typography>
          </Box>
          <Box sx={{ color, opacity: 0.8 }}>{icon}</Box>
        </Box>
      </CardContent>
    </Card>
  )
}

export default function OrdersPage() {
  const { data: stats, isLoading } = useOrderStats()

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>Orders</Typography>

      {isLoading ? <CircularProgress sx={{ mb: 3 }} /> : (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={3}>
            <StatCard label="Total Orders" value={stats?.totalOrders ?? 0} icon={<ShoppingCartIcon sx={{ fontSize: 36 }} />} color="#1976d2" />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatCard label="Pending" value={stats?.pendingCount ?? 0} icon={<PendingIcon sx={{ fontSize: 36 }} />} color="#ed6c02" />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatCard label="Fulfilled" value={stats?.fulfilledCount ?? 0} icon={<CheckCircleIcon sx={{ fontSize: 36 }} />} color="#2e7d32" />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatCard
              label="Revenue"
              value={`$${(stats?.totalRevenue ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              icon={<AttachMoneyIcon sx={{ fontSize: 36 }} />}
              color="#7b1fa2"
            />
          </Grid>
        </Grid>
      )}

      <OrdersTable />
    </Box>
  )
}
