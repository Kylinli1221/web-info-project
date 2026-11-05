import { createError, defineEventHandler, setResponseStatus } from 'h3'
import { idParam } from '../../../utils/admin-content'
import { handleApiError } from '../../../utils/http'
import { prisma } from '../../../utils/prisma'
import { removeStoredImage } from '../../../utils/uploads'

export default defineEventHandler(async (event) => {
  try {
    const asset = await prisma.mediaAsset.findUnique({ where: { id: idParam(event) } })
    if (!asset) throw createError({ statusCode: 404, statusMessage: 'Media not found' })

    const [settings, home, solutions, cases, news] = await Promise.all([
      prisma.siteSetting.findMany(),
      prisma.homeSection.findMany(),
      prisma.solution.findMany(),
      prisma.caseStudy.findMany(),
      prisma.newsPost.findMany(),
    ])
    const referenced = JSON.stringify({ settings, home, solutions, cases, news }).includes(asset.url)
    if (referenced) {
      throw createError({ statusCode: 409, statusMessage: 'Image is still referenced by content' })
    }

    await prisma.mediaAsset.delete({ where: { id: asset.id } })
    await removeStoredImage(asset.storageName)
    setResponseStatus(event, 204)
    return null
  } catch (error) {
    handleApiError(error)
  }
})
