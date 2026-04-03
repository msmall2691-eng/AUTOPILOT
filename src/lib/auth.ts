import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/db'
import type { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me'
const SALT_ROUNDS = 12
const TOKEN_EXPIRY = '7d'

export interface TokenPayload {
  userId: string
  iat: number
  exp: number
}

export interface SessionUser {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  companyId: string | null
}

/**
 * Hash a plaintext password using bcrypt.
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS)
}

/**
 * Verify a plaintext password against a bcrypt hash.
 */
export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

/**
 * Create a signed JWT for the given user ID.
 */
export function createToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY })
}

/**
 * Verify and decode a JWT. Returns the decoded payload or null if invalid.
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload
  } catch {
    return null
  }
}

/**
 * Read the auth token from cookies, verify it, and return the associated user.
 * Returns null if the token is missing, invalid, or the user no longer exists.
 */
export async function getSession(
  cookies: ReadonlyRequestCookies,
): Promise<SessionUser | null> {
  const token = cookies.get('token')?.value

  if (!token) {
    return null
  }

  const payload = verifyToken(token)

  if (!payload) {
    return null
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        companyId: true,
      },
    })

    if (!user) {
      return null
    }

    return user
  } catch {
    return null
  }
}
