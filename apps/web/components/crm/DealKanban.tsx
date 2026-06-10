'use client'

import { Box, CircularProgress, Typography } from '@mui/material'
import { DndContext, type DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { useState } from 'react'
import type { Deal, DealStage } from '@sme/shared'
import { useDeals, useUpdateDeal, useDeleteDeal } from '@/hooks/useDeals'
import { DealColumn } from './DealColumn'
import { DealForm } from './DealForm'

const STAGES: { key: DealStage; label: string }[] = [
  { key: 'lead', label: 'Lead' },
  { key: 'active', label: 'Active' },
  { key: 'closed', label: 'Closed' },
]

export function DealKanban() {
  const [formOpen, setFormOpen] = useState(false)
  const [editDeal, setEditDeal] = useState<Deal | null>(null)
  const [defaultStage, setDefaultStage] = useState<DealStage>('lead')

  const { data, isLoading } = useDeals({ page: 1, pageSize: 200 })
  const updateDeal = useUpdateDeal()
  const deleteDeal = useDeleteDeal()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  const deals = data?.items ?? []

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over) return
    const dealId = Number(active.id)
    const newStage = over.id as DealStage
    const deal = deals.find((d) => d.id === dealId)
    if (!deal || deal.stage === newStage) return
    updateDeal.mutate({ id: dealId, dto: { stage: newStage } })
  }

  function handleNewDeal(stage: DealStage) {
    setEditDeal(null)
    setDefaultStage(stage)
    setFormOpen(true)
  }

  function handleEdit(deal: Deal) {
    setEditDeal(deal)
    setFormOpen(true)
  }

  function handleDelete(id: number) {
    if (window.confirm('Delete this deal?')) {
      deleteDeal.mutate(id)
    }
  }

  if (isLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
  }

  if (!data?.items.length && !isLoading) {
    return (
      <Box>
        <Box sx={{ display: 'flex', gap: 2, overflow: 'auto', pb: 2 }}>
          <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
            {STAGES.map(({ key, label }) => (
              <DealColumn
                key={key}
                id={key}
                label={label}
                deals={[]}
                onNewDeal={() => handleNewDeal(key)}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </DndContext>
        </Box>
        <Typography color="text.secondary" sx={{ mt: 2 }}>No deals yet. Add your first deal above.</Typography>
        <DealForm open={formOpen} deal={editDeal} defaultStage={defaultStage} onClose={() => setFormOpen(false)} />
      </Box>
    )
  }

  return (
    <Box>
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <Box sx={{ display: 'flex', gap: 2, overflow: 'auto', pb: 2 }}>
          {STAGES.map(({ key, label }) => (
            <DealColumn
              key={key}
              id={key}
              label={label}
              deals={deals.filter((d) => d.stage === key)}
              onNewDeal={() => handleNewDeal(key)}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </Box>
      </DndContext>
      <DealForm open={formOpen} deal={editDeal} defaultStage={defaultStage} onClose={() => setFormOpen(false)} />
    </Box>
  )
}
