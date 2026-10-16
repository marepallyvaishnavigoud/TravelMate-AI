import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      authUser?: any;
      params: any;
    }
  }
}