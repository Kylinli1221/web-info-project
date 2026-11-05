import { defineEventHandler } from 'h3'
import { getHomeContent } from '../services/content-service'
import { handleApiError } from '../utils/http'

export default defineEventHandler(async () => {
  try {
    return await getHomeContent()
  } catch (error) {
    handleApiError(error)
  }
})
