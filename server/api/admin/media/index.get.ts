import { defineEventHandler, getQuery } from 'h3'
import { z } from 'zod'
import { handleApiError } from '../../../utils/http'
import { prisma } from '../../../utils/prisma'

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(48).default(24),
})

export default defineEventHandler(async (event) => {
  try {
    const { page, pageSize } = querySchema.parse(getQuery(event))
    const [items, total] = await prisma.$transaction([
      prisma.mediaAsset.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.mediaAsset.count(),
    ])
    return { items, page, pageSize, total }
  } catch (error) {
    handleApiError(error)
  }
})
