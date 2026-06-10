import { Router, type IRouter } from 'express'
import { healthRouter } from './health'
import { contactsRouter } from './contacts'
import { dealsRouter } from './deals'
import { crmRouter } from './crm'

export const router: IRouter = Router()

router.use('/health', healthRouter)
router.use('/crm', crmRouter)
router.use('/contacts', contactsRouter)
router.use('/deals', dealsRouter)

// Session 5: auth routes
// router.use('/auth', authRouter)

// Session 3: Inventory routes
// router.use('/products', authMiddleware, productsRouter)
// router.use('/stock-movements', authMiddleware, stockMovementsRouter)

// Session 4: Order routes
// router.use('/orders', authMiddleware, ordersRouter)
