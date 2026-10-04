import type { RequestHandler } from 'express'
import { getCurrentUser, loginUser, registerUser, revokeUserSessions } from '../services/authService.js'
import { loginSchema, registerSchema } from '../validators/authValidators.js'
import { AppError } from '../utils/AppError.js'

export const register: RequestHandler = async (request, response) => {
  const input = registerSchema.parse(request.body)
  const result = await registerUser(input)
  response.status(201).json({ success: true, message: 'Your account has been created.', data: result })
}

export const login: RequestHandler = async (request, response) => {
  const input = loginSchema.parse(request.body)
  const result = await loginUser(input)
  response.json({ success: true, message: 'You are signed in.', data: result })
}

export const me: RequestHandler = async (request, response) => {
  if (!request.authUser) throw new AppError(401, 'Authentication is required.')
  const user = await getCurrentUser(request.authUser.userId)
  response.json({ success: true, message: 'Your profile is ready.', data: { user } })
}

export const logout: RequestHandler = async (request, response) => {
  if (!request.authUser) throw new AppError(401, 'Authentication is required.')
  await revokeUserSessions(request.authUser.userId)
  response.json({ success: true, message: 'You are signed out.', data: {} })
}
