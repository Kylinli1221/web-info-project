import { createError } from 'h3'
import { z } from 'zod'
import { PublishStatus } from '../../generated/prisma/client'

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(24).default(9),
})

export const slugSchema = z.string().max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)

export function publishedWhere() {
  return {
    status: PublishStatus.PUBLISHED,
    OR: [
      { publishedAt: null },
      { publishedAt: { lte: new Date() } },
    ],
  }
}

export function notFound(): never {
  throw createError({ statusCode: 404, statusMessage: 'Content not found' })
}
