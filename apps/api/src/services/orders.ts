import type { RowDataPacket } from 'mysql2/promise'
import { db } from '~api/db/connection'
import { query } from '~api/db/query'
import type { OrderStatusHistory, PaginatedData, OrderStatus } from '@sme/shared'
import type { CreateOrderDto } from '@sme/shared'

export interface OrderSummary {
  id: number
  contactId: number
  contactName: string
  status: OrderStatus
  total: number
  createdBy: number | null
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  id: number
  productId: number
  productName: string
  productSku: string
  qty: number
  unitPrice: number
  subtotal: number
}

export interface OrderWithDetails extends OrderSummary {
  contactEmail: string | null
  contactCompany: string | null
  items: OrderItem[]
  statusHistory: OrderStatusHistory[]
}

interface OrderRow extends RowDataPacket {
  id: number
  contact_id: number
  first_name: string
  last_name: string
  status: OrderStatus
  total: string
  created_by: number | null
  created_at: string
  updated_at: string
}

interface OrderDetailRow extends OrderRow {
  contact_email: string | null
  contact_company: string | null
}

interface OrderItemRow extends RowDataPacket {
  id: number
  product_id: number
  name: string
  sku: string
  qty: number
  unit_price: string
  subtotal: string
}

interface HistoryRow extends RowDataPacket {
  id: number
  order_id: number
  status: OrderStatus
  changed_by: number | null
  changed_at: string
}

function toSummary(row: OrderRow): OrderSummary {
  return {
    id: row.id,
    contactId: row.contact_id,
    contactName: `${row.first_name} ${row.last_name}`,
    status: row.status,
    total: Number(row.total),
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function getAll(params: {
  page: number
  pageSize: number
  status?: string
}): Promise<PaginatedData<OrderSummary>> {
  const { page, pageSize, status = '' } = params
  const offset = (page - 1) * pageSize

  const whereClauses = ['1=1']
  const baseParams: (string | number)[] = []

  if (status) {
    whereClauses.push('o.status = ?')
    baseParams.push(status)
  }

  const where = whereClauses.join(' AND ')

  const rows = await query<OrderRow>(
    `SELECT o.*, c.first_name, c.last_name
     FROM orders o
     JOIN contacts c ON o.contact_id = c.id
     WHERE ${where}
     ORDER BY o.created_at DESC
     LIMIT ? OFFSET ?`,
    [...baseParams, pageSize, offset]
  )

  const [countRow] = await query<RowDataPacket & { total: number }>(
    `SELECT COUNT(*) AS total
     FROM orders o
     JOIN contacts c ON o.contact_id = c.id
     WHERE ${where}`,
    baseParams
  )

  const total = Number(countRow?.total ?? 0)
  return {
    items: rows.map(toSummary),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  }
}

export async function getById(id: number): Promise<OrderWithDetails | null> {
  const [row] = await query<OrderDetailRow>(
    `SELECT o.*, c.first_name, c.last_name, c.email AS contact_email, c.company AS contact_company
     FROM orders o
     JOIN contacts c ON o.contact_id = c.id
     WHERE o.id = ?`,
    [id]
  )
  if (!row) return null

  const items = await query<OrderItemRow>(
    `SELECT oi.id, oi.product_id, p.name, p.sku, oi.qty, oi.unit_price, oi.subtotal
     FROM order_items oi
     JOIN products p ON oi.product_id = p.id
     WHERE oi.order_id = ?`,
    [id]
  )

  const history = await query<HistoryRow>(
    'SELECT * FROM order_status_history WHERE order_id = ? ORDER BY changed_at ASC',
    [id]
  )

  return {
    id: row.id,
    contactId: row.contact_id,
    contactName: `${row.first_name} ${row.last_name}`,
    contactEmail: row.contact_email,
    contactCompany: row.contact_company,
    status: row.status,
    total: Number(row.total),
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    items: items.map((i) => ({
      id: i.id,
      productId: i.product_id,
      productName: i.name,
      productSku: i.sku,
      qty: i.qty,
      unitPrice: Number(i.unit_price),
      subtotal: Number(i.subtotal),
    })),
    statusHistory: history.map((h) => ({
      id: h.id,
      orderId: h.order_id,
      status: h.status,
      changedBy: h.changed_by,
      changedAt: h.changed_at,
    })),
  }
}

export async function create(data: CreateOrderDto, userId?: number): Promise<OrderWithDetails> {
  const conn = await db.getConnection()
  try {
    await conn.beginTransaction()

    // Snapshot unit prices and calculate total
    let total = 0
    const itemsWithPrice: Array<{ productId: number; qty: number; unitPrice: number; subtotal: number }> = []

    for (const item of data.items) {
      const [rows] = await conn.query<RowDataPacket[]>(
        'SELECT unit_price FROM products WHERE id = ? AND deleted_at IS NULL',
        [item.productId]
      )
      if (!rows[0]) {
        await conn.rollback()
        const err = new Error(`Product ${item.productId} not found`) as Error & { code: string; status: number }
        err.code = 'PRODUCT_NOT_FOUND'; err.status = 400; throw err
      }
      const unitPrice = Number((rows[0] as { unit_price: string }).unit_price)
      const subtotal = unitPrice * item.qty
      total += subtotal
      itemsWithPrice.push({ productId: item.productId, qty: item.qty, unitPrice, subtotal })
    }

    const [orderResult] = await conn.execute(
      'INSERT INTO orders (contact_id, status, total, created_by) VALUES (?, ?, ?, ?)',
      [data.contactId, 'pending', total, userId ?? null]
    )
    const orderId = (orderResult as { insertId: number }).insertId

    for (const item of itemsWithPrice) {
      await conn.execute(
        'INSERT INTO order_items (order_id, product_id, qty, unit_price, subtotal) VALUES (?, ?, ?, ?, ?)',
        [orderId, item.productId, item.qty, item.unitPrice, item.subtotal]
      )
    }

    await conn.execute(
      'INSERT INTO order_status_history (order_id, status, changed_by) VALUES (?, ?, ?)',
      [orderId, 'pending', userId ?? null]
    )

    await conn.commit()
    return (await getById(orderId))!
  } catch (err) {
    await conn.rollback()
    throw err
  } finally {
    conn.release()
  }
}

export async function updateStatus(
  id: number,
  status: 'fulfilled' | 'cancelled',
  userId?: number
): Promise<OrderWithDetails | null> {
  const order = await getById(id)
  if (!order) return null

  if (order.status !== 'pending') {
    const err = new Error('Only pending orders can be updated') as Error & { code: string; status: number }
    err.code = 'INVALID_TRANSITION'; err.status = 400; throw err
  }

  const conn = await db.getConnection()
  try {
    await conn.beginTransaction()
    await conn.execute('UPDATE orders SET status = ? WHERE id = ?', [status, id])
    await conn.execute(
      'INSERT INTO order_status_history (order_id, status, changed_by) VALUES (?, ?, ?)',
      [id, status, userId ?? null]
    )
    await conn.commit()
  } catch (err) {
    await conn.rollback()
    throw err
  } finally {
    conn.release()
  }

  return getById(id)
}

export async function getStats(): Promise<{
  totalOrders: number
  pendingCount: number
  fulfilledCount: number
  cancelledCount: number
  totalRevenue: number
}> {
  const [row] = await query<RowDataPacket & {
    total_orders: number
    pending_count: number
    fulfilled_count: number
    cancelled_count: number
    total_revenue: string
  }>(
    `SELECT
       COUNT(*) AS total_orders,
       SUM(status = 'pending') AS pending_count,
       SUM(status = 'fulfilled') AS fulfilled_count,
       SUM(status = 'cancelled') AS cancelled_count,
       COALESCE(SUM(CASE WHEN status = 'fulfilled' THEN total ELSE 0 END), 0) AS total_revenue
     FROM orders`
  )
  return {
    totalOrders: Number(row?.total_orders ?? 0),
    pendingCount: Number(row?.pending_count ?? 0),
    fulfilledCount: Number(row?.fulfilled_count ?? 0),
    cancelledCount: Number(row?.cancelled_count ?? 0),
    totalRevenue: Number(row?.total_revenue ?? 0),
  }
}
