'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { dealsApi, crmApi } from '@/lib/api/deals'
import type { CreateDealDto, UpdateDealDto } from '@sme/shared'

export function useDeals(params: { page: number; pageSize: number; stage?: string; contactId?: number }) {
  return useQuery({
    queryKey: ['deals', params],
    queryFn: () => dealsApi.getAll(params),
  })
}

export function useDeal(id: number) {
  return useQuery({
    queryKey: ['deals', id],
    queryFn: () => dealsApi.getById(id),
    enabled: id > 0,
  })
}

export function useDealActivities(id: number) {
  return useQuery({
    queryKey: ['deals', id, 'activities'],
    queryFn: () => dealsApi.getActivities(id),
    enabled: id > 0,
  })
}

export function useCreateDeal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateDealDto) => dealsApi.create(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['deals'] }),
  })
}

export function useUpdateDeal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: UpdateDealDto }) => dealsApi.update(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['deals'] }),
  })
}

export function useDeleteDeal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => dealsApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['deals'] }),
  })
}

export function useCrmStats() {
  return useQuery({
    queryKey: ['crm', 'stats'],
    queryFn: crmApi.getStats,
  })
}
