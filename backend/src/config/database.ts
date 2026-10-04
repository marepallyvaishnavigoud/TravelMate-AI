import mongoose from 'mongoose'

export async function connectDatabase(): Promise<void> {
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('MONGODB_URI is not configured. Add it to backend/.env to enable registration and login.')
  if (mongoose.connection.readyState === 1) return
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
}

export function isDatabaseConnected(): boolean {
  return mongoose.connection.readyState === 1
}
