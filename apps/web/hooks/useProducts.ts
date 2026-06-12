'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { productsApi } from '@/lib/api/products'
import type { CreateProductDto, UpdateProductDto } from '@sme/shared'

type MovementBody = { type: 'stock_in' | 'stock_out'; qty: number; reason: string }

export function useProducts(params: { page: number; pageSize: number; search: string; category: string }) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => productsApi.getAll(params),
  })
}

export function useProduct(id: number) {
  return useQuery({
    queryKey: ['products', id],
    queryFn: () => productsApi.getById(id),
    enabled: id > 0,
  })
}

export function useProductCategories() {
  return useQuery({
    queryKey: ['product-categories'],
    queryFn: () => productsApi.getCategories(),
  })
}

export function useCreateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateProductDto) => productsApi.create(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] })
      qc.invalidateQueries({ queryKey: ['product-categories'] })
      qc.invalidateQueries({ queryKey: ['inventory-stats'] })
    },
  })
}

export function useUpdateProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: UpdateProductDto }) => productsApi.update(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] })
      qc.invalidateQueries({ queryKey: ['product-categories'] })
      qc.invalidateQueries({ queryKey: ['inventory-stats'] })
    },
  })
}

export function useDeleteProduct() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => productsApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] })
      qc.invalidateQueries({ queryKey: ['inventory-stats'] })
    },
  })
}

export function useProductMovements(productId: number) {
  return useQuery({
    queryKey: ['product-movements', productId],
    queryFn: () => productsApi.getMovements(productId),
    enabled: productId > 0,
  })
}

export function useCreateMovement() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ productId, dto }: { productId: number; dto: MovementBody }) =>
      productsApi.createMovement(productId, dto),
    onSuccess: (_data, { productId }) => {
      qc.invalidateQueries({ queryKey: ['products'] })
      qc.invalidateQueries({ queryKey: ['product-movements', productId] })
      qc.invalidateQueries({ queryKey: ['inventory-stats'] })
    },
  })
}

export function useInventoryStats() {
  return useQuery({
    queryKey: ['inventory-stats'],
    queryFn: () => productsApi.getInventoryStats(),
  })
}
