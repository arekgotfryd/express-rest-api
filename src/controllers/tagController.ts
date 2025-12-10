import type { Request, Response } from 'express'
import type { AuthenticatedRequest } from '../middleware/auth.ts'
import { tags as Tag, habitTags as HabitTag, habits as Habit, users as User } from '../db/schema.ts'

// Public routes - no authentication required
export const getTags = async (req: Request, res: Response) => {
  try {
    const allTags = await Tag.findAll({ order: [['name', 'ASC']] })

    res.json({ tags: allTags })
  } catch (error) {
    console.error('Get tags error:', error)
    res.status(500).json({ error: 'Failed to fetch tags' })
  }
}

export const getTagById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const tag = await Tag.findOne({
      where: { id },
      include: [
        {
          model: HabitTag,
          as: 'habitTags',
          include: [
            {
              model: Habit,
              as: 'habit',
              attributes: ['id', 'name', 'description', 'isActive'],
            },
          ],
        },
      ],
    })

    if (!tag) {
      return res.status(404).json({ error: 'Tag not found' })
    }

    const plain = tag.get({ plain: true }) as any
    const tagWithHabits = {
      ...plain,
      habits: plain.habitTags.map((ht: any) => ht.habit),
      habitTags: undefined,
    }

    res.json({ tag: tagWithHabits })
  } catch (error) {
    console.error('Get tag error:', error)
    res.status(500).json({ error: 'Failed to fetch tag' })
  }
}

export const getPopularTags = async (req: Request, res: Response) => {
  try {
    const tagsWithCount = await Tag.findAll({ include: [{ model: HabitTag, as: 'habitTags' }] })

    const popularTags = tagsWithCount
      .map((tag: any) => ({
        id: tag.id,
        name: tag.name,
        color: tag.color,
        usageCount: tag.habitTags.length,
        createdAt: tag.createdAt,
        updatedAt: tag.updatedAt,
      }))
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 10)

    res.json({ tags: popularTags })
  } catch (error) {
    console.error('Get popular tags error:', error)
    res.status(500).json({ error: 'Failed to fetch popular tags' })
  }
}

// Protected routes - authentication required
export const createTag = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, color } = req.body

    const existingTag = await Tag.findOne({ where: { name } })
    if (existingTag) {
      return res.status(409).json({ error: 'Tag with this name already exists' })
    }

    const newTag = await Tag.create({ name, color: color || '#6B7280' })

    res.status(201).json({ message: 'Tag created successfully', tag: newTag })
  } catch (error) {
    console.error('Create tag error:', error)
    res.status(500).json({ error: 'Failed to create tag' })
  }
}

export const updateTag = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params
    const { name, color } = req.body

    if (name) {
      const existingTag = await Tag.findOne({ where: { name } })
      if (existingTag && existingTag.id !== id) {
        return res.status(409).json({ error: 'Tag with this name already exists' })
      }
    }

    const tag = await Tag.findByPk(id)
    if (!tag) {
      return res.status(404).json({ error: 'Tag not found' })
    }

    await tag.update({
      ...(name ? { name } : {}),
      ...(color ? { color } : {}),
      updatedAt: new Date(),
    })

    res.json({ message: 'Tag updated successfully', tag })
  } catch (error) {
    console.error('Update tag error:', error)
    res.status(500).json({ error: 'Failed to update tag' })
  }
}

export const deleteTag = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params

    const tagUsage = await HabitTag.findOne({ where: { tagId: id } })
    if (tagUsage) {
      return res.status(409).json({
        error: 'Cannot delete tag that is currently in use',
        message: 'Remove this tag from all habits before deleting',
      })
    }

    const tag = await Tag.findByPk(id)
    if (!tag) {
      return res.status(404).json({ error: 'Tag not found' })
    }

    await tag.destroy()

    res.json({ message: 'Tag deleted successfully' })
  } catch (error) {
    console.error('Delete tag error:', error)
    res.status(500).json({ error: 'Failed to delete tag' })
  }
}

export const getTagHabits = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params
    const userId = req.user!.id

    const tagWithHabits = await Tag.findOne({
      where: { id },
      include: [
        {
          model: HabitTag,
          as: 'habitTags',
          include: [
            {
              model: Habit,
              as: 'habit',
              include: [
                {
                  model: User,
                  as: 'user',
                  attributes: ['id', 'username'],
                },
                {
                  model: HabitTag,
                  as: 'habitTags',
                  include: [{ model: Tag, as: 'tag' }],
                },
              ],
            },
          ],
        },
      ],
    })

    if (!tagWithHabits) {
      return res.status(404).json({ error: 'Tag not found' })
    }

    const plain = tagWithHabits.get({ plain: true }) as any

    const userHabits = plain.habitTags
      .filter((ht: any) => ht.habit.userId === userId)
      .map((ht: any) => ({
        ...ht.habit,
        tags: ht.habit.habitTags.map((habitTag: any) => habitTag.tag),
        habitTags: undefined,
        user: undefined,
      }))

    res.json({
      tag: { id: plain.id, name: plain.name, color: plain.color },
      habits: userHabits,
    })
  } catch (error) {
    console.error('Get tag habits error:', error)
    res.status(500).json({ error: 'Failed to fetch habits for tag' })
  }
}