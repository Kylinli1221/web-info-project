import { verify } from 'argon2'
import { createError, defineEventHandler, getRequestIP, readBody } from 'h3'
import { z } from 'zod'
import { createSession } from '../../../utils/auth'
import { handleApiError } from '../../../utils/http'
import { prisma } from '../../../utils/prisma'
import { rateLimit } from '../../../utils/rate-limit'

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1).max(1024),
})

function invalidCredentials(): never {
  const error = createError({ statusCode: 401, statusMessage: 'Invalid email or password' })
  error.stack = ''
  throw error
}

export default defineEventHandler(async (event) => {
  try {
    const clientIp = getRequestIP(event) ?? 'unknown'
    rateLimit(`${clientIp}:/api/admin/auth/login`, 5, 15 * 60 * 1000)

    const { email, password } = loginSchema.parse(await readBody(event))
    const user = await prisma.adminUser.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, passwordHash: true },
    })

    if (!user || !await verify(user.passwordHash, password)) invalidCredentials()

    await createSession(event, user.id)
    return { id: user.id, email: user.email, name: user.name }
  } catch (error) {
    handleApiError(error)
  }
})
