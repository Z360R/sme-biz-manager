import { Router, type IRouter } from 'express'
import { authenticate } from '~api/middleware/auth'
import { loginLimiter } from '~api/middleware/rateLimiter'
import * as authCtrl from '~api/controllers/auth'

export const authRouter: IRouter = Router()

authRouter.post('/login', loginLimiter, authCtrl.login)
authRouter.post('/refresh', authCtrl.refreshToken)
authRouter.post('/logout', authCtrl.logout)
authRouter.get('/me', authenticate, authCtrl.me)
