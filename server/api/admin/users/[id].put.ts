import { hash } from 'argon2'
import { createError, defineEventHandler, getRouterParam, readBody } from 'h3'
import { z } from 'zod'
import { requireAdmin } from '../../../utils/auth'
import { handleApiError } from '../../../utils/http'
import { prisma } from '../../../utils/prisma'

const updateSchema = z.object({
  name: z.string().trim().min(1).max(80),
  password: z.string().min(16).max(1024).optional(),
})

function notFound(): never {
  const error = createError({ statusCode: 404, statusMessage: 'User not found' })
  error.stack = ''
  throw error
}

export default defineEventHandler(async (event) => {
  try {
    await requireAdmin(event)
    const id = getRouterParam(event, 'id')
    const existing = await prisma.adminUser.findUnique({ where: { id }, select: { id: true } })
    if (!existing) notFound()

    const input = updateSchema.parse(await readBody(event))
    const passwordHash = input.password ? await hash(input.password) : undefined

    const [user] = await prisma.$transaction([
      prisma.adminUser.update({
        where: { id },
        data: { name: input.name, ...(passwordHash ? { passwordHash } : {}) },
        select: { id: true, email: true, name: true, createdAt: true, updatedAt: true },
      }),
      // A new password invalidates every existing session of this user.
      ...(passwordHash
        ? [prisma.adminSession.deleteMany({ where: { userId: id } })]
        : []),
    ])

    return user
  } catch (error) {
    handleApiError(error)
  }
})
