'use client'

import {
  Box, Drawer, List, ListItem, ListItemButton, ListItemIcon,
  ListItemText, Typography, Divider, Collapse,
} from '@mui/material'
import PeopleIcon from '@mui/icons-material/People'
import HandshakeIcon from '@mui/icons-material/Handshake'
import InventoryIcon from '@mui/icons-material/Inventory'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import DashboardIcon from '@mui/icons-material/Dashboard'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

export const SIDEBAR_WIDTH = 240

const NAV = [
  {
    label: 'CRM',
    icon: <HandshakeIcon />,
    children: [
      { label: 'Contacts', href: '/crm/contacts', icon: <PeopleIcon fontSize="small" /> },
      { label: 'Deals', href: '/crm/deals', icon: <HandshakeIcon fontSize="small" /> },
    ],
  },
  {
    label: 'Inventory',
    icon: <InventoryIcon />,
    children: [
      { label: 'Products', href: '/inventory/products', icon: <InventoryIcon fontSize="small" /> },
    ],
  },
  {
    label: 'Orders',
    icon: <ShoppingCartIcon />,
    children: [
      { label: 'All Orders', href: '/orders', icon: <ShoppingCartIcon fontSize="small" /> },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState<Record<string, boolean>>({ CRM: true })

  function toggle(label: string) {
    setOpen((prev) => ({ ...prev, [label]: !prev[label] }))
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: SIDEBAR_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': { width: SIDEBAR_WIDTH, boxSizing: 'border-box', borderRight: '1px solid', borderColor: 'divider' },
      }}
    >
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <DashboardIcon color="primary" />
        <Typography variant="subtitle1" fontWeight={700} color="primary">
          SME Manager
        </Typography>
      </Box>
      <Divider />
      <List dense>
        {NAV.map(({ label, icon, children }) => (
          <Box key={label}>
            <ListItemButton onClick={() => toggle(label)}>
              <ListItemIcon sx={{ minWidth: 36 }}>{icon}</ListItemIcon>
              <ListItemText primary={label} primaryTypographyProps={{ fontWeight: 600, fontSize: 14 }} />
              {open[label] ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
            </ListItemButton>
            <Collapse in={open[label] ?? false} timeout="auto" unmountOnExit>
              <List dense disablePadding>
                {children.map(({ label: childLabel, href, icon: childIcon }) => (
                  <ListItem key={href} disablePadding>
                    <ListItemButton
                      component={Link}
                      href={href}
                      selected={pathname === href || pathname.startsWith(href + '/')}
                      sx={{ pl: 4 }}
                    >
                      <ListItemIcon sx={{ minWidth: 28 }}>{childIcon}</ListItemIcon>
                      <ListItemText primary={childLabel} primaryTypographyProps={{ fontSize: 13 }} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Collapse>
          </Box>
        ))}
      </List>
    </Drawer>
  )
}
