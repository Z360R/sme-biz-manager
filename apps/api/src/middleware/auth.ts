import jwt from 'jsonwebtoken'
import type { Request, Response, NextFunction } from 'express'
import type { UserRole } from '@sme/shared'

interface JwtPayload {
  sub: string
  email: string
  role: UserRole
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: 'No token provided', code: 'UNAUTHORIZED' })
    return
  }

  try {
    const payload = jwt.verify(header.slice(7), process.env.JWT_ACCESS_SECRET!) as unknown as JwtPayload
    req.user = { id: Number(payload.sub), email: payload.email, role: payload.role }
    next()
  } catch {
    res.status(401).json({ success: false, error: 'Token invalid or expired', code: 'UNAUTHORIZED' })
  }
}

export function authorize(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ success: false, error: 'Insufficient permissions', code: 'FORBIDDEN' })
      return
    }
    next()
  }
}
