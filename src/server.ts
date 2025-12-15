import { env, isDev, isTestEnv } from '../env.ts'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import authRoutes from './routes/authRoutes.ts'
import userRoutes from './routes/userRoutes.ts'
import morgan from 'morgan'
import orderRoutes from './routes/orderRoutes.ts'
import organizationRoutes from './routes/organizationRoutes.ts'
import { sequelize } from './db/connection.ts'
import swaggerUi from 'swagger-ui-express'
import { swaggerSpec } from './config/swagger.ts'

const app = express()

app.use(helmet())
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  })
)
console.log('LOG_LEVEL: '+env.LOG_LEVEL)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(
  morgan('dev', {
    skip: () => isTestEnv() || env.LOG_LEVEL !== 'debug',
  })
)

// Swagger documentation
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Express REST API',
  })
})

// Readiness check endpoint (checks DB and cache readiness)
app.get('/ready', async (req, res) => {
  const checks = {
    database: false,
    cache: false,
  }

  try {
    // Check database connection
    await sequelize.authenticate()
    checks.database = true

    // TODO: Add cache check when cache is implemented
    // For now, mark as true if no cache service is configured
    checks.cache = true

    const allChecksPass = Object.values(checks).every((check) => check === true)

    if (allChecksPass) {
      res.status(200).json({
        status: 'ready',
        timestamp: new Date().toISOString(),
        checks,
      })
    } else {
      res.status(503).json({
        status: 'not ready',
        timestamp: new Date().toISOString(),
        checks,
      })
    }
  } catch (error) {
    res.status(503).json({
      status: 'not ready',
      timestamp: new Date().toISOString(),
      checks,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
  }
})

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/organizations', organizationRoutes)

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
  })
})

// Global error handler
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack)
    res.status(500).json({
      error: 'Something went wrong!',
      ...(isDev() && { details: err.message }),
    })
  }
)

export { app }

export default app
