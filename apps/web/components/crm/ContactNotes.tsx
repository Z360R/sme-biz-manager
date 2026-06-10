'use client'

import {
  Box, Typography, TextField, Button, Paper,
  List, ListItem, ListItemText, IconButton, Divider, CircularProgress,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import { useState } from 'react'
import { useContactNotes, useCreateContactNote, useDeleteContactNote } from '@/hooks/useContactNotes'

interface Props {
  contactId: number
}

export function ContactNotes({ contactId }: Props) {
  const [content, setContent] = useState('')
  const { data: notes, isLoading } = useContactNotes(contactId)
  const createNote = useCreateContactNote(contactId)
  const deleteNote = useDeleteContactNote(contactId)

  function handleAdd() {
    if (!content.trim()) return
    createNote.mutate(content.trim(), { onSuccess: () => setContent('') })
  }

  return (
    <Box>
      <Typography variant="h6" fontWeight={600} gutterBottom>Notes</Typography>

      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <TextField
          placeholder="Add a note…"
          size="small"
          fullWidth
          multiline
          maxRows={3}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAdd() } }}
        />
        <Button
          variant="contained"
          onClick={handleAdd}
          disabled={!content.trim() || createNote.isPending}
          sx={{ alignSelf: 'flex-start' }}
        >
          Add
        </Button>
      </Box>

      {isLoading && <CircularProgress size={20} />}

      {notes && notes.length === 0 && (
        <Typography variant="body2" color="text.secondary">No notes yet.</Typography>
      )}

      <Paper variant="outlined">
        <List dense disablePadding>
          {notes?.map((note, idx) => (
            <Box key={note.id}>
              {idx > 0 && <Divider />}
              <ListItem
                secondaryAction={
                  <IconButton size="small" color="error" onClick={() => deleteNote.mutate(note.id)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                }
              >
                <ListItemText
                  primary={note.content}
                  secondary={new Date(note.createdAt).toLocaleString()}
                  primaryTypographyProps={{ variant: 'body2', sx: { whiteSpace: 'pre-wrap' } }}
                  secondaryTypographyProps={{ variant: 'caption' }}
                />
              </ListItem>
            </Box>
          ))}
        </List>
      </Paper>
    </Box>
  )
}
