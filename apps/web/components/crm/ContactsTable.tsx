'use client'

import {
  Box, Button, TextField, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TablePagination,
  IconButton, Tooltip, Paper, Typography, CircularProgress,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import { useState } from 'react'
import Link from 'next/link'
import type { Contact } from '@sme/shared'
import { useContacts, useDeleteContact } from '@/hooks/useContacts'
import { ContactForm } from './ContactForm'

export function ContactsTable() {
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(20)
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editContact, setEditContact] = useState<Contact | null>(null)

  const { data, isLoading } = useContacts({ page: page + 1, pageSize, search })
  const deleteContact = useDeleteContact()

  function handleEdit(contact: Contact) {
    setEditContact(contact)
    setFormOpen(true)
  }

  function handleCreate() {
    setEditContact(null)
    setFormOpen(true)
  }

  function handleDelete(id: number) {
    if (window.confirm('Delete this contact?')) {
      deleteContact.mutate(id)
    }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          placeholder="Search contacts…"
          size="small"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0) }}
          sx={{ width: 280 }}
        />
        <Box sx={{ flex: 1 }} />
        <Button variant="contained" onClick={handleCreate}>+ New Contact</Button>
      </Box>

      <Paper>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Company</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              )}
              {!isLoading && data?.items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">No contacts found</Typography>
                  </TableCell>
                </TableRow>
              )}
              {data?.items.map((contact) => (
                <TableRow key={contact.id} hover>
                  <TableCell>
                    {contact.firstName} {contact.lastName}
                  </TableCell>
                  <TableCell>{contact.company ?? '—'}</TableCell>
                  <TableCell>{contact.email ?? '—'}</TableCell>
                  <TableCell>{contact.phone ?? '—'}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="View details">
                      <IconButton size="small" component={Link} href={`/crm/contacts/${contact.id}`}>
                        <OpenInNewIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => handleEdit(contact)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" color="error" onClick={() => handleDelete(contact.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={data?.total ?? 0}
          page={page}
          rowsPerPage={pageSize}
          rowsPerPageOptions={[10, 20, 50]}
          onPageChange={(_, p) => setPage(p)}
          onRowsPerPageChange={(e) => { setPageSize(Number(e.target.value)); setPage(0) }}
        />
      </Paper>

      <ContactForm open={formOpen} contact={editContact} onClose={() => setFormOpen(false)} />
    </Box>
  )
}
