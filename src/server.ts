import { env, isDev, isTestEnv } from '../env.ts'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import authRoutes from './routes/authRoutes.ts'
import userRoutes from './routes/userRoutes.ts'
import orderRoutes from './routes/orderRoutes.ts'
import organizationRoutes from './routes/organizationRoutes.ts'
import healthRoutes from './routes/healthRoutes.ts'
import swaggerUi from 'swagger-ui-express'
import { swaggerSpec } from './config/swagger.ts'
import audit from 'express-requests-logger'
const app = express()

app.use(helmet())
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  })
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(
  audit({
    logger: { info: console.log }, // Logger object
    excludeURLs: ['health', 'readiness'], // Exclude paths which enclude 'health' & 'metrics'
    request: {
      maskBody: ['password'], // Mask 'password' field in incoming requests
      excludeHeaders: ['authorization'], // Exclude 'authorization' header from requests
    },
    response: {
      excludeHeaders: ['*'], // Exclude all headers from responses,
      excludeBody: ['*'], // Exclude all body from responses
    },
    shouldSkipAuditFunc: function (req, res) {
      return isTestEnv() || env.LOG_LEVEL !== 'debug'
    },
  })
)

// Swagger documentation
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

// Health and readiness routes
app.use('/', healthRoutes)

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
