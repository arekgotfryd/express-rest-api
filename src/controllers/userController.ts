import type { Response } from 'express'
import type { AuthenticatedRequest } from '../middleware/auth.ts'
import { UserService } from '../services/userService.ts'

const userService = new UserService()

export const getUsers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const users = await userService.findAll(undefined, {
      attributes: ['id', 'email', 'firstName', 'lastName'],
    })
    res.json({ users })
  } catch (error) {
    console.error('Get all users error', error)
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
    console.error('Get profile error:', error)
    res.status(500).json({ error: 'Failed to fetch profile' })
  }
}

export const updateUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id
    const { email, firstName, lastName } = req.body

    const user = await userService.findById(userId)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    await userService.update(userId, {
      email,
      firstName,
      lastName,
    })

    const updatedUser = await userService.findById(userId, {
      attributes: ['id', 'email', 'firstName', 'lastName'],
    })

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser,
    })
  } catch (error) {
    console.error('Update profile error:', error)
    res.status(500).json({ error: 'Failed to update profile' })
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
    console.error('Delete user error', error)
    res.status(500).json({ error: 'Failed to delete an user' })
  }
}
