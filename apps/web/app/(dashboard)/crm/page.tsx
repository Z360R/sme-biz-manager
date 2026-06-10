'use client'

import { Box, Card, CardContent, Typography, Grid, Button, CircularProgress } from '@mui/material'
import PeopleIcon from '@mui/icons-material/People'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import FiberNewIcon from '@mui/icons-material/FiberNew'
import Link from 'next/link'
import { useCrmStats } from '@/hooks/useDeals'

function StatCard({ label, value, icon, color }: { label: string; value: number | string; icon: React.ReactNode; color: string }) {
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

export default function CrmDashboardPage() {
  const { data: stats, isLoading } = useCrmStats()

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>CRM Dashboard</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" component={Link} href="/crm/contacts">Contacts</Button>
          <Button variant="contained" component={Link} href="/crm/deals">Deals Board</Button>
        </Box>
      </Box>

      {isLoading ? (
        <CircularProgress />
      ) : (
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard label="Total Contacts" value={stats?.contacts.total ?? 0} icon={<PeopleIcon sx={{ fontSize: 40 }} />} color="#1976d2" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard label="Leads" value={stats?.deals.byStage.lead ?? 0} icon={<FiberNewIcon sx={{ fontSize: 40 }} />} color="#1976d2" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard label="Active Deals" value={stats?.deals.byStage.active ?? 0} icon={<TrendingUpIcon sx={{ fontSize: 40 }} />} color="#ed6c02" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard label="Closed" value={stats?.deals.byStage.closed ?? 0} icon={<CheckCircleIcon sx={{ fontSize: 40 }} />} color="#2e7d32" />
          </Grid>
        </Grid>
      )}
    </Box>
  )
}
