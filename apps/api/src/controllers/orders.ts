import type { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { paginationSchema, createOrderSchema, updateOrderStatusSchema } from '@sme/shared'
import * as ordersService from '~api/services/orders'

const listQuerySchema = paginationSchema.extend({
  status: z.enum(['pending', 'fulfilled', 'cancelled']).optional(),
})

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const params = listQuerySchema.parse(req.query)
    const result = await ordersService.getAll(params)
    res.json({ success: true, data: result })
  } catch (err) {
    next(err)
  }
}

export async function getOne(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const order = await ordersService.getById(Number(req.params.id))
    if (!order) {
      res.status(404).json({ success: false, error: 'Order not found', code: 'NOT_FOUND' })
      return
    }
    res.json({ success: true, data: order })
  } catch (err) {
    next(err)
  }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const order = await ordersService.create(req.body, req.user?.id)
    res.status(201).json({ success: true, data: order })
  } catch (err: unknown) {
    if ((err as { code?: string }).code === 'PRODUCT_NOT_FOUND') {
      res.status(400).json({ success: false, error: (err as Error).message, code: 'PRODUCT_NOT_FOUND' })
      return
    }
    next(err)
  }
}

export async function updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { status } = updateOrderStatusSchema.parse(req.body)
    const order = await ordersService.updateStatus(Number(req.params.id), status, req.user?.id)
    if (!order) {
      res.status(404).json({ success: false, error: 'Order not found', code: 'NOT_FOUND' })
      return
    }
    res.json({ success: true, data: order })
  } catch (err: unknown) {
    if ((err as { code?: string }).code === 'INVALID_TRANSITION') {
      res.status(400).json({ success: false, error: (err as Error).message, code: 'INVALID_TRANSITION' })
      return
    }
    next(err)
  }
}

export async function stats(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await ordersService.getStats()
    res.json({ success: true, data: result })
  } catch (err) {
    next(err)
  }
}
