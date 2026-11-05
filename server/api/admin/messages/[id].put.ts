import { defineEventHandler } from 'h3'
import { z } from 'zod'
import { idParam, parseAdminBody } from '../../../utils/admin-content'
import { handleApiError } from '../../../utils/http'
import { prisma } from '../../../utils/prisma'

const updateSchema = z.object({ isRead: z.boolean() })

export default defineEventHandler(async (event) => {
  try {
    const input = await parseAdminBody(event, updateSchema)
    return await prisma.contactMessage.update({
      where: { id: idParam(event) },
      data: input,
    })
  } catch (error) {
    handleApiError(error)
  }
})
