import { env } from './config/env.ts'
import app from './server.ts'
import { logger } from './utils/logger.ts'
import { sequelize } from './db/connection.ts'
import type { Server } from 'http'
import figlet from 'figlet'

let server: Server = null

// Handle unhandled exceptions
process.on('uncaughtException', (err: Error) => {
  logger.error('UNCAUGHT EXCEPTION! Shutting down...')
  logger.error(err.name, err.message)
  logger.error(err.stack)
  gracefulShutdown('uncaughtException')
})

// Handle unhandled rejections
process.on('unhandledRejection', (err: Error) => {
  logger.error('UNHANDLED REJECTION! Shutting down...')
  logger.error(err.name, err.message)
  gracefulShutdown('unhandledRejection')
})

// Graceful shutdown handler
const gracefulShutdown = async (signal: string) => {
  logger.info(`${signal} received. Starting graceful shutdown...`)

  // Stop accepting new connections
  if (server) {
    server.close(async () => {
      logger.info('HTTP server closed')

      try {
        // Close database connection
        await sequelize.close()
        logger.info('Database connection closed')
        process.exit(0)
      } catch (error) {
        logger.error('Error during database shutdown:', error)
        process.exit(1)
      }
    })

    // Force shutdown after 30 seconds
    setTimeout(() => {
      logger.error('Forced shutdown after timeout')
      process.exit(1)
    }, 30000)
  } else {
    process.exit(0)
  }
}

// Handle termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))

server = app.listen(env.PORT, () => {
  logger.info(`Server running on port ${env.PORT}`)
  logger.info(`Environment: ${env.APP_STAGE}`)
  logger.info(`LOG_LEVEL: ${env.LOG_LEVEL}`)
  console.log(figlet.textSync('Express REST API Ready'))
})
