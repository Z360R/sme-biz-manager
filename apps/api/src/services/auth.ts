import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import type { RowDataPacket } from 'mysql2/promise'
import { query, execute } from '~api/db/query'
import type { User, UserRole } from '@sme/shared'

interface UserRow extends RowDataPacket {
  id: number
  email: string
  password_hash: string
  role: UserRole
  created_at: string
  updated_at: string
}

interface AuthPayload {
  sub: number
  email: string
  role: UserRole
}

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

function toUser(row: UserRow): User {
  return {
    id: row.id,
    email: row.email,
    role: row.role,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function generateAccessToken(payload: AuthPayload): string {
  const expiresIn = (process.env.JWT_ACCESS_EXPIRES ?? '15m') as unknown as jwt.SignOptions['expiresIn']
  return jwt.sign(
    { email: payload.email, role: payload.role },
    process.env.JWT_ACCESS_SECRET!,
    { expiresIn, subject: String(payload.sub) }
  )
}

function generateRefreshToken(payload: AuthPayload): string {
  const expiresIn = (process.env.JWT_REFRESH_EXPIRES ?? '7d') as unknown as jwt.SignOptions['expiresIn']
  return jwt.sign(
    { email: payload.email, role: payload.role },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn, subject: String(payload.sub) }
  )
}

export async function login(email: string, password: string): Promise<{ accessToken: string; refreshToken: string; user: User }> {
  const [row] = await query<UserRow>('SELECT * FROM users WHERE email = ? LIMIT 1', [email])
  if (!row) {
    const err = new Error('Invalid credentials') as Error & { status: number; code: string }
    err.status = 401; err.code = 'INVALID_CREDENTIALS'; throw err
  }

  const valid = await bcrypt.compare(password, row.password_hash)
  if (!valid) {
    const err = new Error('Invalid credentials') as Error & { status: number; code: string }
    err.status = 401; err.code = 'INVALID_CREDENTIALS'; throw err
  }

  const user = toUser(row)
  const payload: AuthPayload = { sub: user.id, email: user.email, role: user.role }
  const accessToken = generateAccessToken(payload)
  const refreshToken = generateRefreshToken(payload)
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  await execute(
    'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)',
    [user.id, hashToken(refreshToken), expiresAt]
  )

  return { accessToken, refreshToken, user }
}

export async function refresh(refreshToken: string): Promise<{ accessToken: string; refreshToken: string; user: User }> {
  let payload: AuthPayload
  try {
    payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as unknown as AuthPayload
  } catch {
    const err = new Error('Invalid refresh token') as Error & { status: number; code: string }
    err.status = 401; err.code = 'INVALID_TOKEN'; throw err
  }

  const [tokenRow] = await query<RowDataPacket & { id: number }>(
    'SELECT id FROM refresh_tokens WHERE token_hash = ? AND revoked_at IS NULL AND expires_at > NOW()',
    [hashToken(refreshToken)]
  )
  if (!tokenRow) {
    const err = new Error('Refresh token not valid') as Error & { status: number; code: string }
    err.status = 401; err.code = 'INVALID_TOKEN'; throw err
  }

  await execute('UPDATE refresh_tokens SET revoked_at = NOW() WHERE id = ?', [tokenRow.id])

  const [userRow] = await query<UserRow>('SELECT * FROM users WHERE id = ? LIMIT 1', [payload.sub])
  if (!userRow) {
    const err = new Error('User not found') as Error & { status: number; code: string }
    err.status = 401; err.code = 'INVALID_TOKEN'; throw err
  }

  const user = toUser(userRow)
  const newPayload: AuthPayload = { sub: user.id, email: user.email, role: user.role }
  const accessToken = generateAccessToken(newPayload)
  const newRefreshToken = generateRefreshToken(newPayload)
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

  await execute(
    'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)',
    [user.id, hashToken(newRefreshToken), expiresAt]
  )

  return { accessToken, refreshToken: newRefreshToken, user }
}

export async function logout(refreshToken: string): Promise<void> {
  await execute(
    'UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = ? AND revoked_at IS NULL',
    [hashToken(refreshToken)]
  )
}

export async function getMe(userId: number): Promise<User | null> {
  const [row] = await query<UserRow>('SELECT * FROM users WHERE id = ? LIMIT 1', [userId])
  return row ? toUser(row) : null
}
