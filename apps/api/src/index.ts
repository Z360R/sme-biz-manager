import 'dotenv/config'
import { app } from './app'
import { logger } from './utils/logger'
import { db } from './db/connection'

const PORT = process.env.PORT ?? 4000

async function bootstrap() {
  try {
    await db.query('SELECT 1')
    logger.info('Database connection established')
  } catch (err) {
    logger.error('Database connection failed — check DB_* env vars', { err })
    process.exit(1)
  }

  app.listen(PORT, () => {
    logger.info(`API server running`, {
      port: PORT,
      env: process.env.NODE_ENV ?? 'development',
    })
  })
}

bootstrap()
