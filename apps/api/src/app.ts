import express, { type Application } from 'express'
import cors from 'cors'
import { requestLogger } from '~api/middleware/requestLogger'
import { errorHandler } from '~api/middleware/errorHandler'
import { router } from '~api/routes/index'

export const app: Application = express()

app.use(
  cors({
    origin: process.env.CLIENT_URL ?? 'http://localhost:3000',
    credentials: true,
  })
)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(requestLogger)

app.use('/api/v1', router)

app.use(errorHandler)
