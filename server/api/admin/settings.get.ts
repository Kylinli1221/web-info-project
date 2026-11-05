import { defineEventHandler } from 'h3'
import { getOrCreateSettings } from '../../services/settings-service'
import { handleApiError } from '../../utils/http'

export default defineEventHandler(async () => {
  try {
    return await getOrCreateSettings()
  } catch (error) {
    handleApiError(error)
  }
})
