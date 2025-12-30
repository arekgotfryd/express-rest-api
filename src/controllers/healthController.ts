import { sequelize } from '../db/connection.ts'
import { logger } from '../utils/logger.ts'
import { getCacheStats } from '../middleware/serverCache.ts'

export const health = async (req, res) => {
  try {
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      service: 'Express REST API',
    })
  } catch (error) {
    logger.error('Error while checking health')
    res.status(503).json({ message: 'Not healthy' })
  }
}

export const readiness = async (req, res) => {
  const checks = {
    database: false,
    cache: false,
  }

  try {
    // Check database connection
    await sequelize.authenticate()
    checks.database = true

    // Check server cache
    const cacheStats = getCacheStats()
    checks.cache = cacheStats.maxSize > 0

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
}
