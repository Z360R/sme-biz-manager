import type { Metadata, Viewport } from 'next'
import { AppProviders } from '@/components/providers/AppProviders'

export const metadata: Metadata = {
  title: {
    default: 'SME Business Manager',
    template: '%s | SME Business Manager',
  },
  description: 'CRM, Inventory, and Order management for growing businesses',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  )
}
