'use client'

import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Stack, InputAdornment,
} from '@mui/material'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createProductSchema } from '@sme/shared'
import type { CreateProductDto, Product } from '@sme/shared'
import { useCreateProduct, useUpdateProduct } from '@/hooks/useProducts'
import { useEffect } from 'react'

interface Props {
  open: boolean
  product: Product | null
  onClose: () => void
}

export function ProductForm({ open, product, onClose }: Props) {
  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct()
  const isPending = createProduct.isPending || updateProduct.isPending

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateProductDto>({
    resolver: zodResolver(createProductSchema),
  })

  useEffect(() => {
    if (open) {
      reset(product ? {
        sku: product.sku,
        name: product.name,
        category: product.category,
        unitPrice: product.unitPrice,
        stockQty: product.stockQty,
        lowStockThreshold: product.lowStockThreshold,
      } : { sku: '', name: '', category: '', unitPrice: 0, stockQty: 0, lowStockThreshold: 10 })
    }
  }, [open, product, reset])

  function onSubmit(data: CreateProductDto) {
    if (product) {
      updateProduct.mutate({ id: product.id, dto: data }, { onSuccess: onClose })
    } else {
      createProduct.mutate(data, { onSuccess: onClose })
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogTitle>{product ? 'Edit Product' : 'New Product'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Stack direction="row" spacing={2}>
              <TextField
                label="SKU"
                required
                size="small"
                sx={{ width: 160 }}
                {...register('sku')}
                error={!!errors.sku}
                helperText={errors.sku?.message}
              />
              <TextField
                label="Name"
                fullWidth
                required
                size="small"
                {...register('name')}
                error={!!errors.name}
                helperText={errors.name?.message}
              />
            </Stack>
            <TextField
              label="Category"
              fullWidth
              required
              size="small"
              {...register('category')}
              error={!!errors.category}
              helperText={errors.category?.message}
            />
            <Stack direction="row" spacing={2}>
              <TextField
                label="Unit Price"
                type="number"
                fullWidth
                required
                size="small"
                InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                {...register('unitPrice', { valueAsNumber: true })}
                error={!!errors.unitPrice}
                helperText={errors.unitPrice?.message}
              />
              <TextField
                label="Stock Qty"
                type="number"
                fullWidth
                size="small"
                {...register('stockQty', { valueAsNumber: true })}
                error={!!errors.stockQty}
                helperText={errors.stockQty?.message}
              />
              <TextField
                label="Low Stock At"
                type="number"
                fullWidth
                size="small"
                {...register('lowStockThreshold', { valueAsNumber: true })}
                error={!!errors.lowStockThreshold}
                helperText={errors.lowStockThreshold?.message}
              />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isPending}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={isPending}>
            {isPending ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
