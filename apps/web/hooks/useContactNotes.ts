'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { contactsApi } from '@/lib/api/contacts'

export function useContactNotes(contactId: number) {
  return useQuery({
    queryKey: ['contacts', contactId, 'notes'],
    queryFn: () => contactsApi.getNotes(contactId),
    enabled: contactId > 0,
  })
}

export function useCreateContactNote(contactId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (content: string) => contactsApi.createNote(contactId, content),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['contacts', contactId, 'notes'] }),
  })
}

export function useDeleteContactNote(contactId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (noteId: number) => contactsApi.deleteNote(contactId, noteId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['contacts', contactId, 'notes'] }),
  })
}
