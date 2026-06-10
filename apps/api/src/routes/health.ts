import { Router, type IRouter } from 'express'
import { db } from '~api/db/connection'

export const healthRouter: IRouter = Router()

healthRouter.get('/', async (_req, res) => {
  try {
    await db.query('SELECT 1')
    res.json({ success: true, data: { status: 'ok', db: 'connected' } })
  } catch {
    res.status(503).json({
      success: false,
      error: 'Database unavailable',
      code: 'DB_UNAVAILABLE',
    })
  }
})
