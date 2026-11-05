import { defineEventHandler } from 'h3'
import { settingsSchema } from '../../../shared/schemas/content'
import { updateSettings } from '../../services/settings-service'
import { parseAdminBody } from '../../utils/admin-content'
import { handleApiError } from '../../utils/http'

export default defineEventHandler(async (event) => {
  try {
    const input = await parseAdminBody(event, settingsSchema)
    return await updateSettings(input)
  } catch (error) {
    handleApiError(error)
  }
})
