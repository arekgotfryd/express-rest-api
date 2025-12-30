import { env } from '../env.ts'
import app from './server.ts'
import { logger } from './utils/logger.ts'

// Handle unhandled exceptions
process.on('uncaughtException', (err: Error) => {
  logger.error('UNCAUGHT EXCEPTION! Shutting down...')
  logger.error(err.name, err.message)
  logger.error(err.stack)
  process.exit(1)
})

// Handle unhandled rejections
process.on('unhandledRejection', (err: Error) => {
  logger.error('UNHANDLED REJECTION! Shutting down...')
  logger.error(err.name, err.message)
  process.exit(1)
})

app.listen(env.PORT, () => {
  logger.info(`Server running on port ${env.PORT}`)
  logger.info(`Environment: ${env.APP_STAGE}`)
  logger.info(`LOG_LEVEL: ${env.LOG_LEVEL}`)
})
