import { z } from 'zod'

// ─── Auth ────────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export type LoginDto = z.infer<typeof loginSchema>

// ─── Contacts ────────────────────────────────────────────────────────────────

export const createContactSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email().nullable().optional(),
  phone: z.string().max(20).nullable().optional(),
  company: z.string().max(100).nullable().optional(),
})

export const updateContactSchema = createContactSchema.partial()

export type CreateContactDto = z.infer<typeof createContactSchema>
export type UpdateContactDto = z.infer<typeof updateContactSchema>

// ─── Deals ───────────────────────────────────────────────────────────────────

export const dealStageSchema = z.enum(['lead', 'active', 'closed'])

export const createDealSchema = z.object({
  title: z.string().min(1).max(200),
  contactId: z.number().int().positive(),
  stage: dealStageSchema.default('lead'),
  value: z.number().min(0).default(0),
  notes: z.string().nullable().optional(),
})

export const updateDealSchema = createDealSchema.partial()

export type CreateDealDto = z.infer<typeof createDealSchema>
export type UpdateDealDto = z.infer<typeof updateDealSchema>

// ─── Contact Notes ───────────────────────────────────────────────────────────

export const createContactNoteSchema = z.object({
  contactId: z.number().int().positive(),
  content: z.string().min(1).max(5000),
})

export type CreateContactNoteDto = z.infer<typeof createContactNoteSchema>

// ─── Products ────────────────────────────────────────────────────────────────

export const createProductSchema = z.object({
  sku: z.string().min(1).max(50),
  name: z.string().min(1).max(200),
  category: z.string().min(1).max(100),
  unitPrice: z.number().min(0),
  stockQty: z.number().int().min(0).default(0),
  lowStockThreshold: z.number().int().min(0).default(10),
})

export const updateProductSchema = createProductSchema.partial()

export type CreateProductDto = z.infer<typeof createProductSchema>
export type UpdateProductDto = z.infer<typeof updateProductSchema>

// ─── Stock Movements ─────────────────────────────────────────────────────────

export const stockMovementSchema = z.object({
  productId: z.number().int().positive(),
  type: z.enum(['stock_in', 'stock_out']),
  qty: z.number().int().positive(),
  reason: z.string().min(1).max(255),
})

export type StockMovementDto = z.infer<typeof stockMovementSchema>

// ─── Orders ──────────────────────────────────────────────────────────────────

export const orderItemSchema = z.object({
  productId: z.number().int().positive(),
  qty: z.number().int().positive(),
})

export const createOrderSchema = z.object({
  contactId: z.number().int().positive(),
  items: z.array(orderItemSchema).min(1, 'Order must have at least one item'),
})

export const updateOrderStatusSchema = z.object({
  status: z.enum(['fulfilled', 'cancelled']),
})

export type CreateOrderDto = z.infer<typeof createOrderSchema>
export type UpdateOrderStatusDto = z.infer<typeof updateOrderStatusSchema>

// ─── Pagination ──────────────────────────────────────────────────────────────

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
})

export type PaginationDto = z.infer<typeof paginationSchema>
