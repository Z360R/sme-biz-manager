import { Router, type IRouter } from 'express'
import { healthRouter } from './health'
import { contactsRouter } from './contacts'
import { dealsRouter } from './deals'
import { crmRouter } from './crm'
import { productsRouter } from './products'
import { inventoryRouter } from './inventory'

export const router: IRouter = Router()

router.use('/health', healthRouter)
router.use('/crm', crmRouter)
router.use('/contacts', contactsRouter)
router.use('/deals', dealsRouter)
router.use('/products', productsRouter)
router.use('/inventory', inventoryRouter)

// Session 5: auth routes
// router.use('/auth', authRouter)

// Session 5: Order routes
// router.use('/orders', authMiddleware, ordersRouter)
