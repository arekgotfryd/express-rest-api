import { Sequelize } from 'sequelize'
import { env, isProd } from '../../env.ts'
import { remember } from '@epic-web/remember'

const createSequelize = () => {
  return new Sequelize(env.DATABASE_URL, {
    dialect: 'mysql',
    logging: false,
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
