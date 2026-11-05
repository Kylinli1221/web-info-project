import { defineEventHandler } from 'h3'
import { destroySession } from '../../../utils/auth'
import { handleApiError } from '../../../utils/http'

export default defineEventHandler(async (event) => {
  try {
    await destroySession(event)
    return { success: true }
  } catch (error) {
    handleApiError(error)
  }
})
