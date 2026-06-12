import { Router, type IRouter } from 'express'
import { healthRouter } from './health'
import { authRouter } from './auth'
import { contactsRouter } from './contacts'
import { dealsRouter } from './deals'
import { crmRouter } from './crm'
import { productsRouter } from './products'
import { inventoryRouter } from './inventory'
import { ordersRouter } from './orders'
import { authenticate } from '~api/middleware/auth'

export const router: IRouter = Router()

router.use('/health', healthRouter)
router.use('/auth', authRouter)

// All data routes require authentication
router.use('/crm', authenticate, crmRouter)
router.use('/contacts', authenticate, contactsRouter)
router.use('/deals', authenticate, dealsRouter)
router.use('/products', authenticate, productsRouter)
router.use('/inventory', authenticate, inventoryRouter)
router.use('/orders', authenticate, ordersRouter)
