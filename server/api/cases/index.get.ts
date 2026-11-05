import { defineEventHandler, getQuery } from 'h3'
import { listPublished } from '../../services/content-service'
import { paginationSchema } from '../../utils/content'
import { handleApiError } from '../../utils/http'

export default defineEventHandler(async (event) => {
  try {
    const query = paginationSchema.parse(getQuery(event))
    return await listPublished('cases', query)
  } catch (error) {
    handleApiError(error)
  }
})
