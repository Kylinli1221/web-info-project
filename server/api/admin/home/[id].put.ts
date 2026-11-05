import { defineEventHandler } from 'h3'
import type { Prisma } from '../../../../generated/prisma/client'
import { homeUpdateSchema } from '../../../../shared/schemas/content'
import { idParam, parseAdminBody } from '../../../utils/admin-content'
import { handleApiError } from '../../../utils/http'
import { prisma } from '../../../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const { content, ...input } = await parseAdminBody(event, homeUpdateSchema)
    return await prisma.homeSection.update({
      where: { id: idParam(event) },
      data: {
        ...input,
        ...(content === undefined ? {} : { content: content as Prisma.InputJsonValue }),
      },
    })
  } catch (error) {
    handleApiError(error)
  }
})
