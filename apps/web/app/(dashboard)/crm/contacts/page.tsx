import type { Metadata } from 'next'
import { Box, Typography } from '@mui/material'
import { ContactsTable } from '@/components/crm/ContactsTable'

export const metadata: Metadata = { title: 'Contacts' }

export default function ContactsPage() {
  return (
    <Box>
      <Typography variant="h5" fontWeight={700} gutterBottom>Contacts</Typography>
      <ContactsTable />
    </Box>
  )
}
