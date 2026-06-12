import type { RowDataPacket } from 'mysql2/promise'
import { db } from '~api/db/connection'
import { query } from '~api/db/query'
import type { StockMovement } from '@sme/shared'
import type { StockMovementDto } from '@sme/shared'

interface StockMovementRow extends RowDataPacket {
  id: number
  product_id: number
  type: 'stock_in' | 'stock_out'
  qty: number
  reason: string
  user_id: number | null
  created_at: string
}

function toMovement(row: StockMovementRow): StockMovement {
  return {
    id: row.id,
    productId: row.product_id,
    type: row.type,
    qty: row.qty,
    reason: row.reason,
    userId: row.user_id,
    createdAt: row.created_at,
  }
}

export async function getByProduct(productId: number): Promise<StockMovement[]> {
  const rows = await query<StockMovementRow>(
    'SELECT * FROM stock_movements WHERE product_id = ? ORDER BY created_at DESC LIMIT 50',
    [productId]
  )
  return rows.map(toMovement)
}

export async function create(data: StockMovementDto, userId?: number): Promise<StockMovement> {
  const conn = await db.getConnection()
  try {
    await conn.beginTransaction()

    if (data.type === 'stock_out') {
      const [rows] = await conn.query<RowDataPacket[]>(
        'SELECT stock_qty FROM products WHERE id = ? AND deleted_at IS NULL FOR UPDATE',
        [data.productId]
      )
      const currentQty: number = (rows[0] as { stock_qty: number } | undefined)?.stock_qty ?? 0
      if (currentQty < data.qty) {
        await conn.rollback()
        const err = new Error('Insufficient stock') as Error & { code: string; status: number }
        err.code = 'INSUFFICIENT_STOCK'
        err.status = 400
        throw err
      }
    }

    const [insertResult] = await conn.execute(
      'INSERT INTO stock_movements (product_id, type, qty, reason, user_id) VALUES (?, ?, ?, ?, ?)',
      [data.productId, data.type, data.qty, data.reason, userId ?? null]
    )
    const insertId = (insertResult as { insertId: number }).insertId

    const delta = data.type === 'stock_in' ? data.qty : -data.qty
    await conn.execute(
      'UPDATE products SET stock_qty = stock_qty + ? WHERE id = ?',
      [delta, data.productId]
    )

    await conn.commit()

    const rows = await query<StockMovementRow>(
      'SELECT * FROM stock_movements WHERE id = ?',
      [insertId]
    )
    return toMovement(rows[0])
  } catch (err) {
    await conn.rollback()
    throw err
  } finally {
    conn.release()
  }
}

export interface DailyMovement {
  date: string
  stock_in: number
  stock_out: number
}

export async function getRecentMovements(days = 7): Promise<DailyMovement[]> {
  const rows = await query<RowDataPacket & { date: string; type: string; total: number }>(
    `SELECT
       DATE(created_at) AS date,
       type,
       SUM(qty) AS total
     FROM stock_movements
     WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
     GROUP BY DATE(created_at), type
     ORDER BY date ASC`,
    [days]
  )

  const map = new Map<string, DailyMovement>()
  for (const row of rows) {
    if (!map.has(row.date)) map.set(row.date, { date: row.date, stock_in: 0, stock_out: 0 })
    const entry = map.get(row.date)!
    if (row.type === 'stock_in') entry.stock_in = Number(row.total)
    else entry.stock_out = Number(row.total)
  }

  return Array.from(map.values())
}
