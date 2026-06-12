'use client'

import {
  Box, Typography, Card, CardContent, Grid, Chip, Divider,
  Table, TableHead, TableRow, TableCell, TableBody, Button,
  CircularProgress, Stack, Alert,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import PrintIcon from '@mui/icons-material/Print'
import Link from 'next/link'
import { useOrder, useUpdateOrderStatus } from '@/hooks/useOrders'

const STATUS_COLORS = {
  pending: 'warning',
  fulfilled: 'success',
  cancelled: 'error',
} as const

interface Props {
  orderId: number
}

export function OrderDetail({ orderId }: Props) {
  const { data: order, isLoading } = useOrder(orderId)
  const updateStatus = useUpdateOrderStatus()

  if (isLoading) return <CircularProgress />
  if (!order) return <Alert severity="error">Order not found</Alert>

  const canFulfil = order.status === 'pending'
  const canCancel = order.status === 'pending'

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button component={Link} href="/orders" startIcon={<ArrowBackIcon />} variant="outlined" size="small">
          Orders
        </Button>
        <Typography variant="h5" fontWeight={700} sx={{ flex: 1 }}>
          Order #{order.id}
        </Typography>
        <Button
          startIcon={<PrintIcon />}
          size="small"
          variant="outlined"
          onClick={() => window.print()}
        >
          Print
        </Button>
        {canFulfil && (
          <Button
            variant="contained"
            color="success"
            size="small"
            disabled={updateStatus.isPending}
            onClick={() => updateStatus.mutate({ id: order.id, status: 'fulfilled' })}
          >
            Mark Fulfilled
          </Button>
        )}
        {canCancel && (
          <Button
            variant="outlined"
            color="error"
            size="small"
            disabled={updateStatus.isPending}
            onClick={() => {
              if (window.confirm('Cancel this order?')) {
                updateStatus.mutate({ id: order.id, status: 'cancelled' })
              }
            }}
          >
            Cancel
          </Button>
        )}
      </Box>

      <Grid container spacing={3}>
        {/* Order info */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>Order Info</Typography>
              <Stack spacing={1}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Status</Typography>
                  <Chip
                    label={order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    size="small"
                    color={STATUS_COLORS[order.status]}
                  />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Date</Typography>
                  <Typography variant="body2">{new Date(order.createdAt).toLocaleString()}</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Contact */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>Bill To</Typography>
              <Typography fontWeight={600}>{order.contactName}</Typography>
              {order.contactCompany && <Typography variant="body2">{order.contactCompany}</Typography>}
              {order.contactEmail && <Typography variant="body2" color="text.secondary">{order.contactEmail}</Typography>}
            </CardContent>
          </Card>
        </Grid>

        {/* Line items */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>Line Items</Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>SKU</TableCell>
                    <TableCell>Product</TableCell>
                    <TableCell align="right">Qty</TableCell>
                    <TableCell align="right">Unit Price</TableCell>
                    <TableCell align="right">Subtotal</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {order.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: 13 }}>{item.productSku}</TableCell>
                      <TableCell>{item.productName}</TableCell>
                      <TableCell align="right">{item.qty}</TableCell>
                      <TableCell align="right">${item.unitPrice.toFixed(2)}</TableCell>
                      <TableCell align="right">${item.subtotal.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={3} />
                    <TableCell align="right">
                      <Typography fontWeight={700}>Total</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography fontWeight={700}>${order.total.toFixed(2)}</Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>

        {/* Status history */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>Status History</Typography>
              <Stack spacing={1} divider={<Divider />}>
                {order.statusHistory.map((h) => (
                  <Box key={h.id} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                    <Chip
                      label={h.status.charAt(0).toUpperCase() + h.status.slice(1)}
                      size="small"
                      color={STATUS_COLORS[h.status as keyof typeof STATUS_COLORS] ?? 'default'}
                      variant="outlined"
                    />
                    <Typography variant="body2" color="text.secondary">
                      {new Date(h.changedAt).toLocaleString()}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
