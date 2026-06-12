'use client'

import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Stack, MenuItem, Alert,
} from '@mui/material'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCreateMovement } from '@/hooks/useProducts'
import { useEffect, useState } from 'react'

const schema = z.object({
  type: z.enum(['stock_in', 'stock_out']),
  qty: z.number().int().positive('Quantity must be at least 1'),
  reason: z.string().min(1, 'Reason is required').max(255),
})

type FormValues = z.infer<typeof schema>

interface Props {
  open: boolean
  productId: number
  productName: string
  onClose: () => void
}

export function StockMovementForm({ open, productId, productName, onClose }: Props) {
  const createMovement = useCreateMovement()
  const [apiError, setApiError] = useState<string | null>(null)

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'stock_in', qty: 1, reason: '' },
  })

  useEffect(() => {
    if (open) {
      reset({ type: 'stock_in', qty: 1, reason: '' })
      setApiError(null)
    }
  }, [open, reset])

  function onSubmit(data: FormValues) {
    setApiError(null)
    createMovement.mutate(
      { productId, dto: data },
      {
        onSuccess: onClose,
        onError: (err: unknown) => {
          const msg = err instanceof Error ? err.message : 'Failed to record movement'
          setApiError(msg)
        },
      }
    )
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogTitle>Adjust Stock — {productName}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {apiError && <Alert severity="error">{apiError}</Alert>}
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <TextField select label="Movement Type" size="small" fullWidth {...field}>
                  <MenuItem value="stock_in">Stock In</MenuItem>
                  <MenuItem value="stock_out">Stock Out</MenuItem>
                </TextField>
              )}
            />
            <TextField
              label="Quantity"
              type="number"
              size="small"
              fullWidth
              {...register('qty', { valueAsNumber: true })}
              error={!!errors.qty}
              helperText={errors.qty?.message}
            />
            <TextField
              label="Reason"
              size="small"
              fullWidth
              {...register('reason')}
              error={!!errors.reason}
              helperText={errors.reason?.message}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={createMovement.isPending}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={createMovement.isPending}>
            {createMovement.isPending ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
