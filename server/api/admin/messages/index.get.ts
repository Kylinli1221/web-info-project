import { defineEventHandler, getQuery } from 'h3'
import { z } from 'zod'
import { handleApiError } from '../../../utils/http'
import { prisma } from '../../../utils/prisma'

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
  isRead: z.enum(['true', 'false']).optional(),
})

export default defineEventHandler(async (event) => {
  try {
    const { page, pageSize, isRead } = querySchema.parse(getQuery(event))
    const where = isRead === undefined ? undefined : { isRead: isRead === 'true' }
    const [items, total] = await prisma.$transaction([
      prisma.contactMessage.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.contactMessage.count({ where }),
    ])
    return { items, page, pageSize, total }
  } catch (error) {
    handleApiError(error)
  }
})
