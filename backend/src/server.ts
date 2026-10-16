import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { connectDatabase, disconnectDatabase, isDatabaseConnected } from './config/database.js'
import { authRoutes } from './routes/authRoutes.js'
import { savedDestinationRoutes } from './routes/savedDestinationRoutes.js'
import { dashboardRoutes } from './routes/dashboardRoutes.js'
import { tripRoutes } from './routes/tripRoutes.js'
import { placesRoutes } from './routes/placesRoutes.js'
import { assistantRoutes } from './routes/assistantRoutes.js'
import { weatherRoutes } from './routes/weatherRoutes.js'
import { errorHandler } from './middleware/errorHandler.js'
import { isJwtConfigured } from './utils/jwt.js'

const app = express()
const port = Number(process.env.PORT ?? 5000)
const allowedOrigins = [
  'https://travel-mate-ai-1sok.vercel.app',
  'https://travel-mate-ai-1sok-flax.vercel.app',
  process.env.FRONTEND_URL,
  process.env.CORS_ORIGIN,
  process.env.CLIENT_URL,
  'http://localhost:5173',
].filter((origin): origin is string => Boolean(origin))

app.disable('x-powered-by')
app.use(helmet())
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))
app.use(express.json({ limit: '10kb' }))

app.get('/api/health', (_request, response) => {
  const connected = isDatabaseConnected()
  response.status(connected ? 200 : 503).json({ success: connected, message: connected ? 'TravelMate AI API is running' : 'TravelMate AI API database is unavailable', database: connected ? 'connected' : 'disconnected' })
})
app.use('/api/auth', authRoutes)
app.use('/api/saved-destinations', savedDestinationRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/trips', tripRoutes)
app.use('/api/places', placesRoutes)
app.use('/api/assistant', assistantRoutes)
app.use('/api/weather', weatherRoutes)
app.use('/api', (_request, response) => response.status(404).json({ success: false, message: 'API route not found.' }))
app.use(errorHandler)

async function startServer(): Promise<void> {
  try {
    await connectDatabase()
  } catch (error) {
    console.error(error instanceof Error ? error.message : 'MongoDB connection failed. The API was not started.')
    process.exitCode = 1
    return
  }
  if (!isJwtConfigured()) console.error('JWT_SECRET is missing or too short. Set a value of at least 32 characters in backend/.env before enabling authentication.')
  const server = app.listen(port, () => console.info(`TravelMate AI API listening on http://localhost:${port}`))
  for (const signal of ['SIGINT','SIGTERM'] as const) {
    process.once(signal, () => server.close(() => { void disconnectDatabase().catch(() => console.error('MongoDB disconnect failed.')).finally(() => process.exit(0)) }))
  }
}

void startServer()
