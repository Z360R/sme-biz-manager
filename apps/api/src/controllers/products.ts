import type { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { paginationSchema, stockMovementSchema } from '@sme/shared'
import * as productsService from '~api/services/products'
import * as stockMovementsService from '~api/services/stockMovements'

const listQuerySchema = paginationSchema.extend({
  search: z.string().optional().default(''),
  category: z.string().optional().default(''),
})

const movementBodySchema = stockMovementSchema.omit({ productId: true })

export async function list(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const params = listQuerySchema.parse(req.query)
    const result = await productsService.getAll(params)
    res.json({ success: true, data: result })
  } catch (err) {
    next(err)
  }
}

export async function getOne(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const product = await productsService.getById(Number(req.params.id))
    if (!product) {
      res.status(404).json({ success: false, error: 'Product not found', code: 'NOT_FOUND' })
      return
    }
    res.json({ success: true, data: product })
  } catch (err) {
    next(err)
  }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const product = await productsService.create(req.body)
    res.status(201).json({ success: true, data: product })
  } catch (err) {
    next(err)
  }
}

export async function update(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const product = await productsService.update(Number(req.params.id), req.body)
    if (!product) {
      res.status(404).json({ success: false, error: 'Product not found', code: 'NOT_FOUND' })
      return
    }
    res.json({ success: true, data: product })
  } catch (err) {
    next(err)
  }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await productsService.softDelete(Number(req.params.id))
    res.json({ success: true, data: null })
  } catch (err) {
    next(err)
  }
}

export async function categories(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const cats = await productsService.getCategories()
    res.json({ success: true, data: cats })
  } catch (err) {
    next(err)
  }
}

export async function listMovements(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const movements = await stockMovementsService.getByProduct(Number(req.params.id))
    res.json({ success: true, data: movements })
  } catch (err) {
    next(err)
  }
}

export async function createMovement(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = movementBodySchema.parse(req.body)
    const movement = await stockMovementsService.create({
      ...body,
      productId: Number(req.params.id),
    })
    res.status(201).json({ success: true, data: movement })
  } catch (err: unknown) {
    if (err instanceof Error && (err as Error & { code?: string }).code === 'INSUFFICIENT_STOCK') {
      res.status(400).json({ success: false, error: err.message, code: 'INSUFFICIENT_STOCK' })
      return
    }
    next(err)
  }
}
