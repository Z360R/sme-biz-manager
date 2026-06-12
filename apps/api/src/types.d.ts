import type { UserRole } from '@sme/shared'

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number
        email: string
        role: UserRole
      }
    }
  }
}

export {}
