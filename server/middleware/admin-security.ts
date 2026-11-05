import { createError, defineEventHandler, getHeader, getMethod, getRequestURL } from 'h3'
import { requireAdmin } from '../utils/auth'
import { handleApiError } from '../utils/http'

const mutationMethods = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

function forbidden(): never {
  const error = createError({ statusCode: 403, statusMessage: 'Invalid request origin' })
  error.stack = ''
  throw error
}

function isAllowedOrigin(event: Parameters<typeof getRequestURL>[0], origin: string): boolean {
  try {
    const candidate = new URL(origin)
    if (candidate.protocol !== 'http:' && candidate.protocol !== 'https:') return false

    const allowedOrigins = new Set([getRequestURL(event).origin])
    if (process.env.PUBLIC_SITE_URL) {
      const configured = new URL(process.env.PUBLIC_SITE_URL)
      if (configured.protocol === 'http:' || configured.protocol === 'https:') {
        allowedOrigins.add(configured.origin)
      }
    }
    return allowedOrigins.has(candidate.origin)
  } catch {
    return false
  }
}

export default defineEventHandler(async (event) => {
  const pathname = getRequestURL(event).pathname
  if (pathname !== '/api/admin' && !pathname.startsWith('/api/admin/')) return

  try {
    if (mutationMethods.has(getMethod(event))) {
      const origin = getHeader(event, 'origin')
      if (origin && !isAllowedOrigin(event, origin)) forbidden()
    }

    if (pathname !== '/api/admin/auth/login') await requireAdmin(event)
  } catch (error) {
    handleApiError(error)
  }
})
