'use client'

import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Stack, MenuItem,
} from '@mui/material'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createDealSchema } from '@sme/shared'
import type { CreateDealDto, Deal, DealStage } from '@sme/shared'
import { useCreateDeal, useUpdateDeal } from '@/hooks/useDeals'
import { useContacts } from '@/hooks/useContacts'
import { useEffect } from 'react'

const STAGES: { value: DealStage; label: string }[] = [
  { value: 'lead', label: 'Lead' },
  { value: 'active', label: 'Active' },
  { value: 'closed', label: 'Closed' },
]

interface Props {
  open: boolean
  deal: Deal | null
  defaultStage?: DealStage
  onClose: () => void
}

export function DealForm({ open, deal, defaultStage = 'lead', onClose }: Props) {
  const createDeal = useCreateDeal()
  const updateDeal = useUpdateDeal()
  const isPending = createDeal.isPending || updateDeal.isPending

  const { data: contactsData } = useContacts({ page: 1, pageSize: 100, search: '' })

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<CreateDealDto>({
    resolver: zodResolver(createDealSchema),
  })

  useEffect(() => {
    if (open) {
      reset(deal ? {
        title: deal.title,
        contactId: deal.contactId,
        stage: deal.stage,
        value: deal.value,
        notes: deal.notes ?? undefined,
      } : { title: '', contactId: 0, stage: defaultStage, value: 0 })
    }
  }, [open, deal, defaultStage, reset])

  function onSubmit(data: CreateDealDto) {
    if (deal) {
      updateDeal.mutate({ id: deal.id, dto: data }, { onSuccess: onClose })
    } else {
      createDeal.mutate(data, { onSuccess: onClose })
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogTitle>{deal ? 'Edit Deal' : 'New Deal'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              label="Deal Title"
              fullWidth
              required
              size="small"
              {...register('title')}
              error={!!errors.title}
              helperText={errors.title?.message}
            />

            <Controller
              name="contactId"
              control={control}
              render={({ field }) => (
                <TextField select label="Contact" fullWidth required size="small" {...field} error={!!errors.contactId}>
                  <MenuItem value={0} disabled>Select a contact</MenuItem>
                  {contactsData?.items.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.firstName} {c.lastName}{c.company ? ` — ${c.company}` : ''}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />

            <Controller
              name="stage"
              control={control}
              render={({ field }) => (
                <TextField select label="Stage" fullWidth size="small" {...field}>
                  {STAGES.map((s) => (
                    <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
                  ))}
                </TextField>
              )}
            />

            <TextField
              label="Value ($)"
              type="number"
              fullWidth
              size="small"
              inputProps={{ min: 0, step: 0.01 }}
              {...register('value', { valueAsNumber: true })}
            />

            <TextField
              label="Notes"
              fullWidth
              size="small"
              multiline
              rows={3}
              {...register('notes')}
            />
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
