'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { contactsApi } from '@/lib/api/contacts'
import type { CreateContactDto, UpdateContactDto } from '@sme/shared'

export function useContacts(params: { page: number; pageSize: number; search: string }) {
  return useQuery({
    queryKey: ['contacts', params],
    queryFn: () => contactsApi.getAll(params),
  })
}

export function useContact(id: number) {
  return useQuery({
    queryKey: ['contacts', id],
    queryFn: () => contactsApi.getById(id),
    enabled: id > 0,
  })
}

export function useCreateContact() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dto: CreateContactDto) => contactsApi.create(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['contacts'] }),
  })
}

export function useUpdateContact() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: number; dto: UpdateContactDto }) => contactsApi.update(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['contacts'] }),
  })
}

export function useDeleteContact() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => contactsApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['contacts'] }),
  })
}
