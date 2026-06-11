import type { Request, Response, NextFunction } from 'express'
import * as notesService from '~api/services/contactNotes'
import { z } from 'zod'

const noteBodySchema = z.object({
  content: z.string().min(1).max(5000),
})

export async function listByContact(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const notes = await notesService.getByContactId(Number(req.params.id))
    res.json({ success: true, data: notes })
  } catch (err) {
    next(err)
  }
}

export async function create(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = noteBodySchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ success: false, error: 'content is required', code: 'VALIDATION_ERROR' })
      return
    }
    const note = await notesService.create(Number(req.params.id), parsed.data.content)
    res.status(201).json({ success: true, data: note })
  } catch (err) {
    next(err)
  }
}

export async function remove(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await notesService.remove(Number(req.params.noteId))
    res.json({ success: true, data: null })
  } catch (err) {
    next(err)
  }
}
