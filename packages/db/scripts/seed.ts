import 'dotenv/config'
import mysql from 'mysql2/promise'
import bcrypt from 'bcryptjs'

// Seed is idempotent — safe to re-run.
// Session 5: users only. Full seed (contacts, products, orders) in Session 6.

const USERS = [
  { email: 'admin@demo.com', password: 'Demo@1234', role: 'admin' },
  { email: 'staff@demo.com', password: 'Demo@1234', role: 'staff' },
]

async function seed() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT ?? 3306),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  })

  try {
    for (const u of USERS) {
      const hash = await bcrypt.hash(u.password, 12)
      await conn.execute(
        `INSERT INTO users (email, password_hash, role)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), role = VALUES(role)`,
        [u.email, hash, u.role]
      )
      console.log(`✓ Upserted user: ${u.email} (${u.role})`)
    }
    console.log('\nSeed complete. Login with admin@demo.com / Demo@1234')
  } finally {
    await conn.end()
  }
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
