import type { Request, Response, NextFunction } from 'express'
import * as contactsService from '~api/services/contacts'
import { paginationSchema } from '@sme/shared'
import { z } from 'zod'

const listQuerySchema = paginationSchema.extend({
  search: z.string().optional().default(''),
})

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const params = listQuerySchema.parse(req.query)
    const result = await contactsService.getAll(params)
    res.json({ success: true, data: result })
  } catch (err) {
    next(err)
  }
}

export async function getOne(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const contact = await contactsService.getById(Number(req.params.id))
    if (!contact) {
      res.status(404).json({ success: false, error: 'Contact not found', code: 'NOT_FOUND' })
      return
    }
    res.json({ success: true, data: contact })
  } catch (err) {
    next(err)
  }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const contact = await contactsService.create(req.body)
    res.status(201).json({ success: true, data: contact })
  } catch (err) {
    next(err)
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const contact = await contactsService.update(Number(req.params.id), req.body)
    if (!contact) {
      res.status(404).json({ success: false, error: 'Contact not found', code: 'NOT_FOUND' })
      return
    }
    res.json({ success: true, data: contact })
  } catch (err) {
    next(err)
  }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await contactsService.softDelete(Number(req.params.id))
    res.json({ success: true, data: null })
  } catch (err) {
    next(err)
  }
}
