import { defineEventHandler, setResponseStatus } from 'h3'
import { idParam } from '../../../utils/admin-content'
import { handleApiError } from '../../../utils/http'
import { prisma } from '../../../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    await prisma.solution.delete({ where: { id: idParam(event) } })
    setResponseStatus(event, 204)
    return null
  } catch (error) {
    handleApiError(error)
  }
})
