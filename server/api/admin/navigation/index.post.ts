import { defineEventHandler, setResponseStatus } from 'h3'
import { navigationSchema } from '../../../../shared/schemas/content'
import { parseAdminBody } from '../../../utils/admin-content'
import { handleApiError } from '../../../utils/http'
import { prisma } from '../../../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const input = await parseAdminBody(event, navigationSchema)
    const item = await prisma.navigationItem.create({ data: input })
    setResponseStatus(event, 201)
    return item
  } catch (error) {
    handleApiError(error)
  }
})
