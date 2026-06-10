import { apiClient } from '@/lib/axios'
import type { Contact, ContactNote, CreateContactDto, UpdateContactDto, PaginatedData, ApiSuccess } from '@sme/shared'

export const contactsApi = {
  getAll: async (params: { page: number; pageSize: number; search?: string }) => {
    const { data } = await apiClient.get<ApiSuccess<PaginatedData<Contact>>>('/contacts', { params })
    return data.data
  },

  getById: async (id: number) => {
    const { data } = await apiClient.get<ApiSuccess<Contact>>(`/contacts/${id}`)
    return data.data
  },

  create: async (dto: CreateContactDto) => {
    const { data } = await apiClient.post<ApiSuccess<Contact>>('/contacts', dto)
    return data.data
  },

  update: async (id: number, dto: UpdateContactDto) => {
    const { data } = await apiClient.put<ApiSuccess<Contact>>(`/contacts/${id}`, dto)
    return data.data
  },

  remove: async (id: number) => {
    await apiClient.delete(`/contacts/${id}`)
  },

  getNotes: async (contactId: number) => {
    const { data } = await apiClient.get<ApiSuccess<ContactNote[]>>(`/contacts/${contactId}/notes`)
    return data.data
  },

  createNote: async (contactId: number, content: string) => {
    const { data } = await apiClient.post<ApiSuccess<ContactNote>>(`/contacts/${contactId}/notes`, { content })
    return data.data
  },

  deleteNote: async (contactId: number, noteId: number) => {
    await apiClient.delete(`/contacts/${contactId}/notes/${noteId}`)
  },
}
