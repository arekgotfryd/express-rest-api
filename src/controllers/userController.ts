import type { Response } from 'express'
import type { AuthenticatedRequest } from '../middleware/auth.ts'
import { UserService } from '../services/userService.ts'
import { logger } from '../utils/logger.ts'

const userService = new UserService()

export const getUsers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Pagination parameters
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10
    const offset = (page - 1) * limit

    // Get total count for pagination metadata
    const totalCount = await userService.count()

    // Fetch paginated users
    const users = await userService.findAll(undefined, {
      attributes: ['id', 'email', 'firstName', 'lastName'],
      limit,
      offset,
    })

    res.json({
      users,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNextPage: page < Math.ceil(totalCount / limit),
        hasPreviousPage: page > 1,
      },
    })
  } catch (error) {
    logger.error('Get all users error', error)
    res.status(500).json({ error: 'Failed to fetch users' })
  }
}

export const getUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id

    const user = await userService.findById(userId, {
      attributes: ['id', 'email', 'username', 'firstName', 'lastName'],
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({ user })
  } catch (error) {
    logger.error('Get profile error:', error)
    res.status(500).json({ error: 'Failed to fetch profile' })
  }
}

export const updateUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id

    const user = await userService.findById(userId)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    await userService.update(userId, {
      ...req.body,
    })

    res.json({
      message: 'User updated successfully',
    })
  } catch (error) {
    logger.error('User update error:', error)
    res.status(500).json({ error: 'Failed to update user' })
  }
}

export const deleteUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const deletedCount = await userService.delete(req.params.id)

    if (deletedCount === 0) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({ message: 'User deleted successfully' })
  } catch (error) {
    logger.error('Delete user error', error)
    res.status(500).json({ error: 'Failed to delete an user' })
  }
}
