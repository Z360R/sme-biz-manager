import { DashboardShell } from '@/components/layout/DashboardShell'
import { AuthGuard } from '@/components/providers/AuthGuard'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <DashboardShell>{children}</DashboardShell>
    </AuthGuard>
  )
}
