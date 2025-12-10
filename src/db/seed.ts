import { sequelize } from './connection.ts'
import { users as User, habits as Habit, entries as Entry, tags as Tag, habitTags as HabitTag } from './schema.ts'
import { hashPassword } from '../utils/password.ts'

async function seed() {
  console.log('🌱 Starting database seed...')

  try {
    // Optionally sync models (uncomment if you want Sequelize to manage tables)
    await sequelize.sync({ alter: false })

    // Clear existing data (respect FK order)
    console.log('Clearing existing data...')
    await Entry.destroy({ where: {} })
    await HabitTag.destroy({ where: {} })
    await Habit.destroy({ where: {} })
    await Tag.destroy({ where: {} })
    await User.destroy({ where: {} })

    // Create demo users
    console.log('Creating demo users...')
    const hashedPassword = await hashPassword('demo123')

    const demoUser = await User.create({
      email: 'demo@habittracker.com',
      username: 'demouser',
      password: hashedPassword,
      firstName: 'Demo',
      lastName: 'User',
    })

    const johnDoe = await User.create({
      email: 'john@example.com',
      username: 'johndoe',
      password: hashedPassword,
      firstName: 'John',
      lastName: 'Doe',
    })

    // Create tags
    console.log('Creating tags...')
    const healthTag = await Tag.create({ name: 'Health', color: '#10B981' })
    const productivityTag = await Tag.create({ name: 'Productivity', color: '#3B82F6' })
    const mindfulnessTag = await Tag.create({ name: 'Mindfulness', color: '#8B5CF6' })
    const fitnessTag = await Tag.create({ name: 'Fitness', color: '#EF4444' })
    const learningTag = await Tag.create({ name: 'Learning', color: '#F59E0B' })
    const personalTag = await Tag.create({ name: 'Personal', color: '#EC4899' })

    // Create habits for demo user
    console.log('Creating demo habits...')
    const exerciseHabit = await Habit.create({
      userId: demoUser.id,
      name: 'Exercise',
      description: 'Daily workout routine',
      frequency: 'daily',
      targetCount: 1,
    })

    // Add tags to exercise habit
    await HabitTag.bulkCreate([
      { habitId: exerciseHabit.id, tagId: healthTag.id },
      { habitId: exerciseHabit.id, tagId: fitnessTag.id },
    ])

    const readingHabit = await Habit.create({
      userId: demoUser.id,
      name: 'Read for 30 minutes',
      description: 'Read books or articles',
      frequency: 'daily',
      targetCount: 1,
    })

    await HabitTag.bulkCreate([
      { habitId: readingHabit.id, tagId: learningTag.id },
      { habitId: readingHabit.id, tagId: personalTag.id },
    ])

    const meditationHabit = await Habit.create({
      userId: demoUser.id,
      name: 'Meditate',
      description: '10 minutes of mindfulness',
      frequency: 'daily',
      targetCount: 1,
    })

    await HabitTag.bulkCreate([
      { habitId: meditationHabit.id, tagId: mindfulnessTag.id },
      { habitId: meditationHabit.id, tagId: healthTag.id },
    ])

    const waterHabit = await Habit.create({
      userId: demoUser.id,
      name: 'Drink 8 glasses of water',
      description: 'Stay hydrated throughout the day',
      frequency: 'daily',
      targetCount: 8,
    })

    await HabitTag.bulkCreate([{ habitId: waterHabit.id, tagId: healthTag.id }])

    // Create habits for John
    const codingHabit = await Habit.create({
      userId: johnDoe.id,
      name: 'Code for 1 hour',
      description: 'Practice programming skills',
      frequency: 'daily',
      targetCount: 1,
    })

    await HabitTag.bulkCreate([
      { habitId: codingHabit.id, tagId: learningTag.id },
      { habitId: codingHabit.id, tagId: productivityTag.id },
    ])

    // Add completion entries for demo user
    console.log('Adding completion entries...')

    const today = new Date()
    today.setHours(12, 0, 0, 0)

    // Exercise habit - completions for past 7 days
    for (let i = 0; i < 7; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      await Entry.create({
        habitId: exerciseHabit.id,
        completionDate: date,
        note: i === 0 ? 'Great workout today!' : null,
        createdAt: new Date(),
      })
    }

    // Reading habit - completions for past 3 days
    for (let i = 1; i <= 3; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      await Entry.create({
        habitId: readingHabit.id,
        completionDate: date,
        createdAt: new Date(),
      })
    }

    // Meditation habit - Sporadic completions
    const meditationDays = [0, 2, 3, 5, 8, 9, 10, 15]
    for (const daysAgo of meditationDays) {
      const date = new Date(today)
      date.setDate(date.getDate() - daysAgo)
      await Entry.create({
        habitId: meditationHabit.id,
        completionDate: date,
        createdAt: new Date(),
      })
    }

    // Water habit - Completed today with multiple entries (for target count demo)
    for (let i = 0; i < 6; i++) {
      const date = new Date(today)
      date.setHours(8 + i * 2, 0, 0, 0)
      await Entry.create({
        habitId: waterHabit.id,
        completionDate: date,
        note: `Glass ${i + 1} of water`,
        createdAt: new Date(),
      })
    }

    // Coding habit for John - completions from 3 to 17 days ago
    for (let i = 3; i < 17; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      await Entry.create({
        habitId: codingHabit.id,
        completionDate: date,
        createdAt: new Date(),
      })
    }

    // Demonstrate using relations to query data
    console.log('\n🔍 Testing relational queries...')

    // Query user with all their habits, entries, and tags
    const userWithHabits = await User.findOne({
      where: { email: 'demo@habittracker.com' },
      include: [
        {
          model: Habit,
          as: 'habits',
          include: [
            { model: Entry, as: 'entries' },
            {
              model: Tag,
              as: 'tags',
              through: { attributes: [] },
            },
          ],
        },
      ],
    })

    // Query habits with their tags and user (excluding password)
    const habitsWithTags = await Habit.findAll({
      limit: 3,
      include: [
        {
          model: User,
          as: 'user',
          attributes: { exclude: ['password'] },
        },
        {
          model: Tag,
          as: 'tags',
          through: { attributes: [] },
        },
        { model: Entry, as: 'entries', limit: 5, order: [['completion_date', 'DESC']] },
      ],
    })

    // Query tags with their habits (only id and name)
    const tagsWithHabits = await Tag.findAll({
      include: [
        {
          model: Habit,
          as: 'habits',
          attributes: ['id', 'name'],
          through: { attributes: [] },
        },
      ],
    })

    console.log('✅ Database seeded successfully!')
    console.log('\n📊 Seed Summary:')
    console.log('- 2 demo users created')
    console.log('- 6 tags created')
    console.log('- 5 habits created with tags')
    console.log('- Multiple completion entries added')
    console.log(`- Demo user has ${userWithHabits?.habits?.length || 0} habits`)
    console.log(
      `- Total entries for demo user: ${
        userWithHabits?.habits?.reduce((acc, h) => acc + (h.entries?.length || 0), 0) || 0
      }`
    )
    console.log(`- Total tags in system: ${tagsWithHabits?.length || 0}`)
    console.log('\n🔑 Login Credentials:')
    console.log('Email: demo@habittracker.com')
    console.log('Password: demo123')
    console.log('\nEmail: john@example.com')
    console.log('Password: demo123')
  } catch (error) {
    console.error('❌ Seed failed:', error)
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
