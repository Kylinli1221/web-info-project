import { defineEventHandler, setResponseStatus } from 'h3'
import { handleApiError } from '../../../utils/http'
import { prisma } from '../../../utils/prisma'
import { removeStoredImage, saveImageUpload } from '../../../utils/uploads'

export default defineEventHandler(async (event) => {
  let storageName: string | undefined
  try {
    const stored = await saveImageUpload(event)
    storageName = stored.storageName
    const asset = await prisma.mediaAsset.create({ data: stored })
    setResponseStatus(event, 201)
    return asset
  } catch (error) {
    if (storageName) await removeStoredImage(storageName).catch(() => {})
    handleApiError(error)
  }
})
