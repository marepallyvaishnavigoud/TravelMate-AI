import type { AuthTokenPayload } from '../utils/jwt.js'

declare global {
  namespace Express {
    interface Request {
      authUser?: AuthTokenPayload
    }
  }
}

export {}
