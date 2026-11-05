import { defineEventHandler } from 'h3'
import { requireAdmin } from '../../../utils/auth'
import { handleApiError } from '../../../utils/http'

export default defineEventHandler(async (event) => {
  try {
    return await requireAdmin(event)
  } catch (error) {
    handleApiError(error)
  }
})
