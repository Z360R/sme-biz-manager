'use client'

import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Stack, TextField, MenuItem, IconButton,
  Table, TableHead, TableRow, TableCell, TableBody, Typography,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createOrderSchema } from '@sme/shared'
import type { CreateOrderDto } from '@sme/shared'
import { useCreateOrder } from '@/hooks/useOrders'
import { useContacts } from '@/hooks/useContacts'
import { useProducts } from '@/hooks/useProducts'
import { useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  open: boolean
  onClose: () => void
}

export function OrderForm({ open, onClose }: Props) {
  const createOrder = useCreateOrder()
  const router = useRouter()

  const { data: contactsData } = useContacts({ page: 1, pageSize: 100, search: '' })
  const { data: productsData } = useProducts({ page: 1, pageSize: 100, search: '', category: '' })

  const { control, register, handleSubmit, watch, reset, formState: { errors } } = useForm<CreateOrderDto>({
    resolver: zodResolver(createOrderSchema),
    defaultValues: { contactId: 0, items: [{ productId: 0, qty: 1 }] },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'items' })
  const watchedItems = watch('items')

  // Build product price map for live total calculation
  const priceMap = useMemo(() => {
    const map = new Map<number, number>()
    productsData?.items.forEach((p) => map.set(p.id, p.unitPrice))
    return map
  }, [productsData])

  const lineTotal = (productId: number, qty: number) => {
    const price = priceMap.get(productId) ?? 0
    return price * (qty || 0)
  }

  const grandTotal = watchedItems?.reduce((sum, item) => sum + lineTotal(item.productId, item.qty), 0) ?? 0

  useEffect(() => {
    if (open) reset({ contactId: 0, items: [{ productId: 0, qty: 1 }] })
  }, [open, reset])

  function onSubmit(data: CreateOrderDto) {
    createOrder.mutate(data, {
      onSuccess: (order) => {
        onClose()
        router.push(`/orders/${order.id}`)
      },
    })
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogTitle>New Order</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ pt: 1 }}>
            <Controller
              name="contactId"
              control={control}
              render={({ field }) => (
                <TextField
                  select
                  label="Contact"
                  size="small"
                  fullWidth
                  required
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  error={!!errors.contactId}
                  helperText={errors.contactId?.message}
                >
                  <MenuItem value={0} disabled>Select a contact…</MenuItem>
                  {contactsData?.items.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.firstName} {c.lastName}{c.company ? ` — ${c.company}` : ''}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />

            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell width={100}>Qty</TableCell>
                  <TableCell width={110} align="right">Unit Price</TableCell>
                  <TableCell width={110} align="right">Subtotal</TableCell>
                  <TableCell width={48} />
                </TableRow>
              </TableHead>
              <TableBody>
                {fields.map((field, idx) => {
                  const productId = watchedItems?.[idx]?.productId ?? 0
                  const qty = watchedItems?.[idx]?.qty ?? 1
                  const unitPrice = priceMap.get(productId) ?? 0
                  return (
                    <TableRow key={field.id}>
                      <TableCell>
                        <Controller
                          name={`items.${idx}.productId`}
                          control={control}
                          render={({ field: f }) => (
                            <TextField
                              select
                              size="small"
                              fullWidth
                              {...f}
                              onChange={(e) => f.onChange(Number(e.target.value))}
                            >
                              <MenuItem value={0} disabled>Select product…</MenuItem>
                              {productsData?.items.map((p) => (
                                <MenuItem key={p.id} value={p.id}>
                                  [{p.sku}] {p.name}
                                </MenuItem>
                              ))}
                            </TextField>
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          size="small"
                          fullWidth
                          inputProps={{ min: 1 }}
                          {...register(`items.${idx}.qty`, { valueAsNumber: true })}
                        />
                      </TableCell>
                      <TableCell align="right">${unitPrice.toFixed(2)}</TableCell>
                      <TableCell align="right">${lineTotal(productId, qty).toFixed(2)}</TableCell>
                      <TableCell>
                        <IconButton size="small" onClick={() => remove(idx)} disabled={fields.length === 1}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  )
                })}
                <TableRow>
                  <TableCell colSpan={3}>
                    <Button size="small" startIcon={<AddIcon />} onClick={() => append({ productId: 0, qty: 1 })}>
                      Add item
                    </Button>
                  </TableCell>
                  <TableCell align="right">
                    <Typography fontWeight={700}>${grandTotal.toFixed(2)}</Typography>
                  </TableCell>
                  <TableCell />
                </TableRow>
              </TableBody>
            </Table>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={createOrder.isPending}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={createOrder.isPending}>
            {createOrder.isPending ? 'Creating…' : 'Create Order'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
