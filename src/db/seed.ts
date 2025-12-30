import { sequelize } from './connection.ts'
import { User, Order, Organization } from '../models/index.ts'
import { hashPassword } from '../utils/password.ts'

async function seed() {
  console.log('Starting database seed...')

  try {
    // Optionally sync models (uncomment if you want Sequelize to manage tables)
    await sequelize.sync({ alter: false })

    // Clear existing data (respect FK order)
    console.log('Clearing existing data...')
    await Organization.destroy({ where: {} })
    await Order.destroy({ where: {} })
    await User.destroy({ where: {} })

    //Create organizations
    console.log('Creating organizations...')
    const corpA = await Organization.create({
      name: 'Corp A',
      industry: 'Finance',
      dateFounded: new Date('2000-01-01'),
    })
    const corpB = await Organization.create({
      name: 'Corp B',
      industry: 'Technology',
      dateFounded: new Date('2010-01-01'),
    })

    // Create demo users Corp A
    console.log('Creating demo users corp A...')
    const usersCorpA = await Promise.all(
      Array.from({ length: 5 }, (_, i) => i + 1).map(async (n) => {
        const hashedPassword = await hashPassword('demo1234')
        return User.create({
          email: `user${n}@corpa.com`,
          password: hashedPassword,
          firstName: 'User',
          lastName: ['One', 'Two', 'Three', 'Four', 'Five'][n - 1],
          organizationId: corpA.id,
        })
      })
    )

    console.log('Creating demo users corp B...')
    const usersCorpB = await Promise.all(
      Array.from({ length: 5 }, (_, i) => i + 6).map(async (n) => {
        const hashedPassword = await hashPassword('demo1234')
        return User.create({
          email: `user${n}@corpb.com`,
          password: hashedPassword,
          firstName: 'User',
          lastName: ['Six', 'Seven', 'Eight', 'Nine', 'Ten'][n - 6],
          organizationId: corpB.id,
        })
      })
    )
    const orderCountPerUser = 2
    // Create orders for users in Corp A
    console.log('Creating orders for Corp A users...')
    for (const user of usersCorpA) {
      for (let i = 0; i < orderCountPerUser; i++) {
        await Order.create({
          userId: user.id,
          totalAmount: Math.floor(Math.random() * 100) + 1,
          organizationId: corpA.id,
        })
      }
    }

    // Create orders for users in Corp B
    console.log('Creating orders for Corp B users...')
    for (const user of usersCorpB) {
      for (let i = 0; i < orderCountPerUser; i++) {
        await Order.create({
          userId: user.id,
          totalAmount: Math.floor(Math.random() * 100) + 1,
          organizationId: corpB.id,
        })
      }
    }

    // Demonstrate using relations to query data
    console.log('\n🔍 Testing relational queries...')

    // Query user with all their orders
    const userWithOrders = await User.findOne({
      where: { email: 'user1@corpa.com' },
      include: [
        {
          model: Order,
          as: 'orders',
        },
      ],
    })

    // Query all organizations with their users and orders
    const orgsWithUsersAndOrders = await Organization.findAll({
      include: [
        {
          model: User,
          as: 'users',
          include: [
            {
              model: Order,
              as: 'orders',
            },
          ],
        },
        {
          model: Order,
          as: 'orders',
        },
      ],
    })

    // Sanity check
    console.log('Database seeded successfully!')
    console.log('\nSeed Summary:')
    console.log('- 2  demo orgs created')
    console.log('- 10 demo users created')
    console.log('- 20 demo orders created')
    console.log(`- Demo user has ${userWithOrders?.orders?.length || 0} orders`)
    console.log(
      `- Total organizations in system: ${orgsWithUsersAndOrders?.length || 0}`
    )
    console.log(
      `- Total orders in system: ${orgsWithUsersAndOrders.reduce(
        (acc, org) => acc + (org.orders?.length || 0),
        0
      )}`
    )
    console.log('\nLogin Credentials:')
    console.log('email: user1@corpa.com')
    console.log('Password: demo1234')
    console.log('\nEmail: user1@corpb.com')
    console.log('Password: demo1234')
  } catch (error) {
    console.error('Seed failed:', error)
    throw error
  }
}

// Run seed if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seed()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}

export default seed
