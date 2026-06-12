import { Router, type IRouter } from 'express'
import { validate } from '~api/middleware/validate'
import { createProductSchema, updateProductSchema } from '@sme/shared'
import * as productsCtrl from '~api/controllers/products'

export const productsRouter: IRouter = Router()

productsRouter.get('/', productsCtrl.list)
productsRouter.post('/', validate(createProductSchema), productsCtrl.create)
productsRouter.get('/categories', productsCtrl.categories)
productsRouter.get('/:id', productsCtrl.getOne)
productsRouter.put('/:id', validate(updateProductSchema), productsCtrl.update)
productsRouter.delete('/:id', productsCtrl.remove)
productsRouter.get('/:id/movements', productsCtrl.listMovements)
productsRouter.post('/:id/movements', productsCtrl.createMovement)
