import { defineEventHandler, getRequestIP, readBody, setResponseStatus } from 'h3'
import { z } from 'zod'
import { handleApiError } from '../utils/http'
import { prisma } from '../utils/prisma'
import { rateLimit } from '../utils/rate-limit'

const contactSchema = z.object({
  name: z.string().trim().min(1).max(80),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().max(50).optional().default(''),
  company: z.string().trim().max(160).optional().default(''),
  message: z.string().trim().min(10).max(2000),
  locale: z.enum(['zh', 'en']),
  website: z.string().max(200).optional().default(''),
})

export default defineEventHandler(async (event) => {
  try {
    const clientIp = getRequestIP(event) ?? 'unknown'
    rateLimit(`${clientIp}:/api/contact`, 5, 60 * 60 * 1000)
    const input = contactSchema.parse(await readBody(event))

    if (input.website) return { success: true }

    await prisma.contactMessage.create({
      data: {
        name: input.name,
        email: input.email,
        phone: input.phone || null,
        company: input.company || null,
        message: input.message,
        locale: input.locale,
      },
    })
    setResponseStatus(event, 201)
    return { success: true }
  } catch (error) {
    handleApiError(error)
  }
})
