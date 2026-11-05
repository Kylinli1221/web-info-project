import { createHmac, randomBytes } from 'node:crypto'
import { createError, deleteCookie, getCookie, setCookie } from 'h3'
import type { H3Event } from 'h3'
import type { AdminUser as PrismaAdminUser } from '../../generated/prisma/client'
import { prisma } from './prisma'

export const SESSION_COOKIE = 'nexora_admin'
export const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000

export type AdminUser = Pick<PrismaAdminUser, 'id' | 'email' | 'name'>

function unauthorized(): never {
  const error = createError({ statusCode: 401, statusMessage: 'Authentication required' })
  error.stack = ''
  throw error
}

function hashToken(rawToken: string): string {
  const secret = process.env.SESSION_SECRET
  if (!secret) throw new Error('SESSION_SECRET is not configured')
  return createHmac('sha256', secret).update(rawToken).digest('hex')
}

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
  }
}

export function getSessionTokenHash(event: H3Event): string {
  const rawToken = getCookie(event, SESSION_COOKIE)
  if (!rawToken) unauthorized()
  return hashToken(rawToken)
}

export async function createSession(event: H3Event, userId: string): Promise<void> {
  const rawToken = randomBytes(32).toString('base64url')
  const tokenHash = hashToken(rawToken)
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS)

  await prisma.adminSession.create({
    data: { tokenHash, userId, expiresAt },
  })

  setCookie(event, SESSION_COOKIE, rawToken, {
    ...cookieOptions(),
    maxAge: SESSION_TTL_MS / 1000,
  })
}

export async function destroySession(event: H3Event): Promise<void> {
  const rawToken = getCookie(event, SESSION_COOKIE)
  if (rawToken) {
    await prisma.adminSession.deleteMany({ where: { tokenHash: hashToken(rawToken) } })
  }
  deleteCookie(event, SESSION_COOKIE, cookieOptions())
}

export async function requireAdmin(event: H3Event): Promise<AdminUser> {
  const tokenHash = getSessionTokenHash(event)
  const session = await prisma.adminSession.findFirst({
    where: { tokenHash, expiresAt: { gt: new Date() } },
    select: {
      user: { select: { id: true, email: true, name: true } },
    },
  })

  if (!session) unauthorized()
  return session.user
}
