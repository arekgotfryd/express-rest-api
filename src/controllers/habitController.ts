import type { Response } from 'express'
import type { AuthenticatedRequest } from '../middleware/auth.ts'
import { sequelize } from '../db/connection.ts'
import { habits as Habit, entries as Entry, habitTags as HabitTag, tags as Tag, users as User } from '../db/schema.ts'

export const createHabit = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, description, frequency, targetCount, tagIds } = req.body
    const userId = req.user!.id

    const result = await sequelize.transaction(async (tx) => {
      const newHabit = await Habit.create(
        {
          userId,
          name,
          description,
          frequency,
          targetCount,
        },
        { transaction: tx }
      )

      if (tagIds && tagIds.length > 0) {
        const habitTagValues = tagIds.map((tagId: string) => ({
          habitId: newHabit.id,
          tagId,
        }))
        await HabitTag.bulkCreate(habitTagValues, { transaction: tx })
      }

      return newHabit
    })

    res.status(201).json({
      message: 'Habit created successfully',
      habit: result,
    })
  } catch (error) {
    console.error('Create habit error:', error)
    res.status(500).json({ error: 'Failed to create habit' })
  }
}

export const getUserHabits = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user!.id

    const userHabitsWithTags = await Habit.findAll({
      where: { userId },
      include: [
        {
          model: HabitTag,
          as: 'habitTags',
          include: [{ model: Tag, as: 'tag' }],
        },
      ],
      order: [['created_at', 'DESC']],
    })

    const habitsWithTags = userHabitsWithTags.map((habit: any) => ({
      ...habit.get({ plain: true }),
      tags: habit.habitTags.map((ht: any) => ht.tag),
      habitTags: undefined,
    }))

    res.json({ habits: habitsWithTags })
  } catch (error) {
    console.error('Get habits error:', error)
    res.status(500).json({ error: 'Failed to fetch habits' })
  }
}

export const getHabitById = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { id } = req.params
    const userId = req.user!.id

    const habit = await Habit.findOne({
      where: { id, userId },
      include: [
        {
          model: HabitTag,
          as: 'habitTags',
          include: [{ model: Tag, as: 'tag' }],
        },
        { model: Entry, as: 'entries', limit: 10, order: [['completion_date', 'DESC']] },
      ],
    })

    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' })
    }

    const plain = habit.get({ plain: true }) as any
    const habitWithTags = {
      ...plain,
      tags: plain.habitTags.map((ht: any) => ht.tag),
      habitTags: undefined,
    }

    res.json({ habit: habitWithTags })
  } catch (error) {
    console.error('Get habit error:', error)
    res.status(500).json({ error: 'Failed to fetch habit' })
  }
}

export const updateHabit = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.user!.id
    const { tagIds, ...updates } = req.body

    const result = await sequelize.transaction(async (tx) => {
      const habit = await Habit.findOne({ where: { id, userId }, transaction: tx })
      if (!habit) throw new Error('Habit not found')

      await habit.update({ ...updates, updatedAt: new Date() }, { transaction: tx })

      if (tagIds !== undefined) {
        await HabitTag.destroy({ where: { habitId: id }, transaction: tx })
        if (tagIds.length > 0) {
          const habitTagValues = tagIds.map((tagId: string) => ({ habitId: id, tagId }))
          await HabitTag.bulkCreate(habitTagValues, { transaction: tx })
        }
      }

      return habit
    })

    res.json({ message: 'Habit updated successfully', habit: result })
  } catch (error: any) {
    if (error.message === 'Habit not found') {
      return res.status(404).json({ error: 'Habit not found' })
    }
    console.error('Update habit error:', error)
    res.status(500).json({ error: 'Failed to update habit' })
  }
}

export const deleteHabit = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.user!.id

    const habit = await Habit.findOne({ where: { id, userId } })
    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' })
    }

    await habit.destroy()

    res.json({ message: 'Habit deleted successfully' })
  } catch (error) {
    console.error('Delete habit error:', error)
    res.status(500).json({ error: 'Failed to delete habit' })
  }
}

export const logHabitCompletion = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { habitId } = req.params
    const { note } = req.body
    const userId = req.user!.id

    const habit = await Habit.findOne({ where: { id: habitId, userId } })
    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' })
    }

    const newLog = await Entry.create({
      habitId,
      completionDate: new Date(),
      note,
    })

    res.status(201).json({ message: 'Habit completion logged', log: newLog })
  } catch (error) {
    console.error('Log habit completion error:', error)
    res.status(500).json({ error: 'Failed to log habit completion' })
  }
}

export const completeHabit = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { id } = req.params
    const userId = req.user!.id
    const { note } = req.body

    const habit = await Habit.findOne({ where: { id, userId } })
    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' })
    }

    if (!habit.isActive) {
      return res.status(400).json({ error: 'Cannot complete an inactive habit' })
    }

    const newEntry = await Entry.create({
      habitId: id,
      completionDate: new Date(),
      note,
    })

    res.status(201).json({ message: 'Habit completed successfully', entry: newEntry })
  } catch (error) {
    console.error('Complete habit error:', error)
    res.status(500).json({ error: 'Failed to complete habit' })
  }
}

export const getHabitsByTag = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { tagId } = req.params
    const userId = req.user!.id

    const habitsWithTag = await HabitTag.findAll({
      where: { tagId },
      include: [
        {
          model: Habit,
          as: 'habit',
          include: [
            {
              model: HabitTag,
              as: 'habitTags',
              include: [{ model: Tag, as: 'tag' }],
            },
          ],
        },
      ],
    })

    const userHabits = habitsWithTag
      .filter((ht: any) => ht.habit.userId === userId)
      .map((ht: any) => ({
        ...ht.habit.get({ plain: true }),
        tags: ht.habit.habitTags.map((habitTag: any) => habitTag.tag),
        habitTags: undefined,
      }))

    res.json({ habits: userHabits })
  } catch (error) {
    console.error('Get habits by tag error:', error)
    res.status(500).json({ error: 'Failed to fetch habits by tag' })
  }
}

export const addTagsToHabit = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { id } = req.params
    const { tagIds } = req.body
    const userId = req.user!.id

    const habit = await Habit.findOne({ where: { id, userId } })
    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' })
    }

    const existingTags = await HabitTag.findAll({ where: { habitId: id } })
    const existingTagIds = existingTags.map((ht) => ht.tagId)
    const newTagIds = tagIds.filter((tagId: string) => !existingTagIds.includes(tagId))

    if (newTagIds.length > 0) {
      const habitTagValues = newTagIds.map((tagId: string) => ({ habitId: id, tagId }))
      await HabitTag.bulkCreate(habitTagValues)
    }

    res.json({ message: 'Tags added successfully' })
  } catch (error) {
    console.error('Add tags to habit error:', error)
    res.status(500).json({ error: 'Failed to add tags to habit' })
  }
}

export const removeTagFromHabit = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { id, tagId } = req.params
    const userId = req.user!.id

    const habit = await Habit.findOne({ where: { id, userId } })
    if (!habit) {
      return res.status(404).json({ error: 'Habit not found' })
    }

    await HabitTag.destroy({ where: { habitId: id, tagId } })

    res.json({ message: 'Tag removed successfully' })
  } catch (error) {
    console.error('Remove tag from habit error:', error)
    res.status(500).json({ error: 'Failed to remove tag from habit' })
  }
}
