import type { RowDataPacket } from 'mysql2/promise'
import { query, execute } from '~api/db/query'
import type { ContactNote } from '@sme/shared'

interface NoteRow extends RowDataPacket {
  id: number
  contact_id: number
  user_id: number | null
  content: string
  created_at: string
  updated_at: string
}

function toNote(row: NoteRow): ContactNote {
  return {
    id: row.id,
    contactId: row.contact_id,
    userId: row.user_id,
    content: row.content,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function getByContactId(contactId: number): Promise<ContactNote[]> {
  const rows = await query<NoteRow>(
    'SELECT * FROM contact_notes WHERE contact_id = ? ORDER BY created_at DESC',
    [contactId]
  )
  return rows.map(toNote)
}

export async function create(
  contactId: number,
  content: string,
  userId?: number
): Promise<ContactNote> {
  const result = await execute(
    'INSERT INTO contact_notes (contact_id, user_id, content) VALUES (?, ?, ?)',
    [contactId, userId ?? null, content]
  )
  const [row] = await query<NoteRow>(
    'SELECT * FROM contact_notes WHERE id = ?',
    [result.insertId]
  )
  return toNote(row!)
}

export async function remove(id: number): Promise<void> {
  await execute('DELETE FROM contact_notes WHERE id = ?', [id])
}
