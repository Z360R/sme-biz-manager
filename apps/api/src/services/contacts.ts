import type { RowDataPacket } from 'mysql2/promise'
import { query, execute } from '~api/db/query'
import type { Contact, PaginatedData } from '@sme/shared'
import type { CreateContactDto, UpdateContactDto } from '@sme/shared'

interface ContactRow extends RowDataPacket {
  id: number
  first_name: string
  last_name: string
  email: string | null
  phone: string | null
  company: string | null
  created_by: number | null
  deleted_at: string | null
  created_at: string
  updated_at: string
}

function toContact(row: ContactRow): Contact {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email,
    phone: row.phone,
    company: row.company,
    createdBy: row.created_by,
    deletedAt: row.deleted_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function getAll(params: {
  page: number
  pageSize: number
  search?: string
}): Promise<PaginatedData<Contact>> {
  const { page, pageSize, search = '' } = params
  const offset = (page - 1) * pageSize
  const like = `%${search}%`

  const rows = await query<ContactRow>(
    `SELECT * FROM contacts
     WHERE deleted_at IS NULL
       AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR company LIKE ?)
     ORDER BY created_at DESC
     LIMIT ? OFFSET ?`,
    [like, like, like, like, pageSize, offset]
  )

  const [countRow] = await query<RowDataPacket & { total: number }>(
    `SELECT COUNT(*) AS total FROM contacts
     WHERE deleted_at IS NULL
       AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR company LIKE ?)`,
    [like, like, like, like]
  )

  const total = Number(countRow?.total ?? 0)

  return {
    items: rows.map(toContact),
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  }
}

export async function getById(id: number): Promise<Contact | null> {
  const rows = await query<ContactRow>(
    'SELECT * FROM contacts WHERE id = ? AND deleted_at IS NULL',
    [id]
  )
  return rows[0] ? toContact(rows[0]) : null
}

export async function create(data: CreateContactDto, userId?: number): Promise<Contact> {
  const result = await execute(
    `INSERT INTO contacts (first_name, last_name, email, phone, company, created_by)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [data.firstName, data.lastName, data.email ?? null, data.phone ?? null, data.company ?? null, userId ?? null]
  )
  return (await getById(result.insertId))!
}

export async function update(id: number, data: UpdateContactDto): Promise<Contact | null> {
  const fields: string[] = []
  const values: (string | number | null)[] = []

  if (data.firstName !== undefined) { fields.push('first_name = ?'); values.push(data.firstName) }
  if (data.lastName !== undefined) { fields.push('last_name = ?'); values.push(data.lastName) }
  if (data.email !== undefined) { fields.push('email = ?'); values.push(data.email ?? null) }
  if (data.phone !== undefined) { fields.push('phone = ?'); values.push(data.phone ?? null) }
  if (data.company !== undefined) { fields.push('company = ?'); values.push(data.company ?? null) }

  if (fields.length === 0) return getById(id)

  values.push(id)
  await execute(
    `UPDATE contacts SET ${fields.join(', ')} WHERE id = ? AND deleted_at IS NULL`,
    values
  )
  return getById(id)
}

export async function softDelete(id: number): Promise<void> {
  await execute(
    'UPDATE contacts SET deleted_at = NOW() WHERE id = ? AND deleted_at IS NULL',
    [id]
  )
}

export async function getStats(): Promise<{ total: number }> {
  const [row] = await query<RowDataPacket & { total: number }>(
    'SELECT COUNT(*) AS total FROM contacts WHERE deleted_at IS NULL'
  )
  return { total: Number(row?.total ?? 0) }
}
