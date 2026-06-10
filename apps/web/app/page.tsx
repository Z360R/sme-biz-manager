import { Box, Button, Container, Typography } from '@mui/material'
import Link from 'next/link'

export default function HomePage() {
  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 3,
          textAlign: 'center',
        }}
      >
        <Typography variant="h3" fontWeight={700} color="primary">
          SME Business Manager
        </Typography>
        <Typography variant="h6" color="text.secondary" fontWeight={400}>
          CRM · Inventory · Orders
        </Typography>
        <Typography variant="body2" color="text.disabled">
          Portfolio demo — Renato C. Javier Jr.
        </Typography>
        <Button
          variant="contained"
          size="large"
          component={Link}
          href="/login"
          sx={{ mt: 1, px: 4 }}
        >
          Sign In
        </Button>
      </Box>
    </Container>
  )
}
