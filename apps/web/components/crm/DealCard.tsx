'use client'

import { Paper, Typography, Box, IconButton, Tooltip } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import type { Deal } from '@sme/shared'

interface Props {
  deal: Deal
  onEdit: (deal: Deal) => void
  onDelete: (id: number) => void
}

export function DealCard({ deal, onEdit, onDelete }: Props) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: deal.id,
    data: { deal },
  })

  return (
    <Paper
      ref={setNodeRef}
      elevation={isDragging ? 6 : 1}
      sx={{
        p: 1.5,
        cursor: isDragging ? 'grabbing' : 'grab',
        opacity: isDragging ? 0.5 : 1,
        transform: CSS.Translate.toString(transform),
        userSelect: 'none',
        '&:hover .deal-actions': { opacity: 1 },
      }}
      style={{ transform: CSS.Translate.toString(transform) }}
      {...attributes}
      {...listeners}
    >
      <Typography variant="body2" fontWeight={600} noWrap>{deal.title}</Typography>
      {deal.value > 0 && (
        <Typography variant="caption" color="primary.main">
          ${deal.value.toLocaleString()}
        </Typography>
      )}
      <Box
        className="deal-actions"
        sx={{ display: 'flex', justifyContent: 'flex-end', mt: 0.5, opacity: 0, transition: 'opacity 0.15s' }}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <Tooltip title="Edit">
          <IconButton size="small" onClick={() => onEdit(deal)}>
            <EditIcon sx={{ fontSize: 14 }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton size="small" color="error" onClick={() => onDelete(deal.id)}>
            <DeleteIcon sx={{ fontSize: 14 }} />
          </IconButton>
        </Tooltip>
      </Box>
    </Paper>
  )
}
