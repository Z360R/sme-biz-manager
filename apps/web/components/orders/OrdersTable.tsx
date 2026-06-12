'use client'

import {
  Box, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TablePagination, Paper, Typography,
  CircularProgress, Chip, TextField, MenuItem, IconButton, Tooltip,
} from '@mui/material'
import VisibilityIcon from '@mui/icons-material/Visibility'
import { useState } from 'react'
import Link from 'next/link'
import type { OrderSummary } from '@/lib/api/orders'
import { useOrders } from '@/hooks/useOrders'
import { OrderForm } from './OrderForm'

const STATUS_COLORS = {
  pending: 'warning',
  fulfilled: 'success',
  cancelled: 'error',
} as const

export function OrdersTable() {
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(20)
  const [status, setStatus] = useState('')
  const [formOpen, setFormOpen] = useState(false)

  const { data, isLoading } = useOrders({ page: page + 1, pageSize, status })

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
        <TextField
          select
          label="Status"
          size="small"
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(0) }}
          sx={{ width: 160 }}
        >
          <MenuItem value="">All statuses</MenuItem>
          <MenuItem value="pending">Pending</MenuItem>
          <MenuItem value="fulfilled">Fulfilled</MenuItem>
          <MenuItem value="cancelled">Cancelled</MenuItem>
        </TextField>
        <Box sx={{ flex: 1 }} />
        <Button variant="contained" onClick={() => setFormOpen(true)}>+ New Order</Button>
      </Box>

      <Paper>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Order #</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Total</TableCell>
                <TableCell>Date</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && data?.items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">No orders found</Typography>
                  </TableCell>
                </TableRow>
              )}
              {data?.items.map((order: OrderSummary) => (
                <TableRow key={order.id} hover>
                  <TableCell sx={{ fontFamily: 'monospace' }}>#{order.id}</TableCell>
                  <TableCell>{order.contactName}</TableCell>
                  <TableCell>
                    <Chip
                      label={order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      size="small"
                      color={STATUS_COLORS[order.status]}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right">${order.total.toFixed(2)}</TableCell>
                  <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="View / Invoice">
                      <IconButton size="small" component={Link} href={`/orders/${order.id}`}>
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={data?.total ?? 0}
          page={page}
          rowsPerPage={pageSize}
          rowsPerPageOptions={[10, 20, 50]}
          onPageChange={(_, p) => setPage(p)}
          onRowsPerPageChange={(e) => { setPageSize(Number(e.target.value)); setPage(0) }}
        />
      </Paper>

      <OrderForm open={formOpen} onClose={() => setFormOpen(false)} />
    </Box>
  )
}
