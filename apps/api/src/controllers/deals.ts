import type { Request, Response, NextFunction } from 'express'
import * as dealsService from '~api/services/deals'
import { paginationSchema } from '@sme/shared'
import { z } from 'zod'

const listQuerySchema = paginationSchema.extend({
  stage: z.enum(['lead', 'active', 'closed']).optional(),
  contactId: z.coerce.number().int().positive().optional(),
})

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const params = listQuerySchema.parse(req.query)
    const result = await dealsService.getAll(params)
    res.json({ success: true, data: result })
  } catch (err) {
    next(err)
  }
}

export async function getOne(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const deal = await dealsService.getById(Number(req.params.id))
    if (!deal) {
      res.status(404).json({ success: false, error: 'Deal not found', code: 'NOT_FOUND' })
      return
    }
    res.json({ success: true, data: deal })
  } catch (err) {
    next(err)
  }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const deal = await dealsService.create(req.body)
    res.status(201).json({ success: true, data: deal })
  } catch (err) {
    next(err)
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const deal = await dealsService.update(Number(req.params.id), req.body)
    if (!deal) {
      res.status(404).json({ success: false, error: 'Deal not found', code: 'NOT_FOUND' })
      return
    }
    res.json({ success: true, data: deal })
  } catch (err) {
    next(err)
  }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await dealsService.remove(Number(req.params.id))
    res.json({ success: true, data: null })
  } catch (err) {
    next(err)
  }
}

export async function listActivities(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const activities = await dealsService.getActivities(Number(req.params.id))
    res.json({ success: true, data: activities })
  } catch (err) {
    next(err)
  }
}
