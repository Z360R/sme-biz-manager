import { db } from './connection'
import type { RowDataPacket, ResultSetHeader } from 'mysql2/promise'

type Param = string | number | boolean | null | Date | Buffer

export async function query<T extends RowDataPacket>(
  sql: string,
  params: Param[] = []
): Promise<T[]> {
  const [rows] = await db.execute<T[]>(sql, params)
  return rows
}

export async function execute(
  sql: string,
  params: Param[] = []
): Promise<ResultSetHeader> {
  const [result] = await db.execute<ResultSetHeader>(sql, params)
  return result
}
