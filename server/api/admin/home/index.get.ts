import { defineEventHandler } from 'h3'
import { handleApiError } from '../../../utils/http'
import { prisma } from '../../../utils/prisma'

export default defineEventHandler(async () => {
  try {
    return await prisma.homeSection.findMany({
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    })
  } catch (error) {
    handleApiError(error)
  }
})
