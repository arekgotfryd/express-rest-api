import { Sequelize } from 'sequelize'
import { env, isProd } from '../../env.ts'
import { remember } from '@epic-web/remember'
import logger from '../utils/logger.ts'

const createSequelize = () => {
  // Enable logging based on LOG_LEVEL
  const shouldLog = ['info', 'debug'].includes(env.LOG_LEVEL)

  // Custom logger that only outputs the SQL query and execution time
  const sqlLogger = (sql: string, timing?: number) => {
    logger.info(sql, { ms: timing })
  }

  return new Sequelize(env.DATABASE_URL, {
    dialect: 'mysql',
    logging: shouldLog ? sqlLogger : false,
    benchmark: true,
    pool: {
      max: env.DATABASE_POOL_MAX,
      min: env.DATABASE_POOL_MIN,
      acquire: 30000,
      idle: 10000,
    },
  })
}

let sequelize: Sequelize

if (isProd()) {
  sequelize = createSequelize()
} else {
  sequelize = remember('sequelize', () => createSequelize())
}

const db = sequelize

export { sequelize, db }
export default db
