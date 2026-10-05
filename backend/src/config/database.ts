import mongoose from 'mongoose'

mongoose.connection.on('disconnected', () => console.warn('MongoDB disconnected.'))
mongoose.connection.on('error', () => console.error('MongoDB connection error. Check database connectivity and configuration; connection details were not logged.'))

export async function connectDatabase(): Promise<void> {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI is not configured. Add it to backend/.env before starting the API.')
  if (mongoose.connection.readyState === 1) return
  try {
    if (mongoose.connection.readyState === 2) await mongoose.connection.asPromise()
    else await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000, autoIndex: true })
    console.info('MongoDB connected successfully.')
  } catch {
    throw new Error('MongoDB connection failed. Check that MONGODB_URI is valid and the database is reachable. The connection URI was not logged.')
  }
}

export function isDatabaseConnected(): boolean {
  return mongoose.connection.readyState === 1
}

export async function disconnectDatabase(): Promise<void> {
  if (mongoose.connection.readyState !== 0) await mongoose.disconnect()
}
