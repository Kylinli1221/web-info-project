import { createError, defineEventHandler, getRouterParam } from 'h3'
import { requireAdmin } from '../../../utils/auth'
import { handleApiError } from '../../../utils/http'
import { prisma } from '../../../utils/prisma'

function badRequest(statusMessage: string): never {
  const error = createError({ statusCode: 400, statusMessage })
  error.stack = ''
  throw error
}

export default defineEventHandler(async (event) => {
  try {
    const currentUser = await requireAdmin(event)
    const id = getRouterParam(event, 'id')

    if (id === currentUser.id) badRequest('You cannot delete your own account')

    const existing = await prisma.adminUser.findUnique({ where: { id }, select: { id: true } })
    if (!existing) {
      const error = createError({ statusCode: 404, statusMessage: 'User not found' })
      error.stack = ''
      throw error
    }

    const remaining = await prisma.adminUser.count({ where: { id: { not: id } } })
    if (remaining === 0) badRequest('At least one administrator must remain')

    await prisma.adminUser.delete({ where: { id } })
    return { ok: true }
  } catch (error) {
    handleApiError(error)
  }
})
