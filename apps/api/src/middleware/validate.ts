import type { Request, Response, NextFunction } from 'express'
import type { ZodSchema } from 'zod'

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
      res.status(400).json({
        success: false,
        error: result.error.errors.map((e) => e.message).join('; '),
        code: 'VALIDATION_ERROR',
      })
      return
    }
    req.body = result.data
    next()
  }
}
