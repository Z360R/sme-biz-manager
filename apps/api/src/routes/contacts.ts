import { Router, type IRouter } from 'express'
import { validate } from '~api/middleware/validate'
import { createContactSchema, updateContactSchema } from '@sme/shared'
import * as contactsCtrl from '~api/controllers/contacts'
import * as notesCtrl from '~api/controllers/contactNotes'

export const contactsRouter: IRouter = Router()

contactsRouter.get('/', contactsCtrl.list)
contactsRouter.post('/', validate(createContactSchema), contactsCtrl.create)
contactsRouter.get('/:id', contactsCtrl.getOne)
contactsRouter.put('/:id', validate(updateContactSchema), contactsCtrl.update)
contactsRouter.delete('/:id', contactsCtrl.remove)

contactsRouter.get('/:id/notes', notesCtrl.listByContact)
contactsRouter.post('/:id/notes', notesCtrl.create)
contactsRouter.delete('/:id/notes/:noteId', notesCtrl.remove)
