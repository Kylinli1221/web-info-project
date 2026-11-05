import { randomUUID } from 'node:crypto'
import { mkdir, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { createError, getHeader, readMultipartFormData } from 'h3'
import type { H3Event } from 'h3'
import { fileTypeFromBuffer } from 'file-type'
import sharp from 'sharp'
import { optimize } from 'svgo'

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024
const MIME_BY_EXTENSION: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
  svg: 'image/svg+xml',
}

export interface StoredImage {
  url: string
  storageName: string
  originalName: string
  mimeType: string
  size: number
  width: number | null
  height: number | null
}

export function uploadDirectory(): string {
  return path.resolve(process.cwd(), process.env.UPLOAD_DIR ?? 'storage/uploads')
}

export function mediaMimeType(name: string): string {
  const extension = path.extname(name).slice(1).toLowerCase()
  return MIME_BY_EXTENSION[extension] ?? 'application/octet-stream'
}

function safeFilename(name: string | undefined): string {
  return path.basename(name ?? 'image').replace(/[^\w.\- ]+/g, '_').slice(0, 200) || 'image'
}

function sanitizeSvg(buffer: Buffer): Buffer {
  const source = buffer.toString('utf8')
  if (!/^\s*(?:<\?xml[^>]*>\s*)?<svg[\s>]/i.test(source)) {
    throw createError({ statusCode: 415, statusMessage: 'Invalid SVG image' })
  }

  const optimized = optimize(source, {
    multipass: true,
    plugins: ['preset-default', 'removeStyleElement'],
  }).data

  const unsafe = /<script|<foreignObject|<iframe|<object|<embed|<!DOCTYPE|<!ENTITY|\son[a-z]+\s*=|\s(?:xlink:)?href\s*=|url\s*\(\s*['"]?(?!#)/i
  if (unsafe.test(optimized)) {
    throw createError({ statusCode: 415, statusMessage: 'Unsafe SVG content' })
  }

  return Buffer.from(optimized, 'utf8')
}

export async function saveImageUpload(event: H3Event): Promise<StoredImage> {
  const contentLength = Number(getHeader(event, 'content-length') ?? 0)
  if (contentLength > MAX_UPLOAD_BYTES + 512 * 1024) {
    throw createError({ statusCode: 413, statusMessage: 'Image exceeds 5 MiB' })
  }

  const parts = await readMultipartFormData(event)
  const file = parts?.find(part => part.name === 'file' && part.data?.length)
  if (!file) throw createError({ statusCode: 400, statusMessage: 'Image file is required' })
  if (file.data.length > MAX_UPLOAD_BYTES) {
    throw createError({ statusCode: 413, statusMessage: 'Image exceeds 5 MiB' })
  }

  const originalName = safeFilename(file.filename)
  const declaredType = file.type ?? ''
  let buffer = file.data
  let extension: string

  if (declaredType === 'image/svg+xml' || originalName.toLowerCase().endsWith('.svg')) {
    buffer = sanitizeSvg(buffer)
    extension = 'svg'
  } else {
    const detected = await fileTypeFromBuffer(buffer)
    if (!detected || !['jpg', 'png', 'webp', 'gif'].includes(detected.ext)) {
      throw createError({ statusCode: 415, statusMessage: 'Unsupported image type' })
    }
    extension = detected.ext === 'jpg' ? 'jpg' : detected.ext
  }

  const mimeType = MIME_BY_EXTENSION[extension] ?? 'application/octet-stream'
  const storageName = `${randomUUID()}.${extension}`
  const directory = uploadDirectory()
  await mkdir(directory, { recursive: true })

  let width: number | null = null
  let height: number | null = null
  try {
    const metadata = await sharp(buffer).metadata()
    width = metadata.width ?? null
    height = metadata.height ?? null
  } catch {
    if (extension !== 'svg') {
      throw createError({ statusCode: 415, statusMessage: 'Invalid image data' })
    }
  }

  const diskPath = path.join(directory, storageName)
  await writeFile(diskPath, buffer, { flag: 'wx' })

  return {
    url: `/media/${storageName}`,
    storageName,
    originalName,
    mimeType,
    size: buffer.length,
    width,
    height,
  }
}

export async function removeStoredImage(storageName: string): Promise<void> {
  try {
    await unlink(path.join(uploadDirectory(), storageName))
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
  }
}
