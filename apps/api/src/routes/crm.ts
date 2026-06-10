import { Router, type IRouter } from 'express'
import * as contactsService from '~api/services/contacts'
import * as dealsService from '~api/services/deals'

export const crmRouter: IRouter = Router()

crmRouter.get('/stats', async (_req, res, next) => {
  try {
    const [contacts, deals] = await Promise.all([
      contactsService.getStats(),
      dealsService.getStats(),
    ])
    res.json({ success: true, data: { contacts, deals } })
  } catch (err) {
    next(err)
  }
})
