import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { createError, defineEventHandler, getRouterParam, setHeader } from 'h3'
import { mediaMimeType, uploadDirectory } from '../../utils/uploads'

const SAFE_MEDIA_NAME = /^[a-zA-Z0-9-]+\.[a-z0-9]+$/

export default defineEventHandler(async (event) => {
  const name = getRouterParam(event, 'name') ?? ''
  if (!SAFE_MEDIA_NAME.test(name) || path.basename(name) !== name) {
    throw createError({ statusCode: 404, statusMessage: 'Media not found' })
  }

  const directory = uploadDirectory()
  const filePath = path.join(directory, name)
  if (path.dirname(filePath) !== directory) {
    throw createError({ statusCode: 404, statusMessage: 'Media not found' })
  }

  let contents: Buffer
  try {
    contents = await readFile(filePath)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      throw createError({ statusCode: 404, statusMessage: 'Media not found' })
    }
    throw createError({ statusCode: 500, statusMessage: 'Unable to read media' })
  }

  setHeader(event, 'Content-Type', mediaMimeType(name))
  setHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable')
  setHeader(event, 'X-Content-Type-Options', 'nosniff')
  setHeader(event, 'Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline'; img-src 'self' data:")
  return contents
})
