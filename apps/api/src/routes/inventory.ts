import { Router, type IRouter } from 'express'
import * as inventoryCtrl from '~api/controllers/inventory'

export const inventoryRouter: IRouter = Router()

inventoryRouter.get('/stats', inventoryCtrl.getStats)
