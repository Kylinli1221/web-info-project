import { defineEventHandler } from 'h3'
import { requireAdmin } from '../../../utils/auth'
import { handleApiError } from '../../../utils/http'
import { prisma } from '../../../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    await requireAdmin(event)
    return await prisma.adminUser.findMany({
      select: { id: true, email: true, name: true, createdAt: true, updatedAt: true },
      orderBy: { createdAt: 'asc' },
    })
  } catch (error) {
    handleApiError(error)
  }
})
