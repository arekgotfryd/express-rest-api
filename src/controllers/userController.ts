import type { Response } from 'express'
import type { AuthenticatedRequest } from '../middleware/auth.ts'
import { users as User } from '../db/schema.ts'
import bcrypt from 'bcrypt'

export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id

    const user = await User.findByPk(userId, {
      attributes: [
        'id',
        'email',
        'username',
        'firstName',
        'lastName',
        'createdAt',
        'updatedAt',
      ],
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

export const updateProfile = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user!.id
    const { email, username, firstName, lastName } = req.body

    const user = await User.findByPk(userId)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    await user.update({
      email,
      username,
      firstName,
      lastName,
      updatedAt: new Date(),
    })

    const updatedUser = await User.findByPk(userId, {
      attributes: [
        'id',
        'email',
        'username',
        'firstName',
        'lastName',
        'updatedAt',
      ],
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

export const changePassword = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user!.id
    const { currentPassword, newPassword } = req.body

    const user = await User.findByPk(userId)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const isValidPassword = await bcrypt.compare(currentPassword, user.password)
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Current password is incorrect' })
    }

    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12')
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds)

    await user.update({
      password: hashedNewPassword,
      updatedAt: new Date(),
    })

    res.json({
      message: 'Password changed successfully',
    })
  } catch (error) {
    console.error('Change password error:', error)
    res.status(500).json({ error: 'Failed to change password' })
  }
}
