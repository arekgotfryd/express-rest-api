import { sequelize } from '../db/connection.ts'

export const health = async (req, res) => {
  try {
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      service: 'Express REST API',
    })
  } catch (error) {
    console.error('Error while checking health')
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
}
