import type { RowDataPacket } from 'mysql2/promise'
import { query, execute } from '~api/db/query'
import type { Deal, DealActivity, PaginatedData } from '@sme/shared'
import type { CreateDealDto, UpdateDealDto } from '@sme/shared'

interface DealRow extends RowDataPacket {
  id: number
  title: string
  contact_id: number
  stage: 'lead' | 'active' | 'closed'
  value: string
  notes: string | null
  created_by: number | null
  created_at: string
  updated_at: string
}

interface ActivityRow extends RowDataPacket {
  id: number
  deal_id: number
  user_id: number | null
  action: string
  created_at: string
}

function toDeal(row: DealRow): Deal {
  return {
    id: row.id,
    title: row.title,
    contactId: row.contact_id,
    stage: row.stage,
    value: Number(row.value),
    notes: row.notes,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function toActivity(row: ActivityRow): DealActivity {
  return {
    id: row.id,
    dealId: row.deal_id,
    userId: row.user_id,
    action: row.action,
    createdAt: row.created_at,
  }
}

export async function getAll(params: {
  page: number
  pageSize: number
  stage?: string
  contactId?: number
}): Promise<PaginatedData<Deal>> {
  const { page, pageSize, stage, contactId } = params
  const offset = (page - 1) * pageSize
  const conditions: string[] = []
  const values: (string | number)[] = []

  if (stage) { conditions.push('stage = ?'); values.push(stage) }
  if (contactId) { conditions.push('contact_id = ?'); values.push(contactId) }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

  const rows = await query<DealRow>(
    `SELECT * FROM deals ${where} ORDER BY updated_at DESC LIMIT ? OFFSET ?`,
    [...values, pageSize, offset]
  )

  const [countRow] = await query<RowDataPacket & { total: number }>(
    `SELECT COUNT(*) AS total FROM deals ${where}`,
    values
  )

  const total = Number(countRow?.total ?? 0)

  return { items: rows.map(toDeal), total, page, pageSize, totalPages: Math.ceil(total / pageSize) }
}

export async function getById(id: number): Promise<Deal | null> {
  const rows = await query<DealRow>('SELECT * FROM deals WHERE id = ?', [id])
  return rows[0] ? toDeal(rows[0]) : null
}

export async function create(data: CreateDealDto, userId?: number): Promise<Deal> {
  const result = await execute(
    `INSERT INTO deals (title, contact_id, stage, value, notes, created_by) VALUES (?, ?, ?, ?, ?, ?)`,
    [data.title, data.contactId, data.stage ?? 'lead', data.value ?? 0, data.notes ?? null, userId ?? null]
  )
  await logActivity(result.insertId, `Deal created in "${data.stage ?? 'lead'}" stage`, userId)
  return (await getById(result.insertId))!
}

export async function update(id: number, data: UpdateDealDto, userId?: number): Promise<Deal | null> {
  const current = await getById(id)
  if (!current) return null

  const fields: string[] = []
  const values: (string | number | null)[] = []

  if (data.title !== undefined) { fields.push('title = ?'); values.push(data.title) }
  if (data.contactId !== undefined) { fields.push('contact_id = ?'); values.push(data.contactId) }
  if (data.stage !== undefined) { fields.push('stage = ?'); values.push(data.stage) }
  if (data.value !== undefined) { fields.push('value = ?'); values.push(data.value) }
  if (data.notes !== undefined) { fields.push('notes = ?'); values.push(data.notes ?? null) }

  if (fields.length > 0) {
    values.push(id)
    await execute(`UPDATE deals SET ${fields.join(', ')} WHERE id = ?`, values)
  }

  if (data.stage && data.stage !== current.stage) {
    await logActivity(id, `Stage moved from "${current.stage}" → "${data.stage}"`, userId)
  }

  return getById(id)
}

export async function remove(id: number): Promise<void> {
  await execute('DELETE FROM deals WHERE id = ?', [id])
}

export async function getActivities(dealId: number): Promise<DealActivity[]> {
  const rows = await query<ActivityRow>(
    'SELECT * FROM deal_activities WHERE deal_id = ? ORDER BY created_at DESC',
    [dealId]
  )
  return rows.map(toActivity)
}

async function logActivity(dealId: number, action: string, userId?: number): Promise<void> {
  await execute(
    'INSERT INTO deal_activities (deal_id, user_id, action) VALUES (?, ?, ?)',
    [dealId, userId ?? null, action]
  )
}

export async function getStats(): Promise<{
  total: number
  byStage: { lead: number; active: number; closed: number }
}> {
  const rows = await query<RowDataPacket & { stage: string; count: number }>(
    'SELECT stage, COUNT(*) AS count FROM deals GROUP BY stage'
  )
  const byStage = { lead: 0, active: 0, closed: 0 }
  for (const row of rows) {
    if (row.stage === 'lead') byStage.lead = Number(row.count)
    else if (row.stage === 'active') byStage.active = Number(row.count)
    else if (row.stage === 'closed') byStage.closed = Number(row.count)
  }
  return { total: byStage.lead + byStage.active + byStage.closed, byStage }
}
