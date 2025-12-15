import { env } from '../env.ts'
import app from './server.ts'
import { logger } from './utils/logger.ts'

app.listen(env.PORT, () => {
  logger.info(`Server running on port ${env.PORT}`)
  logger.info(`Environment: ${env.APP_STAGE}`)
  logger.info(`LOG_LEVEL: ${env.LOG_LEVEL}`)
})
