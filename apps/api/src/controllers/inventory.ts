import type { Request, Response, NextFunction } from 'express'
import * as productsService from '~api/services/products'
import * as stockMovementsService from '~api/services/stockMovements'

export async function getStats(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const [stats, chart] = await Promise.all([
      productsService.getStats(),
      stockMovementsService.getRecentMovements(7),
    ])
    res.json({ success: true, data: { ...stats, chart } })
  } catch (err) {
    next(err)
  }
}
