import { Sequelize } from 'sequelize'
import { env, isProd, isDev } from '../../env.ts'
import { remember } from '@epic-web/remember'

const createSequelize = () => {
  // Enable logging based on LOG_LEVEL
  const shouldLog = ['info', 'debug'].includes(env.LOG_LEVEL)

  return new Sequelize(env.DATABASE_URL, {
    dialect: 'mysql',
    logging: shouldLog ? console.log : false,
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
