import { defineEventHandler } from 'h3'
import { getSiteContent } from '../services/content-service'
import { handleApiError } from '../utils/http'

export default defineEventHandler(async () => {
  try {
    return await getSiteContent()
  } catch (error) {
    handleApiError(error)
  }
})
