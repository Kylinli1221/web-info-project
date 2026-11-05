import { createError, getQuery, getRouterParam, readBody } from 'h3'
import type { H3Event } from 'h3'
import type { z } from 'zod'
import { statusFilterSchema } from '../../shared/schemas/content'

type PublicationInput = {
  status?: 'DRAFT' | 'PUBLISHED'
  publishedAt?: string | null
}

export async function parseAdminBody<T extends z.ZodType>(
  event: H3Event,
  schema: T,
): Promise<z.infer<T>> {
  return schema.parse(await readBody(event))
}

export function idParam(event: H3Event): string {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing record id' })
  return id
}

export function listStatusQuery(event: H3Event) {
  return statusFilterSchema.parse(getQuery(event))
}

export function publicationData<T extends PublicationInput>(
  input: T,
  existingPublishedAt?: Date | null,
): Omit<T, 'publishedAt'> & { publishedAt?: Date | null } {
  const { publishedAt, ...rest } = input
  const status = input.status

  if (status === 'PUBLISHED') {
    return {
      ...rest,
      publishedAt: publishedAt ? new Date(publishedAt) : existingPublishedAt ?? new Date(),
    }
  }

  if (publishedAt !== undefined) {
    return {
      ...rest,
      publishedAt: publishedAt ? new Date(publishedAt) : null,
    }
  }

  return rest
}
