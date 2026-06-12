import type { RowDataPacket } from 'mysql2/promise'
import { query, execute } from '~api/db/query'
import type { Product, PaginatedData } from '@sme/shared'
import type { CreateProductDto, UpdateProductDto } from '@sme/shared'

interface ProductRow extends RowDataPacket {
  id: number
  sku: string
  name: string
  category: string
  unit_price: string
  stock_qty: number
  low_stock_threshold: number
  deleted_at: string | null
  created_at: string
  updated_at: string
}

function toProduct(row: ProductRow): Product {
  return {
    id: row.id,
    sku: row.sku,
    name: row.name,
    category: row.category,
    unitPrice: Number(row.unit_price),
    stockQty: row.stock_qty,
    lowStockThreshold: row.low_stock_threshold,
    deletedAt: row.deleted_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function getAll(params: {
  page: number
  pageSize: number
  search?: string
  category?: string
}): Promise<PaginatedData<Product>> {
  const { page, pageSize, search = '', category = '' } = params
  const offset = (page - 1) * pageSize
  const like = `%${search}%`

  const whereClauses = ['deleted_at IS NULL', '(name LIKE ? OR sku LIKE ?)']
  const baseParams: (string | number)[] = [like, like]

  if (category) {
    whereClauses.push('category = ?')
    baseParams.push(category)
  }

  const where = whereClauses.join(' AND ')

  const rows = await query<ProductRow>(
    `SELECT * FROM products WHERE ${where} ORDER BY name ASC LIMIT ? OFFSET ?`,
    [...baseParams, pageSize, offset]
  )

  const [countRow] = await query<RowDataPacket & { total: number }>(
    `SELECT COUNT(*) AS total FROM products WHERE ${where}`,
    baseParams
  )

  const total = Number(countRow?.total ?? 0)
  return {
    items: rows.map(toProduct),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  }
}

export async function getById(id: number): Promise<Product | null> {
  const rows = await query<ProductRow>(
    'SELECT * FROM products WHERE id = ? AND deleted_at IS NULL',
    [id]
  )
  return rows[0] ? toProduct(rows[0]) : null
}

export async function create(data: CreateProductDto): Promise<Product> {
  const result = await execute(
    `INSERT INTO products (sku, name, category, unit_price, stock_qty, low_stock_threshold)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [data.sku, data.name, data.category, data.unitPrice, data.stockQty ?? 0, data.lowStockThreshold ?? 10]
  )
  return (await getById(result.insertId))!
}

export async function update(id: number, data: UpdateProductDto): Promise<Product | null> {
  const fields: string[] = []
  const values: (string | number | null)[] = []

  if (data.sku !== undefined) { fields.push('sku = ?'); values.push(data.sku) }
  if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name) }
  if (data.category !== undefined) { fields.push('category = ?'); values.push(data.category) }
  if (data.unitPrice !== undefined) { fields.push('unit_price = ?'); values.push(data.unitPrice) }
  if (data.stockQty !== undefined) { fields.push('stock_qty = ?'); values.push(data.stockQty) }
  if (data.lowStockThreshold !== undefined) { fields.push('low_stock_threshold = ?'); values.push(data.lowStockThreshold) }

  if (fields.length === 0) return getById(id)

  values.push(id)
  await execute(
    `UPDATE products SET ${fields.join(', ')} WHERE id = ? AND deleted_at IS NULL`,
    values
  )
  return getById(id)
}

export async function softDelete(id: number): Promise<void> {
  await execute(
    'UPDATE products SET deleted_at = NOW() WHERE id = ? AND deleted_at IS NULL',
    [id]
  )
}

export async function getStats(): Promise<{
  totalProducts: number
  totalStockValue: number
  lowStockCount: number
}> {
  const [row] = await query<RowDataPacket & {
    total_products: number
    total_stock_value: string
    low_stock_count: number
  }>(
    `SELECT
       COUNT(*) AS total_products,
       COALESCE(SUM(unit_price * stock_qty), 0) AS total_stock_value,
       SUM(CASE WHEN stock_qty < low_stock_threshold THEN 1 ELSE 0 END) AS low_stock_count
     FROM products
     WHERE deleted_at IS NULL`
  )
  return {
    totalProducts: Number(row?.total_products ?? 0),
    totalStockValue: Number(row?.total_stock_value ?? 0),
    lowStockCount: Number(row?.low_stock_count ?? 0),
  }
}

export async function getCategories(): Promise<string[]> {
  const rows = await query<RowDataPacket & { category: string }>(
    'SELECT DISTINCT category FROM products WHERE deleted_at IS NULL ORDER BY category ASC'
  )
  return rows.map((r) => r.category)
}
