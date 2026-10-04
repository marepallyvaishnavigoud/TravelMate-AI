import jwt, { type JwtPayload, type SignOptions } from 'jsonwebtoken'
import type { UserRole } from '../models/User.js'

export type AuthTokenPayload = { userId: string; role: UserRole; tokenVersion: number }

function jwtSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret || secret.length < 32) throw new Error('JWT_SECRET must be configured with at least 32 characters.')
  return secret
}

export function isJwtConfigured(): boolean {
  return Boolean(process.env.JWT_SECRET && process.env.JWT_SECRET.length >= 32)
}

export function generateToken(payload: AuthTokenPayload): string {
  const expiresIn = (process.env.JWT_EXPIRES_IN ?? '7d') as SignOptions['expiresIn']
  return jwt.sign(payload, jwtSecret(), { expiresIn })
}

export function verifyToken(token: string): AuthTokenPayload {
  const decoded: string | JwtPayload = jwt.verify(token, jwtSecret())
  if (typeof decoded === 'string' || typeof decoded.userId !== 'string' || (decoded.role !== 'user' && decoded.role !== 'admin') || typeof decoded.tokenVersion !== 'number') {
    throw new Error('Invalid authentication token.')
  }
  return { userId: decoded.userId, role: decoded.role, tokenVersion: decoded.tokenVersion }
}
