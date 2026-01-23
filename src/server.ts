import { env, isTestEnv } from '../env.ts'
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
import logger from './utils/logger.ts'
import morgan from 'morgan'
import { errorHandler } from './middleware/errorHandler.ts'

const app = express()

app.use(helmet())
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  }),
)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(
  morgan('combined', {
    stream: { write: (msg) => logger.info(msg.trim()) },
    skip: () => isTestEnv() || env.LOG_LEVEL !== 'debug',
  }),
)

// Swagger documentation
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

// Health and readiness routes
app.use('/', healthRoutes)

// Routes with rate limiting
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
app.use(errorHandler)

export { app }

export default app
