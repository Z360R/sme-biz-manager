import { Router, type IRouter } from 'express'
import { validate } from '~api/middleware/validate'
import { createOrderSchema, updateOrderStatusSchema } from '@sme/shared'
import * as ordersCtrl from '~api/controllers/orders'

export const ordersRouter: IRouter = Router()

ordersRouter.get('/', ordersCtrl.list)
ordersRouter.post('/', validate(createOrderSchema), ordersCtrl.create)
ordersRouter.get('/stats', ordersCtrl.stats)
ordersRouter.get('/:id', ordersCtrl.getOne)
ordersRouter.put('/:id/status', validate(updateOrderStatusSchema), ordersCtrl.updateStatus)
