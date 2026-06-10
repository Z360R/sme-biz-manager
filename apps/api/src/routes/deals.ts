import { Router, type IRouter } from 'express'
import { validate } from '~api/middleware/validate'
import { createDealSchema, updateDealSchema } from '@sme/shared'
import * as dealsCtrl from '~api/controllers/deals'

export const dealsRouter: IRouter = Router()

dealsRouter.get('/', dealsCtrl.list)
dealsRouter.post('/', validate(createDealSchema), dealsCtrl.create)
dealsRouter.get('/:id', dealsCtrl.getOne)
dealsRouter.put('/:id', validate(updateDealSchema), dealsCtrl.update)
dealsRouter.delete('/:id', dealsCtrl.remove)
dealsRouter.get('/:id/activities', dealsCtrl.listActivities)
