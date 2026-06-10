import { Router } from 'express'
import { healthRouter } from './health'

export const router = Router()

router.use('/health', healthRouter)

// Session 5: auth routes
// router.use('/auth', authRouter)

// Session 2: CRM routes
// router.use('/contacts', authMiddleware, contactsRouter)
// router.use('/deals', authMiddleware, dealsRouter)

// Session 3: Inventory routes
// router.use('/products', authMiddleware, productsRouter)
// router.use('/stock-movements', authMiddleware, stockMovementsRouter)

// Session 4: Order routes
// router.use('/orders', authMiddleware, ordersRouter)
