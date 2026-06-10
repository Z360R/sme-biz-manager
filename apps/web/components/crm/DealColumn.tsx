'use client'

import { Box, Typography, Button, Chip } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import { useDroppable } from '@dnd-kit/core'
import type { Deal } from '@sme/shared'
import { DealCard } from './DealCard'

const STAGE_COLORS: Record<string, string> = {
  lead: '#1976d2',
  active: '#ed6c02',
  closed: '#2e7d32',
}

interface Props {
  id: string
  label: string
  deals: Deal[]
  onNewDeal: () => void
  onEdit: (deal: Deal) => void
  onDelete: (id: number) => void
}

export function DealColumn({ id, label, deals, onNewDeal, onEdit, onDelete }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minWidth: 270,
        flex: 1,
        bgcolor: isOver ? 'action.selected' : 'grey.100',
        borderRadius: 2,
        p: 1.5,
        transition: 'background-color 0.15s',
        border: '2px solid',
        borderColor: isOver ? STAGE_COLORS[id] ?? 'primary.main' : 'transparent',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography fontWeight={700} fontSize={14}>{label}</Typography>
          <Chip label={deals.length} size="small" sx={{ bgcolor: STAGE_COLORS[id], color: 'white', height: 18, fontSize: 11 }} />
        </Box>
        <Button size="small" startIcon={<AddIcon />} onClick={onNewDeal} sx={{ minWidth: 0, px: 1 }}>
          Add
        </Button>
      </Box>

      <Box ref={setNodeRef} sx={{ display: 'flex', flexDirection: 'column', gap: 1, minHeight: 80, flexGrow: 1 }}>
        {deals.map((deal) => (
          <DealCard key={deal.id} deal={deal} onEdit={onEdit} onDelete={onDelete} />
        ))}
      </Box>
    </Box>
  )
}
