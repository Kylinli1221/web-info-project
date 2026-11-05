import { defineEventHandler } from 'h3'
import { listStatusQuery } from '../../../utils/admin-content'
import { handleApiError } from '../../../utils/http'
import { prisma } from '../../../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const { status } = listStatusQuery(event)
    return await prisma.solution.findMany({
      where: status ? { status } : undefined,
      orderBy: [{ sortOrder: 'asc' }, { updatedAt: 'desc' }],
    })
  } catch (error) {
    handleApiError(error)
  }
})
