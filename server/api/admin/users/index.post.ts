import { hash } from 'argon2'
import { createError, defineEventHandler, readBody } from 'h3'
import { z } from 'zod'
import { requireAdmin } from '../../../utils/auth'
import { handleApiError } from '../../../utils/http'
import { prisma } from '../../../utils/prisma'

const createSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(200),
  name: z.string().trim().min(1).max(80),
  password: z.string().min(16).max(1024),
})

function emailTaken(): never {
  const error = createError({ statusCode: 409, statusMessage: 'A user with this email already exists' })
  error.stack = ''
  throw error
}

export default defineEventHandler(async (event) => {
  try {
    await requireAdmin(event)
    const input = createSchema.parse(await readBody(event))
    const existing = await prisma.adminUser.findUnique({ where: { email: input.email }, select: { id: true } })
    if (existing) emailTaken()

    const passwordHash = await hash(input.password)
    const user = await prisma.adminUser.create({
      data: { email: input.email, name: input.name, passwordHash },
      select: { id: true, email: true, name: true, createdAt: true, updatedAt: true },
    })
    return user
  } catch (error) {
    handleApiError(error)
  }
})
