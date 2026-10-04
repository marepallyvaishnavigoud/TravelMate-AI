import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { connectDatabase, isDatabaseConnected } from './config/database.js'
import { authRoutes } from './routes/authRoutes.js'
import { errorHandler } from './middleware/errorHandler.js'
import { isJwtConfigured } from './utils/jwt.js'

const app = express()
const port = Number(process.env.PORT ?? 5000)
const clientUrl = process.env.CLIENT_URL ?? 'http://localhost:5173'

app.disable('x-powered-by')
app.use(helmet())
app.use(cors({ origin: clientUrl, methods: ['GET','POST','OPTIONS'], allowedHeaders: ['Content-Type','Authorization'] }))
app.use(express.json({ limit: '10kb' }))

app.get('/api/health', (_request, response) => {
  response.json({ success: true, message: 'TravelMate AI API is running', data: { database: isDatabaseConnected() ? 'connected' : 'disconnected' } })
})
app.use('/api/auth', authRoutes)
app.use('/api', (_request, response) => response.status(404).json({ success: false, message: 'API route not found.' }))
app.use(errorHandler)

const server = app.listen(port, () => {
  console.info(`TravelMate AI API listening on http://localhost:${port}`)
  if (!isJwtConfigured()) console.error('JWT_SECRET is missing or too short. Set a value of at least 32 characters in backend/.env before enabling authentication.')
  void connectDatabase().then(() => console.info('MongoDB connected.')).catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : 'MongoDB connection failed.')
  })
})

for (const signal of ['SIGINT','SIGTERM'] as const) {
  process.on(signal, () => server.close(() => process.exit(0)))
}
