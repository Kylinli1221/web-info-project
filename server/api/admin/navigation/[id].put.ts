import { defineEventHandler } from 'h3'
import { navigationUpdateSchema } from '../../../../shared/schemas/content'
import { idParam, parseAdminBody } from '../../../utils/admin-content'
import { handleApiError } from '../../../utils/http'
import { prisma } from '../../../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const input = await parseAdminBody(event, navigationUpdateSchema)
    return await prisma.navigationItem.update({
      where: { id: idParam(event) },
      data: input,
    })
  } catch (error) {
    handleApiError(error)
  }
})
