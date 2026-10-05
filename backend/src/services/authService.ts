import bcrypt from 'bcryptjs'
import { isDatabaseConnected } from '../config/database.js'
import { User, type UserRole } from '../models/User.js'
import type { LoginInput, RegisterInput } from '../validators/authValidators.js'
import { AppError } from '../utils/AppError.js'
import { generateToken, isJwtConfigured } from '../utils/jwt.js'

export type SafeUser = { id: string; firstName: string; lastName: string; email: string; avatar: string | null; role: UserRole; createdAt: Date }
export type AuthResult = { user: SafeUser; token: string }

function requireDatabase(): void {
  if (!isJwtConfigured()) throw new AppError(503, 'Authentication is not configured. Set a JWT_SECRET of at least 32 characters in backend/.env.')
  if (!isDatabaseConnected()) throw new AppError(503, 'Account services are unavailable until the database is connected. Configure MONGODB_URI and restart the backend.')
}

function safeUser(user: { _id: { toString(): string }; firstName: string; lastName: string; email: string; avatar?: string | null; role: UserRole; createdAt: Date }): SafeUser {
  return { id: user._id.toString(), firstName: user.firstName, lastName: user.lastName, email: user.email, avatar: user.avatar ?? null, role: user.role, createdAt: user.createdAt }
}

export async function registerUser(input: RegisterInput): Promise<AuthResult> {
  requireDatabase()
  const existing = await User.findOne({ email: input.email }).lean()
  if (existing) throw new AppError(409, 'An account with this email already exists.')
  const password = await bcrypt.hash(input.password, 12)
  try {
    const user = await User.create({ ...input, password })
    const publicUser = safeUser(user)
    return { user: publicUser, token: generateToken({ userId: publicUser.id, role: publicUser.role, tokenVersion: user.tokenVersion }) }
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 11000) throw new AppError(409, 'An account with this email already exists.')
    throw error
  }
}

export async function loginUser(input: LoginInput): Promise<AuthResult> {
  requireDatabase()
  // tokenVersion is select:false in the model, but it must be present in the
  // JWT so authMiddleware can validate sessions after login.
  const user = await User.findOne({ email: input.email }).select('+password +tokenVersion')
  let passwordMatches = false
  if (user) passwordMatches = await bcrypt.compare(input.password, user.password)
  else await bcrypt.hash(input.password, 12)
  if (!user || !passwordMatches) throw new AppError(401, 'Email or password is incorrect.')
  const publicUser = safeUser(user)
  return { user: publicUser, token: generateToken({ userId: publicUser.id, role: publicUser.role, tokenVersion: user.tokenVersion }) }
}

export async function getCurrentUser(userId: string): Promise<SafeUser> {
  requireDatabase()
  const user = await User.findById(userId)
  if (!user) throw new AppError(401, 'Your account could not be found. Please sign in again.')
  return safeUser(user)
}

export async function revokeUserSessions(userId: string): Promise<void> {
  requireDatabase()
  await User.findByIdAndUpdate(userId, { $inc: { tokenVersion: 1 } })
}
