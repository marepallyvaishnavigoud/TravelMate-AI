import type { ErrorRequestHandler } from 'express'
import { ZodError } from 'zod'
import { AppError } from '../utils/AppError.js'

export const errorHandler: ErrorRequestHandler = (error: unknown, _request, response, _next) => {
  if (error instanceof ZodError) {
    const details = error.issues.map((issue) => ({ field: issue.path.join('.'), message: issue.message }))
    response.status(400).json({ success: false, message: details[0]?.message ?? 'Please check the information you entered.', errors: details })
    return
  }
  if (error instanceof AppError) {
    response.status(error.statusCode).json({ success: false, message: error.message })
    return
  }
  if (typeof error === 'object' && error !== null && 'name' in error && error.name === 'ValidationError') {
    response.status(400).json({ success: false, message: 'Please check the information you entered.' })
    return
  }
  if (typeof error === 'object' && error !== null && 'code' in error && error.code === 11000) {
    response.status(409).json({ success: false, message: 'An account with this email already exists.' })
    return
  }
  const message = process.env.NODE_ENV === 'production' ? 'An unexpected server error occurred.' : error instanceof Error ? error.message : 'An unexpected server error occurred.'
  response.status(500).json({ success: false, message })
}
