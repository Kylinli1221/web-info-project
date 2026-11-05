import { hash, verify } from 'argon2'
import { createError, defineEventHandler, readBody } from 'h3'
import { z } from 'zod'
import { getSessionTokenHash, requireAdmin } from '../../../utils/auth'
import { handleApiError } from '../../../utils/http'
import { prisma } from '../../../utils/prisma'

const passwordSchema = z.object({
  currentPassword: z.string().min(1).max(1024),
  newPassword: z.string().min(16).max(1024),
})

function invalidCurrentPassword(): never {
  const error = createError({ statusCode: 401, statusMessage: 'Invalid current password' })
  error.stack = ''
  throw error
}

export default defineEventHandler(async (event) => {
  try {
    const user = await requireAdmin(event)
    const { currentPassword, newPassword } = passwordSchema.parse(await readBody(event))
    const record = await prisma.adminUser.findUnique({
      where: { id: user.id },
      select: { passwordHash: true },
    })

    if (!record || !await verify(record.passwordHash, currentPassword)) invalidCurrentPassword()

    const passwordHash = await hash(newPassword)
    const tokenHash = getSessionTokenHash(event)
    const [updatedUser] = await prisma.$transaction([
      prisma.adminUser.update({
        where: { id: user.id },
        data: { passwordHash },
        select: { id: true, email: true, name: true },
      }),
      prisma.adminSession.deleteMany({
        where: { userId: user.id, NOT: { tokenHash } },
      }),
    ])

    return updatedUser
  } catch (error) {
    handleApiError(error)
  }
})
