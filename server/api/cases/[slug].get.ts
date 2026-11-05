import { defineEventHandler, getRouterParam } from 'h3'
import { getPublishedBySlug } from '../../services/content-service'
import { handleApiError } from '../../utils/http'

export default defineEventHandler(async (event) => {
  try {
    return await getPublishedBySlug('cases', getRouterParam(event, 'slug') ?? '')
  } catch (error) {
    handleApiError(error)
  }
})
