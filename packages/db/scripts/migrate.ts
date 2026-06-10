import 'dotenv/config'
import mysql from 'mysql2/promise'
import { readFileSync } from 'fs'
import { join } from 'path'

async function migrate() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT ?? 3306),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    multipleStatements: true,
  })

  try {
    const sql = readFileSync(
      join(__dirname, '..', 'migrations', '001_initial_schema.sql'),
      'utf8'
    )
    await conn.query(sql)
    console.log('✓ Migration 001_initial_schema completed')
  } finally {
    await conn.end()
  }
}

migrate().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
