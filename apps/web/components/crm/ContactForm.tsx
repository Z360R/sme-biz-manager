'use client'

import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Stack,
} from '@mui/material'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createContactSchema } from '@sme/shared'
import type { CreateContactDto, Contact } from '@sme/shared'
import { useCreateContact, useUpdateContact } from '@/hooks/useContacts'
import { useEffect } from 'react'

interface Props {
  open: boolean
  contact: Contact | null
  onClose: () => void
}

export function ContactForm({ open, contact, onClose }: Props) {
  const createContact = useCreateContact()
  const updateContact = useUpdateContact()
  const isPending = createContact.isPending || updateContact.isPending

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateContactDto>({
    resolver: zodResolver(createContactSchema),
  })

  useEffect(() => {
    if (open) {
      reset(contact ? {
        firstName: contact.firstName,
        lastName: contact.lastName,
        email: contact.email ?? undefined,
        phone: contact.phone ?? undefined,
        company: contact.company ?? undefined,
      } : { firstName: '', lastName: '' })
    }
  }, [open, contact, reset])

  function onSubmit(data: CreateContactDto) {
    if (contact) {
      updateContact.mutate({ id: contact.id, dto: data }, { onSuccess: onClose })
    } else {
      createContact.mutate(data, { onSuccess: onClose })
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogTitle>{contact ? 'Edit Contact' : 'New Contact'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Stack direction="row" spacing={2}>
              <TextField
                label="First Name"
                fullWidth
                required
                size="small"
                {...register('firstName')}
                error={!!errors.firstName}
                helperText={errors.firstName?.message}
              />
              <TextField
                label="Last Name"
                fullWidth
                required
                size="small"
                {...register('lastName')}
                error={!!errors.lastName}
                helperText={errors.lastName?.message}
              />
            </Stack>
            <TextField label="Email" fullWidth size="small" {...register('email')} error={!!errors.email} helperText={errors.email?.message} />
            <TextField label="Phone" fullWidth size="small" {...register('phone')} />
            <TextField label="Company" fullWidth size="small" {...register('company')} />
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
