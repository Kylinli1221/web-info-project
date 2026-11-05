import { createError } from 'h3'

type RateLimitEntry = {
  count: number
  expiresAt: number
}

const entries = new Map<string, RateLimitEntry>()
const maxEntries = 1000
const cleanupIntervalMs = 60_000

function cleanup(now = Date.now()) {
  for (const [key, entry] of entries) {
    if (entry.expiresAt <= now) entries.delete(key)
  }
}

const cleanupTimer = setInterval(cleanup, cleanupIntervalMs)
cleanupTimer.unref()

export function rateLimit(key: string, limit: number, windowMs: number): void {
  const now = Date.now()
  const existing = entries.get(key)

  if (existing && existing.expiresAt > now) {
    existing.count += 1
    if (existing.count > limit) {
      const error = createError({ statusCode: 429, statusMessage: 'Too many requests' })
      error.stack = ''
      throw error
    }
    return
  }

  if (entries.size >= maxEntries) {
    cleanup(now)
    while (entries.size >= maxEntries) {
      const oldestKey = entries.keys().next().value
      if (oldestKey === undefined) break
      entries.delete(oldestKey)
    }
  }

  entries.set(key, { count: 1, expiresAt: now + windowMs })
}
