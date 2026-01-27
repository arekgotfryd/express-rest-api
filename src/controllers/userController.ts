import type { Response } from 'express'
import type { AuthenticatedRequest } from '../middleware/auth.ts'
import { container } from '../container.ts'
import { logger } from '../utils/logger.ts'
import { toUserDTO, toUserDTOList, toPaginationDTO } from '../dtos/mappers.ts'
import type {
  UsersResponseDTO,
  UserResponseDTO,
  MessageDTO,
  ErrorDTO,
} from '../dtos/index.ts'

export const getUsers = async (
  req: AuthenticatedRequest,
  res: Response<UsersResponseDTO | ErrorDTO>,
) => {
  try {
    // Pagination parameters
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 10
    const offset = (page - 1) * limit

    // Get total count for pagination metadata
    const totalCount = await container.userService.count()

    // Fetch paginated users
    const users = await container.userService.findAll(limit, offset)

    res.json({
      users: toUserDTOList(users),
      pagination: toPaginationDTO(page, limit, totalCount),
    })
  } catch (error) {
    logger.error('Get all users error', error)
    res.status(500).json({ error: 'Failed to fetch users' })
  }
}

export const getUser = async (
  req: AuthenticatedRequest,
  res: Response<UserResponseDTO | ErrorDTO>,
) => {
  try {
    const userId = req.user!.id

    const user = await container.userService.findById(userId)

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({ user: toUserDTO(user) })
  } catch (error) {
    logger.error('Get profile error:', error)
    res.status(500).json({ error: 'Failed to fetch profile' })
  }
}

export const updateUser = async (
  req: AuthenticatedRequest,
  res: Response<MessageDTO | ErrorDTO>,
) => {
  try {
    const userId = req.user!.id

    const user = await container.userService.findById(userId)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    await container.userService.update(userId, {
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

export const deleteUser = async (
  req: AuthenticatedRequest,
  res: Response<MessageDTO | ErrorDTO>,
) => {
  try {
    const targetUserId = req.params.id
    const currentUserId = req.user!.id

    // Authorization: users can only delete their own account
    if (targetUserId !== currentUserId) {
      return res
        .status(403)
        .json({ error: 'You can only delete your own account' })
    }

    const deletedCount = await container.userService.delete(targetUserId)

    if (deletedCount === 0) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({ message: 'User deleted successfully' })
  } catch (error) {
    logger.error('Delete user error', error)
    res.status(500).json({ error: 'Failed to delete an user' })
  }
}
