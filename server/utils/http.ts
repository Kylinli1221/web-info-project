import { createError, H3Error } from 'h3'
import { ZodError } from 'zod'

function throwPublicError(statusCode: number, statusMessage: string): never {
  const error = createError({ statusCode, statusMessage })
  error.stack = ''
  throw error
}

function prismaErrorCode(error: unknown): string | undefined {
  if (!error || typeof error !== 'object' || !('code' in error)) return undefined
  return typeof error.code === 'string' ? error.code : undefined
}

export function handleApiError(error: unknown): never {
  if (error instanceof ZodError) {
    throwPublicError(422, 'Invalid query parameters')
  }

  if (error instanceof H3Error) {
    error.stack = ''
    throw error
  }

  const code = prismaErrorCode(error)
  if (code === 'P2002') throwPublicError(409, 'A record with this value already exists')
  if (code === 'P2025') throwPublicError(404, 'Record not found')

  console.error('[api] Unexpected server error', error)
  throwPublicError(500, 'Internal Server Error')
}
