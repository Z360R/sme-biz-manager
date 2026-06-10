import morgan from 'morgan'
import { logger } from '~api/utils/logger'

const stream = {
  write: (message: string) => logger.http(message.trimEnd()),
}

export const requestLogger = morgan('combined', { stream })
