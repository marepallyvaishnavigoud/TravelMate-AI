import type { RequestHandler } from 'express'
import { isDatabaseConnected } from '../config/database.js'
import { User } from '../models/User.js'
import { AppError } from '../utils/AppError.js'
import { verifyToken } from '../utils/jwt.js'

export const authMiddleware: RequestHandler = async (request, _response, next) => {
  const authorization = request.headers.authorization
  if (!authorization?.startsWith('Bearer ')) return next(new AppError(401, 'Authentication is required.'))
  const token = authorization.slice(7).trim()
  if (!token) return next(new AppError(401, 'Authentication is required.'))
  let payload: ReturnType<typeof verifyToken>
  try {
    payload = verifyToken(token)
  } catch {
    next(new AppError(401, 'Your session is invalid or has expired. Please sign in again.'))
    return
  }
  if (!isDatabaseConnected()) return next(new AppError(503, 'Account services are unavailable until the database is connected. Configure MONGODB_URI and restart the backend.'))
  const user = await User.findById(payload.userId).select('+tokenVersion')
  if (!user || user.tokenVersion !== payload.tokenVersion || user.role !== payload.role) return next(new AppError(401, 'Your session is invalid or has expired. Please sign in again.'))
  request.authUser = payload
  next()
}
