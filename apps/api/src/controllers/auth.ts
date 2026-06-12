import type { Request, Response, NextFunction } from 'express'
import * as authService from '~api/services/auth'
import { loginSchema } from '@sme/shared'

const RT_COOKIE = 'refreshToken'
const RT_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/',
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = loginSchema.parse(req.body)
    const { accessToken, refreshToken, user } = await authService.login(email, password)
    res.cookie(RT_COOKIE, refreshToken, RT_OPTS)
    res.json({ success: true, data: { accessToken, user } })
  } catch (err: unknown) {
    if ((err as { code?: string }).code === 'INVALID_CREDENTIALS') {
      res.status(401).json({ success: false, error: 'Invalid email or password', code: 'INVALID_CREDENTIALS' })
      return
    }
    next(err)
  }
}

export async function refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const token: string | undefined = req.cookies?.[RT_COOKIE]
    if (!token) {
      res.status(401).json({ success: false, error: 'No refresh token', code: 'UNAUTHORIZED' })
      return
    }
    const { accessToken, refreshToken: newRT, user } = await authService.refresh(token)
    res.cookie(RT_COOKIE, newRT, RT_OPTS)
    res.json({ success: true, data: { accessToken, user } })
  } catch (err: unknown) {
    if ((err as { code?: string }).code === 'INVALID_TOKEN') {
      res.clearCookie(RT_COOKIE, { path: '/' })
      res.status(401).json({ success: false, error: 'Session expired', code: 'INVALID_TOKEN' })
      return
    }
    next(err)
  }
}

export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const token: string | undefined = req.cookies?.[RT_COOKIE]
    if (token) await authService.logout(token)
    res.clearCookie(RT_COOKIE, { path: '/' })
    res.json({ success: true, data: null })
  } catch (err) {
    next(err)
  }
}

export async function me(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await authService.getMe(req.user!.id)
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found', code: 'NOT_FOUND' })
      return
    }
    res.json({ success: true, data: user })
  } catch (err) {
    next(err)
  }
}
