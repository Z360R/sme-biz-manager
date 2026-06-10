'use client'

import {
  Box, Typography, Paper, Grid, Chip, Button, CircularProgress, Divider,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import EditIcon from '@mui/icons-material/Edit'
import Link from 'next/link'
import { useState } from 'react'
import { use } from 'react'
import { useContact } from '@/hooks/useContacts'
import { ContactNotes } from '@/components/crm/ContactNotes'
import { ContactForm } from '@/components/crm/ContactForm'

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <Box sx={{ mb: 1.5 }}>
      <Typography variant="caption" color="text.secondary" display="block">{label}</Typography>
      <Typography variant="body2">{value ?? '—'}</Typography>
    </Box>
  )
}

export default function ContactDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const contactId = Number(id)
  const { data: contact, isLoading } = useContact(contactId)
  const [formOpen, setFormOpen] = useState(false)

  if (isLoading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
  }

  if (!contact) {
    return <Typography color="error">Contact not found.</Typography>
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button startIcon={<ArrowBackIcon />} component={Link} href="/crm/contacts" size="small">
          Back
        </Button>
        <Typography variant="h5" fontWeight={700} sx={{ flex: 1 }}>
          {contact.firstName} {contact.lastName}
        </Typography>
        <Button variant="outlined" startIcon={<EditIcon />} onClick={() => setFormOpen(true)}>
          Edit
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>Contact Info</Typography>
            <Divider sx={{ mb: 2 }} />
            <InfoRow label="Full Name" value={`${contact.firstName} ${contact.lastName}`} />
            <InfoRow label="Company" value={contact.company} />
            <InfoRow label="Email" value={contact.email} />
            <InfoRow label="Phone" value={contact.phone} />
            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" color="text.secondary">Added</Typography>
              <Typography variant="body2">{new Date(contact.createdAt).toLocaleDateString()}</Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <ContactNotes contactId={contactId} />
          </Paper>
        </Grid>
      </Grid>

      <ContactForm open={formOpen} contact={contact} onClose={() => setFormOpen(false)} />
    </Box>
  )
}
